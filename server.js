"use strict";

require("dotenv").config();

const crypto = require("node:crypto");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const ExcelJS = require("exceljs");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const QRCode = require("qrcode");
const { initializeDatabase } = require("./database");

const app = express();
const port = Number(process.env.PORT) || 3000;
const publicDirectory = path.resolve(__dirname, "public");
const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validUsername = /^[A-Za-z0-9][A-Za-z0-9._-]{2,31}$/;
const validRoles = new Set(["admin", "principal", "curriculum", "coach"]);
const validMenus = new Set(["dashboard", "players", "teams", "attendance", "schedule", "training", "matches", "recommendations", "reports", "targets", "strategy", "activityLog", "settings"]);
const accessLevels = new Set(["view", "edit", "full"]);
const dataMenuSections = [
  { section: "players", menu: "players" },
  { section: "teams", menu: "teams" },
  { section: "sessions", menu: "attendance" },
  { section: "events", menu: "schedule" },
  { section: "matches", menu: "training" },
  { section: "strategyBoards", menu: "strategy" },
  { section: "targets", menu: "targets" }
];
const defaultBranding = {
  logo: "",
  favicon: "",
  appName: "VolleyDesk",
  appSubtitle: "Team management",
  tabTitle: "VolleyDesk — Manajemen Ekstrakurikuler",
  letterheadTitle: "EKSTRAKURIKULER BOLA VOLI",
  letterheadSubtitle: "Manajemen dan Statistik Pemain",
  logoWidth: 88,
  titleFontSize: 20,
  subtitleFontSize: 12,
  fontFamily: "Arial, sans-serif",
  titleBold: true,
  titleItalic: false,
  subtitleBold: false,
  subtitleItalic: false,
  letterheadLine: true,
  pdfSignaturesEnabled: true,
  pdfPrincipalNameVisible: true,
  pdfPrincipalIntro: "Mengetahui,",
  pdfPrincipalRole: "Kepala Sekolah",
  pdfPrincipalName: "",
  pdfSignaturePlace: "",
  pdfCoachRole: "Pelatih",
  pdfCoachName: ""
};
const brandingFontFamilies = new Set([
  "Arial, sans-serif",
  "\"Times New Roman\", serif",
  "Georgia, serif",
  "Verdana, sans-serif",
  "Tahoma, sans-serif"
]);
const minimumPasswordLength = 6;
const sessionDurationMs = 30 * 24 * 60 * 60 * 1000;
const cookieName = "volleydesk.sid";
const maximumStateBytes = 10 * 1024 * 1024;
const maximumBrandingLogoBytes = 200 * 1024;
const maximumFaviconBytes = 100 * 1024;
const maximumProfileAvatarBytes = 200 * 1024;
const maximumTelegramDocumentBytes = 40 * 1024 * 1024;
const excelMimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const timezone = process.env.BACKUP_TIMEZONE || "Asia/Jakarta";
let database;

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use((request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "same-origin");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'"
  );
  next();
});
app.use(express.json({ limit: "12mb" }));

function apiError(response, status, message) {
  response.status(status).json({ error: message });
}

function requireSameOrigin(request, response, next) {
  const origin = request.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.get("host")) {
        apiError(response, 403, "Permintaan ditolak.");
        return;
      }
    } catch {
      apiError(response, 403, "Permintaan ditolak.");
      return;
    }
  }
  if (request.get("sec-fetch-site") === "cross-site") {
    apiError(response, 403, "Permintaan ditolak.");
    return;
  }
  next();
}

function parseCookie(request, name) {
  const prefix = `${name}=`;
  const item = (request.headers.cookie || "").split(";").map(value => value.trim()).find(value => value.startsWith(prefix));
  return item ? item.slice(prefix.length) : "";
}

function requestUser(request, response, next) {
  const token = parseCookie(request, cookieName);
  if (token) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const session = database.get(
      `SELECT app_users.id, app_users.name, app_users.email,
              app_users.role, app_users.avatar_data_url, app_users.created_at
       FROM auth_sessions JOIN app_users ON app_users.id = auth_sessions.user_id
       WHERE auth_sessions.token_hash = ? AND auth_sessions.expires_at > ?
         AND NOT EXISTS (SELECT 1 FROM player_user_links WHERE player_user_links.user_id = app_users.id)`,
      [tokenHash, Date.now()]
    );
    request.user = session && validRoles.has(session.role) ? session : null;
  }
  next();
}

app.use("/api", (request, response, next) => {
  response.setHeader("Cache-Control", "no-store");
  next();
}, requestUser);

function requireUser(request, response, next) {
  if (!request.user) {
    apiError(response, 401, "Silakan masuk terlebih dahulu.");
    return;
  }
  next();
}

function requireAdmin(request, response, next) {
  if (!request.user || request.user.role !== "admin") {
    apiError(response, 403, "Akses khusus administrator.");
    return;
  }
  next();
}

function requireOperator(request, response, next) {
  if (!request.user || !["admin", "coach"].includes(request.user.role)) {
    apiError(response, 403, "Akses tidak diizinkan.");
    return;
  }
  next();
}

function requireMenuAction(menu, action) {
  return (request, response, next) => {
    if (!request.user) {
      apiError(response, 401, "Silakan masuk terlebih dahulu.");
      return;
    }
    if (request.user.role === "admin") {
      next();
      return;
    }
    const state = readAppState().data;
    const visible = Boolean(state && state.menuVisibility && state.menuVisibility[request.user.role] &&
      state.menuVisibility[request.user.role].includes(menu));
    const level = state && state.accessPermissions && state.accessPermissions[request.user.role] &&
      state.accessPermissions[request.user.role][menu] || "view";
    const allowed = action === "view" ? visible :
      action === "delete" ? visible && level === "full" :
        visible && (level === "edit" || level === "full");
    if (!allowed) {
      apiError(response, 403, `Akses ${action === "view" ? "lihat" : action === "delete" ? "hapus" : "ubah"} menu ${menu} tidak diizinkan.`);
      return;
    }
    next();
  };
}

function defaultAccessLevel(role) {
  return role === "admin" || role === "coach" ? "full" : "view";
}

function assertStateAccess(nextState, previousState, role) {
  if (role === "admin") return;
  for (const { section, menu } of dataMenuSections) {
    const before = previousState[section] == null ? (section === "targets" ? {} : []) : previousState[section];
    const after = nextState[section] == null ? (section === "targets" ? {} : []) : nextState[section];
    if (JSON.stringify(before) === JSON.stringify(after)) continue;
    const level = previousState.accessPermissions && previousState.accessPermissions[role] &&
      previousState.accessPermissions[role][menu] || "view";
    const visible = (previousState.menuVisibility && previousState.menuVisibility[role] || []).includes(menu);
    if (!visible || level === "view") {
      const error = new Error(`Akses ubah data pada menu ${menu} tidak diizinkan.`);
      error.status = 403;
      throw error;
    }
    if (level !== "full") {
      const beforeItems = Array.isArray(before) ? before : Object.keys(before);
      const afterItems = Array.isArray(after) ? after : Object.keys(after);
      const remainingIds = new Set(afterItems.map(item => String(Array.isArray(after) ? item.id : item)));
      const removed = beforeItems.some(item => !remainingIds.has(String(Array.isArray(before) ? item.id : item)));
      if (removed) {
        const error = new Error(`Hak hapus pada menu ${menu} belum diberikan.`);
        error.status = 403;
        throw error;
      }
    }
  }
}

function setSessionCookie(response, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader("Set-Cookie", `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionDurationMs / 1000}${secure}`);
}

function clearSessionCookie(response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader("Set-Cookie", `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

function readAppState() {
  const row = database.get("SELECT state_json, is_initial FROM app_state WHERE id = 1");
  return row ? { data: JSON.parse(row.state_json), isInitial: Boolean(row.is_initial) } : { data: null, isInitial: true };
}

function insertActivity(actor, description) {
  database.run(
    "INSERT INTO activity_log (actor_id, actor_name, actor_role, description) VALUES (?, ?, ?, ?)",
    [actor && actor.id || null, actor && actor.name || "Pengguna", actor && actor.role || "unknown", description]
  );
}

function stateChangeDescriptions(previous, state) {
  const sections = [
    ["players", "Data pemain"],
    ["teams", "Tim"],
    ["sessions", "Latihan"],
    ["events", "Agenda"],
    ["matches", "Pertandingan"],
    ["strategyBoards", "Papan strategi"]
  ];
  const changes = [];
  for (const [key, label] of sections) {
    const before = previous && Array.isArray(previous[key]) ? previous[key] : [];
    const after = Array.isArray(state[key]) ? state[key] : [];
    const beforeById = new Map(before.map(item => [String(item.id), item]));
    const afterById = new Map(after.map(item => [String(item.id), item]));
    let added = 0, updated = 0, removed = 0;
    for (const [id, item] of afterById) {
      if (!beforeById.has(id)) added++;
      else if (JSON.stringify(beforeById.get(id)) !== JSON.stringify(item)) updated++;
    }
    for (const id of beforeById.keys()) {
      if (!afterById.has(id)) removed++;
    }
    if (added || updated || removed) {
      const summary = [];
      if (added) summary.push(`${added} ditambahkan`);
      if (updated) summary.push(`${updated} diperbarui`);
      if (removed) summary.push(`${removed} dihapus`);
      changes.push(`${label}: ${summary.join(", ")}`);
    }
  }
  for (const [key, label] of [["targets", "Target pemain"], ["menuVisibility", "Visibilitas menu"], ["accessPermissions", "Hak akses"], ["highlights", "Menu sorotan"], ["bottomNav", "Navigasi bawah"], ["bottomHighlights", "Sorotan navigasi bawah"], ["branding", "Identitas aplikasi"]]) {
    if (JSON.stringify(previous && previous[key] || {}) !== JSON.stringify(state[key] || {})) {
      changes.push(`${label} diperbarui`);
    }
  }
  return changes;
}

function validPortalToken(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}

function validBirthDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day && value <= new Date().toISOString().slice(0, 10);
}

function publicPortalMatches(token) {
  return validPortalToken(token) && Boolean(database.get(
    "SELECT id FROM public_portal WHERE id = 1 AND enabled = 1 AND token = ?",
    [token]
  ));
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validLoginIdentifier(value) {
  return validEmail.test(value) || validUsername.test(value);
}

function sanitizeTeams(input, players) {
  if (input == null) return [];
  if (!Array.isArray(input) || input.length > 100) throw new Error("Format data aplikasi tidak valid.");
  const playerIds = new Set(players.map(player => Number(player.id)));
  const teamIds = new Set();
  return input.map(team => {
    if (!isRecord(team)) throw new Error("Format data aplikasi tidak valid.");
    const id = Number(team.id);
    const name = typeof team.name === "string" ? team.name.trim() : "";
    const logo = team.logo == null ? "" : team.logo;
    if (!Number.isSafeInteger(id) || id < 1 || teamIds.has(id) ||
        !name || name.length > 80 || typeof logo !== "string" || logo.length > 280000 ||
        (logo && !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(logo)) ||
        !Array.isArray(team.playerIds) || team.playerIds.length > players.length) {
      throw new Error("Format data aplikasi tidak valid.");
    }
    const members = team.playerIds.map(Number);
    if (members.some(playerId => !Number.isSafeInteger(playerId) || !playerIds.has(playerId)) ||
        new Set(members).size !== members.length) {
      throw new Error("Format data aplikasi tidak valid.");
    }
    teamIds.add(id);
    return { id, name, logo, playerIds: members };
  });
}

function sanitizeBrandingImage(value, maximumBytes) {
  if (value == null || value === "") return "";
  if (typeof value !== "string") throw new Error("Format data aplikasi tidak valid.");
  const match = /^data:image\/(?:png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) throw new Error("Format data aplikasi tidak valid.");
  const image = Buffer.from(match[1], "base64");
  if (image.length > maximumBytes || image.toString("base64") !== match[1]) {
    throw new Error("Format data aplikasi tidak valid.");
  }
  return value;
}

function sanitizeBranding(input, previous, role) {
  const branding = role === "admin" ? input : previous && previous.branding;
  if (branding == null) return { ...defaultBranding };
  if (!isRecord(branding)) throw new Error("Format data aplikasi tidak valid.");
  const stringValue = (key, maximumLength) => {
    const value = branding[key] == null ? defaultBranding[key] : branding[key];
    if (typeof value !== "string" || value.length > maximumLength) throw new Error("Format data aplikasi tidak valid.");
    return value.trim();
  };
  const numericValue = (key, minimum, maximum) => {
    const value = branding[key] == null ? defaultBranding[key] : Number(branding[key]);
    if (!Number.isInteger(value) || value < minimum || value > maximum) throw new Error("Format data aplikasi tidak valid.");
    return value;
  };
  const fontFamily = branding.fontFamily == null ? defaultBranding.fontFamily : branding.fontFamily;
  if (typeof fontFamily !== "string" || !brandingFontFamilies.has(fontFamily)) throw new Error("Format data aplikasi tidak valid.");
  return {
    logo: sanitizeBrandingImage(branding.logo, maximumBrandingLogoBytes),
    favicon: sanitizeBrandingImage(branding.favicon, maximumFaviconBytes),
    appName: stringValue("appName", 80) || defaultBranding.appName,
    appSubtitle: stringValue("appSubtitle", 160),
    tabTitle: stringValue("tabTitle", 120) || defaultBranding.tabTitle,
    letterheadTitle: stringValue("letterheadTitle", 100),
    letterheadSubtitle: stringValue("letterheadSubtitle", 160),
    logoWidth: numericValue("logoWidth", 24, 260),
    titleFontSize: numericValue("titleFontSize", 12, 42),
    subtitleFontSize: numericValue("subtitleFontSize", 8, 24),
    fontFamily,
    titleBold: branding.titleBold == null ? defaultBranding.titleBold : branding.titleBold === true,
    titleItalic: branding.titleItalic == null ? defaultBranding.titleItalic : branding.titleItalic === true,
    subtitleBold: branding.subtitleBold == null ? defaultBranding.subtitleBold : branding.subtitleBold === true,
    subtitleItalic: branding.subtitleItalic == null ? defaultBranding.subtitleItalic : branding.subtitleItalic === true,
    letterheadLine: branding.letterheadLine !== false,
    pdfSignaturesEnabled: branding.pdfSignaturesEnabled == null ? defaultBranding.pdfSignaturesEnabled : branding.pdfSignaturesEnabled === true,
    pdfPrincipalNameVisible: branding.pdfPrincipalNameVisible == null ? defaultBranding.pdfPrincipalNameVisible : branding.pdfPrincipalNameVisible === true,
    pdfPrincipalIntro: stringValue("pdfPrincipalIntro", 80),
    pdfPrincipalRole: stringValue("pdfPrincipalRole", 80),
    pdfPrincipalName: stringValue("pdfPrincipalName", 80),
    pdfSignaturePlace: stringValue("pdfSignaturePlace", 80),
    pdfCoachRole: stringValue("pdfCoachRole", 80),
    pdfCoachName: stringValue("pdfCoachName", 80)
  };
}

function sanitizeAppState(input, previous, role) {
  if (!isRecord(input) ||
      !Array.isArray(input.players) ||
      !Array.isArray(input.sessions) ||
      !Array.isArray(input.events) ||
      !Array.isArray(input.matches) ||
      (input.strategyBoards != null && (!Array.isArray(input.strategyBoards) || input.strategyBoards.length > 5000 ||
        input.strategyBoards.some(item => !isRecord(item)))) ||
      [input.players, input.sessions, input.events, input.matches].some(items =>
        items.length > 5000 || items.some(item => !isRecord(item)))) {
    throw new Error("Format data aplikasi tidak valid.");
  }

  const sourceMenus = role === "admin" ? input.menuVisibility : previous && previous.menuVisibility;
  const sourceHighlights = role === "admin" ? input.highlights : previous && previous.highlights;
  const sourceBottomNav = role === "admin" ? input.bottomNav : previous && previous.bottomNav;
  const sourceBottomHighlights = role === "admin" ? input.bottomHighlights : previous && previous.bottomHighlights;
  const menuConfigVersion = role === "admin" ? input.menuConfigVersion : previous && previous.menuConfigVersion;
  const sourceAccessPermissions = role === "admin" ? input.accessPermissions : previous && previous.accessPermissions;
  const menuVisibility = {};
  const highlights = {};
  const bottomNav = {};
  const bottomHighlights = {};
  const accessPermissions = {};
  for (const roleName of validRoles) {
    const configured = sourceMenus && Array.isArray(sourceMenus[roleName]) ? sourceMenus[roleName] : [];
    menuVisibility[roleName] = Array.from(new Set(configured.filter(menu => validMenus.has(menu))));
    const highlight = sourceHighlights && sourceHighlights[roleName];
    highlights[roleName] = validMenus.has(highlight) ? highlight : (menuVisibility[roleName][0] || "dashboard");
    const configuredBottom = sourceBottomNav && Array.isArray(sourceBottomNav[roleName]) ? sourceBottomNav[roleName] : [];
    bottomNav[roleName] = Array.from(new Set(configuredBottom.filter(menu => menuVisibility[roleName].includes(menu)))).slice(0, 5);
    const bottomHighlight = sourceBottomHighlights && sourceBottomHighlights[roleName];
    bottomHighlights[roleName] = bottomNav[roleName].includes(bottomHighlight)
      ? bottomHighlight
      : bottomNav[roleName][0] || "";
    const configuredPermissions = sourceAccessPermissions && sourceAccessPermissions[roleName];
    accessPermissions[roleName] = {};
    for (const menu of validMenus) {
      const configuredLevel = configuredPermissions && configuredPermissions[menu];
        accessPermissions[roleName][menu] = roleName === "admin"
          ? "full"
          : accessLevels.has(configuredLevel) ? configuredLevel : defaultAccessLevel(roleName);
    }
  }
  const clean = {
    theme: input.theme === "dark" ? "dark" : "light",
    menuConfigVersion: Number(menuConfigVersion) >= 1 ? 1 : 0,
    menuVisibility,
    highlights,
    bottomNav,
    bottomHighlights,
    accessPermissions,
    branding: sanitizeBranding(input.branding, previous, role),
    players: input.players,
    teams: sanitizeTeams(input.teams, input.players),
    sessions: input.sessions,
    events: input.events,
    matches: input.matches,
    strategyBoards: Array.isArray(input.strategyBoards) ? input.strategyBoards : [],
    targets: isRecord(input.targets) ? input.targets : {}
  };
  if (Buffer.byteLength(JSON.stringify(clean), "utf8") > maximumStateBytes) {
    throw new Error("Ukuran data terlalu besar.");
  }
  return clean;
}

function writeAppState(input, role, initialOnly, actor) {
  const current = readAppState();
  if (initialOnly && !current.isInitial) {
    const error = new Error("Data server sudah tersedia; import awal tidak dapat menimpanya.");
    error.status = 409;
    throw error;
  }
  const state = sanitizeAppState(input, current.data, role);
  if (current.data) assertStateAccess(state, current.data, role);
  const changes = stateChangeDescriptions(current.data, state);
  database.transaction(() => {
    database.run(
      `INSERT INTO app_state (id, state_json, is_initial, updated_at) VALUES (1, ?, 0, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, is_initial = 0, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(state)]
    );
    for (const description of changes) insertActivity(actor, description);
    if (!current.data && initialOnly) insertActivity(actor, "Menyiapkan data aplikasi");
  });
  return state;
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan masuk. Coba lagi beberapa saat." }
});
const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan ubah kata sandi. Coba lagi beberapa saat." }
});
const publicPortalSearchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Terlalu banyak pencarian. Coba lagi beberapa saat." }
});
const publicPortalStatsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan. Coba lagi beberapa saat." }
});

app.get("/health", (request, response) => {
  try {
    database.get("SELECT 1 AS ok");
    response.status(200).json({ status: "ok" });
  } catch {
    response.status(503).json({ status: "unavailable" });
  }
});

app.post("/api/login", requireSameOrigin, loginLimiter, async (request, response, next) => {
  try {
    const rawIdentifier = typeof request.body.identifier === "string"
      ? request.body.identifier
      : typeof request.body.email === "string" ? request.body.email : "";
    const identifier = rawIdentifier.trim().toLowerCase();
    const password = typeof request.body.password === "string" ? request.body.password : "";
    if (!validLoginIdentifier(identifier) || identifier.length > 254 || !password || password.length > 1024) {
      apiError(response, 400, "Username atau email dan kata sandi wajib diisi.");
      return;
    }
    const user = database.get(
      `SELECT app_users.id, app_users.name, app_users.email, app_users.role, app_users.password_hash,
              app_users.avatar_data_url, app_users.created_at, player_user_links.player_id
       FROM app_users LEFT JOIN player_user_links ON player_user_links.user_id = app_users.id
       WHERE app_users.email = ? COLLATE NOCASE`,
      [identifier]
    );
    const passwordHash = user ? user.password_hash : await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);
    const passwordMatches = await bcrypt.compare(password, passwordHash);
    if (!user || !passwordMatches || user.player_id != null || !validRoles.has(user.role)) {
      apiError(response, 401, "Email atau kata sandi tidak sesuai.");
      return;
    }

    const token = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = Date.now() + sessionDurationMs;
    database.transaction(() => {
      database.run("DELETE FROM auth_sessions WHERE expires_at <= ?", [Date.now()]);
      database.run("INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)", [tokenHash, user.id, expiresAt]);
      insertActivity({ id: user.id, name: user.name, role: user.role }, "Login berhasil");
    });
    setSessionCookie(response, token);
    response.json({ user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar_data_url || "",
      createdAt: user.created_at
    } });
  } catch (error) {
    next(error);
  }
});

app.get("/api/session", (request, response) => {
  const user = request.user;
  response.json({ user: user ? {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar_data_url || "",
    createdAt: user.created_at
  } : null });
});

app.get("/api/branding", (request, response) => {
  const state = readAppState().data;
  response.setHeader("Cache-Control", "no-store");
  response.json({ branding: state && state.branding || { ...defaultBranding } });
});

app.get("/api/public-portal/:token/search", publicPortalSearchLimiter, (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  if (!publicPortalMatches(request.params.token)) {
    apiError(response, 404, "Portal publik tidak ditemukan.");
    return;
  }
  const query = typeof request.query.q === "string" ? request.query.q.trim() : "";
  if (query.length < 3 || query.length > 80) {
    response.json({ names: [] });
    return;
  }
  const state = readAppState().data;
  const normalizedQuery = query.normalize("NFKC").toLocaleLowerCase("id-ID");
  const names = state
    ? Array.from(new Set(state.players
      .filter(player => typeof player.name === "string" && validBirthDate(player.birthDate) &&
        player.name.trim().normalize("NFKC").toLocaleLowerCase("id-ID").startsWith(normalizedQuery))
      .map(player => player.name.trim())
      .filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, "id"))
      .slice(0, 10)
    : [];
  response.json({ names });
});

app.post("/api/public-portal/:token/statistics", requireSameOrigin, publicPortalStatsLimiter, (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  if (!publicPortalMatches(request.params.token)) {
    apiError(response, 404, "Portal publik tidak ditemukan.");
    return;
  }
  const body = isRecord(request.body) ? request.body : {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const birthDate = typeof body.birthDate === "string" ? body.birthDate : "";
  if (!name || name.length > 80 || !validBirthDate(birthDate)) {
    apiError(response, 400, "Isi nama pemain dan tanggal lahir yang valid.");
    return;
  }
  const state = readAppState().data;
  const players = state ? state.players.filter(player =>
    typeof player.name === "string" &&
    player.name.trim().normalize("NFKC").toLocaleLowerCase("id-ID") === name.normalize("NFKC").toLocaleLowerCase("id-ID") &&
    player.birthDate === birthDate
  ) : [];
  if (players.length !== 1) {
    apiError(response, 404, "Nama atau tanggal lahir tidak sesuai.");
    return;
  }
  const player = players[0];
  const skills = [
    { key: "Ace", label: "Ace" },
    { key: "Attack", label: "Serangan" },
    { key: "Block", label: "Blok" },
    { key: "Serve", label: "Servis" },
    { key: "Receive", label: "Receive" }
  ];
  const matches = state.matches
    .filter(match =>
      (Array.isArray(match.playerIds) && match.playerIds.some(id => Number(id) === Number(player.id))) ||
      (Array.isArray(match.stats) && match.stats.some(stat => Number(stat.playerId) === Number(player.id)))
    )
    .slice()
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .map(match => {
      const stats = (Array.isArray(match.stats) ? match.stats : []).filter(stat => Number(stat.playerId) === Number(player.id));
      const techniques = skills.map(skill => {
        const values = stats.filter(stat => stat.skill === skill.key);
        const sum = key => values.reduce((total, stat) => {
          const value = Number(stat[key]);
          return total + (Number.isFinite(value) && value > 0 ? Math.floor(value) : 0);
        }, 0);
        return {
          name: skill.label,
          success: sum("success"),
          errors: sum("errors")
        };
      });
      return {
        name: typeof match.name === "string" ? match.name : "",
        opponent: typeof match.opponent === "string" ? match.opponent : "",
        date: typeof match.date === "string" ? match.date : "",
        techniques
      };
    });
  const totals = skills.map(skill => {
    const values = matches.flatMap(match => match.techniques.filter(item => item.name === skill.label));
    return {
      name: skill.label,
      success: values.reduce((sum, item) => sum + item.success, 0),
      errors: values.reduce((sum, item) => sum + item.errors, 0)
    };
  });
  response.json({
    player: {
      name: player.name,
      position: typeof player.position === "string" ? player.position : ""
    },
    totals,
    matches
  });
});

app.post("/api/logout", requireSameOrigin, (request, response, next) => {
  try {
    const token = parseCookie(request, cookieName);
    if (token) {
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      database.transaction(() => {
        database.run("DELETE FROM auth_sessions WHERE token_hash = ?", [tokenHash]);
        if (request.user) insertActivity(request.user, "Logout");
      });
    }
    clearSessionCookie(response);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.post("/api/password", requireSameOrigin, requireUser, passwordLimiter, async (request, response, next) => {
  try {
    const currentPassword = typeof request.body.currentPassword === "string" ? request.body.currentPassword : "";
    const newPassword = typeof request.body.newPassword === "string" ? request.body.newPassword : "";
    if (newPassword.length < minimumPasswordLength || newPassword.length > 1024) {
      apiError(response, 400, `Kata sandi baru harus memiliki minimal ${minimumPasswordLength} karakter.`);
      return;
    }
    const user = database.get("SELECT password_hash FROM app_users WHERE id = ?", [request.user.id]);
    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      apiError(response, 401, "Kata sandi saat ini tidak sesuai.");
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const token = parseCookie(request, cookieName);
    const currentTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    database.transaction(() => {
      database.run("UPDATE app_users SET password_hash = ? WHERE id = ?", [passwordHash, request.user.id]);
      database.run("DELETE FROM auth_sessions WHERE user_id = ? AND token_hash != ?", [request.user.id, currentTokenHash]);
      insertActivity(request.user, "Mengubah kata sandi");
    });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.put("/api/profile", requireSameOrigin, requireUser, async (request, response, next) => {
  try {
    const current = database.get(
      "SELECT id, name, email, role, password_hash, avatar_data_url, created_at FROM app_users WHERE id = ?",
      [request.user.id]
    );
    if (!current) {
      apiError(response, 404, "Profil pengguna tidak ditemukan.");
      return;
    }
    const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
    const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const currentPassword = typeof request.body.currentPassword === "string" ? request.body.currentPassword : "";
    const newPassword = typeof request.body.newPassword === "string" ? request.body.newPassword : "";
    const passwordConfirm = typeof request.body.passwordConfirm === "string" ? request.body.passwordConfirm : "";
    const avatar = typeof request.body.avatar === "string" ? request.body.avatar : current.avatar_data_url || "";
    if (!name || name.length > 80 || !validLoginIdentifier(email) || email.length > 254 ||
        (newPassword && (newPassword.length < minimumPasswordLength || newPassword.length > 1024 ||
          newPassword !== passwordConfirm))) {
      apiError(response, 400, "Periksa nama, username, dan kata sandi baru.");
      return;
    }
    let safeAvatar;
    try {
      safeAvatar = sanitizeBrandingImage(avatar, maximumProfileAvatarBytes);
    } catch {
      apiError(response, 400, "Foto profil harus berupa PNG, JPG, atau WebP maksimal 200 KB.");
      return;
    }
    if (!currentPassword || !(await bcrypt.compare(currentPassword, current.password_hash))) {
      apiError(response, 401, "Kata sandi saat ini tidak sesuai.");
      return;
    }
    const passwordHash = newPassword ? await bcrypt.hash(newPassword, 12) : current.password_hash;
    const token = parseCookie(request, cookieName);
    const currentTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    database.transaction(() => {
      database.run(
        "UPDATE app_users SET name = ?, email = ?, avatar_data_url = ?, password_hash = ? WHERE id = ?",
        [name, email, safeAvatar, passwordHash, request.user.id]
      );
      if (newPassword) {
        database.run("DELETE FROM auth_sessions WHERE user_id = ? AND token_hash != ?", [request.user.id, currentTokenHash]);
      }
      insertActivity(request.user, "Memperbarui profil");
    });
    response.json({ user: {
      id: current.id,
      name,
      email,
      role: request.user.role,
      avatar: safeAvatar,
      createdAt: current.created_at
    } });
  } catch (error) {
    if (String(error.message).includes("UNIQUE constraint failed: app_users.email")) {
      apiError(response, 409, "Username atau email tersebut sudah digunakan.");
      return;
    }
    next(error);
  }
});

app.get("/api/admin/users", requireUser, requireAdmin, (request, response) => {
  const users = database.all(
    `SELECT app_users.id, app_users.name, app_users.email, app_users.avatar_data_url AS avatar, app_users.created_at AS createdAt,
            app_users.role
     FROM app_users
     WHERE NOT EXISTS (SELECT 1 FROM player_user_links WHERE player_user_links.user_id = app_users.id)
     ORDER BY app_users.name, app_users.email`
  );
  response.json({ users });
});

app.post("/api/admin/users", requireSameOrigin, requireUser, requireAdmin, async (request, response, next) => {
  try {
    const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
    const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const password = typeof request.body.password === "string" ? request.body.password : "";
    const role = request.body.role;
    if (!name || name.length > 80 || !validEmail.test(email) || email.length > 254 ||
        password.length < minimumPasswordLength || password.length > 1024 || !validRoles.has(role)) {
      apiError(response, 400, `Periksa data akun. Kata sandi harus memiliki minimal ${minimumPasswordLength} karakter.`);
      return;
    }
    if (role === "admin" && Number(database.get("SELECT COUNT(*) AS count FROM app_users WHERE role = 'admin'").count) > 0) {
      apiError(response, 409, "Akun admin sudah tersedia. Aplikasi hanya mengizinkan satu akun admin.");
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    let user;
    database.transaction(() => {
      if (role === "admin" && Number(database.get("SELECT COUNT(*) AS count FROM app_users WHERE role = 'admin'").count) > 0) {
        const error = new Error("Akun admin sudah tersedia. Aplikasi hanya mengizinkan satu akun admin.");
        error.code = "ADMIN_ALREADY_EXISTS";
        throw error;
      }
      database.run("INSERT INTO app_users (name, email, role, password_hash) VALUES (?, ?, ?, ?)", [name, email, role, passwordHash]);
      user = database.get("SELECT id, name, email, role FROM app_users WHERE email = ? COLLATE NOCASE", [email]);
      insertActivity(request.user, `Membuat akun: ${name} (${role})`);
    });
    response.status(201).json({ user });
  } catch (error) {
    if (error.code === "ADMIN_ALREADY_EXISTS") {
      apiError(response, 409, error.message);
      return;
    }
    if (String(error.message).includes("UNIQUE constraint failed: app_users.email")) {
      apiError(response, 409, "Email tersebut sudah terdaftar.");
      return;
    }
    next(error);
  }
});

app.put("/api/admin/users/:id", requireSameOrigin, requireUser, requireAdmin, async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      apiError(response, 400, "Akun yang dipilih tidak valid.");
      return;
    }
    const current = database.get("SELECT id, name, email, role, password_hash, avatar_data_url, created_at FROM app_users WHERE id = ?", [id]);
    if (!current) {
      apiError(response, 404, "Akun pengguna tidak ditemukan.");
      return;
    }
    if (database.get("SELECT user_id FROM player_user_links WHERE user_id = ?", [id])) {
      apiError(response, 409, "Akun login pemain sudah dinonaktifkan dan tidak dapat diubah.");
      return;
    }
    const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
    const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const role = request.body.role;
    const password = typeof request.body.password === "string" ? request.body.password : "";
    if (!name || name.length > 80 || !validLoginIdentifier(email) || email.length > 254 ||
        !validRoles.has(role) || (password && (password.length < minimumPasswordLength || password.length > 1024))) {
      apiError(response, 400, `Periksa data pengguna. Username/email valid dan kata sandi baru minimal ${minimumPasswordLength} karakter.`);
      return;
    }
    const adminCount = () => Number(database.get("SELECT COUNT(*) AS count FROM app_users WHERE role = 'admin'").count);
    if (role === "admin" && current.role !== "admin" && adminCount() > 0) {
      apiError(response, 409, "Akun admin sudah tersedia. Aplikasi hanya mengizinkan satu akun admin.");
      return;
    }
    if (current.role === "admin" && role !== "admin" && adminCount() <= 1) {
      apiError(response, 409, "Role admin terakhir tidak dapat diubah.");
      return;
    }
    const passwordHash = password ? await bcrypt.hash(password, 12) : current.password_hash;
    let updatedUser;
    database.transaction(() => {
      if (role === "admin" && current.role !== "admin" && adminCount() > 0) {
        const error = new Error("Akun admin sudah tersedia. Aplikasi hanya mengizinkan satu akun admin.");
        error.code = "ADMIN_ALREADY_EXISTS";
        throw error;
      }
      if (current.role === "admin" && role !== "admin" && adminCount() <= 1) {
        const error = new Error("Role admin terakhir tidak dapat diubah.");
        error.code = "LAST_ADMIN";
        throw error;
      }
      database.run(
        "UPDATE app_users SET name = ?, email = ?, role = ?, password_hash = ? WHERE id = ?",
        [name, email, role, passwordHash, id]
      );
      insertActivity(request.user, `Memperbarui akun: ${name} (${role})`);
      updatedUser = database.get(
        "SELECT id, name, email, avatar_data_url AS avatar, created_at AS createdAt, role FROM app_users WHERE id = ?",
        [id]
      );
    });
    response.json({ user: updatedUser });
  } catch (error) {
    if (error.code === "ADMIN_ALREADY_EXISTS" || error.code === "LAST_ADMIN") {
      apiError(response, 409, error.message);
      return;
    }
    if (String(error.message).includes("UNIQUE constraint failed: app_users.email")) {
      apiError(response, 409, "Username atau email tersebut sudah digunakan.");
      return;
    }
    next(error);
  }
});

app.delete("/api/admin/users/:id", requireSameOrigin, requireUser, requireAdmin, (request, response, next) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1 || id === Number(request.user.id)) {
    apiError(response, 400, "Akun yang dipilih tidak dapat dihapus.");
    return;
  }
  const user = database.get("SELECT id, name, role FROM app_users WHERE id = ?", [id]);
  if (!user) {
    apiError(response, 404, "Akun tidak ditemukan.");
    return;
  }
  if (user.role === "admin" && Number(database.get("SELECT COUNT(*) AS count FROM app_users WHERE role = 'admin'").count) <= 1) {
    apiError(response, 409, "Administrator terakhir tidak dapat dihapus.");
    return;
  }
  try {
    database.transaction(() => {
      database.run("DELETE FROM app_users WHERE id = ?", [id]);
      insertActivity(request.user, `Menghapus akun: ${user.name}`);
    });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.all("/api/player-accounts", (request, response) => {
  apiError(response, 410, "Login pemain sudah dinonaktifkan. Gunakan portal publik pemain.");
});

app.all("/api/player-accounts/:playerId", (request, response) => {
  apiError(response, 410, "Login pemain sudah dinonaktifkan. Gunakan portal publik pemain.");
});

app.get("/api/players/template", requireUser, requireOperator, requireMenuAction("players", "view"), async (request, response, next) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Data Pemain");
    sheet.columns = [
      { header: "Nama", key: "name", width: 28 },
      { header: "Posisi", key: "position", width: 22 },
      { header: "Nomor Punggung", key: "number", width: 18 },
      { header: "Kelas", key: "className", width: 18 },
      { header: "Tinggi (cm)", key: "height", width: 14 },
      { header: "Berat (kg)", key: "weight", width: 14 },
      { header: "Spike Reach (cm)", key: "spikeReach", width: 18 },
      { header: "Block Reach (cm)", key: "blockReach", width: 18 },
      { header: "Vertical Jump (cm)", key: "verticalJump", width: 20 },
      { header: "Jenis Kelamin", key: "gender", width: 20 },
      { header: "Tanggal Lahir", key: "birthDate", width: 18 }
    ];
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.autoFilter = "A1:K5001";
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF315EE8" } };
    sheet.dataValidations.add("B2:B5001", {
      type: "list",
      formulae: ['"Setter,Outside Hitter,Opposite,Middle Blocker,Libero"'],
      allowBlank: false
    });
    sheet.dataValidations.add("C2:C5001", { type: "whole", operator: "between", formulae: [0, 99], allowBlank: false });
    sheet.dataValidations.add("E2:E5001", { type: "decimal", operator: "between", formulae: [100, 230], allowBlank: false });
    sheet.dataValidations.add("F2:F5001", { type: "decimal", operator: "between", formulae: [20, 180], allowBlank: false });
    sheet.dataValidations.add("G2:H5001", { type: "decimal", operator: "between", formulae: [100, 350], allowBlank: false });
    sheet.dataValidations.add("I2:I5001", { type: "decimal", operator: "between", formulae: [0, 120], allowBlank: true });
    sheet.dataValidations.add("J2:J5001", {
      type: "list",
      formulae: ['"Perempuan,Laki-laki"'],
      allowBlank: true
    });
    const instructions = workbook.addWorksheet("Petunjuk");
    instructions.addRows([
      ["Petunjuk impor pemain"],
      ["Isi satu pemain per baris pada sheet Data Pemain, mulai dari baris 2. Jangan mengubah nama kolom."],
      ["Kolom wajib: Nama, Posisi, Nomor Punggung, Kelas, Tinggi, Berat, Spike Reach, dan Block Reach."],
      ["Posisi harus dipilih dari daftar: Setter, Outside Hitter, Opposite, Middle Blocker, atau Libero."],
      ["Nomor punggung: 0-99; tinggi: 100-230 cm; berat: 20-180 kg; jangkauan spike/block: 100-350 cm."],
      ["Vertical Jump (0-120 cm), Jenis Kelamin, dan Tanggal Lahir (YYYY-MM-DD) bersifat opsional."],
      ["Baris kosong akan dilewati. Lengkapi semua kolom wajib agar baris dapat diimpor."]
    ]);
    instructions.getColumn(1).width = 110;
    instructions.getRow(1).font = { bold: true, size: 14, color: { argb: "FF315EE8" } };
    instructions.getColumn(1).alignment = { wrapText: true, vertical: "top" };
    const contents = await workbook.xlsx.writeBuffer();
    response.setHeader("Content-Type", excelMimeType);
    response.setHeader("Content-Disposition", 'attachment; filename="template-import-pemain-volleydesk.xlsx"');
    response.send(Buffer.from(contents));
  } catch (error) {
    next(error);
  }
});

app.post(
  "/api/players/import",
  requireSameOrigin,
  requireUser,
  requireOperator,
  requireMenuAction("players", "edit"),
  express.raw({ type: [excelMimeType, "application/octet-stream"], limit: "2mb" }),
  async (request, response, next) => {
    try {
      if (!Buffer.isBuffer(request.body) || !request.body.length) {
        apiError(response, 400, "Pilih berkas Excel terlebih dahulu.");
        return;
      }
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(request.body);
      const sheet = workbook.worksheets[0];
      if (!sheet || sheet.rowCount < 2 || sheet.rowCount > 5001) {
        apiError(response, 400, "Berkas Excel harus memiliki header dan maksimal 5.000 baris.");
        return;
      }
      const normalizeHeader = value => String(value || "").trim().toLowerCase().replace(/\([^)]*\)/g, "").replace(/[^a-z0-9]/g, "");
      const headerMap = new Map();
      sheet.getRow(1).eachCell((cell, column) => headerMap.set(normalizeHeader(cell.text), column));
      const fields = {
        name: "nama",
        position: "posisi",
        number: "nomorpunggung",
        className: "kelas",
        height: "tinggi",
        weight: "berat",
        spikeReach: "spikereach",
        blockReach: "blockreach",
        verticalJump: "verticaljump",
        gender: "jeniskelamin",
        birthDate: "tanggallahir"
      };
      const columns = Object.fromEntries(Object.entries(fields).map(([field, header]) => [field, headerMap.get(header)]));
      if (Object.entries(columns).some(([field, column]) => ["gender", "birthDate", "verticalJump"].includes(field) ? false : !column)) {
        apiError(response, 400, "Header Excel tidak sesuai template. Unduh template pemain terlebih dahulu.");
        return;
      }
      const current = readAppState();
      if (!current.data) {
        apiError(response, 409, "Data aplikasi belum diinisialisasi oleh administrator.");
        return;
      }
      const players = current.data.players;
      const positions = ["Setter", "Outside Hitter", "Opposite", "Middle Blocker", "Libero"];
      const validBirthDate = value => {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        if (!match || value > new Date().toISOString().slice(0, 10)) return false;
        const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
        return date.getUTCFullYear() === Number(match[1]) &&
          date.getUTCMonth() === Number(match[2]) - 1 &&
          date.getUTCDate() === Number(match[3]);
      };
      let nextId = Math.max(Date.now(), ...players.map(player => Number(player.id) || 0)) + 1;
      let added = 0, skipped = 0;
      for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
        const row = sheet.getRow(rowNumber);
        const value = field => String(row.getCell(columns[field]).text || "").trim();
        const name = value("name");
        const className = value("className");
        const gender = columns.gender ? value("gender") : "";
        const birthCell = columns.birthDate ? row.getCell(columns.birthDate) : null;
        const rawBirthDate = birthCell && birthCell.value instanceof Date
          ? birthCell.value.toISOString().slice(0, 10)
          : birthCell ? String(birthCell.text || "").trim() : "";
        const birthDate = rawBirthDate;
        const verticalInput = columns.verticalJump ? value("verticalJump") : "";
        const numeric = Object.fromEntries(["number", "height", "weight", "spikeReach", "blockReach"].map(field => [field, Number(value(field))]));
        numeric.verticalJump = verticalInput ? Number(verticalInput) : null;
        if (!name && !className && Object.values(numeric).every(number => !number)) continue;
        const position = positions.find(item => item.toLowerCase() === value("position").toLowerCase());
        const valid = name && name.length <= 80 && className && className.length <= 40 && position &&
          Number.isInteger(numeric.number) && numeric.number >= 0 && numeric.number <= 99 &&
          Number.isFinite(numeric.height) && numeric.height >= 100 && numeric.height <= 230 &&
          Number.isFinite(numeric.weight) && numeric.weight >= 20 && numeric.weight <= 180 &&
          (numeric.verticalJump == null || (Number.isFinite(numeric.verticalJump) && numeric.verticalJump >= 0 && numeric.verticalJump <= 120)) &&
          Number.isFinite(numeric.spikeReach) && numeric.spikeReach >= 100 && numeric.spikeReach <= 350 &&
          Number.isFinite(numeric.blockReach) && numeric.blockReach >= 100 && numeric.blockReach <= 350 &&
          (!gender || ["Perempuan", "Laki-laki"].includes(gender)) &&
          (!birthDate || validBirthDate(birthDate));
        const duplicate = players.some(player => player.name.toLowerCase() === name.toLowerCase() &&
          player.className.toLowerCase() === className.toLowerCase());
        if (!valid || duplicate) {
          skipped++;
          continue;
        }
        const profile = {
          id: nextId++,
          name,
          position,
          number: numeric.number,
          className,
          gender,
          birthDate,
          height: numeric.height,
          weight: numeric.weight,
          verticalJump: numeric.verticalJump,
          spikeReach: numeric.spikeReach,
          blockReach: numeric.blockReach,
          history: [{ date: new Date().toISOString().slice(0, 10), height: numeric.height, weight: numeric.weight, verticalJump: numeric.verticalJump, spikeReach: numeric.spikeReach, blockReach: numeric.blockReach }]
        };
        players.push(profile);
        added++;
      }
      if (!added) {
        apiError(response, 400, "Tidak ada baris pemain yang valid. Isi semua kolom wajib dan gunakan posisi serta rentang angka sesuai sheet Petunjuk.");
        return;
      }
      writeAppState(current.data, request.user.role, false, request.user);
      response.json({ ok: true, added, skipped });
    } catch (error) {
      if (error.message && /invalid|zip|central directory|unexpected end/i.test(error.message)) {
        apiError(response, 400, "Berkas Excel tidak valid atau rusak.");
        return;
      }
      next(error);
    }
  }
);

app.get("/api/state", requireUser, (request, response) => {
  const result = readAppState();
  response.json({ ...result, role: request.user.role });
});

app.put("/api/state", requireSameOrigin, requireUser, (request, response, next) => {
  try {
    const state = writeAppState(request.body.data, request.user.role, false, request.user);
    response.json({ ok: true, updatedAt: new Date().toISOString(), data: state });
  } catch (error) {
    if (error.status) {
      apiError(response, error.status, error.message);
      return;
    }
    if (error.message === "Format data aplikasi tidak valid." || error.message === "Ukuran data terlalu besar.") {
      apiError(response, 400, error.message);
      return;
    }
    next(error);
  }
});

app.get("/api/admin/activity-log", requireUser, requireAdmin, (request, response) => {
  const entries = database.all(
    `SELECT id, actor_name AS actorName, actor_role AS actorRole, description, created_at AS createdAt
     FROM activity_log ORDER BY created_at DESC, id DESC LIMIT 200`
  );
  response.json({ entries });
});

app.post("/api/state/initialize", requireSameOrigin, requireUser, requireAdmin, (request, response, next) => {
  try {
    const state = writeAppState(request.body.data, request.user.role, true, request.user);
    response.json({ ok: true, data: state });
  } catch (error) {
    if (error.status) {
      apiError(response, error.status, error.message);
      return;
    }
    if (error.message === "Format data aplikasi tidak valid." || error.message === "Ukuran data terlalu besar.") {
      apiError(response, 400, error.message);
      return;
    }
    next(error);
  }
});

function telegramCredentials() {
  const settings = database.get("SELECT telegram_bot_token, telegram_chat_id FROM backup_settings WHERE id = 1");
  return {
    token: process.env.TELEGRAM_BOT_TOKEN || settings.telegram_bot_token || "",
    chatId: process.env.TELEGRAM_CHAT_ID || settings.telegram_chat_id || ""
  };
}

function telegramConfigured() {
  const credentials = telegramCredentials();
  return Boolean(credentials.token && credentials.chatId);
}

function getBackupSettings() {
  const settings = database.get("SELECT enabled, time_local, last_result, last_message, last_run_at, telegram_bot_token, telegram_chat_id FROM backup_settings WHERE id = 1");
  return {
    enabled: Boolean(settings.enabled),
    time: settings.time_local,
    timezone,
    telegramConfigured: telegramConfigured(),
    botTokenSaved: Boolean(process.env.TELEGRAM_BOT_TOKEN || settings.telegram_bot_token),
    chatIdSaved: Boolean(process.env.TELEGRAM_CHAT_ID || settings.telegram_chat_id),
    lastResult: settings.last_result,
    lastMessage: settings.last_message,
    lastRunAt: settings.last_run_at
  };
}

function createBackup() {
  const storedState = readAppState().data;
  if (!storedState) throw new Error("Data aplikasi belum pernah tersimpan.");
  const state = sanitizeAppState(storedState, storedState, "admin");
  const users = database.all(
    `SELECT app_users.id, app_users.name, app_users.email, app_users.role,
            app_users.password_hash, app_users.created_at
     FROM app_users
     WHERE NOT EXISTS (SELECT 1 FROM player_user_links WHERE player_user_links.user_id = app_users.id)
     ORDER BY app_users.id`
  );
  const settings = database.get("SELECT enabled, time_local FROM backup_settings WHERE id = 1");
  return {
    format: "volleydesk-backup",
    version: 1,
    createdAt: new Date().toISOString(),
    data: state,
    users,
    backupSettings: { enabled: Boolean(settings.enabled), time: settings.time_local }
  };
}

async function sendTelegramBackup() {
  const credentials = telegramCredentials();
  if (!credentials.token || !credentials.chatId) {
    const error = new Error("Telegram belum dikonfigurasi di Railway.");
    error.status = 503;
    throw error;
  }
  const backup = createBackup();
  const contents = JSON.stringify(backup, null, 2);
  const bytes = Buffer.byteLength(contents, "utf8");
  if (bytes > maximumTelegramDocumentBytes) {
    throw new Error("Berkas backup melewati batas 40 MB untuk pengiriman bot.");
  }
  const form = new FormData();
  form.set("chat_id", credentials.chatId);
  form.set("caption", `VolleyDesk backup ${new Date().toLocaleString("id-ID", { timeZone: timezone })}`);
  form.set("document", new Blob([contents], { type: "application/json" }), `volleydesk-backup-${new Date().toISOString().slice(0, 10)}.json`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const result = await fetch(`https://api.telegram.org/bot${credentials.token}/sendDocument`, {
      method: "POST",
      body: form,
      signal: controller.signal
    });
    const payload = await result.json().catch(() => null);
    if (!result.ok || !payload || payload.ok !== true) {
      throw new Error("Telegram gagal menerima berkas backup.");
    }
  } finally {
    clearTimeout(timeout);
  }
}

function saveBackupResult(result, message, scheduled) {
  database.transaction(() => database.run(
    scheduled
      ? "UPDATE backup_settings SET last_attempt_at = ?, last_result = ?, last_message = ?, last_run_at = CURRENT_TIMESTAMP WHERE id = 1"
      : "UPDATE backup_settings SET last_result = ?, last_message = ?, last_run_at = CURRENT_TIMESTAMP WHERE id = 1",
    scheduled ? [Date.now(), result, message] : [result, message]
  ));
}

app.get("/api/admin/backup-settings", requireUser, requireAdmin, (request, response) => {
  response.json(getBackupSettings());
});

async function publicPortalDetails(request) {
  const settings = database.get("SELECT token, enabled FROM public_portal WHERE id = 1");
  const enabled = Boolean(settings && settings.enabled && validPortalToken(settings.token));
  if (!enabled) return { enabled: false, url: "", qrDataUrl: "" };
  const url = new URL(`/portal/${settings.token}`, `${request.protocol}://${request.get("host")}`).toString();
  return { enabled: true, url, qrDataUrl: await QRCode.toDataURL(url, { margin: 1, width: 220 }) };
}

app.get("/api/admin/public-portal", requireUser, requireAdmin, async (request, response, next) => {
  try {
    response.json(await publicPortalDetails(request));
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/public-portal", requireSameOrigin, requireUser, requireAdmin, async (request, response, next) => {
  try {
    const token = crypto.randomBytes(32).toString("base64url");
    database.transaction(() => database.run(
      "UPDATE public_portal SET token = ?, enabled = 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
      [token]
    ));
    response.json(await publicPortalDetails(request));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/public-portal", requireSameOrigin, requireUser, requireAdmin, (request, response) => {
  database.transaction(() => database.run(
    "UPDATE public_portal SET token = NULL, enabled = 0, updated_at = CURRENT_TIMESTAMP WHERE id = 1"
  ));
  response.json({ enabled: false, url: "", qrDataUrl: "" });
});

app.put("/api/admin/backup-settings", requireSameOrigin, requireUser, requireAdmin, (request, response) => {
  const enabled = request.body.enabled === true;
  const time = typeof request.body.time === "string" ? request.body.time : "";
  const botToken = typeof request.body.botToken === "string" ? request.body.botToken.trim() : "";
  const chatId = typeof request.body.chatId === "string" ? request.body.chatId.trim() : "";
  const clearCredentials = request.body.clearCredentials === true;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    apiError(response, 400, "Format waktu backup tidak valid.");
    return;
  }
  if (botToken.length > 256 || chatId.length > 128 || (botToken && !/^\d+:[A-Za-z0-9_-]{20,}$/.test(botToken))) {
    apiError(response, 400, "Format token bot atau chat ID tidak valid.");
    return;
  }
  const stored = database.get("SELECT telegram_bot_token, telegram_chat_id FROM backup_settings WHERE id = 1");
  const nextToken = process.env.TELEGRAM_BOT_TOKEN || (clearCredentials ? "" : botToken || stored.telegram_bot_token || "");
  const nextChatId = process.env.TELEGRAM_CHAT_ID || (clearCredentials ? "" : chatId || stored.telegram_chat_id || "");
  if (enabled && !(nextToken && nextChatId)) {
    apiError(response, 503, "Isi token bot dan chat ID terlebih dahulu sebelum mengaktifkan backup.");
    return;
  }
  database.transaction(() => database.run(
    "UPDATE backup_settings SET enabled = ?, time_local = ?, telegram_bot_token = ?, telegram_chat_id = ? WHERE id = 1",
    [enabled ? 1 : 0, time, process.env.TELEGRAM_BOT_TOKEN ? stored.telegram_bot_token : nextToken || null, process.env.TELEGRAM_CHAT_ID ? stored.telegram_chat_id : nextChatId || null]
  ));
  response.json(getBackupSettings());
});

app.get("/api/admin/backup/download", requireUser, requireAdmin, (request, response, next) => {
  try {
    const contents = JSON.stringify(createBackup(), null, 2);
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Content-Disposition", `attachment; filename="volleydesk-backup-${new Date().toISOString().slice(0, 10)}.json"`);
    response.send(contents);
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/backup/telegram", requireSameOrigin, requireUser, requireAdmin, async (request, response, next) => {
  try {
    await sendTelegramBackup();
    saveBackupResult("success", "Backup manual berhasil dikirim ke Telegram.");
    response.json(getBackupSettings());
  } catch (error) {
    saveBackupResult("failed", error.message || "Backup gagal.");
    if (error.status) {
      apiError(response, error.status, error.message);
      return;
    }
    next(error);
  }
});

app.post("/api/admin/restore", requireSameOrigin, requireUser, requireAdmin, (request, response, next) => {
  try {
    const backup = request.body.backup;
    if (!isRecord(backup) || backup.format !== "volleydesk-backup" || backup.version !== 1 ||
        !Array.isArray(backup.users) || backup.users.length < 1 || backup.users.length > 500 ||
        !backup.users.some(user => isRecord(user) && user.role === "admin") ||
        !isRecord(backup.backupSettings) ||
        typeof backup.backupSettings.enabled !== "boolean" ||
        typeof backup.backupSettings.time !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(backup.backupSettings.time)) {
      apiError(response, 400, "Format berkas backup tidak dikenal.");
      return;
    }
    const state = sanitizeAppState(backup.data, readAppState().data, "admin");
    const userIds = new Set();
    const userEmails = new Set();
    const users = backup.users.map(user => {
      const role = user && (user.backup_role || user.role);
      if (!isRecord(user) || !Number.isSafeInteger(Number(user.id)) || Number(user.id) < 1 ||
          typeof user.name !== "string" || !user.name.trim() || user.name.length > 80 ||
          typeof user.email !== "string" || !validLoginIdentifier(user.email) || user.email.length > 254 ||
          (!validRoles.has(role) && role !== "player") ||
          typeof user.password_hash !== "string" || !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.password_hash)) {
        throw new Error("Berkas backup berisi data akun yang tidak valid.");
      }
      const email = user.email.trim().toLowerCase();
      if (userIds.has(Number(user.id)) || userEmails.has(email)) throw new Error("Berkas backup berisi akun duplikat.");
      userIds.add(Number(user.id));
      userEmails.add(email);
      return {
        id: Number(user.id),
        name: user.name.trim(),
        email,
        role,
        passwordHash: user.password_hash,
        createdAt: typeof user.created_at === "string" && user.created_at.length <= 40
          ? user.created_at
          : new Date().toISOString()
      };
    }).filter(user => user.role !== "player");
    if (users.filter(user => user.role === "admin").length !== 1) {
      apiError(response, 400, "Berkas backup harus berisi tepat satu akun admin.");
      return;
    }
    database.transaction(() => {
      database.run("DELETE FROM auth_sessions");
      database.run("DELETE FROM player_user_links");
      database.run("DELETE FROM app_users");
      for (const user of users) {
        database.run(
          "INSERT INTO app_users (id, name, email, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
          [user.id, user.name, user.email, user.role, user.passwordHash, user.createdAt || new Date().toISOString()]
        );
      }
      database.run(
        `INSERT INTO app_state (id, state_json, is_initial, updated_at) VALUES (1, ?, 0, CURRENT_TIMESTAMP)
         ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, is_initial = 0, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(state)]
      );
      database.run(
        "UPDATE backup_settings SET enabled = ?, time_local = ? WHERE id = 1",
        [backup.backupSettings.enabled ? 1 : 0, backup.backupSettings.time]
      );
    });
    clearSessionCookie(response);
    response.json({ ok: true });
  } catch (error) {
    if (error.message === "Format data aplikasi tidak valid." || error.message === "Ukuran data terlalu besar.") {
      apiError(response, 400, error.message);
      return;
    }
    if (error.message === "Berkas backup berisi data akun yang tidak valid." ||
        error.message === "Berkas backup berisi akun duplikat.") {
      apiError(response, 400, error.message);
      return;
    }
    next(error);
  }
});

function jakartaDateTime() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return { date: `${values.year}-${values.month}-${values.day}`, time: `${values.hour}:${values.minute}` };
}

async function runScheduledBackup() {
  const now = jakartaDateTime();
  const settings = database.get("SELECT enabled, time_local, last_scheduled_date, last_attempt_at FROM backup_settings WHERE id = 1");
  if (!settings.enabled || settings.last_scheduled_date === now.date || now.time < settings.time_local || !telegramConfigured()) return;
  if (settings.last_attempt_at && Date.now() - Number(settings.last_attempt_at) < 30 * 60 * 1000) return;
  database.transaction(() => database.run(
    "UPDATE backup_settings SET last_attempt_at = ?, last_result = 'running', last_message = ?, last_run_at = CURRENT_TIMESTAMP WHERE id = 1",
    [Date.now(), "Backup terjadwal sedang dikirim."]
  ));
  try {
    await sendTelegramBackup();
    database.transaction(() => database.run("UPDATE backup_settings SET last_scheduled_date = ? WHERE id = 1", [now.date]));
    saveBackupResult("success", "Backup harian berhasil dikirim ke Telegram.", true);
  } catch (error) {
    console.error("Scheduled Telegram backup failed:", error.message);
    saveBackupResult("failed", error.message || "Backup harian gagal.", true);
  }
}

let server;
let scheduler;

async function start() {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    throw new Error("BACKUP_TIMEZONE is not a valid IANA timezone.");
  }
  database = await initializeDatabase();
  const adminCount = database.get("SELECT COUNT(*) AS count FROM app_users WHERE role = 'admin'");
  if (Number(adminCount.count) === 0) {
    const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || (process.env.NODE_ENV === "production" ? "" : "admin@volleydesk.demo")).trim().toLowerCase();
    const name = (process.env.BOOTSTRAP_ADMIN_NAME || (process.env.NODE_ENV === "production" ? "" : "Administrator")).trim();
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "VoliDesk!2026");
    if (!validEmail.test(email) || !name || name.length > 80 || password.length < minimumPasswordLength) {
      throw new Error("Set BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_NAME, and BOOTSTRAP_ADMIN_PASSWORD (minimum 6 characters) before starting.");
    }
    const passwordHash = await bcrypt.hash(password, 12);
    database.transaction(() => database.run(
      "INSERT INTO app_users (name, email, role, password_hash) VALUES (?, ?, 'admin', ?)",
      [name, email, passwordHash]
    ));
    console.log("Bootstrap administrator account created.");
  }

  app.get("/portal/:token", (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Referrer-Policy", "no-referrer");
    if (!publicPortalMatches(request.params.token)) {
      response.status(404).type("text/plain").send("Portal publik tidak ditemukan.");
      return;
    }
    response.sendFile(path.join(publicDirectory, "portal.html"));
  });

  app.use(express.static(publicDirectory, {
    dotfiles: "deny",
    index: "index.html",
    maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
    setHeaders(response, filePath) {
      if (path.extname(filePath) === ".html") response.setHeader("Cache-Control", "no-cache");
    }
  }));
  app.use((request, response) => {
    response.status(404).type("text/plain").send("Not Found");
  });
  app.use((error, request, response, next) => {
    console.error("Request failed:", error);
    if (response.headersSent) {
      next(error);
      return;
    }
    response.status(500).json({ error: "Terjadi kesalahan pada server." });
  });

  if (!process.env.VERCEL) {
    server = app.listen(port, "0.0.0.0", () => {
      console.log(`VolleyDesk listening on port ${port}; SQLite at ${process.env.SQLITE_PATH || "data/volleydesk.sqlite"}`);
    });
    scheduler = setInterval(() => { runScheduledBackup().catch(error => console.error("Backup scheduler failed:", error)); }, 30000);
  }
}

if (!process.env.VERCEL) {
  start().catch(error => {
    console.error("VolleyDesk startup failed:", error);
    process.exitCode = 1;
  });
}

module.exports = { app, start };

function shutdown() {
  if (scheduler) clearInterval(scheduler);
  if (server) {
    server.close(() => {
      try { database.close(); } catch (error) { console.error("Database shutdown failed:", error); }
    });
  } else if (database) {
    try { database.close(); } catch (error) { console.error("Database shutdown failed:", error); }
  }
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
