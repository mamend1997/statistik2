(function () {
      "use strict";
      const STORAGE_KEY = "volleyDeskDataV1";
      const LEGACY_IMPORTED_KEY = "volleyDeskLegacyImportedV1";
      const LAST_PAGE_KEY = "volleyDeskLastPageV1";
      const LAST_PLAYER_KEY = "volleyDeskLastPlayerV1";
      const MIN_PASSWORD_LENGTH = 6;
      const roles = {
        admin: "Admin / Operator",
        principal: "Kepala Sekolah",
        curriculum: "Wakasek Kesiswaan",
        coach: "Pelatih"
      };
      const pages = [
        { id: "dashboard", label: "Dashboard", icon: "▦", roles: ["admin", "principal", "curriculum", "coach"] },
        { id: "attendance", label: "Latihan", icon: "✓", roles: ["admin", "principal", "curriculum", "coach"] },
        { id: "training", label: "Pertandingan", icon: "◎", roles: ["admin", "coach"] },
        { id: "schedule", label: "Kalender", icon: "▣", roles: ["admin", "principal", "curriculum", "coach"] },
        { id: "players", label: "Data pemain", icon: "♟", roles: ["admin", "coach"] },
        { id: "teams", label: "Tim", icon: "🏐", roles: ["admin", "coach"] },
        { id: "strategy", label: "Papan Strategi", icon: "♧", roles: ["admin", "coach"] },
        { id: "reports", label: "Laporan", icon: "▤", roles: ["admin", "principal", "curriculum", "coach"] },
        { id: "activityLog", label: "Log aktivitas", icon: "◷", roles: ["admin"] },
        { id: "settings", label: "Pengaturan", icon: "⚙", roles: ["admin"] }
      ];
      const brandingDefaults = {
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
      const defaultAccessPermissions = Object.fromEntries(Object.keys(roles).map(role => [
        role,
        Object.fromEntries(pages.filter(page => !["settings", "activityLog"].includes(page.id)).map(page => [
          page.id,
          role === "admin" || role === "coach" ? "full" : "view"
        ]))
      ]));
      const defaultData = {
        theme: "light",
        role: "coach",
        branding: { ...brandingDefaults },
        menuVisibility: {
          admin: pages.filter(p => p.roles.includes("admin")).map(p => p.id),
          principal: ["dashboard", "attendance", "schedule", "reports"],
          curriculum: ["dashboard", "attendance", "schedule", "reports"],
          coach: ["dashboard", "players", "teams", "attendance", "schedule", "training", "strategy", "reports"]
        },
        highlights: { admin: "dashboard", principal: "dashboard", curriculum: "schedule", coach: "attendance" },
        bottomNav: {
          admin: ["dashboard", "players", "attendance", "schedule", "settings"],
          principal: ["dashboard", "attendance", "schedule", "reports"],
          curriculum: ["dashboard", "schedule", "attendance", "reports"],
          coach: ["dashboard", "players", "attendance", "training", "schedule"]
        },
        bottomHighlights: { admin: "dashboard", principal: "dashboard", curriculum: "schedule", coach: "attendance" },
        accessPermissions: JSON.parse(JSON.stringify(defaultAccessPermissions)),
        menuConfigVersion: 1,
        players: [
          { id: 1, name: "Nadia Putri", position: "Setter", number: 7, className: "XI IPA 1", height: 166, weight: 55, verticalJump: 33, spikeReach: 274, blockReach: 262, history: [{ date: "2026-09-10", height: 165, weight: 54, verticalJump: 31, spikeReach: 271, blockReach: 260 }, { date: "2026-11-01", height: 166, weight: 55, verticalJump: 33, spikeReach: 274, blockReach: 262 }] },
          { id: 2, name: "Alya Safitri", position: "Outside Hitter", number: 12, className: "X IPA 2", height: 171, weight: 58, verticalJump: 43, spikeReach: 286, blockReach: 273, history: [{ date: "2026-10-12", height: 170, weight: 58, verticalJump: 39, spikeReach: 282, blockReach: 270 }, { date: "2026-11-02", height: 171, weight: 58, verticalJump: 43, spikeReach: 286, blockReach: 273 }] },
          { id: 3, name: "Dinda Maharani", position: "Libero", number:  liberoNumber(), className: "XI IPS 1", height: 158, weight: 50, verticalJump: 30, spikeReach: 253, blockReach: 244, history: [{ date: "2026-10-08", height: 158, weight: 50, verticalJump: 28, spikeReach: 251, blockReach: 242 }, { date: "2026-11-03", height: 158, weight: 50, verticalJump: 30, spikeReach: 253, blockReach: 244 }] },
          { id: 4, name: "Salsa Amalia", position: "Middle Blocker", number: 9, className: "XII IPA 2", height: 174, weight: 63, verticalJump: 43, spikeReach: 290, blockReach: 279, history: [{ date: "2026-09-14", height: 173, weight: 62, verticalJump: 40, spikeReach: 286, blockReach: 276 }, { date: "2026-11-04", height: 174, weight: 63, verticalJump: 43, spikeReach: 290, blockReach: 279 }] },
          { id: 5, name: "Rani Oktavia", position: "Opposite", number: 4, className: "XI IPA 3", height: 169, weight: 57, verticalJump: 39, spikeReach: 282, blockReach: 269, history: [{ date: "2026-10-15", height: 169, weight: 57, verticalJump: 37, spikeReach: 278, blockReach: 267 }, { date: "2026-11-05", height: 169, weight: 57, verticalJump: 39, spikeReach: 282, blockReach: 269 }] },
          { id: 6, name: "Citra Lestari", position: "Outside Hitter", number: 10, className: "X IPA 1", height: 164, weight: 53, verticalJump: 36, spikeReach: 272, blockReach: 261, history: [{ date: "2026-09-15", height: 163, weight: 52, verticalJump: 33, spikeReach: 269, blockReach: 258 }, { date: "2026-11-06", height: 164, weight: 53, verticalJump: 36, spikeReach: 272, blockReach: 261 }] }
        ],
        teams: [],
        sessions: [
          { id: 1, date: "2026-11-12", title: "Latihan teknik dasar", drills: ["Drilling passing bawah", "Serve target"], notes: "Fokus platform receive dan komunikasi bola.", attendance: { 1: "Hadir", 2: "Hadir", 3: "Hadir", 4: "Hadir", 5: "Izin", 6: "Hadir" } },
          { id: 2, date: "2026-11-05", title: "Latihan kombinasi", drills: ["Spike footwork", "Block positioning", "Game simulation"], notes: "Akurasi approach meningkat.", attendance: { 1: "Hadir", 2: "Hadir", 3: "Hadir", 4: "Izin", 5: "Hadir", 6: "Hadir" } },
          { id: 3, date: "2026-10-29", title: "Latihan pertahanan", drills: ["Dig defense", "Serving tactical"], notes: "Evaluasi transisi defense ke offense.", attendance: { 1: "Hadir", 2: "Sakit", 3: "Hadir", 4: "Hadir", 5: "Hadir", 6: "Hadir" } }
        ],
        events: [
          { id: 1, title: "Latihan teknik & taktik", type: "Latihan", date: "2026-11-18", time: "15:30", location: "GOR Sekolah", reminder: true },
          { id: 2, title: "Sparring vs SMA Harapan", type: "Sparring", date: "2026-11-21", time: "08:00", location: "GOR Kota", reminder: true },
          { id: 3, title: "Pemulihan & istirahat tim", type: "Istirahat", date: "2026-11-23", time: "00:00", location: "Rumah", reminder: false },
          { id: 4, title: "Turnamen antar sekolah", type: "Turnamen", date: "2026-11-28", time: "07:30", location: "GOR Kabupaten", reminder: true }
        ],
        matches: [
          { id: 1, name: "Uji Coba vs SMA Harapan", date: "2026-11-08", opponent: "SMA Harapan", stats: [
            { playerId: 2, skill: "Attack", success: 8, errors: 5 }, { playerId: 4, skill: "Block", success: 4, errors: 2 }, { playerId: 1, skill: "Set", success: 15, errors: 3 }, { playerId: 3, skill: "Receive", success: 12, errors: 4 }, { playerId: 5, skill: "Serve", success: 5, errors: 3 }
          ] }
        ],
        strategyBoards: [],
        targets: {}
      };
      function liberoNumber() { return 3; }
      let signedInUser = null;
      let serverUsers = [];
      let applicationBranding = { ...brandingDefaults };
      let data = JSON.parse(JSON.stringify(defaultData));
      let backupSettings = null;
      let publicPortal = null;
      let activityLogEntries = null;
      let activityLogLoading = false;
      let activityLogError = "";
      let legacyData = null;
      let saveQueue = Promise.resolve();
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        legacyData = saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.error("Data lama VolleyDesk di browser tidak dapat dibaca.", error);
      }
      let currentPage = "dashboard";
      let settingsRoleKey = data.role || "coach";
      let selectedMatchId = data.matches[0] ? data.matches[0].id : null;
      let selectedPlayerId = null;
      let matchStatsDirty = false;
      let selectedTargetPlayerId = null;
      let selectedStrategyId = null;
      let strategyDraft = null;
      let strategyDirty = false;
      let selectedTargetPeriod = "week";
      let reportPeriod = "month";
      let reportCustomStart = "";
      let reportCustomEnd = "";
      let calendarMonth = new Date();
      calendarMonth.setDate(1);
      let calendarView = "month";
      let selectedCalendarDate = "";
      let searchTerm = "";
      let selectedPlayerIds = new Set();
      let bottomNavRole = "coach";

      const $ = (selector, root) => (root || document).querySelector(selector);
      async function api(url, options) {
        const response = await fetch(url, Object.assign({ credentials: "same-origin" }, options || {}));
        if (response.status === 204) return null;
        let payload = null;
        try { payload = await response.json(); } catch {}
        if (!response.ok) {
          const error = new Error(payload && payload.error ? payload.error : "Permintaan ke server gagal.");
          error.status = response.status;
          throw error;
        }
        return payload;
      }
      const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      const todayISO = () => new Date().toISOString().slice(0, 10);
      const validBirthDate = value => {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        if (!match || value > todayISO()) return false;
        const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
        return date.getUTCFullYear() === Number(match[1]) &&
          date.getUTCMonth() === Number(match[2]) - 1 &&
          date.getUTCDate() === Number(match[3]);
      };
      const dateObj = value => new Date(value + "T12:00:00");
      const formatDate = value => dateObj(value).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
      const shortMonth = value => dateObj(value).toLocaleDateString("id-ID", { month: "short" }).replace(".", "");
      const activeRole = () => data.role || "coach";
      const playerById = id => data.players.find(p => Number(p.id) === Number(id));
      function accessLevel(menu) {
        if (activeRole() === "admin") return "full";
        const rolePermissions = data.accessPermissions && data.accessPermissions[activeRole()];
        return rolePermissions && rolePermissions[menu] || (activeRole() === "coach" ? "full" : "view");
      }
      const canEditMenu = menu => ["edit", "full"].includes(accessLevel(menu));
      const canDeleteMenu = menu => accessLevel(menu) === "full";
      function calendarMenuForSource(source) {
        return source === "session" ? "attendance" : source === "match" ? "training" : "schedule";
      }
      function applyPageActionPermissions(menu) {
        const editSelectors = [
          '#content button[data-action^="add-"]',
          '#content button[data-action^="new-"]',
          '#content button[data-action^="save-"]',
          '#content button[data-action^="update-"]',
          '#content button[data-action="player-import"]',
          '#content button[data-edit-player]',
          '#content button[data-edit-team]',
          '#content button[data-session-edit]',
          '#content button[data-edit-match]',
          '#content button[data-calendar-event-edit]',
          '#content button[data-preview-edit]',
          '#content button[data-update-anthropometry]',
          '#content button[data-edit-attendance]',
          '#content button[data-live-stat]',
          '#content button[data-open-live-match]',
          '#content button[data-preview-live]',
          '#content button[data-delete-stat]',
          '#modal-root button[data-action^="add-"]',
          '#modal-root button[data-action^="save-"]',
          '#modal-root button[data-session-edit]',
          '#modal-root button[data-edit-match]',
          '#modal-root button[data-calendar-event-edit]',
          '#modal-root button[data-preview-edit]',
          '#modal-root button[data-preview-live]',
          '#modal-root button[data-edit-attendance]'
        ];
        if (!canEditMenu(menu)) {
          document.querySelectorAll(editSelectors.join(",")).forEach(element => { element.hidden = true; });
          document.querySelectorAll("#content [data-match-set], #content [data-match-evaluation]").forEach(element => {
            element.readOnly = true;
          });
        }
        document.querySelectorAll("#content button[data-calendar-edit-source]").forEach(button => {
          button.hidden = !canEditMenu(calendarMenuForSource(button.dataset.calendarEditSource));
        });
        document.querySelectorAll("#content button[data-calendar-delete-source]").forEach(button => {
          button.hidden = !canDeleteMenu(calendarMenuForSource(button.dataset.calendarDeleteSource));
        });
        const deleteSelectors = [
          '#content button[data-action^="delete-"]',
          '#content button[data-delete-player]',
          '#content button[data-delete-team]',
          '#content button[data-delete-session]',
          '#content button[data-delete-event]',
          '#content button[data-delete-stat]',
          '#content button[data-delete-strategy]',
          '#content button[data-delete-match]',
          '#modal-root button[data-delete-player]',
          '#modal-root button[data-delete-team]',
          '#modal-root button[data-delete-session]',
          '#modal-root button[data-delete-strategy]',
          '#modal-root button[data-delete-match]'
        ];
        if (!canDeleteMenu(menu)) {
          document.querySelectorAll(deleteSelectors.join(",")).forEach(element => { element.hidden = true; });
        }
      }
      const visiblePages = () => pages.filter(p =>
        (p.id !== "settings" || activeRole() === "admin") &&
        (p.id !== "activityLog" || activeRole() === "admin") &&
        (data.menuVisibility[activeRole()] || []).includes(p.id)
      );
      function restoreLastPage() {
        if (!signedInUser) return;
        try {
          const savedPage = localStorage.getItem(`${LAST_PAGE_KEY}:${signedInUser.id}`);
          const canOpenLiveMatch = savedPage === "matches" && visiblePages().some(page => page.id === "training");
          const canOpenPlayerStats = savedPage === "playerStats" && visiblePages().some(page => page.id === "players");
          if (canOpenPlayerStats) {
            selectedPlayerId = Number(localStorage.getItem(`${LAST_PLAYER_KEY}:${signedInUser.id}`));
            if (!playerById(selectedPlayerId)) selectedPlayerId = null;
          }
          if (canOpenPlayerStats && selectedPlayerId != null) {
            currentPage = "playerStats";
            return;
          }
          if (canOpenLiveMatch || visiblePages().some(page => page.id === savedPage)) currentPage = savedPage;
        } catch (error) {
          console.error("Halaman terakhir tidak dapat dipulihkan.", error);
        }
      }
      function saveLastPage() {
        if (!signedInUser) return;
        try {
          const key = `${LAST_PAGE_KEY}:${signedInUser.id}`;
          if (localStorage.getItem(key) !== currentPage) localStorage.setItem(key, currentPage);
        } catch (error) {
          console.error("Halaman terakhir tidak dapat disimpan.", error);
        }
      }
      function applyBranding(branding) {
        applicationBranding = Object.assign({}, brandingDefaults, branding || {});
        const logo = applicationBranding.logo;
        document.querySelectorAll(".brand-mark").forEach(mark => {
          mark.textContent = "";
          mark.classList.toggle("custom-logo", Boolean(logo));
          if (!logo) {
            mark.textContent = "V";
            return;
          }
          const image = document.createElement("img");
          image.src = logo;
          image.alt = `Logo ${applicationBranding.appName}`;
          image.className = "brand-mark-image";
          mark.appendChild(image);
        });
        document.querySelectorAll(".brand-name").forEach(name => {
          const subtitle = document.createElement("span");
          subtitle.className = "brand-sub";
          subtitle.textContent = applicationBranding.appSubtitle;
          name.replaceChildren(document.createTextNode(applicationBranding.appName), subtitle);
        });
        const crumbBrand = $("#crumb-brand");
        if (crumbBrand) crumbBrand.textContent = applicationBranding.appName;
        document.title = applicationBranding.tabTitle;
        const loginSubmit = $("#login-submit");
        if (loginSubmit) loginSubmit.textContent = `Masuk ke ${applicationBranding.appName}`;
        const loginHelp = $("#login-help");
        if (loginHelp) loginHelp.textContent = `Pemain dapat membuka Portal Publik ${applicationBranding.appName} melalui tautan yang dibagikan admin atau pelatih.`;
        const favicon = $("#app-favicon");
        if (favicon) {
          const icon = applicationBranding.favicon;
          favicon.href = icon || "/favicon.svg";
          favicon.type = icon ? icon.slice(5, icon.indexOf(";")) : "image/svg+xml";
        }
      }
      function persist() {
        const snapshot = JSON.stringify(data);
        saveQueue = saveQueue.catch(() => {}).then(() => api("/api/state", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: JSON.parse(snapshot) })
        }));
        return saveQueue.then(() => true).catch(error => {
          console.error("Penyimpanan data VolleyDesk ke server gagal.", error);
          toast(error.message || "Penyimpanan ke server gagal.");
          return false;
        });
      }
      function toast(message) {
        const node = $("#toast"); node.textContent = message; node.classList.add("show");
        window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => node.classList.remove("show"), 2600);
      }
      function initials(name) { return name.split(/\s+/).slice(0, 2).map(s => s[0]).join("").toUpperCase(); }
      function attendanceRate(playerId) {
        const records = data.sessions.filter(s => s.attendance && s.attendance[playerId]);
        if (!records.length) return 0;
        return Math.round(records.filter(s => s.attendance[playerId] === "Hadir").length / records.length * 100);
      }
      function allAttendanceRate() {
        const total = data.players.reduce((sum, p) => sum + data.sessions.filter(s => s.attendance && s.attendance[p.id]).length, 0);
        const present = data.players.reduce((sum, p) => sum + data.sessions.filter(s => s.attendance && s.attendance[p.id] === "Hadir").length, 0);
        return total ? Math.round(present / total * 100) : 0;
      }
      function skillEfficiency(playerId, skill) {
        const stats = data.matches.flatMap(m => m.stats || []).filter(s => Number(s.playerId) === Number(playerId) && (!skill || s.skill === skill));
        const success = stats.reduce((sum, s) => sum + Number(s.success || 0), 0);
        const attempts = stats.reduce((sum, s) => sum + Number(s.success || 0) + Number(s.errors || 0), 0);
        return attempts ? Math.round(success / attempts * 100) : null;
      }
      function dateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }
      function targetDateRange(period) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        if (period === "month") {
          start.setDate(1);
          end.setMonth(end.getMonth() + 1, 0);
        } else {
          const day = (start.getDay() + 6) % 7;
          start.setDate(start.getDate() - day);
          end.setDate(start.getDate() + 6);
        }
        return { start: dateKey(start), end: dateKey(end), weeks: Math.max(1, (end - start) / 604800000 + 1) };
      }
      function reportDateRange() {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const end = new Date(start);
        if (reportPeriod === "week") {
          start.setDate(start.getDate() - (start.getDay() + 6) % 7);
          end.setTime(start.getTime());
          end.setDate(end.getDate() + 6);
        } else if (reportPeriod === "month") {
          start.setDate(1);
          end.setMonth(end.getMonth() + 1, 0);
        } else if (reportPeriod === "year") {
          start.setMonth(0, 1);
          end.setMonth(11, 31);
        } else {
          return {
            start: reportCustomStart || dateKey(new Date(today.getFullYear(), today.getMonth(), 1)),
            end: reportCustomEnd || dateKey(today)
          };
        }
        return { start: dateKey(start), end: dateKey(end) };
      }
      function targetDefaultsForPosition(position, period) {
        const defaults = {
          "Libero": { blockSuccess: 0, attackSuccess: 0, serveErrors: 1, receiveErrors: 2 },
          "Setter": { blockSuccess: 2, attackSuccess: 4, serveErrors: 2, receiveErrors: 2 },
          "Outside Hitter": { blockSuccess: 3, attackSuccess: 8, serveErrors: 2, receiveErrors: 3 },
          "Opposite": { blockSuccess: 3, attackSuccess: 8, serveErrors: 2, receiveErrors: 2 },
          "Middle Blocker": { blockSuccess: 5, attackSuccess: 5, serveErrors: 2, receiveErrors: 2 }
        };
        const base = defaults[position] || defaults["Setter"];
        const multiplier = period === "month" ? 4 : 1;
        return Object.fromEntries(Object.entries(base).map(([key, value]) => [key, value * multiplier]));
      }
      function targetMetrics(playerId, period) {
        const range = targetDateRange(period);
        const stats = data.matches.filter(match => match.date >= range.start && match.date <= range.end)
          .flatMap(match => match.stats || []).filter(stat => Number(stat.playerId) === Number(playerId));
        const sum = skill => stats.filter(stat => stat.skill === skill).reduce((total, stat) => ({
          success: total.success + Number(stat.success || 0),
          errors: total.errors + Number(stat.errors || 0)
        }), { success: 0, errors: 0 });
        const serve = sum("Serve"), receive = sum("Receive"), attack = sum("Attack"), block = sum("Block");
        return {
          blockSuccess: block.success,
          attackSuccess: attack.success,
          serveErrors: serve.errors,
          receiveErrors: receive.errors
        };
      }
      function attendanceReachCorrelation() {
        const paired = data.players.map(p => {
          const history = (p.history || []).slice().sort((a, b) => a.date.localeCompare(b.date));
          const hasAttendance = data.sessions.some(s => s.attendance && s.attendance[p.id]);
          if (!hasAttendance || history.length < 2) return null;
          return { attendance: attendanceRate(p.id), reachChange: Number(history[history.length - 1].spikeReach) - Number(history[history.length - 2].spikeReach) };
        }).filter(Boolean);
        if (paired.length < 3) return { count: paired.length, value: null };
        const avgX = paired.reduce((sum, item) => sum + item.attendance, 0) / paired.length;
        const avgY = paired.reduce((sum, item) => sum + item.reachChange, 0) / paired.length;
        const numerator = paired.reduce((sum, item) => sum + (item.attendance - avgX) * (item.reachChange - avgY), 0);
        const denomX = paired.reduce((sum, item) => sum + Math.pow(item.attendance - avgX, 2), 0);
        const denomY = paired.reduce((sum, item) => sum + Math.pow(item.reachChange - avgY, 2), 0);
        return { count: paired.length, value: denomX && denomY ? numerator / Math.sqrt(denomX * denomY) : null };
      }
      function syncRoleOptions() {
        const roleLabel = roles[activeRole()];
        $("#top-role").textContent = roleLabel;
        $("#sidebar-role").textContent = roleLabel;
        $("#sidebar-user").textContent = signedInUser ? signedInUser.name : roleLabel;
      }
      function renderNav() {
        const nav = $("#nav"), bottomNav = $("#bottom-nav"), allowed = visiblePages();
        const canOpenLiveMatch = currentPage === "matches" && allowed.some(page => page.id === "training");
        const canOpenPlayerStats = currentPage === "playerStats" && allowed.some(page => page.id === "players") && Boolean(playerById(selectedPlayerId));
        if (!canOpenLiveMatch && !canOpenPlayerStats && !allowed.some(p => p.id === currentPage)) currentPage = allowed.length ? allowed[0].id : "dashboard";
        saveLastPage();
        const highlight = data.highlights[activeRole()];
        nav.innerHTML = allowed.length ? allowed.map(p => `<button class="nav-btn ${currentPage === p.id || (canOpenLiveMatch && p.id === "training") || (canOpenPlayerStats && p.id === "players") ? "active" : ""}" data-page="${p.id}"><span class="nav-icon">${p.icon}</span><span>${esc(p.label)}</span>${highlight === p.id && p.id !== "dashboard" ? '<span class="nav-pin">★</span>' : ""}</button>`).join("") : '<div class="empty">Belum ada menu yang diizinkan.</div>';
        nav.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => {
          if (!canLeaveStrategy(button.dataset.page)) return;
          currentPage = button.dataset.page; $("#sidebar").classList.remove("open"); render();
        }));
        const bottomIds = (data.bottomNav && data.bottomNav[activeRole()] || []).filter(id => allowed.some(page => page.id === id)).slice(0, 5);
        const bottomHighlight = data.bottomHighlights && data.bottomHighlights[activeRole()];
        bottomNav.innerHTML = bottomIds.map(id => {
          const page = allowed.find(item => item.id === id);
          return `<button class="bottom-nav-btn ${currentPage === id || (canOpenLiveMatch && id === "training") || (canOpenPlayerStats && id === "players") ? "active" : ""} ${bottomHighlight === id ? "highlight" : ""}" data-page="${id}" aria-label="${esc(page.label)}"><span class="nav-icon">${page.icon}</span><span>${esc(page.label)}</span></button>`;
        }).join("");
        bottomNav.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => {
          if (!canLeaveStrategy(button.dataset.page)) return;
          currentPage = button.dataset.page; render();
        }));
      }
      function canLeaveStrategy(nextPage) {
        if (currentPage !== "strategy" || nextPage === "strategy" || !strategyDirty) return true;
        if (!window.confirm("Perubahan strategi belum disimpan. Tetap tinggalkan halaman?")) return false;
        strategyDraft = null;
        strategyDirty = false;
        return true;
      }
      function syncProfileButton() {
        const button = $("#profile-button");
        button.setAttribute("aria-label", "Buka profil pengguna");
        button.title = "Profil pengguna";
        if (signedInUser && signedInUser.avatar) {
          button.textContent = "";
          const image = document.createElement("img");
          image.src = signedInUser.avatar;
          image.alt = "";
          image.className = "profile-button-avatar";
          button.appendChild(image);
        } else button.textContent = "";
        const label = document.createElement("span");
        label.textContent = "Profil";
        button.appendChild(label);
      }
      function heading(title, subtitle, action) {
        const pageId = currentPage === "matches" ? "training" : currentPage === "playerStats" ? "players" : currentPage;
        const p = pages.find(x => x.id === pageId);
        return `<div class="page-head"><div><div class="eyebrow">${esc(p ? p.label : "VolleyDesk")}</div><h1>${title}</h1><p class="subheading">${subtitle}</p></div>${action || ""}</div>`;
      }
      function metric(label, number, note, icon) {
        return `<div class="card metric"><div class="metric-top">${label}<span class="metric-icon">${icon}</span></div><div class="metric-number">${number}</div><div class="metric-note">${note}</div></div>`;
      }
      function calendarActivities() {
        return [
          ...data.events.map(event => Object.assign({ source: "event" }, event)),
          ...data.sessions.map(session => ({
            id: `session-${session.id}`, title: session.title, type: "Latihan", date: session.date,
            time: session.time || "", location: session.location || "", notes: session.notes || "", source: "session"
          })),
          ...data.matches.map(match => ({
            id: `match-${match.id}`, title: match.name, type: match.eventType || "Pertandingan", date: match.date,
            time: match.time || "", location: match.location || "", notes: match.notes || "", source: "match"
          }))
        ];
      }
      function migrateCalendarActivities() {
        const remainingEvents = [];
        const existingIds = data.sessions.concat(data.matches, data.events).map(item => Number(item.id) || 0);
        let nextId = existingIds.reduce((maximum, id) => Math.max(maximum, id), 0) + 1;
        let migrated = false;
        data.events.forEach(event => {
          const type = String(event.type || "").toLowerCase();
          if (type === "latihan" || type === "latihan tim") {
            data.sessions.push({
              id: nextId++, title: event.title, date: event.date, time: event.time || "",
              location: event.location || "", drills: [], notes: event.notes || "",
              evaluations: {}, attendance: {}, attendanceSaved: false
            });
            migrated = true;
          } else if (["pertandingan", "sparring", "turnamen"].includes(type)) {
            data.matches.push({
              id: nextId++, name: event.title, date: event.date, opponent: "",
              eventType: event.type, time: event.time || "", location: event.location || "",
              notes: event.notes || "", evaluations: {}, stats: []
            });
            migrated = true;
          } else {
            remainingEvents.push(event);
          }
        });
        if (migrated) data.events = remainingEvents;
        return migrated;
      }
      function eventsUpcoming(limit) {
        return calendarActivities().filter(event => event.date >= todayISO())
          .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""))
          .slice(0, limit);
      }
      function eventTypeClass(type) { return type === "Turnamen" ? "orange" : ["Sparring", "Pertandingan"].includes(type) ? "blue" : ""; }
      function calendarActivityColor(event) {
        const type = String(event.type || "").toLowerCase();
        if (type.startsWith("latihan")) return "green";
        if (["pertandingan", "sparring"].includes(type)) return "blue";
        return "orange";
      }
      function calendarDotClass(type) {
        return calendarActivityColor({ type });
      }
      function calendarDayActivityClass(events) {
        const colors = Array.from(new Set(events.map(calendarActivityColor)));
        return colors.length ? "has-activities" : "";
      }
      function calendarDayActivityStyle(events) {
        const colors = Array.from(new Set(events.map(calendarActivityColor)));
        if (!colors.length) return "";
        const palette = {
          green: { color: "var(--green)", background: "var(--green-soft)" },
          blue: { color: "var(--blue)", background: "var(--blue-soft)" },
          orange: { color: "var(--orange)", background: "var(--orange-soft)" }
        };
        const gradient = property => colors.map((color, index) =>
          `${palette[color][property]} ${index * 100 / colors.length}% ${(index + 1) * 100 / colors.length}%`
        ).join(", ");
        const background = colors.length === 1 ? palette[colors[0]].background : `linear-gradient(135deg, ${gradient("background")})`;
        const marker = colors.length === 1 ? palette[colors[0]].color : `linear-gradient(135deg, ${gradient("color")})`;
        return `style="--calendar-day-background:${background};--calendar-day-marker:${marker}"`;
      }
      function calendarActivityActions(event) {
        const id = String(event.id).replace(/^(session|match)-/, "");
        const menu = calendarMenuForSource(event.source);
        return `<div class="toolbar-actions calendar-event-actions">
          <button class="button secondary small" data-calendar-detail-source="${esc(event.source)}" data-calendar-detail-id="${esc(id)}">Detail</button>
          ${canEditMenu(menu) ? `<button class="button secondary small" data-calendar-edit-source="${esc(event.source)}" data-calendar-edit-id="${esc(id)}">Edit</button>` : ""}
          ${canDeleteMenu(menu) ? `<button class="button orange small" data-calendar-delete-source="${esc(event.source)}" data-calendar-delete-id="${esc(id)}">Hapus</button>` : ""}
        </div>`;
      }
      function eventRow(event) {
        const d = dateObj(event.date);
        const details = [event.time, event.location].filter(Boolean).map(esc).join(" · ");
        return `<div class="event-row"><div class="date-tile"><strong>${d.getDate()}</strong><span>${shortMonth(event.date)}</span></div><div style="min-width:0;flex:1"><div class="event-name">${esc(event.title)}</div><div class="event-meta">${details || formatDate(event.date)}${event.notes ? ` · ${esc(event.notes)}` : ""}</div></div><span class="tag ${eventTypeClass(event.type)}">${esc(event.type)}</span></div>`;
      }
      function scoredSets(match) {
        return (Array.isArray(match.sets) ? match.sets : []).map((set, index) => ({
          index,
          teamPoints: set.teamPoints,
          opponentPoints: set.opponentPoints
        })).filter(set => set.teamPoints !== "" && set.teamPoints != null &&
          set.opponentPoints !== "" && set.opponentPoints != null &&
          Number.isFinite(Number(set.teamPoints)) && Number.isFinite(Number(set.opponentPoints)) &&
          Number(set.teamPoints) !== Number(set.opponentPoints));
      }
      function matchSetResult(match) {
        const sets = scoredSets(match);
        const teamSets = sets.filter(set => Number(set.teamPoints) > Number(set.opponentPoints)).length;
        const opponentSets = sets.filter(set => Number(set.opponentPoints) > Number(set.teamPoints)).length;
        return { sets, teamSets, opponentSets, winner: teamSets === opponentSets ? null : teamSets > opponentSets ? "team" : "opponent" };
      }
      function matchSkillTotals(matches) {
        const stats = matches.flatMap(match => match.stats || []);
        const points = skill => stats.filter(stat => stat.skill === skill)
          .reduce((sum, stat) => sum + Number(stat.success || 0), 0);
        return { ace: points("Ace"), attack: points("Attack"), receive: points("Receive"), block: points("Block") };
      }
      function matchTeamName(match) {
        const team = data.teams.find(item => Number(item.id) === Number(match.teamId));
        return team ? team.name : "Tim sendiri";
      }
      function matchTeamRosterMarkup(teamId, selectedPlayerIds) {
        const team = data.teams.find(item => Number(item.id) === Number(teamId));
        const players = team
          ? data.players.filter(player => (team.playerIds || []).some(id => Number(id) === Number(player.id)))
          : data.players;
        const selected = new Set((selectedPlayerIds || players.map(player => player.id)).map(Number));
        return players.map(player => `<label class="roster-option"><input type="checkbox" name="roster" value="${player.id}" ${selected.has(Number(player.id)) ? "checked" : ""}><span>${esc(player.name)} · #${esc(player.number)} · ${esc(player.position)}</span></label>`).join("")
          || '<div class="empty">Tim ini belum memiliki pemain.</div>';
      }
      function matchTeamPickerMarkup(selectedTeamId, allowUnassigned) {
        const teams = data.teams || [];
        const selectedTeamExists = teams.some(team => Number(team.id) === Number(selectedTeamId));
        const unassignedSelected = selectedTeamId == null || selectedTeamId === "" || !selectedTeamExists;
        const showEmptyOption = allowUnassigned || !teams.length || unassignedSelected;
        const emptyOptionLabel = teams.length
          ? (allowUnassigned ? "Roster khusus (tanpa tim)" : "Pilih tim")
          : "Roster pemain (belum ada tim)";
        const unassignedOption = showEmptyOption
          ? `<option value="" ${unassignedSelected ? "selected" : ""}>${emptyOptionLabel}</option>`
          : "";
        return `<select name="teamId" id="match-team-picker" ${teams.length && !allowUnassigned ? "required" : ""}>${unassignedOption}${teams.map(team => `<option value="${team.id}" ${Number(team.id) === Number(selectedTeamId) ? "selected" : ""}>${esc(team.name)}</option>`).join("")}</select>`;
      }
      function bindMatchTeamPicker(root, selectedPlayerIds) {
        const picker = $("#match-team-picker", root);
        const roster = $("#match-roster-picker", root);
        if (!picker || !roster) return;
        const selections = new Map();
        if (Array.isArray(selectedPlayerIds)) selections.set(picker.value, selectedPlayerIds.map(Number));
        const saveSelection = () => selections.set(picker.value,
          Array.from(roster.querySelectorAll('input[name="roster"]:checked'), input => Number(input.value)));
        const renderRoster = () => {
          const current = picker.value;
          if ((data.teams || []).length && !current && !Array.isArray(selectedPlayerIds)) {
            roster.innerHTML = '<div class="empty">Pilih tim terlebih dahulu.</div>';
            return;
          }
          roster.innerHTML = matchTeamRosterMarkup(current, selections.get(current));
          roster.querySelectorAll('input[name="roster"]').forEach(input => input.addEventListener("change", saveSelection));
        };
        picker.addEventListener("change", renderRoster);
        renderRoster();
      }
      function dashboardPage() {
        const rates = data.players.map(p => attendanceRate(p.id));
        const avg = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
        const upcoming = eventsUpcoming(3);
        const nextSession = data.sessions.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
        const topPlayers = data.players.slice().sort((a, b) => attendanceRate(b.id) - attendanceRate(a.id)).slice(0, 4);
        const coreSkills = [["Ace", "Ace"], ["Attack", "Serangan"], ["Receive", "Receive"], ["Block", "Blok"]];
        const performance = data.players.map(player => {
          const rates = coreSkills.map(([skill]) => skillEfficiency(player.id, skill)).filter(value => value != null);
          return { player, value: rates.length ? Math.round(rates.reduce((sum, value) => sum + value, 0) / rates.length) : null };
        });
        const teamSkillTotals = matchSkillTotals(data.matches);
        const totalValues = [
          { label: "Ace", value: teamSkillTotals.ace, color: "var(--blue)" },
          { label: "Serangan", value: teamSkillTotals.attack, color: "var(--orange)" },
          { label: "Receive", value: teamSkillTotals.receive, color: "var(--green)" },
          { label: "Blok", value: teamSkillTotals.block, color: "#8b69d4" }
        ];
        const highestSkillTotal = Math.max(1, ...totalValues.map(item => item.value));
        return `${heading(`Selamat datang di ${esc(applicationBranding.appName)}`, "Pantau perkembangan tim dan siapkan sesi latihan berikutnya.", activeRole() === "coach" ? '<button class="button" data-action="new-session">＋ Catat sesi</button>' : "")}
          <div class="grid metrics">
            ${metric("Pemain aktif", data.players.length, '<span class="positive">●</span> Terdaftar di tim', "♟")}
            ${metric("Kehadiran rata-rata", avg + "%", `<span class="positive">●</span> ${data.sessions.length} sesi tercatat`, "✓")}
            ${metric("Sesi latihan", data.sessions.length, "Pertemuan terdokumentasi", "↗")}
            ${metric("Agenda mendatang", eventsUpcoming(20).length, "Latihan, sparring & turnamen", "▣")}
          </div>
          <section class="card wide-card"><div class="card-head"><div><h2 class="card-title">Agenda berikutnya</h2><p class="card-sub">Pengingat kegiatan tim</p></div><button class="button secondary small" data-page="schedule">Lihat semua</button></div><div class="event-list">${upcoming.length ? upcoming.map(eventRow).join("") : '<div class="empty">Belum ada agenda mendatang.</div>'}</div></section>
          <div class="grid dashboard-charts">
            <section class="card"><div class="card-head"><div><h2 class="card-title">Rata-rata performa pemain</h2><p class="card-sub">Rata-rata efisiensi Ace, serangan, receive, dan blok</p></div></div>
              <div class="performance-chart">${performance.length ? performance.map(({ player, value }) => `<div class="performance-row"><span class="performance-player">${esc(player.name)}</span><div class="performance-track"><i style="width:${value == null ? 0 : value}%"></i></div><strong>${value == null ? "—" : `${value}%`}</strong></div>`).join("") : '<div class="empty">Belum ada data pemain.</div>'}</div>
            </section>
            <section class="card"><div class="card-head"><div><h2 class="card-title">Total poin teknik</h2><p class="card-sub">Jumlah sukses dari seluruh pertandingan</p></div></div>
              <div class="skill-total-chart" role="img" aria-label="Total sukses: ${totalValues.map(item => `${item.label} ${item.value}`).join(", ")}">${totalValues.map(item => `<div class="skill-total-column"><strong>${item.value}</strong><div class="skill-total-track"><i style="height:${Math.round(item.value / highestSkillTotal * 100)}%;background:${item.color}"></i></div><span>${item.label}</span></div>`).join("")}</div>
            </section>
          </div>
          <section class="card wide-card"><div class="card-head"><div><h2 class="card-title">Ringkasan pemain</h2><p class="card-sub">Kehadiran dan jangkauan spike terakhir</p></div><button class="button secondary small" data-page="players">Data pemain</button></div>
            <div class="table-wrap"><table><thead><tr><th>Pemain</th><th>Kelas</th><th>Posisi</th><th>Kehadiran</th><th>Spike reach</th></tr></thead><tbody>
              ${topPlayers.map(p => `<tr><td><div class="player-name"><span class="player-avatar">${initials(p.name)}</span><span>${esc(p.name)}<span class="position">#${esc(p.number)}</span></span></div></td><td>${esc(p.className)}</td><td>${esc(p.position)}</td><td><span class="progress"><i style="width:${attendanceRate(p.id)}%"></i></span>${attendanceRate(p.id)}%</td><td>${esc(p.spikeReach)} cm</td></tr>`).join("")}
            </tbody></table></div></section>
          ${nextSession ? `<div class="privacy-note">Sesi terakhir: <strong>${esc(nextSession.title)}</strong> · ${formatDate(nextSession.date)}. Data kehadiran dan progres digunakan sebagai indikator pembinaan, bukan diagnosis medis.</div>` : ""}`;
      }
      function playerRows(players) {
        return players.map(p => `<tr><td><input class="player-select" type="checkbox" data-select-player="${p.id}" ${selectedPlayerIds.has(Number(p.id)) ? "checked" : ""} aria-label="Pilih ${esc(p.name)}"></td><td><div class="player-name"><span class="player-avatar">${initials(p.name)}</span><span>${esc(p.name)}<span class="position">#${esc(p.number)}</span></span></div></td><td>${esc(p.position)}</td><td>${esc(p.className)}</td><td>${esc(p.height)} cm</td><td>${esc(p.weight)} kg</td><td>${p.verticalJump == null ? "—" : `${esc(p.verticalJump)} cm`}</td><td>${esc(p.spikeReach)} / ${esc(p.blockReach)} cm</td><td>${attendanceRate(p.id)}%</td><td><div class="toolbar-actions"><button class="button small" data-player-stats="${p.id}">Statistik pemain</button><button class="button secondary small" data-edit-player="${p.id}">Edit profil</button></div></td></tr>`).join("");
      }
      function openPlayerStats(playerId) {
        const player = playerById(playerId);
        if (!player) return;
        selectedPlayerId = Number(player.id);
        if (signedInUser) {
          try { localStorage.setItem(`${LAST_PLAYER_KEY}:${signedInUser.id}`, String(selectedPlayerId)); }
          catch (error) { console.error("Pemain terakhir tidak dapat disimpan.", error); }
        }
        currentPage = "playerStats";
        render();
      }
      function physicalTrendChart(player, field, title) {
        const records = (player.history || []).filter(record =>
          record[field] !== "" && record[field] != null && Number.isFinite(Number(record[field]))
        ).slice().sort((a, b) => a.date.localeCompare(b.date));
        if (!records.length) {
          return `<section class="card trend-chart-card"><div class="card-head"><div><h2 class="card-title">${esc(title)}</h2><p class="card-sub">Riwayat pengukuran · cm</p></div></div><div class="empty">Belum ada data pengukuran.</div></section>`;
        }
        const values = records.map(record => Number(record[field]));
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || Math.max(1, max * 0.1);
        const lower = min - range * 0.12;
        const upper = max + range * 0.12;
        const plot = { left: 38, right: 428, top: 18, bottom: 138 };
        const points = records.map((record, index) => {
          const x = records.length === 1 ? (plot.left + plot.right) / 2 : plot.left + index * (plot.right - plot.left) / (records.length - 1);
          const y = plot.bottom - (Number(record[field]) - lower) / (upper - lower) * (plot.bottom - plot.top);
          const labelDate = dateObj(record.date);
          const dateLabel = `${labelDate.getDate()} ${shortMonth(record.date)} ${record.date.slice(2, 4)}`;
          return { x, y, record, value: Number(record[field]), dateLabel };
        });
        const labelStep = Math.max(1, Math.ceil(points.length / 6));
        const grid = [0, 1, 2].map(index => {
          const y = plot.top + index * (plot.bottom - plot.top) / 2;
          const value = upper - index * (upper - lower) / 2;
          return `<line x1="${plot.left}" y1="${y}" x2="${plot.right}" y2="${y}" class="trend-gridline"></line><text x="${plot.left - 7}" y="${y + 3}" text-anchor="end" class="trend-axis-label">${value.toFixed(0)}</text>`;
        }).join("");
        const line = points.map(point => `${point.x},${point.y}`).join(" ");
        return `<section class="card trend-chart-card"><div class="card-head"><div><h2 class="card-title">${esc(title)}</h2><p class="card-sub">Riwayat pengukuran · cm</p></div><strong class="trend-current">${values[values.length - 1]} cm</strong></div>
          <div class="trend-chart-scroll"><svg class="trend-chart" viewBox="0 0 450 190" role="img" aria-label="${esc(title)}: ${points.map(point => `${point.value} cm tanggal ${formatDate(point.record.date)}`).join(", ")}">${grid}
            ${points.length > 1 ? `<polyline points="${line}" class="trend-line"></polyline>` : ""}
            ${points.map((point, index) => `<circle cx="${point.x}" cy="${point.y}" r="4" class="trend-point"><title>${esc(formatDate(point.record.date))}: ${point.value} cm</title></circle>${index % labelStep === 0 || index === points.length - 1 ? `<text x="${point.x}" y="161" text-anchor="middle" class="trend-date-label">${esc(point.dateLabel)}</text>` : ""}`).join("")}
          </svg></div></section>`;
      }
      function playersPage() {
        const filtered = data.players.filter(p => (p.name + " " + p.position + " " + p.className).toLowerCase().includes(searchTerm.toLowerCase()));
        return `${heading("Biodata pemain", "Kelola profil, posisi, dan perkembangan antropometri setiap atlet.", '<button class="button" data-action="add-player">＋ Tambah pemain</button>')}
          <section class="card"><div class="toolbar player-toolbar"><div><strong style="font-size:13px">Daftar skuad</strong><span class="card-sub" style="margin-left:8px">${data.players.length} pemain</span></div><input class="search" id="player-search" placeholder="Cari nama, posisi, kelas..." value="${esc(searchTerm)}"><div class="toolbar-actions"><button class="button secondary small" data-action="player-template">Unduh template Excel</button><button class="button secondary small" data-action="player-import">Impor Excel / CSV</button><input id="player-import-file" type="file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" hidden><button class="button orange small" data-action="delete-selected" ${selectedPlayerIds.size ? "" : "disabled"}>Hapus terpilih (${selectedPlayerIds.size})</button></div></div>
          <div class="table-wrap"><table><thead><tr><th><input type="checkbox" id="select-all-players" ${filtered.length && filtered.every(p => selectedPlayerIds.has(Number(p.id))) ? "checked" : ""} aria-label="Pilih semua pemain yang ditampilkan"></th><th>Pemain</th><th>Posisi</th><th>Kelas</th><th>Tinggi</th><th>Berat</th><th>Vertical jump</th><th>Spike / block</th><th>Kehadiran</th><th>Aksi</th></tr></thead><tbody>${filtered.length ? playerRows(filtered) : '<tr><td colspan="10" class="empty">Pemain tidak ditemukan.</td></tr>'}</tbody></table></div></section>
          <p class="privacy-note">Template Excel (.xlsx) dan CSV memakai delapan kolom biodata/antropometri wajib. Vertical jump, jenis kelamin, dan tanggal lahir (YYYY-MM-DD) opsional; template lama tetap didukung.</p>
          <p class="privacy-note">Riwayat pengukuran disimpan saat profil diperbarui. Pertimbangkan usia, tahap pertumbuhan, dan teknik pengukuran yang konsisten saat membandingkan antropometri.</p>`;
      }
      function playerStatsPage() {
        const player = playerById(selectedPlayerId);
        if (!player) return `${heading("Statistik pemain", "Data pemain tidak ditemukan.", '<button class="button secondary" data-page="players">Kembali</button>')}<div class="card empty">Pilih pemain dari Data pemain.</div>`;
        const sessions = data.sessions.slice().sort((a, b) => b.date.localeCompare(a.date));
        const attendanceRows = sessions.length ? sessions.map(session => {
          const participates = !Array.isArray(session.playerIds) || session.playerIds.some(id => Number(id) === Number(player.id));
          const status = participates ? (session.attendance || {})[player.id] || "Belum dicatat" : "Tidak ikut sesi";
          const statusClass = status === "Tidak ikut sesi" ? "blue" : ({ Hadir: "green", Izin: "blue", Sakit: "orange", Alpa: "red" }[status] || "red");
          return `<tr><td>${formatDate(session.date)}</td><td>${esc(session.title)}</td><td><span class="tag ${statusClass}">${esc(status)}</span></td></tr>`;
        }).join("") : '<tr><td colspan="3" class="empty">Belum ada sesi latihan.</td></tr>';
        const matches = data.matches.filter(match =>
          (Array.isArray(match.playerIds) && match.playerIds.some(id => Number(id) === Number(player.id))) ||
          (match.stats || []).some(stat => Number(stat.playerId) === Number(player.id))
        ).sort((a, b) => b.date.localeCompare(a.date));
        const skills = [
          ["Ace", "Ace"], ["Attack", "Serangan"], ["Block", "Blok"], ["Serve", "Servis"],
          ["Receive", "Receive"]
        ];
        const skillValues = match => skills.map(([skill, label]) => {
          const stats = (match.stats || []).filter(stat => Number(stat.playerId) === Number(player.id) && stat.skill === skill);
          const success = stats.reduce((sum, stat) => sum + Number(stat.success || 0), 0);
          const errors = stats.reduce((sum, stat) => sum + Number(stat.errors || 0), 0);
          return { label, success, errors };
        });
        const matchRows = matches.length ? matches.map(match => {
          const score = matchSetResult(match);
          const scoreLabel = score.sets.length ? `${score.teamSets}-${score.opponentSets} set` : "Skor belum diisi";
          return `<tr><td><strong>${esc(match.name)}</strong><span class="position">${esc(match.opponent || "Lawan belum diisi")} · ${scoreLabel}</span></td><td>${formatDate(match.date)}</td>${skillValues(match).map(value => `<td>${value.success} / ${value.errors}</td>`).join("")}</tr>`;
        }).join("") : `<tr><td colspan="${skills.length + 2}" class="empty">Belum ada statistik pertandingan untuk ${esc(player.name)}.</td></tr>`;
        const totals = skills.map(([skill, label]) => {
          const stats = matches.flatMap(match => match.stats || []).filter(stat => Number(stat.playerId) === Number(player.id) && stat.skill === skill);
          return { label, success: stats.reduce((sum, stat) => sum + Number(stat.success || 0), 0) };
        });
        const total = skill => totals.find(item => item.label === skill).success;
        const anthropometryHistory = (player.history || []).slice().sort((a, b) => b.date.localeCompare(a.date));
        const anthropometryRows = anthropometryHistory.length
          ? anthropometryHistory.map(record => `<tr><td>${formatDate(record.date)}</td><td>${esc(record.height)} cm</td><td>${esc(record.weight)} kg</td><td>${record.verticalJump == null || record.verticalJump === "" ? "—" : `${esc(record.verticalJump)} cm`}</td><td>${esc(record.spikeReach)} cm</td><td>${esc(record.blockReach)} cm</td></tr>`).join("")
          : '<tr><td colspan="6" class="empty">Riwayat antropometri belum tersedia.</td></tr>';
        return `${heading("Statistik pemain", `${esc(player.name)} · ${esc(player.position)} · #${esc(player.number)} · ${esc(player.className)}`, `<div class="toolbar-actions"><button class="button secondary" data-player-stats-print="${player.id}">Cetak PDF</button><button class="button secondary" data-page="players">← Data pemain</button></div>`)}
          <div class="grid metrics player-stat-metrics">
            ${metric("Kehadiran", `${attendanceRate(player.id)}%`, `${sessions.filter(session => (session.attendance || {})[player.id]).length} sesi tercatat`, "✓")}
            ${metric("Pertandingan", matches.length, "Sesuai roster dan statistik", "◎")}
            ${metric("Ace", total("Ace"), "Total sukses", "↗")}
            ${metric("Poin serangan", total("Serangan"), "Total sukses", "✓")}
            ${metric("Vertical jump", player.verticalJump == null ? "—" : `${esc(player.verticalJump)} cm`, "Pengukuran terbaru", "↥")}
          </div>
          <div class="toolbar-actions player-detail-actions"><button class="button secondary" data-edit-player="${player.id}">Edit profil</button></div>
          <section class="card player-history-card"><div class="card-head"><div><h2 class="card-title">Riwayat antropometri</h2><p class="card-sub">Tinggi, berat badan, vertical jump, dan jangkauan pemain</p></div><button class="button" data-update-anthropometry="${player.id}">＋ Update antropometri</button></div><div class="table-wrap anthropometry-table"><table><thead><tr><th>Tanggal pengukuran</th><th>Tinggi</th><th>Berat badan</th><th>Vertical jump</th><th>Spike reach</th><th>Block reach</th></tr></thead><tbody>${anthropometryRows}</tbody></table></div></section>
          <div class="grid physical-trend-grid">${physicalTrendChart(player, "verticalJump", "Vertical jump")}${physicalTrendChart(player, "spikeReach", "Spike reach")}${physicalTrendChart(player, "blockReach", "Block reach")}</div>
          <section class="card player-history-card"><div class="card-head"><div><h2 class="card-title">Riwayat kehadiran</h2><p class="card-sub">${sessions.length} sesi latihan</p></div></div><div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Sesi</th><th>Status</th></tr></thead><tbody>${attendanceRows}</tbody></table></div></section>
          <section class="card player-history-card"><div class="card-head"><div><h2 class="card-title">Statistik setiap pertandingan</h2><p class="card-sub">Jumlah sukses / gagal untuk setiap teknik</p></div></div><div class="table-wrap"><table class="player-match-stats"><thead><tr><th>Pertandingan</th><th>Tanggal</th>${skills.map(([, label]) => `<th>${label}</th>`).join("")}</tr></thead><tbody>${matchRows}</tbody></table></div></section>`;
      }
      function sessionPlayers(session) {
        const roster = Array.isArray(session.playerIds)
          ? new Set(session.playerIds.map(Number))
          : null;
        return data.players.filter(player => !roster || roster.has(Number(player.id)));
      }
      function sessionRosterLabel(session) {
        const team = (data.teams || []).find(item => Number(item.id) === Number(session.teamId));
        if (team) return `Tim latihan · ${team.name}`;
        if (session.rosterMode === "team") return "Tim latihan (tim sudah dihapus)";
        return session.rosterMode === "manual" ? "Pemain dipilih manual" : "Semua pemain";
      }
      function sessionAttendanceComplete(session) {
        const players = sessionPlayers(session);
        return players.length > 0 && players.every(player =>
          ["Hadir", "Izin", "Sakit", "Alpa"].includes((session.attendance || {})[player.id])
        );
      }
      function sessionMaterialComplete(session) {
        return Array.isArray(session.drills) && session.drills.some(drill => String(drill).trim());
      }
      function sessionListMarkup(sessions) {
        if (!sessions.length) return '<div class="empty">Belum ada sesi latihan. Tambahkan sesi untuk mulai mencatat kehadiran.</div>';
        return `<div class="table-wrap"><table><thead><tr><th>Judul sesi</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${sessions.map(session => {
          const complete = sessionAttendanceComplete(session) && sessionMaterialComplete(session);
          return `<tr><td><strong>${esc(session.title)}</strong></td><td>${formatDate(session.date)}</td><td><span class="tag ${complete ? "green" : "red"}">${complete ? "Tersimpan" : "Belum Terisi"}</span></td><td><div class="toolbar-actions"><button class="button secondary small" data-session-review="${session.id}">Pratinjau</button><button class="button secondary small" data-session-edit="${session.id}">Edit</button><button class="button orange small" data-delete-session="${session.id}">Hapus</button></div></td></tr>`;
        }).join("")}</tbody></table></div>`;
      }
      function attendancePage() {
        const sessions = data.sessions.slice().sort((a, b) => b.date.localeCompare(a.date));
        return `${heading("Latihan", "Kelola jadwal sesi latihan dan isi absensi pemain.", '<button class="button" data-action="new-session">＋ Tambah Sesi</button>')}
          <section class="card"><div class="card-head"><div><h2 class="card-title">Daftar sesi latihan</h2><p class="card-sub">${sessions.length} sesi</p></div></div>${sessionListMarkup(sessions)}</section>`;
      }
      function schedulePage() {
        const allActivities = calendarActivities().sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""));
        const weekdays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
        const renderMonthGrid = (monthDate, mini) => {
          const monthKey = dateKey(monthDate).slice(0, 7);
          const monthEvents = allActivities.filter(event => event.date && event.date.slice(0, 7) === monthKey);
          const firstWeekday = (new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay() + 6) % 7;
          const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
          const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
          const eventsByDate = new Map();
          monthEvents.forEach(event => eventsByDate.set(event.date, (eventsByDate.get(event.date) || []).concat(event)));
          const cells = Array.from({ length: cellCount }, (_, index) => {
            const day = index - firstWeekday + 1;
            if (day < 1 || day > daysInMonth) return '<span class="calendar-day is-empty" aria-hidden="true"></span>';
            const date = dateKey(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
            const dayEvents = eventsByDate.get(date) || [];
            const selected = date === selectedCalendarDate;
            return `<button type="button" class="calendar-day ${mini ? "calendar-day-mini" : ""} ${calendarDayActivityClass(dayEvents)} ${selected ? "selected" : ""} ${date === todayISO() ? "today" : ""}" ${calendarDayActivityStyle(dayEvents)} data-calendar-day="${date}" aria-label="${esc(formatDate(date))}${dayEvents.length ? `, ${dayEvents.length} kegiatan` : ""}" aria-pressed="${selected}">
              <span class="calendar-day-number">${day}</span><span class="calendar-day-dots">${dayEvents.slice(0, 3).map(event => `<i class="calendar-dot ${calendarDotClass(event.type)}" aria-label="${esc(event.title)}"></i>`).join("")}</span>
              ${!mini && dayEvents.length ? `<span class="calendar-day-count">${dayEvents.length} agenda</span>` : ""}
            </button>`;
          }).join("");
          const weekdayMarkup = weekdays.map(day => `<span>${day}</span>`).join("");
          if (mini) {
            const label = monthDate.toLocaleDateString("id-ID", { month: "long" });
            return `<section class="calendar-month-card"><h3><button type="button" data-calendar-open-month="${monthDate.getMonth()}">${esc(label)}</button></h3><div class="calendar-mini-weekdays">${weekdayMarkup}</div><div class="calendar-mini-grid">${cells}</div></section>`;
          }
          return `<div class="calendar-weekdays">${weekdayMarkup}</div><div class="calendar-grid">${cells}</div>`;
        };
        const canEdit = ["admin", "coach"].includes(activeRole());
        const monthLabel = calendarView === "year"
          ? String(calendarMonth.getFullYear())
          : calendarMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
        const actionDate = selectedCalendarDate || todayISO();
        const selectedDayEvents = selectedCalendarDate
          ? allActivities.filter(event => event.date === selectedCalendarDate)
          : [];
        return `${heading("Kalender kegiatan", "Pilih tanggal untuk menjadwalkan sesi latihan atau pertandingan.", "")}
          <section class="card calendar-card">
            <div class="calendar-toolbar"><button class="icon-button" data-calendar-month="previous" aria-label="${calendarView === "year" ? "Tahun sebelumnya" : "Bulan sebelumnya"}">‹</button><strong>${esc(monthLabel)}</strong><div class="calendar-toolbar-controls"><div class="calendar-view-toggle" role="group" aria-label="Tampilan kalender"><button type="button" class="button ${calendarView === "month" ? "" : "secondary"} small" data-calendar-view="month" aria-pressed="${calendarView === "month"}">Bulanan</button><button type="button" class="button ${calendarView === "year" ? "" : "secondary"} small" data-calendar-view="year" aria-pressed="${calendarView === "year"}">Tahunan</button></div><button class="button secondary small" data-calendar-today>Hari ini</button><button class="icon-button" data-calendar-month="next" aria-label="${calendarView === "year" ? "Tahun berikutnya" : "Bulan berikutnya"}">›</button></div></div>
            ${calendarView === "year"
              ? `<div class="calendar-year-grid">${Array.from({ length: 12 }, (_, month) => renderMonthGrid(new Date(calendarMonth.getFullYear(), month, 1), true)).join("")}</div>`
              : renderMonthGrid(calendarMonth, false)}
            ${selectedDayEvents.length ? `<section class="calendar-selected-events"><div class="card-head"><div><h2 class="card-title">Kegiatan · ${formatDate(selectedCalendarDate)}</h2><p class="card-sub">${selectedDayEvents.length} kegiatan pada tanggal ini</p></div></div><div class="event-list">${selectedDayEvents.map(event => `<div class="event-row calendar-selected-event-row"><div class="calendar-event-color ${calendarDotClass(event.type)}"></div><div class="calendar-event-copy"><div class="event-name">${esc(event.title)}</div><div class="event-meta">${esc(event.type)} · ${formatDate(event.date)}${event.time ? ` · ${esc(event.time)}` : ""}${event.location ? ` · ${esc(event.location)}` : ""}</div></div>${calendarActivityActions(event)}</div>`).join("")}</div></section>` : ""}
            <div class="calendar-legend"><span><i class="calendar-dot"></i> Latihan</span><span><i class="calendar-dot blue"></i> Pertandingan / sparring</span></div>
          </section>
          <section class="card wide-card"><div class="toolbar"><div><strong style="font-size:13px">Seluruh kegiatan</strong><span class="card-sub" style="margin-left:8px">${allActivities.length} kegiatan</span></div>
          ${canEdit ? `<div class="toolbar-actions"><span class="tag blue">${selectedCalendarDate ? `Tanggal dipilih: ${formatDate(selectedCalendarDate)}` : `Tanggal: ${formatDate(actionDate)}`}</span><button class="button secondary small" data-action="new-session" data-calendar-date="${esc(actionDate)}">＋ Tambah sesi</button><button class="button small" data-action="add-match" data-calendar-date="${esc(actionDate)}">＋ Tambah pertandingan</button></div>` : ""}
          </div><div class="event-list">${allActivities.length ? allActivities.map(event => `<div class="event-row calendar-list-event-row"><div class="date-tile"><strong>${dateObj(event.date).getDate()}</strong><span>${shortMonth(event.date)}</span></div><div class="calendar-event-copy"><div class="event-name">${esc(event.title)}</div><div class="event-meta">${formatDate(event.date)}${event.time ? ` · ${esc(event.time)}` : ""}${event.location ? ` · ${esc(event.location)}` : ""}${event.notes ? ` · ${esc(event.notes)}` : ""}</div></div><span class="tag ${eventTypeClass(event.type)}">${esc(event.type)}</span>${calendarActivityActions(event)}</div>`).join("") : '<div class="empty">Belum ada kegiatan.</div>'}</div></section>`;
      }
      function teamsPage() {
        const teams = (data.teams || []).slice().sort((a, b) => a.name.localeCompare(b.name));
        const cards = teams.map(team => {
          const members = data.players.filter(player => (team.playerIds || []).some(id => Number(id) === Number(player.id)));
          const roster = members.length
            ? members.map(player => `<span class="team-member"><span class="player-avatar">${initials(player.name)}</span><span>${esc(player.name)}<small>${esc(player.position)} · #${esc(player.number)}</small></span></span>`).join("")
            : '<div class="empty team-empty">Belum ada pemain di tim ini.</div>';
          return `<article class="card team-card"><div class="team-card-head"><div class="team-identity">${team.logo ? `<img class="team-logo" src="${esc(team.logo)}" alt="Logo ${esc(team.name)}">` : `<span class="team-logo team-logo-fallback">${esc(initials(team.name))}</span>`}<div><h2 class="card-title">${esc(team.name)}</h2><p class="card-sub">${members.length} pemain · dapat bergabung di beberapa tim</p></div></div><div class="team-actions"><button class="button secondary small" data-edit-team="${team.id}">Ubah</button><button class="close-x" data-delete-team="${team.id}" aria-label="Hapus tim ${esc(team.name)}">×</button></div></div>
            <button class="team-roster-toggle" type="button" aria-expanded="false" aria-controls="team-roster-${esc(team.id)}" data-team-roster-toggle>Daftar pemain (${members.length})<span class="team-roster-chevron" aria-hidden="true">⌄</span></button>
            <div class="team-roster-panel" id="team-roster-${esc(team.id)}" inert><div class="team-roster-panel-inner"><div class="team-roster">${roster}</div></div></div></article>`;
        }).join("");
        return `${heading("Manajemen tim", "Buat beberapa tim, pasangkan pemain, dan kelola identitas tiap tim.", '<button class="button" data-action="add-team">＋ Buat tim</button>')}
          <div class="team-grid">${cards || '<section class="card empty">Belum ada tim. Buat tim pertama untuk mulai mengatur skuad.</section>'}</div>
          <p class="privacy-note">Pemain dapat terdaftar di lebih dari satu tim. Logo PNG, JPG, atau WebP maksimal 200 KB.</p>`;
      }
      function strategyModal() {
        const teamOptions = [`<option value="">Semua pemain</option>`, ...(data.teams || []).map(team =>
          `<option value="${team.id}">${esc(team.name)}</option>`
        )].join("");
        showModal("Buat papan strategi", `<form><div class="form-grid">
          <div class="field full"><label>Nama strategi</label><input name="name" required maxlength="80" placeholder="Contoh: Rotasi awal"></div>
          <div class="field full"><label>Lawan (opsional)</label><input name="opponent" maxlength="80" placeholder="Nama tim lawan"></div>
          <div class="field full"><label>Skuad pemain</label><select name="teamId">${teamOptions}</select></div>
          </div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Buat strategi</button></div></form>`, fd => {
          const name = String(fd.get("name") || "").trim();
          if (!name) throw new Error("Nama strategi wajib diisi.");
          const board = {
            id: Date.now(),
            name,
            opponent: String(fd.get("opponent") || "").trim(),
            teamId: fd.get("teamId") ? Number(fd.get("teamId")) : null,
            lineup: { "1": null, "2": null, "3": null, "4": null, "5": null, "6": null },
            receiveFormation: "W",
            setPlay: "",
            tactics: ""
          };
          data.strategyBoards = Array.isArray(data.strategyBoards) ? data.strategyBoards : [];
          data.strategyBoards.push(board);
          selectedStrategyId = board.id;
          strategyDraft = JSON.parse(JSON.stringify(board));
          strategyDirty = false;
        });
      }
      function strategyPage() {
        data.strategyBoards = Array.isArray(data.strategyBoards) ? data.strategyBoards : [];
        if (!data.strategyBoards.length) {
          selectedStrategyId = null;
          strategyDraft = null;
          strategyDirty = false;
          return `${heading("Papan Strategi & Formasi Lapangan", "Susun starting six, rotasi servis, formasi receive, dan catatan taktik per lawan.", '<button class="button" data-action="add-strategy">＋ Buat strategi</button>')}
            <section class="card empty">Belum ada papan strategi. Buat strategi untuk mulai menyusun formasi tim.</section>`;
        }
        let board = data.strategyBoards.find(item => Number(item.id) === Number(selectedStrategyId));
        if (!board) {
          board = data.strategyBoards[0];
          selectedStrategyId = board.id;
        }
        if (!strategyDraft || Number(strategyDraft.id) !== Number(board.id)) {
          strategyDraft = JSON.parse(JSON.stringify(board));
          strategyDirty = false;
        }
        const team = (data.teams || []).find(item => Number(item.id) === Number(strategyDraft.teamId));
        const roster = team
          ? data.players.filter(player => (team.playerIds || []).some(id => Number(id) === Number(player.id)))
          : data.players;
        const lineup = strategyDraft.lineup || {};
        const positions = [
          ["4", "Depan kiri"], ["3", "Depan tengah"], ["2", "Depan kanan"],
          ["5", "Belakang kiri"], ["6", "Belakang tengah"], ["1", "Belakang kanan"]
        ];
        const playerSelect = position => `<select data-lineup-select="${position}" aria-label="Pemain posisi ${position}"><option value="">Pilih pemain</option>${roster.map(player =>
          `<option value="${player.id}" ${Number(lineup[position]) === Number(player.id) ? "selected" : ""}>${esc(player.name)} · #${esc(player.number)}</option>`
        ).join("")}</select>`;
        const courtPositions = positions.map(([position, label]) => {
          const player = roster.find(item => Number(item.id) === Number(lineup[position]));
          return `<div class="lineup-slot" data-lineup-position="${position}" aria-label="Posisi ${position}, ${label}">
            <span class="lineup-position-number">${position}</span><span class="lineup-position-label">${label}</span>
            ${player ? `<span class="lineup-chip" draggable="true" data-lineup-player="${player.id}">${esc(player.name)} · #${esc(player.number)}</span>` : '<span class="lineup-empty-label">Lepas pemain di sini</span>'}
            ${playerSelect(position)}
          </div>`;
        }).join("");
        const players = roster.map(player => `<span class="lineup-roster-chip" draggable="true" data-lineup-player="${player.id}">${esc(player.name)} · #${esc(player.number)} <small>${esc(player.position)}</small></span>`).join("");
        const boardOptions = data.strategyBoards.map(item => `<option value="${item.id}" ${Number(item.id) === Number(strategyDraft.id) ? "selected" : ""}>${esc(item.name)}${item.opponent ? ` · vs ${esc(item.opponent)}` : ""}</option>`).join("");
        return `${heading("Papan Strategi & Formasi Lapangan", "Susun starting six, rotasi servis, formasi receive, dan catatan taktik per lawan.", '<button class="button" data-action="add-strategy">＋ Buat strategi</button>')}
          <section class="card strategy-editor">
            <div class="strategy-toolbar"><div class="field"><label for="strategy-board-select">Papan strategi</label><select id="strategy-board-select">${boardOptions}</select></div>
              <button class="button orange small" data-delete-strategy="${strategyDraft.id}">Hapus strategi</button></div>
            <div class="strategy-meta form-grid">
              <div class="field"><label for="strategy-name">Nama strategi</label><input id="strategy-name" maxlength="80" value="${esc(strategyDraft.name || "")}"></div>
              <div class="field"><label for="strategy-opponent">Lawan</label><input id="strategy-opponent" maxlength="80" value="${esc(strategyDraft.opponent || "")}" placeholder="Nama lawan (opsional)"></div>
            </div>
            <div class="strategy-lineup-head"><div><h2 class="card-title">Starting six · posisi 1–6</h2><p class="card-sub">Seret pemain ke posisi lapangan, atau pilih nama dari daftar.</p></div><button class="button secondary small" data-strategy-rotate>↻ Rotasi servis</button></div>
            <div class="volleyball-court" role="group" aria-label="Lapangan bola voli dan enam posisi pemain">${courtPositions}</div>
            <div class="strategy-roster"><strong class="strategy-section-title">Daftar pemain ${team ? `· ${esc(team.name)}` : ""}</strong><div class="lineup-roster">${players || '<span class="empty">Belum ada pemain untuk dipilih.</span>'}</div></div>
            <div class="form-grid strategy-options">
              <div class="field"><label for="strategy-receive">Formasi penerimaan</label><select id="strategy-receive">${[["W", "W (5 penerima)"], ["3-receivers", "3 penerima"], ["2-receivers", "2 penerima"], ["5-receivers", "5 penerima"]].map(([value, label]) => `<option value="${value}" ${strategyDraft.receiveFormation === value ? "selected" : ""}>${label}</option>`).join("")}</select></div>
              <div class="field full"><label for="strategy-set-play">Catatan set-play</label><textarea id="strategy-set-play" maxlength="2000" placeholder="Rancang pola serangan atau kombinasi set-play...">${esc(strategyDraft.setPlay || "")}</textarea></div>
              <div class="field"><label for="strategy-tactics">Catatan taktik khusus lawan</label><textarea id="strategy-tactics" maxlength="2000" placeholder="Catat pola serangan lawan, area servis, atau rotasi yang diwaspadai...">${esc(strategyDraft.tactics || "")}</textarea></div>
            </div>
            <div class="strategy-save"><span class="card-sub">${strategyDirty ? "Ada perubahan yang belum disimpan." : "Semua perubahan sudah tersimpan."}</span><button class="button" data-action="save-strategy" ${strategyDirty ? "" : "disabled"}>Simpan strategi</button></div>
          </section>`;
      }
      function trainingPage() {
        const totals = matchSkillTotals(data.matches);
        const decidedMatches = data.matches.map(match => matchSetResult(match)).filter(result => result.winner);
        const wins = decidedMatches.filter(result => result.winner === "team").length;
        const winPercentage = decidedMatches.length ? `${Math.round(wins / decidedMatches.length * 100)}%` : "—";
        const matches = data.matches.slice().sort((a, b) => {
          const aUpcoming = a.date >= todayISO(), bUpcoming = b.date >= todayISO();
          return aUpcoming !== bUpcoming ? Number(bUpcoming) - Number(aUpcoming)
            : aUpcoming ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
        });
        const rows = matches.length ? `<div class="table-wrap"><table><thead><tr><th>Pertandingan</th><th>Tanggal</th><th>Set / hasil</th><th>Ace</th><th>Poin serangan</th><th>Poin receive</th><th>Poin blok</th><th>Aksi</th></tr></thead><tbody>${matches.map(match => {
          const stats = matchSkillTotals([match]);
          const result = matchSetResult(match);
          const setScores = result.sets.map(set => `${set.index + 1}: ${set.teamPoints}-${set.opponentPoints}`).join(" · ");
          const resultLabel = result.winner === "team" ? "Menang" : result.winner === "opponent" ? "Kalah" : "Belum ada hasil";
          const rosterCount = Array.isArray(match.playerIds)
            ? match.playerIds.length
            : data.players.length;
          return `<tr><td><strong>${esc(match.name)}</strong><span class="position">${esc(matchTeamName(match))} · vs ${esc(match.opponent || "Lawan belum diisi")} · ${rosterCount} pemain</span></td><td>${formatDate(match.date)}</td><td>${setScores ? `${setScores}<span class="position">${resultLabel} ${result.teamSets}-${result.opponentSets}</span>` : "—"}</td><td>${stats.ace}</td><td>${stats.attack}</td><td>${stats.receive}</td><td>${stats.block}</td><td><div class="toolbar-actions"><button class="button secondary small" data-preview-match="${match.id}">Pratinjau</button><button class="button secondary small" data-edit-match="${match.id}">Edit</button><button class="button small" data-open-live-match="${match.id}">Catat live</button><button class="button orange small" data-delete-match="${match.id}">Hapus</button></div></td></tr>`;
        }).join("")}</tbody></table></div>` : '<div class="empty">Belum ada pertandingan. Buat pertandingan pertama untuk memulai.</div>';
        return `${heading("Pertandingan", "Lihat statistik, jadwal, dan riwayat pertandingan tim.", '<button class="button" data-action="add-match">＋ Pertandingan</button>')}
          <div class="grid metrics" style="grid-template-columns:repeat(auto-fit,minmax(155px,1fr));margin-bottom:16px">
            ${metric("Total pertandingan", data.matches.length, "Laga tercatat", "◎")}
            ${metric("Persentase menang", winPercentage, `${wins} menang dari ${decidedMatches.length} hasil tercatat`, "🏆")}
            ${metric("Total ace", totals.ace, "Seluruh laga", "↗")}
            ${metric("Poin serangan", totals.attack, "Seluruh laga", "✓")}
            ${metric("Poin receive", totals.receive, "Seluruh laga", "◎")}
            ${metric("Poin blok", totals.block, "Seluruh laga", "▣")}
          </div>
          <section class="card"><div class="card-head"><div><h2 class="card-title">Jadwal dan riwayat pertandingan</h2><p class="card-sub">${matches.length} pertandingan</p></div></div>${rows}</section>`;
      }
      function matchesPage() {
        const match = data.matches.find(m => Number(m.id) === Number(selectedMatchId));
        const playerGroups = match ? data.players.map(p => {
          const stats = (match.stats || []).filter(s => Number(s.playerId) === Number(p.id));
          if (!stats.length) return "";
          return stats.map(s => {
            const attempts = Number(s.success) + Number(s.errors);
            return `<tr><td><div class="player-name"><span class="player-avatar">${initials(p.name)}</span>${esc(p.name)}</div></td><td>${esc(s.skill)}</td><td>${esc(s.success)}</td><td>${esc(s.errors)}</td><td><span class="progress"><i style="width:${attempts ? Math.round(s.success / attempts * 100) : 0}%"></i></span>${attempts ? Math.round(s.success / attempts * 100) : 0}%</td><td><button class="close-x" data-delete-stat="${match.id}:${p.id}:${esc(s.skill)}">×</button></td></tr>`;
          }).join("");
        }).join("") : "";
        return `${heading("Statistik", "Rekap aksi sukses dan error untuk evaluasi performa laga.", '<button class="button" data-action="add-match">＋ Pertandingan</button>')}
          <section class="card"><div class="attendance-head"><div><div class="card-title">Papan statistik</div><div class="card-sub">${match ? esc(match.opponent || match.name) + " · " + formatDate(match.date) : "Pilih atau tambahkan pertandingan"}</div></div><div class="inline-form"><select class="select-mini" id="match-select">${data.matches.map(m => `<option value="${m.id}" ${match && Number(match.id) === Number(m.id) ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</select><button class="button small" data-action="add-stat" ${match ? "" : "disabled"}>＋ Input aksi</button></div></div>
          ${match ? `<div class="table-wrap"><table><thead><tr><th>Pemain</th><th>Teknik</th><th>Sukses</th><th>Error</th><th>Efisiensi</th><th></th></tr></thead><tbody>${playerGroups || '<tr><td colspan="6" class="empty">Belum ada statistik untuk laga ini.</td></tr>'}</tbody></table></div>` : '<div class="empty">Buat pertandingan untuk mulai mencatat statistik.</div>'}
          </section><div class="privacy-note">Efisiensi dihitung sebagai aksi sukses ÷ (sukses + error). Pencatatan receive, dig, dan set memakai jumlah aksi yang dinilai pelatih.</div>`;
      }
      function liveMatchesPage() {
        const match = data.matches.find(item => Number(item.id) === Number(selectedMatchId));
        const players = match
          ? data.players.filter(player => !Array.isArray(match.playerIds) || match.playerIds.map(Number).includes(Number(player.id)))
          : [];
        const teamName = match ? matchTeamName(match) : "Tim";
        const opponentName = match && match.opponent ? match.opponent : "Tim lawan";
        const playerCards = players.map(player => `<article class="card live-player"><div class="player-name"><span class="player-avatar">${initials(player.name)}</span><span>${esc(player.name)}<span class="position">${esc(player.position)} · #${esc(player.number)}</span></span></div><div class="live-skills">${["Block", "Attack", "Serve", "Receive", "Ace"].map(skill => {
          const skillStats = (match.stats || []).filter(item => Number(item.playerId) === Number(player.id) && item.skill === skill);
          const stat = {
            success: skillStats.reduce((sum, item) => sum + Number(item.success || 0), 0),
            errors: skillStats.reduce((sum, item) => sum + Number(item.errors || 0), 0)
          };
          const label = skill === "Attack" ? "Serangan" : skill === "Block" ? "Blok" : skill === "Serve" ? "Servis" : skill;
          const successes = Number(stat.success || 0), errors = Number(stat.errors || 0);
          return `<div class="live-skill"><div><strong>${label}</strong><span>${successes} sukses · ${errors} gagal</span></div><button class="button secondary small" data-live-stat="${player.id}:${skill}:success:-1" aria-label="Kurangi sukses ${label} ${esc(player.name)}" title="Koreksi sukses" ${successes ? "" : "disabled"}>−</button><button class="button small live-success" data-live-stat="${player.id}:${skill}:success:1" aria-label="Tambah sukses ${label} ${esc(player.name)}" title="Tambah sukses">+</button><button class="button secondary small" data-live-stat="${player.id}:${skill}:errors:-1" aria-label="Kurangi gagal ${label} ${esc(player.name)}" title="Koreksi gagal" ${errors ? "" : "disabled"}>−</button><button class="button orange small" data-live-stat="${player.id}:${skill}:errors:1" aria-label="Tambah gagal ${label} ${esc(player.name)}" title="Tambah gagal">+</button></div>`;
        }).join("")}</div></article>`).join("");
        const sets = Array.from({ length: 5 }, (_, index) => (match && match.sets || [])[index] || {});
        const setEditor = match ? `<section class="match-set-section"><h3 class="card-title">Hasil per set</h3><div class="match-set-head"><span>Set</span><span>${esc(teamName)}</span><span></span><span>${esc(opponentName)}</span></div>
          <div class="match-set-list">${sets.map((set, index) => `<div class="match-set-row"><strong>Set ${index + 1}</strong><input type="number" min="0" max="99" data-match-set="${index}" data-set-side="teamPoints" aria-label="Poin Set ${index + 1} ${esc(teamName)}" value="${esc(set.teamPoints == null ? "" : set.teamPoints)}"><span>–</span><input type="number" min="0" max="99" data-match-set="${index}" data-set-side="opponentPoints" aria-label="Poin Set ${index + 1} ${esc(opponentName)}" value="${esc(set.opponentPoints == null ? "" : set.opponentPoints)}"></div>`).join("")}</div><p class="card-sub">Isi skor untuk setiap set yang dimainkan. Maksimal 5 set.</p></section>` : "";
        const liveContent = match ? `
          <div class="live-roster">${playerCards || '<div class="empty">Roster pertandingan kosong. Edit pertandingan untuk memilih pemain.</div>'}</div>
          ${setEditor}
          <div class="form-grid" style="padding:18px">
            <div class="field full"><label>Catatan / Evaluasi Umum</label><textarea id="match-general-notes" maxlength="2000" placeholder="Catatan jalannya pertandingan">${esc(match.notes || "")}</textarea></div>
            <div class="field full"><strong class="card-title">Evaluasi Individu</strong></div>
            ${players.map(player => `<div class="field full"><label>${esc(player.name)}</label><textarea data-match-evaluation="${player.id}" maxlength="500" placeholder="Evaluasi individu">${esc((match.evaluations || {})[player.id] || "")}</textarea></div>`).join("")}
          </div>
          <div class="modal-actions" style="padding:0 18px 18px"><button class="button" data-action="save-live-stats" ${matchStatsDirty ? "" : "disabled"}>Simpan pertandingan</button></div>` : '<div class="empty">Buat pertandingan untuk mulai mencatat statistik live.</div>';
        return `${heading("Catat live pertandingan", "Catat aksi pemain dan simpan evaluasi pertandingan.", '<button class="button secondary" data-action="add-match">＋ Pertandingan</button>')}
          <section class="card"><div class="attendance-head"><div><div class="card-title">Statistik live pemain</div><div class="card-sub">${match ? `${esc(match.name)} · ${esc(teamName)} vs ${esc(match.opponent || "Lawan belum diisi")} · ${formatDate(match.date)} · ${players.length} pemain${matchStatsDirty ? " · perubahan belum disimpan" : ""}` : "Pilih atau buat pertandingan"}</div></div><div class="inline-form"><select class="select-mini" id="match-select">${data.matches.map(item => `<option value="${item.id}" ${match && Number(item.id) === Number(match.id) ? "selected" : ""}>${esc(item.name)}</option>`).join("")}</select><button class="button secondary small" data-action="add-stat" ${match ? "" : "disabled"}>＋ Input manual</button></div></div>
          ${liveContent}</section>`;
      }
      function targetsPage() {
        const player = playerById(selectedTargetPlayerId) || data.players[0];
        if (!player) return `${heading("Target performa", "Atur sasaran dan pantau hasil latihan.", "")}<div class="card empty">Tambahkan biodata pemain terlebih dahulu.</div>`;
        selectedTargetPlayerId = Number(player.id);
        const period = selectedTargetPeriod;
        const key = `${player.id}:${period}`;
        const saved = data.targets && data.targets[key] || {};
        const defaults = targetDefaultsForPosition(player.position, period);
        const current = targetMetrics(player.id, period);
        const metrics = [
          { key: "blockSuccess", label: "Blok berhasil", unit: "aksi", icon: "▣", isMaximum: false },
          { key: "attackSuccess", label: "Serangan berhasil", unit: "aksi", icon: "⌁", isMaximum: false },
          { key: "serveErrors", label: "Servis gagal", unit: "aksi", icon: "!", isMaximum: true },
          { key: "receiveErrors", label: "Receive gagal", unit: "aksi", icon: "◎", isMaximum: true }
        ];
        const editable = ["admin", "coach"].includes(activeRole());
        const range = targetDateRange(period);
        return `${heading("Target performa", "Target memakai jumlah aksi sukses dan gagal yang dicatat pada pertandingan live.", "")}
          <section class="card"><div class="toolbar target-toolbar"><div class="target-player-picker"><span class="target-kicker">PILIH PEMAIN</span><select class="select-mini" id="target-player">${data.players.map(item => `<option value="${item.id}" ${Number(item.id) === Number(player.id) ? "selected" : ""}>${esc(item.name)} · ${esc(item.position)}</option>`).join("")}</select></div><label class="target-period-picker" for="target-period"><span>Periode</span><select class="select-mini" id="target-period" aria-label="Periode target"><option value="week" ${period === "week" ? "selected" : ""}>Minggu ini</option><option value="month" ${period === "month" ? "selected" : ""}>Bulan ini</option></select></label></div>
          <div class="target-grid">${metrics.map(item => `<article class="card target-card"><div class="target-card-head"><span class="target-icon">${item.icon}</span><span class="target-kicker">CAPAIAN PERIODE</span></div><div class="target-label">${item.label}</div><div class="target-value-row"><strong class="target-value">${current[item.key]}</strong><span>${item.unit}</span></div><label class="target-input-label" for="target-${item.key}">${item.isMaximum ? "Maksimal" : "Target"} ${item.unit}</label><div class="target-input-control"><input id="target-${item.key}" type="number" min="0" step="1" data-target-value="${item.key}" value="${saved[item.key] == null ? defaults[item.key] : esc(saved[item.key])}" placeholder="Atur target" ${editable ? "" : "disabled"}><span>${item.unit}</span></div></article>`).join("")}</div>
          ${editable ? '<div class="target-actions"><button class="button" data-action="save-target">Simpan target</button></div>' : '<p class="privacy-note">Target ditetapkan oleh pelatih. Perbarui data dengan pelatih jika target perlu disesuaikan.</p>'}
          <p class="privacy-note">Target awal berbeda menurut posisi (${esc(player.position)}); nilai bisa disesuaikan pelatih. Target keberhasilan adalah jumlah minimal, sedangkan servis gagal dan receive gagal adalah batas maksimal. Periode data ${formatDate(range.start)}–${formatDate(range.end)}${period === "month" ? " (nilai default bulanan = 4× target mingguan)" : ""}.</p></section>`;
      }
      function recommendationItems() {
        const items = [];
        data.players.forEach(p => {
          const attendance = attendanceRate(p.id);
          const attack = skillEfficiency(p.id, "Attack");
          const serve = skillEfficiency(p.id, "Serve");
          const receive = skillEfficiency(p.id, "Receive");
          if (data.sessions.length && attendance < 75) items.push({ player: p.name, category: "Konsistensi", title: "Perkuat konsistensi kehadiran", body: `Kehadiran tercatat ${attendance}%. Lakukan check-in dan komunikasi kendala; materi dapat diringkas saat pemain kembali.`, type: "orange" });
          if (attack !== null && attack < 45) items.push({ player: p.name, category: "Teknik", title: "Drilling spike dan footwork", body: `Efisiensi attack ${attack}%. Fokus pada timing approach, kontak bola tinggi, dan target zona secara bertahap.`, type: "blue" });
          if (serve !== null && serve < 60) items.push({ player: p.name, category: "Teknik", title: "Serve target bertekanan rendah", body: `Efisiensi serve ${serve}%. Bangun rutinitas toss dan akurasi zona sebelum menambah tekanan.`, type: "blue" });
          if (receive !== null && receive < 65) items.push({ player: p.name, category: "Teknik", title: "Passing platform & komunikasi", body: `Efisiensi receive ${receive}%. Latih posisi siap, sudut platform, dan prioritas bola bersama.`, type: "blue" });
          const previous = p.history && p.history.length > 1 ? p.history[p.history.length - 2] : null;
          const current = p.history && p.history.length ? p.history[p.history.length - 1] : null;
          if (previous && current && Number(current.spikeReach) <= Number(previous.spikeReach)) items.push({ player: p.name, category: "Fisik", title: "Pantau progres daya ledak", body: "Spike reach belum meningkat pada pengukuran terakhir. Periksa konsistensi protokol pengukuran dan prioritaskan landing mechanics serta latihan kekuatan yang sesuai usia.", type: "orange" });
        });
        return items;
      }
      function recommendationsPage() {
        const items = recommendationItems();
        return `${heading("Rekomendasi latihan", "Saran berbasis kehadiran, efisiensi teknik, dan tren antropometri.", '<button class="button secondary" data-action="refresh-recommendations">↻ Perbarui analisis</button>')}
          <div class="card"><div class="card-head"><div><h2 class="card-title">Fokus pembinaan berikutnya</h2><p class="card-sub">${items.length} saran berdasarkan data yang sudah tercatat</p></div><span class="tag blue">Indikatif</span></div><div class="recommend-list">${items.length ? items.map(item => `<div class="event-row"><div class="metric-icon">${item.category === "Fisik" ? "↗" : item.category === "Konsistensi" ? "✓" : "◎"}</div><div style="min-width:0;flex:1"><div class="event-name">${esc(item.title)} <span class="tag ${item.type}">${esc(item.category)}</span></div><div class="event-meta" style="margin-top:4px"><strong>${esc(item.player)}</strong> · ${esc(item.body)}</div></div></div>`).join("") : '<div class="empty">Belum ada sinyal khusus. Catat data kehadiran dan statistik laga untuk mendapat rekomendasi yang lebih relevan.</div>'}</div></div>
          <div class="privacy-note">Rekomendasi merupakan panduan pembinaan sederhana, bukan diagnosis medis atau penilaian otomatis bakat. Sesuaikan beban latihan dengan usia, pengalaman, kondisi kesehatan, serta pengawasan pelatih.</div>`;
      }
      function reportsPage() {
        const range = reportDateRange();
        const attendance = reportData("attendance", range);
        const anthropometry = reportData("anthropometry", range);
        const matchStatistics = reportData("match-statistics", range);
        const customRange = reportPeriod === "custom";
        const reportCard = (report, emptyMessage) => `<section class="card player-history-card"><div class="card-head"><div><h2 class="card-title">${esc(report.title)}</h2><p class="card-sub">${esc(report.rangeLabel)} · ${Math.max(0, report.rows.length - 1)} baris</p></div><div class="toolbar-actions"><button class="button secondary small" data-action="export-filtered-report" data-report-type="${esc(report.type)}" data-report-format="csv">CSV</button><button class="button secondary small" data-action="export-filtered-report" data-report-type="${esc(report.type)}" data-report-format="pdf">PDF</button></div></div><div class="table-wrap"><table><thead><tr>${report.rows[0].map(cell => `<th>${esc(cell)}</th>`).join("")}</tr></thead><tbody>${report.rows.length > 1 ? report.rows.slice(1).map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${report.rows[0].length}" class="empty">${esc(emptyMessage)}</td></tr>`}</tbody></table></div></section>`;
        return `${heading("Laporan", "Pilih periode untuk melihat laporan kehadiran, antropometri seluruh pemain, dan statistik setiap pertandingan.", '<button class="button secondary" data-action="export-grades">↓ Nilai rapor CSV</button>')}
          <section class="card player-history-card"><div class="card-head"><div><h2 class="card-title">Filter periode</h2><p class="card-sub">Periode ini berlaku untuk ketiga laporan di bawah.</p></div></div><div class="form-grid" style="padding:0 19px 16px">
            <div class="field"><label for="report-period">Periode</label><select id="report-period"><option value="week" ${reportPeriod === "week" ? "selected" : ""}>Mingguan</option><option value="month" ${reportPeriod === "month" ? "selected" : ""}>Bulanan</option><option value="year" ${reportPeriod === "year" ? "selected" : ""}>Tahunan</option><option value="custom" ${customRange ? "selected" : ""}>Rentang tanggal</option></select></div>
            <div class="field"><label for="report-start">Dari tanggal</label><input id="report-start" type="date" value="${esc(range.start)}" ${customRange ? "" : "disabled"}></div>
            <div class="field"><label for="report-end">Sampai tanggal</label><input id="report-end" type="date" value="${esc(range.end)}" ${customRange ? "" : "disabled"}></div>
            <div class="field"><label>Rentang aktif</label><div class="select-mini">${formatDate(range.start)} – ${formatDate(range.end)}</div></div>
          </div></section>
          ${reportCard(attendance, "Tidak ada data kehadiran pada periode ini.")}
          ${reportCard(anthropometry, "Tidak ada pengukuran antropometri pada periode ini.")}
          ${reportCard(matchStatistics, "Tidak ada pertandingan pada periode ini.")}
          <p class="privacy-note">Berkas CSV dapat dibuka di aplikasi spreadsheet. Nama, kelas, dan catatan siswa merupakan data pribadi—bagikan laporan hanya kepada pihak yang berwenang.</p>`;
      }
      function letterheadMarkup(input) {
        const branding = Object.assign({}, brandingDefaults, input || {});
        const size = (value, minimum, maximum, fallback) => {
          const number = Number(value);
          return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
        };
        const logoWidth = size(branding.logoWidth, 24, 260, brandingDefaults.logoWidth);
        const titleSize = size(branding.titleFontSize, 12, 42, brandingDefaults.titleFontSize);
        const subtitleSize = size(branding.subtitleFontSize, 8, 24, brandingDefaults.subtitleFontSize);
        const titleStyle = `font-family:${branding.fontFamily};font-size:${titleSize}px;font-weight:${branding.titleBold ? 700 : 400};font-style:${branding.titleItalic ? "italic" : "normal"}`;
        const subtitleStyle = `font-family:${branding.fontFamily};font-size:${subtitleSize}px;font-weight:${branding.subtitleBold ? 700 : 400};font-style:${branding.subtitleItalic ? "italic" : "normal"}`;
        return `<div class="letterhead-layout">${branding.logo ? `<img class="letterhead-logo" src="${esc(branding.logo)}" alt="" style="width:${logoWidth}px;max-height:${logoWidth}px">` : ""}<div class="letterhead-copy"><div class="letterhead-title" style="${esc(titleStyle)}">${esc(branding.letterheadTitle)}</div><div class="letterhead-subtitle" style="${esc(subtitleStyle)}">${esc(branding.letterheadSubtitle)}</div></div></div>${branding.letterheadLine ? '<hr class="letterhead-rule">' : ""}`;
      }
      function pdfSignatureMarkup(input) {
        const branding = Object.assign({}, brandingDefaults, input || {});
        if (!branding.pdfSignaturesEnabled) return "";
        const place = String(branding.pdfSignaturePlace || "").trim() || "Tempat";
        const signatureName = name => `<div class="pdf-signature-name">${esc(name || "")}</div>`;
        return `<section class="pdf-signatures">
          <div class="pdf-signature-side pdf-signature-left"><div>${esc(branding.pdfPrincipalIntro)}</div><div>${esc(branding.pdfPrincipalRole)}</div><div class="pdf-signature-space"></div>${branding.pdfPrincipalNameVisible ? signatureName(branding.pdfPrincipalName) : ""}</div>
          <div class="pdf-signature-side pdf-signature-right"><div>${esc(place)}, ${esc(formatDate(todayISO()))}</div><div>${esc(branding.pdfCoachRole)}</div><div class="pdf-signature-space"></div>${signatureName(branding.pdfCoachName)}</div>
        </section>`;
      }
      function settingsPage() {
        const role = settingsRoleKey;
        const allowed = (data.menuVisibility[role] || []).filter(id =>
          (id !== "settings" || role === "admin") && (id !== "activityLog" || role === "admin")
        );
        const bottomAllowed = (data.bottomNav && data.bottomNav[role] || []).filter(id => allowed.includes(id));
        const branding = Object.assign({}, brandingDefaults, data.branding || {});
        const backup = backupSettings || { enabled: false, time: "23:00", timezone: "Asia/Jakarta", telegramConfigured: false };
        const backupStatus = backup.lastRunAt
          ? `${esc(backup.lastMessage || "")} · ${esc(new Date(backup.lastRunAt + (backup.lastRunAt.includes("Z") ? "" : "Z")).toLocaleString("id-ID"))}`
          : "Belum ada pengiriman backup.";
        return `${heading("Pengaturan aplikasi & akses", "Atur hak tindakan tiap role, identitas aplikasi, kop dokumen, portal publik, dan backup data.", '<button class="button secondary" data-action="add-user">＋ Tambah akun</button>')}
          <div class="grid dashboard-grid"><section class="card"><div class="card-head"><div><h2 class="card-title">Konfigurasi menu dinamis</h2><p class="card-sub">Atur menu samping dan maksimal lima menu navigasi bawah per role.</p></div><select class="select-mini" id="settings-role">${Object.entries(roles).map(([id, label]) => `<option value="${id}" ${role === id ? "selected" : ""}>${esc(label)}</option>`).join("")}</select></div>
          <div style="padding:0 19px 18px">${pages.map(p => `<label class="switch-row"><span><span class="note-title">${esc(p.label)}</span><span class="note-copy">Atur visibilitas menu untuk ${esc(roles[role])}</span></span><input class="switch menu-switch" type="checkbox" data-menu="${p.id}" ${allowed.includes(p.id) ? "checked" : ""} ${p.id === "settings" || (p.id === "activityLog" && role !== "admin") ? "disabled" : ""} aria-label="Izinkan menu ${esc(p.label)}"></label>`).join("")}
          <h3 class="card-title" style="margin:22px 0 4px">Hak tindakan per menu</h3><p class="card-sub">Pilih batas akses tertinggi. Hak edit mencakup tambah dan ubah; hapus dapat diberikan terpisah.</p>
          <div class="access-level-list">${pages.filter(p => !["settings", "activityLog"].includes(p.id)).map(p => {
            const level = data.accessPermissions[role] && data.accessPermissions[role][p.id] || "view";
            const fixed = role === "admin";
            return `<div class="access-level-row"><span class="access-level-name">${esc(p.label)}</span><div class="access-level-options" role="radiogroup" aria-label="Hak tindakan ${esc(p.label)} untuk ${esc(roles[role])}">${[["view", "Lihat saja"], ["edit", "Edit/tambah"], ["full", "Termasuk hapus"]].map(([value, label]) => `<label class="access-level-option ${level === value ? "selected" : ""}"><input type="radio" name="access-${role}-${p.id}" value="${value}" data-access-menu="${p.id}" ${level === value ? "checked" : ""} ${fixed ? "disabled" : ""}><span>${label}</span></label>`).join("")}</div></div>`;
          }).join("")}</div>
          ${role === "admin" ? '<p class="privacy-note">Hak Admin selalu penuh agar pengaturan dan pemulihan data tidak terkunci.</p>' : ""}
          <div class="field" style="margin-top:15px"><label for="highlight-select">Menu sorotan / pin role ini</label><select id="highlight-select" ${allowed.length ? "" : "disabled"}>${pages.filter(p => allowed.includes(p.id)).map(p => `<option value="${p.id}" ${data.highlights[role] === p.id ? "selected" : ""}>${esc(p.label)}</option>`).join("")}</select></div>
          <h3 class="card-title" style="margin:22px 0 4px">Navigasi bawah HP · maksimal 5 menu</h3><p class="card-sub">Pilih menu yang tampil dan atur menu sorotannya.</p>
          ${pages.filter(p => allowed.includes(p.id) && (p.id !== "settings" || role === "admin")).map(p => `<label class="switch-row bottom-menu-option"><span>${esc(p.label)}</span><input class="switch bottom-menu-switch" type="checkbox" data-bottom-menu="${p.id}" ${bottomAllowed.includes(p.id) ? "checked" : ""} aria-label="Tampilkan ${esc(p.label)} di navigasi bawah"></label>`).join("")}
          <div class="field" style="margin-top:12px"><label for="bottom-highlight-select">Menu highlight navigasi bawah</label><select id="bottom-highlight-select" ${bottomAllowed.length ? "" : "disabled"}>${pages.filter(p => bottomAllowed.includes(p.id)).map(p => `<option value="${p.id}" ${data.bottomHighlights && data.bottomHighlights[role] === p.id ? "selected" : ""}>${esc(p.label)}</option>`).join("")}</select></div></div></section>
          <section class="card side-note"><h2 class="card-title">Akun pengguna</h2><p class="card-sub">Akun tersimpan di database VolleyDesk</p>${serverUsers.map(u => `<div class="note-item"><div class="account-row"><div class="account-identity">${u.avatar ? `<img class="account-avatar" src="${esc(u.avatar)}" alt="">` : `<span class="account-avatar account-avatar-fallback">${esc(initials(u.name))}</span>`}<div><div class="note-title">${esc(u.name)}</div><div class="note-copy">${esc(u.email)}</div><span class="tag blue" style="margin-top:6px">${esc(roles[u.role] || u.role)}</span></div></div><div class="account-actions"><button class="button secondary small" data-edit-user="${u.id}">Edit</button><button class="close-x" data-delete-user="${u.id}" aria-label="Hapus akun ${esc(u.name)}" ${Number(u.id) === Number(signedInUser.id) ? "disabled" : ""}>×</button></div></div></div>`).join("")}
          <div class="privacy-note">Akses akun diverifikasi oleh server. Hanya satu akun admin yang dapat terdaftar.</div></section></div>
          <section class="card wide-card"><div class="card-head"><div><h2 class="card-title">Identitas aplikasi & kop dokumen</h2><p class="card-sub">Atur nama aplikasi, judul tab browser, serta kop untuk hasil cetak laporan dan statistik pemain.</p></div></div>
            <div class="form-grid branding-form">
              <div class="field"><label for="branding-app-name">Nama aplikasi</label><input id="branding-app-name" maxlength="80" value="${esc(branding.appName)}"></div>
              <div class="field"><label for="branding-app-subtitle">Subjudul aplikasi</label><input id="branding-app-subtitle" maxlength="160" value="${esc(branding.appSubtitle)}"></div>
              <div class="field full"><label for="branding-tab-title">Judul tab browser</label><input id="branding-tab-title" maxlength="120" value="${esc(branding.tabTitle)}"></div>
              <div class="field"><label for="branding-logo-file">Logo aplikasi/kop · PNG, JPG, atau WebP · maks. 200 KB</label><input id="branding-logo-file" type="file" accept="image/png,image/jpeg,image/webp"><div class="branding-preview">${branding.logo ? `<img src="${esc(branding.logo)}" alt="Logo aplikasi saat ini">` : '<span>V</span>'}</div><label class="switch-row"><span>Hapus logo aplikasi</span><input id="branding-clear-logo" class="switch" type="checkbox" ${branding.logo ? "" : "disabled"}></label><div class="field"><label for="branding-logo-width">Ukuran logo kop · 24–260 px</label><input id="branding-logo-width" type="number" min="24" max="260" value="${esc(branding.logoWidth)}"></div></div>
              <div class="field"><label for="branding-favicon-file">Favicon · PNG, JPG, atau WebP · maks. 100 KB</label><input id="branding-favicon-file" type="file" accept="image/png,image/jpeg,image/webp"><div class="branding-preview favicon-preview">${branding.favicon ? `<img src="${esc(branding.favicon)}" alt="Favicon saat ini">` : '<span>V</span>'}</div><label class="switch-row"><span>Hapus favicon kustom</span><input id="branding-clear-favicon" class="switch" type="checkbox" ${branding.favicon ? "" : "disabled"}></label></div>
              <div class="field full"><label for="letterhead-title">Judul kop</label><input id="letterhead-title" maxlength="100" value="${esc(branding.letterheadTitle)}"></div>
              <div class="field full"><label for="letterhead-subtitle">Subjudul kop</label><input id="letterhead-subtitle" maxlength="160" value="${esc(branding.letterheadSubtitle)}"></div>
              <div class="field"><label for="letterhead-font">Jenis font</label><select id="letterhead-font">${[["Arial, sans-serif", "Arial"], ['"Times New Roman", serif', "Times New Roman"], ["Georgia, serif", "Georgia"], ["Verdana, sans-serif", "Verdana"], ["Tahoma, sans-serif", "Tahoma"]].map(([value, label]) => `<option value="${esc(value)}" ${branding.fontFamily === value ? "selected" : ""}>${label}</option>`).join("")}</select></div>
              <div class="field"><label for="letterhead-title-size">Ukuran judul · 12–42 px</label><input id="letterhead-title-size" type="number" min="12" max="42" value="${esc(branding.titleFontSize)}"></div>
              <div class="field"><label for="letterhead-subtitle-size">Ukuran subjudul · 8–24 px</label><input id="letterhead-subtitle-size" type="number" min="8" max="24" value="${esc(branding.subtitleFontSize)}"></div>
              <div class="field"><label class="switch-row" for="letterhead-title-bold"><span>Judul tebal</span><input id="letterhead-title-bold" class="switch" type="checkbox" ${branding.titleBold ? "checked" : ""}></label><label class="switch-row" for="letterhead-title-italic"><span>Judul miring</span><input id="letterhead-title-italic" class="switch" type="checkbox" ${branding.titleItalic ? "checked" : ""}></label></div>
              <div class="field"><label class="switch-row" for="letterhead-subtitle-bold"><span>Subjudul tebal</span><input id="letterhead-subtitle-bold" class="switch" type="checkbox" ${branding.subtitleBold ? "checked" : ""}></label><label class="switch-row" for="letterhead-subtitle-italic"><span>Subjudul miring</span><input id="letterhead-subtitle-italic" class="switch" type="checkbox" ${branding.subtitleItalic ? "checked" : ""}></label></div>
              <div class="field full"><label class="switch-row" for="letterhead-line"><span>Tampilkan garis pembatas kop</span><input id="letterhead-line" class="switch" type="checkbox" ${branding.letterheadLine ? "checked" : ""}></label></div>
              <div class="field full"><label>Pratinjau kop</label><div id="letterhead-preview" class="letterhead-preview">${letterheadMarkup(branding)}</div></div>
              <div class="field full"><h3 class="card-title">Tanda tangan pada PDF</h3><p class="card-sub">Pengaturan ini berlaku untuk semua PDF laporan dan statistik pemain.</p></div>
              <div class="field full"><label class="switch-row" for="pdf-signatures-enabled"><span>Tampilkan blok tanda tangan pada PDF</span><input id="pdf-signatures-enabled" class="switch" type="checkbox" ${branding.pdfSignaturesEnabled ? "checked" : ""}></label></div>
              <div class="field"><label for="pdf-principal-intro">Keterangan kepala sekolah</label><input id="pdf-principal-intro" maxlength="80" value="${esc(branding.pdfPrincipalIntro)}"></div>
              <div class="field"><label for="pdf-principal-role">Jabatan kepala sekolah</label><input id="pdf-principal-role" maxlength="80" value="${esc(branding.pdfPrincipalRole)}"></div>
              <div class="field"><label for="pdf-principal-name">Nama kepala sekolah</label><input id="pdf-principal-name" maxlength="80" value="${esc(branding.pdfPrincipalName)}"></div>
              <div class="field"><label class="switch-row" for="pdf-principal-name-visible"><span>Tampilkan nama kepala sekolah</span><input id="pdf-principal-name-visible" class="switch" type="checkbox" ${branding.pdfPrincipalNameVisible ? "checked" : ""}></label></div>
              <div class="field"><label for="pdf-signature-place">Tempat tanda tangan</label><input id="pdf-signature-place" maxlength="80" value="${esc(branding.pdfSignaturePlace)}" placeholder="Contoh: Jakarta"></div>
              <div class="field"><label for="pdf-coach-role">Jabatan pelatih</label><input id="pdf-coach-role" maxlength="80" value="${esc(branding.pdfCoachRole)}"></div>
              <div class="field"><label for="pdf-coach-name">Nama pelatih</label><input id="pdf-coach-name" maxlength="80" value="${esc(branding.pdfCoachName)}"></div>
              <div class="field full"><button class="button" data-action="save-branding">Simpan identitas & kop</button><p class="privacy-note">Logo dan kop digunakan pada halaman aplikasi serta dokumen cetak. Favicon dan judul tab hanya memengaruhi tampilan browser.</p></div>
            </div>
          </section>
          <section class="card wide-card"><div class="card-head"><div><h2 class="card-title">Portal publik pemain</h2><p class="card-sub">Bagikan tautan atau QR agar pemain dapat melihat statistik pertandingannya.</p></div><span class="tag ${publicPortal && publicPortal.enabled ? "blue" : "orange"}">${publicPortal && publicPortal.enabled ? "Aktif" : "Nonaktif"}</span></div>
            ${publicPortal && publicPortal.enabled ? `<div class="public-portal-share"><div class="field"><label for="public-portal-url">Tautan publik</label><input id="public-portal-url" type="url" readonly value="${esc(publicPortal.url)}"><div class="toolbar-actions"><button class="button secondary small" data-action="copy-public-portal">Salin tautan</button><a class="button secondary small" href="${esc(publicPortal.url)}" target="_blank" rel="noopener noreferrer">Pratinjau portal</a><button class="button secondary small" data-action="generate-public-portal">Buat tautan baru</button><button class="button orange small" data-action="disable-public-portal">Nonaktifkan</button></div><p class="privacy-note">Membuat tautan baru akan membatalkan tautan dan QR yang lama.</p></div><div class="public-portal-qr"><img src="${esc(publicPortal.qrDataUrl)}" alt="QR code portal publik"><span>Pindai untuk membuka portal</span></div></div>` : `<div class="public-portal-empty"><p>Portal belum diaktifkan. Buat tautan acak dan QR untuk membagikan akses.</p><button class="button" data-action="generate-public-portal">Buat tautan publik</button></div>`}
            <p class="privacy-note">Portal hanya menampilkan statistik pertandingan setelah nama dan tanggal lahir cocok. Data kelas, kehadiran, antropometri, evaluasi, dan tanggal lahir tidak ditampilkan. Siapa pun yang memiliki tautan dapat membuka formulir; verifikasi tanggal lahir adalah pemeriksaan dasar.</p>
          </section>
          <section class="card wide-card"><div class="card-head"><div><h2 class="card-title">Backup dan pemulihan data</h2><p class="card-sub">Database SQLite disimpan di volume persisten Railway.</p></div><span class="tag ${backup.telegramConfigured ? "blue" : "orange"}">${backup.telegramConfigured ? "Telegram siap" : "Telegram belum dikonfigurasi"}</span></div>
            <div class="form-grid" style="padding:0 19px 18px">
              <div class="field"><label for="telegram-bot-token">Telegram Bot Token</label><input id="telegram-bot-token" type="password" autocomplete="new-password" placeholder="${backup.botTokenSaved ? "Token tersimpan — isi hanya untuk mengganti" : "123456789:token-bot"}"></div>
              <div class="field"><label for="telegram-chat-id">Telegram Chat ID</label><input id="telegram-chat-id" type="text" inputmode="text" autocomplete="off" placeholder="${backup.chatIdSaved ? "Chat ID tersimpan — isi hanya untuk mengganti" : "Contoh: 123456789 atau -100..."}"></div>
              <div class="field"><label class="switch-row backup-toggle-row" for="backup-enabled"><span>Backup harian Telegram</span><input id="backup-enabled" class="switch" type="checkbox" ${backup.enabled ? "checked" : ""}></label></div>
              <div class="field"><label for="backup-time">Waktu kirim (${esc(backup.timezone || "Asia/Jakarta")})</label><input id="backup-time" type="time" value="${esc(backup.time || "23:00")}" required></div>
              <div class="field full"><label class="switch-row" for="clear-telegram-credentials"><span>Hapus token/chat ID yang tersimpan di aplikasi</span><input id="clear-telegram-credentials" class="switch" type="checkbox"></label><p class="card-sub">Token tidak akan ditampilkan kembali dan disimpan khusus untuk admin. Isi kedua field untuk memasang atau mengganti kredensial. Jika variabel secret Railway sudah dipasang, nilai tersebut tetap digunakan.</p></div>
              <div class="field full" style="display:flex;gap:8px;flex-wrap:wrap"><button class="button" data-action="save-backup-settings">Simpan jadwal</button><button class="button secondary" data-action="backup-now" ${backup.telegramConfigured ? "" : "disabled"}>Kirim backup sekarang</button><button class="button secondary" data-action="download-backup">Unduh backup JSON</button></div>
              <div class="field"><label for="backup-restore-file">Pulihkan dari backup JSON</label><input id="backup-restore-file" type="file" accept=".json,application/json"></div>
              <div class="field" style="display:flex;align-items:end"><button class="button secondary" data-action="restore-backup">Pulihkan data</button></div>
              <div class="field full"><p class="privacy-note">${backupStatus}</p></div>
            </div>
          </section>`;
      }
      function activityLogPage() {
        const rows = activityLogEntries && activityLogEntries.length
          ? activityLogEntries.map(entry => {
            const date = new Date(`${String(entry.createdAt).replace(" ", "T")}Z`);
            const formattedDate = Number.isNaN(date.getTime())
              ? entry.createdAt
              : date.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
            return `<tr><td><strong>${esc(entry.actorName)}</strong><div class="position">${esc(roles[entry.actorRole] || entry.actorRole)}</div></td><td>${esc(entry.description)}</td><td>${esc(formattedDate)}</td></tr>`;
          }).join("")
          : "";
        const message = activityLogError
          ? `<p class="empty">Log aktivitas gagal dimuat: ${esc(activityLogError)}</p>`
          : activityLogLoading
            ? '<p class="empty">Memuat log aktivitas...</p>'
            : '<p class="empty">Belum ada aktivitas yang tercatat.</p>';
        return `${heading("Log aktivitas", "Riwayat login dan perubahan data aplikasi terbaru.", '<button class="button secondary" data-action="refresh-activity-log">Muat ulang</button>')}
          <section class="card"><div class="table-wrap"><table><thead><tr><th>Pengguna</th><th>Aktivitas</th><th>Waktu</th></tr></thead><tbody>${rows}</tbody></table></div>${rows ? "" : message}</section>`;
      }
      function pageContent() {
        switch (currentPage) {
          case "dashboard": return dashboardPage();
          case "players": return playersPage();
          case "playerStats": return playerStatsPage();
          case "teams": return teamsPage();
          case "strategy": return strategyPage();
          case "attendance": return attendancePage();
          case "schedule": return schedulePage();
          case "training": return trainingPage();
          case "matches": return liveMatchesPage();
          case "recommendations": return recommendationsPage();
          case "reports": return reportsPage();
          case "targets": return targetsPage();
          case "activityLog": return activityLogPage();
          case "settings": return settingsPage();
          default: return dashboardPage();
        }
      }
      function render() {
        syncRoleOptions(); renderNav();
        const pageId = currentPage === "matches" ? "training" : currentPage === "playerStats" ? "players" : currentPage;
        const page = pages.find(p => p.id === pageId);
        $("#crumb-title").textContent = page ? page.label : "Ringkasan";
        $("#content").innerHTML = pageContent();
        applyPageActionPermissions(pageId);
        document.documentElement.dataset.theme = data.theme || "light";
        applyBranding(data.branding);
        syncProfileButton();
        $("#theme-toggle").textContent = data.theme === "dark" ? "☀" : "☾";
        $("#theme-toggle").title = data.theme === "dark" ? "Gunakan tema terang" : "Gunakan tema gelap";
        bindContentEvents();
        if (currentPage === "activityLog" && activityLogEntries === null && !activityLogLoading) loadActivityLog();
      }
      async function loadActivityLog(refresh) {
        if (activityLogLoading) return;
        if (refresh) activityLogEntries = null;
        activityLogLoading = true;
        activityLogError = "";
        try {
          const result = await api("/api/admin/activity-log");
          activityLogEntries = result.entries;
        } catch (error) {
          activityLogError = error.message || "Tidak dapat memuat log aktivitas.";
        } finally {
          activityLogLoading = false;
          if (currentPage === "activityLog") render();
        }
      }
      function readBrandingImage(file, label, maximumBytes) {
        if (!file) return Promise.resolve("");
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > maximumBytes) {
          throw new Error(`${label} harus berupa PNG, JPG, atau WebP maksimal ${Math.round(maximumBytes / 1024)} KB.`);
        }
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error(`${label} tidak dapat dibaca.`));
          reader.readAsDataURL(file);
        });
      }
      function brandingFormValues() {
        const text = (id, fallback) => {
          const input = $(`#${id}`);
          return input ? input.value.trim() : fallback;
        };
        const checked = (id, fallback) => {
          const input = $(`#${id}`);
          return input ? input.checked : fallback;
        };
        const number = (id, minimum, maximum, fallback) => {
          const input = $(`#${id}`);
          const value = input ? Number(input.value) : fallback;
          if (!Number.isInteger(value) || value < minimum || value > maximum) {
            throw new Error(`Nilai ${id.includes("logo") ? "ukuran logo" : "ukuran font"} harus berada dalam rentang yang tersedia.`);
          }
          return value;
        };
        return Object.assign({}, data.branding, {
          appName: text("branding-app-name", data.branding.appName),
          appSubtitle: text("branding-app-subtitle", data.branding.appSubtitle),
          tabTitle: text("branding-tab-title", data.branding.tabTitle),
          letterheadTitle: text("letterhead-title", data.branding.letterheadTitle),
          letterheadSubtitle: text("letterhead-subtitle", data.branding.letterheadSubtitle),
          logoWidth: number("branding-logo-width", 24, 260, brandingDefaults.logoWidth),
          titleFontSize: number("letterhead-title-size", 12, 42, brandingDefaults.titleFontSize),
          subtitleFontSize: number("letterhead-subtitle-size", 8, 24, brandingDefaults.subtitleFontSize),
          fontFamily: $("#letterhead-font") ? $("#letterhead-font").value : data.branding.fontFamily,
          titleBold: checked("letterhead-title-bold", data.branding.titleBold),
          titleItalic: checked("letterhead-title-italic", data.branding.titleItalic),
          subtitleBold: checked("letterhead-subtitle-bold", data.branding.subtitleBold),
          subtitleItalic: checked("letterhead-subtitle-italic", data.branding.subtitleItalic),
          letterheadLine: checked("letterhead-line", data.branding.letterheadLine),
          pdfSignaturesEnabled: checked("pdf-signatures-enabled", data.branding.pdfSignaturesEnabled),
          pdfPrincipalNameVisible: checked("pdf-principal-name-visible", data.branding.pdfPrincipalNameVisible),
          pdfPrincipalIntro: text("pdf-principal-intro", data.branding.pdfPrincipalIntro),
          pdfPrincipalRole: text("pdf-principal-role", data.branding.pdfPrincipalRole),
          pdfPrincipalName: text("pdf-principal-name", data.branding.pdfPrincipalName),
          pdfSignaturePlace: text("pdf-signature-place", data.branding.pdfSignaturePlace),
          pdfCoachRole: text("pdf-coach-role", data.branding.pdfCoachRole),
          pdfCoachName: text("pdf-coach-name", data.branding.pdfCoachName)
        });
      }
      function updateLetterheadPreview() {
        const preview = $("#letterhead-preview");
        if (!preview) return;
        try {
          const branding = brandingFormValues();
          if ($("#branding-clear-logo").checked) branding.logo = "";
          preview.innerHTML = letterheadMarkup(branding);
        } catch {}
      }
      async function saveBranding() {
        const logoFile = $("#branding-logo-file").files[0];
        const faviconFile = $("#branding-favicon-file").files[0];
        const previous = data.branding;
        try {
          const branding = Object.assign({}, previous, brandingFormValues());
          if (logoFile) branding.logo = await readBrandingImage(logoFile, "Logo aplikasi", 200 * 1024);
          else if ($("#branding-clear-logo").checked) branding.logo = "";
          if (faviconFile) branding.favicon = await readBrandingImage(faviconFile, "Favicon", 100 * 1024);
          else if ($("#branding-clear-favicon").checked) branding.favicon = "";
          data.branding = branding;
          if (!(await persist())) {
            data.branding = previous;
            return;
          }
          applyBranding(branding);
          render();
          toast("Logo aplikasi dan favicon berhasil disimpan.");
        } catch (error) {
          data.branding = previous;
          toast(error.message || "Logo aplikasi dan favicon gagal disimpan.");
        }
      }
      function showModal(title, body, onSubmit) {
        const root = $("#modal-root");
        root.innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><h2 id="modal-title">${title}</h2><button class="close-x" data-close-modal aria-label="Tutup">×</button></div><div class="modal-body">${body}</div></section></div>`;
        applyPageActionPermissions(currentPage === "matches" ? "training" : currentPage === "playerStats" ? "players" : currentPage);
        root.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", () => root.innerHTML = ""));
        root.querySelector(".modal-backdrop").addEventListener("click", e => { if (e.target.classList.contains("modal-backdrop")) root.innerHTML = ""; });
        const form = root.querySelector("form");
        if (form) form.addEventListener("submit", async e => {
          e.preventDefault();
          const submitButton = form.querySelector('button[type="submit"], button:not([type])');
          if (submitButton) submitButton.disabled = true;
          try {
            const result = await onSubmit(new FormData(form));
            if (result !== false) {
              const nextAction = result && typeof result === "object" ? result : null;
              if (result !== "skip-persist" && !(nextAction && nextAction.skipPersist) && !await persist()) {
                if (submitButton) submitButton.disabled = false;
                return;
              }
              root.innerHTML = "";
              render();
              if (nextAction && nextAction.openSessionId != null) editSessionModal(nextAction.openSessionId);
            } else if (submitButton) {
              submitButton.disabled = false;
            }
          } catch (error) {
            toast(error.message || "Permintaan gagal.");
            if (submitButton) submitButton.disabled = false;
          }
        });
      }
      function addPlayerModal() {
        showModal("Tambah pemain", `<form><div class="form-grid">
          <div class="field full"><label>Nama lengkap</label><input name="name" required maxlength="80" placeholder="Nama pemain"></div>
          <div class="field"><label>Posisi</label><select name="position">${["Setter", "Outside Hitter", "Opposite", "Middle Blocker", "Libero"].map(p => `<option>${p}</option>`).join("")}</select></div>
          <div class="field"><label>Nomor punggung</label><input name="number" type="number" min="0" max="99" required></div>
          <div class="field"><label>Kelas</label><input name="className" required placeholder="XI IPA 1"></div>
          <div class="field"><label>Jenis kelamin (opsional)</label><select name="gender"><option value="">Belum diisi</option><option>Perempuan</option><option>Laki-laki</option></select></div>
          <div class="field"><label>Tanggal lahir (opsional)</label><input name="birthDate" type="date" max="${todayISO()}"></div>
          <div class="field"><label>Tinggi (cm)</label><input name="height" type="number" min="100" max="230" required></div>
          <div class="field"><label>Berat (kg)</label><input name="weight" type="number" min="20" max="180" required></div>
          <div class="field"><label>Vertical jump (cm, opsional)</label><input name="verticalJump" type="number" min="0" max="120" step="0.1"></div>
          <div class="field"><label>Spike reach (cm)</label><input name="spikeReach" type="number" min="100" max="350" required></div>
          <div class="field"><label>Block reach (cm)</label><input name="blockReach" type="number" min="100" max="350" required></div>
          </div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan pemain</button></div></form>`, fd => {
          const name = String(fd.get("name") || "").trim();
          if (!name) return false;
          const id = Date.now();
          const verticalInput = String(fd.get("verticalJump") || "").trim();
          const verticalJump = verticalInput ? Number(verticalInput) : null;
          if (verticalJump != null && (!Number.isFinite(verticalJump) || verticalJump < 0 || verticalJump > 120)) {
            throw new Error("Vertical jump harus antara 0 dan 120 cm.");
          }
          const record = { date: todayISO(), height: Number(fd.get("height")), weight: Number(fd.get("weight")), verticalJump, spikeReach: Number(fd.get("spikeReach")), blockReach: Number(fd.get("blockReach")) };
          const p = { id, name, position: fd.get("position"), number: Number(fd.get("number")), className: String(fd.get("className")).trim(), gender: String(fd.get("gender") || ""), birthDate: String(fd.get("birthDate") || ""), height: record.height, weight: record.weight, verticalJump, spikeReach: record.spikeReach, blockReach: record.blockReach, history: [record] };
          data.players.push(p); toast("Pemain berhasil ditambahkan.");
        });
      }
      function teamModal(teamId) {
        const team = teamId == null ? null : (data.teams || []).find(item => Number(item.id) === Number(teamId));
        if (teamId != null && !team) return;
        const selected = new Set((team && team.playerIds || []).map(Number));
        const body = `<form><div class="form-grid">
          <div class="field full"><label>Nama tim</label><input name="name" required maxlength="80" value="${esc(team ? team.name : "")}" placeholder="Contoh: Tim Junior"></div>
          <div class="field full"><label for="team-logo-file">Logo PNG, JPG, atau WebP (maks. 200 KB)</label><input id="team-logo-file" name="logo" type="file" accept="image/png,image/jpeg,image/webp"><div class="team-logo-preview-wrap">${team && team.logo ? `<img id="team-logo-preview" class="team-logo" src="${esc(team.logo)}" alt="Pratinjau logo">` : '<span id="team-logo-preview" class="team-logo team-logo-fallback">V</span>'}</div></div>
          ${team && team.logo ? '<div class="field full"><label class="team-clear-logo"><input name="clearLogo" type="checkbox"> Hapus logo saat ini</label></div>' : ""}
          <div class="field full"><label>Pilih anggota (bisa memilih pemain di beberapa tim)</label><div class="roster-pick">${data.players.map(player => `<label class="roster-option"><input type="checkbox" name="players" value="${player.id}" ${selected.has(Number(player.id)) ? "checked" : ""}><span>${esc(player.name)} · #${esc(player.number)} · ${esc(player.position)}</span></label>`).join("") || '<div class="empty">Tambahkan biodata pemain terlebih dahulu.</div>'}</div></div>
          </div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">${team ? "Simpan perubahan" : "Buat tim"}</button></div></form>`;
        showModal(team ? "Ubah tim" : "Buat tim", body, async fd => {
          const name = String(fd.get("name") || "").trim();
          if (!name) return false;
          let logo = team ? team.logo || "" : "";
          const file = fd.get("logo");
          if (file && file.size) {
            if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 200 * 1024) {
              throw new Error("Pilih logo PNG, JPG, atau WebP dengan ukuran maksimal 200 KB.");
            }
            logo = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result || ""));
              reader.onerror = () => reject(new Error("Berkas logo tidak dapat dibaca."));
              reader.readAsDataURL(file);
            });
          }
          if (fd.get("clearLogo")) logo = "";
          const playerIds = Array.from(new Set(fd.getAll("players").map(Number)));
          if (team) Object.assign(team, { name, logo, playerIds });
          else {
            data.teams = data.teams || [];
            data.teams.push({ id: Date.now(), name, logo, playerIds });
          }
          toast(team ? "Data tim diperbarui." : "Tim berhasil dibuat.");
        });
        const logoInput = $("#team-logo-file");
        if (logoInput) logoInput.addEventListener("change", () => {
          const file = logoInput.files && logoInput.files[0];
          if (!file) return;
          if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 200 * 1024) {
            logoInput.value = "";
            toast("Pilih logo PNG, JPG, atau WebP dengan ukuran maksimal 200 KB.");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            const preview = $("#team-logo-preview");
            if (!preview) return;
            if (preview.tagName.toLowerCase() !== "img") {
              const image = document.createElement("img");
              image.id = "team-logo-preview";
              image.className = "team-logo";
              image.alt = "Pratinjau logo";
              preview.replaceWith(image);
              image.src = String(reader.result || "");
            } else preview.src = String(reader.result || "");
          };
          reader.readAsDataURL(file);
        });
      }
      function editPlayerModal(id) {
        const player = playerById(id);
        if (!player) return;
        const positions = ["Setter", "Outside Hitter", "Opposite", "Middle Blocker", "Libero"];
        showModal("Edit profil pemain · " + esc(player.name), `<form><div class="form-grid">
          <div class="field full"><label>Nama lengkap</label><input name="name" required maxlength="80" value="${esc(player.name)}"></div>
          <div class="field"><label>Posisi</label><select name="position">${positions.map(position => `<option ${player.position === position ? "selected" : ""}>${position}</option>`).join("")}</select></div>
          <div class="field"><label>Nomor punggung</label><input name="number" type="number" min="0" max="99" value="${esc(player.number)}" required></div>
          <div class="field"><label>Kelas</label><input name="className" maxlength="40" value="${esc(player.className)}" required></div>
          <div class="field"><label>Jenis kelamin</label><select name="gender"><option value="" ${!player.gender ? "selected" : ""}>Belum diisi</option><option value="Perempuan" ${player.gender === "Perempuan" ? "selected" : ""}>Perempuan</option><option value="Laki-laki" ${player.gender === "Laki-laki" ? "selected" : ""}>Laki-laki</option></select></div>
          <div class="field full"><label>Tanggal lahir (opsional)</label><input name="birthDate" type="date" max="${todayISO()}" value="${esc(player.birthDate || "")}"></div>
          </div>
          <div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan profil</button></div></form>`, async fd => {
          const name = String(fd.get("name") || "").trim();
          const className = String(fd.get("className") || "").trim();
          if (!name || !className) throw new Error("Nama pemain dan kelas wajib diisi.");
          const previousPlayer = JSON.parse(JSON.stringify(player));
          Object.assign(player, {
            name, position: String(fd.get("position")), number: Number(fd.get("number")),
            className, gender: String(fd.get("gender") || ""), birthDate: String(fd.get("birthDate") || "")
          });
          if (!await persist()) {
            Object.assign(player, previousPlayer);
            return false;
          }
          toast("Profil pemain diperbarui.");
          return "skip-persist";
        });
      }
      function anthropometryModal(playerId) {
        const player = playerById(playerId);
        if (!player) return;
        showModal("Update antropometri · " + esc(player.name), `<form><p class="card-sub">Masukkan data pengukuran terbaru pemain.</p><div class="form-grid">
            <div class="field full"><label>Tanggal pengukuran</label><input name="date" type="date" max="${todayISO()}" value="${todayISO()}" required></div>
            <div class="field"><label>Tinggi (cm)</label><input name="height" type="number" min="100" max="230" step="1" value="${esc(player.height)}" required></div>
            <div class="field"><label>Berat badan (kg)</label><input name="weight" type="number" min="20" max="180" step="0.1" value="${esc(player.weight)}" required></div>
            <div class="field"><label>Vertical jump (cm, opsional)</label><input name="verticalJump" type="number" min="0" max="120" step="0.1" value="${player.verticalJump == null ? "" : esc(player.verticalJump)}"></div>
            <div class="field"><label>Spike reach (cm)</label><input name="spikeReach" type="number" min="100" max="350" step="1" value="${esc(player.spikeReach)}" required></div>
            <div class="field"><label>Block reach (cm)</label><input name="blockReach" type="number" min="100" max="350" step="1" value="${esc(player.blockReach)}" required></div>
          </div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Tutup</button><button class="button">Simpan pengukuran</button></div></form>`, async fd => {
          const record = {
            date: String(fd.get("date") || ""),
            height: Number(fd.get("height")),
            weight: Number(fd.get("weight")),
            verticalJump: String(fd.get("verticalJump") || "").trim() === "" ? null : Number(fd.get("verticalJump")),
            spikeReach: Number(fd.get("spikeReach")),
            blockReach: Number(fd.get("blockReach"))
          };
          if (!record.date || record.date > todayISO()) throw new Error("Tanggal pengukuran tidak valid.");
          if (!Number.isInteger(record.height) || record.height < 100 || record.height > 230 ||
            !Number.isFinite(record.weight) || record.weight < 20 || record.weight > 180 ||
            (record.verticalJump != null && (!Number.isFinite(record.verticalJump) || record.verticalJump < 0 || record.verticalJump > 120)) ||
            !Number.isInteger(record.spikeReach) || record.spikeReach < 100 || record.spikeReach > 350 ||
            !Number.isInteger(record.blockReach) || record.blockReach < 100 || record.blockReach > 350) {
            throw new Error("Periksa kembali rentang nilai antropometri.");
          }
          const previousPlayer = JSON.parse(JSON.stringify(player));
          player.history = Array.isArray(player.history) ? player.history : [];
          const sameDateIndex = player.history.findIndex(item => item.date === record.date);
          if (sameDateIndex >= 0) player.history[sameDateIndex] = record;
          else player.history.push(record);
          Object.assign(player, {
            height: record.height, weight: record.weight,
            verticalJump: record.verticalJump,
            spikeReach: record.spikeReach, blockReach: record.blockReach
          });
          if (!await persist()) {
            Object.assign(player, previousPlayer);
            return false;
          }
          toast("Data antropometri berhasil diperbarui.");
          return "skip-persist";
        });
      }
      function newSessionModal(defaultDate, returnToCalendar) {
        const teams = data.teams || [];
        const playerOptions = data.players.map(player => `<label class="roster-option"><input type="checkbox" name="participantIds" value="${player.id}" data-session-manual-player><span>${esc(player.name)} · #${esc(player.number)} · ${esc(player.position)}</span></label>`).join("")
          || '<div class="empty">Belum ada pemain. Tambahkan pemain terlebih dahulu.</div>';
        showModal("Tambah sesi latihan", `<form><div class="form-grid">
          <div class="field full"><label>Nama sesi</label><input name="title" required maxlength="100" placeholder="Contoh: Latihan teknik & taktik"></div>
          <div class="field"><label>Tanggal</label><input name="date" type="date" value="${esc(defaultDate || todayISO())}" required></div>
          <div class="field full"><label>Materi latihan (pisahkan dengan koma)</label><input name="drills" required maxlength="500" placeholder="Contoh: Drilling passing, spike footwork"></div>
          <div class="field full"><label for="session-participant-mode">Pemain yang dilatih</label><select id="session-participant-mode" name="participantMode">
            <option value="all">Semua pemain</option>
            <option value="team" ${teams.length ? "" : "disabled"}>Pilih tim</option>
            <option value="manual">Pilih manual</option>
          </select></div>
          <div class="field full" id="session-team-field" hidden><label for="session-team-picker">Tim latihan</label>
            <select id="session-team-picker" name="teamId"><option value="">Pilih tim</option>${teams.map(team => {
              const count = data.players.filter(player => (team.playerIds || []).some(id => Number(id) === Number(player.id))).length;
              return `<option value="${team.id}">${esc(team.name)} · ${count} pemain</option>`;
            }).join("")}</select><p class="card-sub" id="session-team-summary">Pilih tim untuk melihat jumlah pemain.</p>
          </div>
          <div class="field full" id="session-manual-field" hidden>
            <label class="roster-option"><input type="checkbox" id="session-select-all"><span>Pilih semua pemain</span></label>
            <div class="roster-pick" id="session-manual-roster">${playerOptions}</div>
          </div>
          </div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan</button></div></form>`, async fd => {
          const title = String(fd.get("title") || "").trim();
          const date = String(fd.get("date") || "");
          if (!title || !date) return false;
          const drills = String(fd.get("drills") || "").split(",").map(value => value.trim()).filter(Boolean);
          if (!drills.length) throw new Error("Materi latihan wajib diisi.");
          const rosterMode = String(fd.get("participantMode") || "all");
          let teamId = null;
          let playerIds;
          if (rosterMode === "team") {
            teamId = Number(fd.get("teamId"));
            const team = teams.find(item => Number(item.id) === teamId);
            if (!team) throw new Error("Pilih tim yang akan dilatih.");
            playerIds = data.players.filter(player => (team.playerIds || []).some(id => Number(id) === Number(player.id))).map(player => Number(player.id));
            if (!playerIds.length) throw new Error("Tim ini belum memiliki pemain.");
          } else if (rosterMode === "manual") {
            playerIds = Array.from(new Set(fd.getAll("participantIds").map(Number)))
              .filter(id => data.players.some(player => Number(player.id) === id));
            if (!playerIds.length) throw new Error("Pilih minimal satu pemain atau gunakan Pilih semua pemain.");
          } else {
            playerIds = data.players.map(player => Number(player.id));
            if (!playerIds.length) throw new Error("Tambahkan pemain terlebih dahulu.");
          }
          const session = {
            id: Date.now(), title, date, drills, notes: "", evaluations: {},
            attendance: {}, attendanceSaved: false, rosterMode, teamId, playerIds
          };
          data.sessions.unshift(session);
          if (!await persist()) {
            data.sessions = data.sessions.filter(item => item !== session);
            return false;
          }
          if (returnToCalendar) {
            currentPage = "schedule";
            toast("Sesi latihan ditambahkan ke Kalender. Kelola absensi dari menu Latihan.");
            return "skip-persist";
          }
          currentPage = "attendance";
          toast("Sesi latihan ditambahkan. Absensi belum diisi.");
          return { skipPersist: true, openSessionId: session.id };
        });
        const root = $("#modal-root");
        const modePicker = $("#session-participant-mode", root);
        const teamField = $("#session-team-field", root);
        const teamPicker = $("#session-team-picker", root);
        const teamSummary = $("#session-team-summary", root);
        const manualField = $("#session-manual-field", root);
        const selectAll = $("#session-select-all", root);
        const manualPlayers = Array.from(root.querySelectorAll("[data-session-manual-player]"));
        const updateTeamSummary = () => {
          const team = teams.find(item => Number(item.id) === Number(teamPicker.value));
          const count = team ? data.players.filter(player => (team.playerIds || []).some(id => Number(id) === Number(player.id))).length : 0;
          teamSummary.textContent = team ? `${count} pemain akan ditambahkan ke sesi.` : "Pilih tim untuk melihat jumlah pemain.";
        };
        const updateManualSelectAll = () => {
          const selectedCount = manualPlayers.filter(input => input.checked).length;
          selectAll.checked = manualPlayers.length > 0 && selectedCount === manualPlayers.length;
          selectAll.indeterminate = selectedCount > 0 && selectedCount < manualPlayers.length;
        };
        const updateParticipantFields = () => {
          teamField.hidden = modePicker.value !== "team";
          manualField.hidden = modePicker.value !== "manual";
          teamPicker.required = modePicker.value === "team";
          updateTeamSummary();
        };
        modePicker.addEventListener("change", updateParticipantFields);
        teamPicker.addEventListener("change", updateTeamSummary);
        selectAll.addEventListener("change", () => {
          manualPlayers.forEach(input => { input.checked = selectAll.checked; });
          selectAll.indeterminate = false;
        });
        manualPlayers.forEach(input => input.addEventListener("change", updateManualSelectAll));
        updateParticipantFields();
      }
      function reviewSessionModal(sessionId) {
        const session = data.sessions.find(item => Number(item.id) === Number(sessionId));
        if (!session) return;
        const attendance = session.attendance || {};
        const evaluations = session.evaluations || {};
        const players = sessionPlayers(session);
        const attendanceRows = players.map(player => {
          const status = attendance[player.id] || "Belum dicatat";
          const statusClass = { Hadir: "green", Izin: "blue", Sakit: "orange", Alpa: "red" }[status] || "red";
          return `<div class="switch-row"><span>${esc(player.name)}</span><span class="tag ${statusClass}">${esc(status)}</span></div>`;
        }).join("");
        const rosterLabel = sessionRosterLabel(session);
        const evaluationRows = Object.entries(evaluations).filter(([, text]) => text).map(([playerId, text]) => {
          const player = playerById(playerId);
          return player ? `<div class="note-item"><div class="note-title">${esc(player.name)}</div><div class="note-copy">${esc(text)}</div></div>` : "";
        }).join("");
        showModal(`${esc(session.title)} · Pratinjau`, `<div class="note-item"><div class="note-title">Tanggal</div><div class="note-copy">${formatDate(session.date)}</div></div>
          <div class="note-item"><div class="note-title">${esc(rosterLabel)}</div><div class="note-copy">${players.length} pemain</div></div>
          <div class="note-item"><div class="note-title">Status absensi</div>${attendanceRows || '<div class="note-copy">Belum ada data pemain.</div>'}</div>
          <div class="note-item"><div class="note-title">Materi latihan</div><div class="note-copy">${(session.drills || []).map(esc).join(", ") || "Belum diisi."}</div></div>
          <div class="note-item"><div class="note-title">Catatan progres / evaluasi umum</div><div class="note-copy">${esc(session.notes || "Belum diisi.")}</div></div>
          <div class="note-item"><div class="note-title">Evaluasi individu</div>${evaluationRows || '<div class="note-copy">Belum ada evaluasi individu.</div>'}</div>
          <div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Tutup</button><button type="button" class="button" data-session-edit="${session.id}">Edit</button></div>`);
        $("#modal-root [data-session-edit]").addEventListener("click", () => editSessionModal(session.id));
      }
      function editSessionModal(sessionId) {
        const session = data.sessions.find(item => Number(item.id) === Number(sessionId));
        if (!session) return;
        const players = sessionPlayers(session);
        const attendanceDraft = Object.assign({}, session.attendance || {});
        players.forEach(player => {
          if (!["Hadir", "Izin", "Sakit", "Alpa"].includes(attendanceDraft[player.id])) attendanceDraft[player.id] = "Hadir";
        });
        const attendanceRows = players.map(player => `<div class="attendance-row" data-session-player-row="${player.id}" data-player-name="${esc(player.name.toLowerCase())}">
          <div class="player-name"><span class="player-avatar">${initials(player.name)}</span><span>${esc(player.name)}<span class="position">${esc(player.position)} · #${esc(player.number)}</span></span></div>
          <span class="status-group">${["Hadir", "Izin", "Sakit", "Alpa"].map(status => `<button type="button" class="status-btn ${attendanceDraft[player.id] === status ? "selected" : ""}" data-edit-attendance="${player.id}" data-status="${status}">${status}</button>`).join("")}</span>
          </div>`).join("");
        const evaluationFields = players.map(player => `<div class="field full" data-session-evaluation="${player.id}" ${attendanceDraft[player.id] === "Hadir" ? "" : "hidden"}>
          <label>Catatan evaluasi · ${esc(player.name)}</label><textarea name="eval_${player.id}" maxlength="500" placeholder="Catatan perkembangan individu">${esc((session.evaluations || {})[player.id] || "")}</textarea>
          </div>`).join("");
        const rosterLabel = sessionRosterLabel(session);
        showModal("Edit sesi · " + esc(session.title), `<form id="edit-session-form">
          <div class="form-grid">
            <div class="field full"><label>Nama sesi</label><input name="title" required maxlength="100" value="${esc(session.title)}"></div>
            <div class="field"><label>Tanggal</label><input name="date" type="date" required value="${esc(session.date)}"></div>
            <div class="field full"><label>${esc(rosterLabel)} · ${players.length} pemain</label><input id="session-player-filter" type="search" placeholder="Cari nama pemain..."></div>
          </div>
          <div class="attendance-list">${attendanceRows || '<div class="empty">Belum ada data pemain.</div>'}</div>
          <div style="padding:14px 0;text-align:right"><button type="button" class="button secondary" id="save-session-attendance">Simpan Absensi</button></div>
          <div class="form-grid">
            <div class="field full"><label>Catatan progres / evaluasi umum sesi</label><textarea name="notes" maxlength="2000" placeholder="Catatan umum sesi">${esc(session.notes || "")}</textarea></div>
            <div class="field full"><label>Materi latihan (pisahkan dengan koma)</label><input name="drills" required maxlength="500" value="${esc((session.drills || []).join(", "))}" placeholder="Drilling passing, spike footwork"></div>
            <div class="field full"><strong class="card-title">Catatan evaluasi individu</strong></div>
            ${evaluationFields}
          </div>
          <div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan Sesi</button></div>
          </form>`, async fd => {
          const title = String(fd.get("title") || "").trim();
          const date = String(fd.get("date") || "");
          if (!title || !date) return false;
          const drills = String(fd.get("drills") || "").split(",").map(value => value.trim()).filter(Boolean);
          if (!drills.length) throw new Error("Materi latihan wajib diisi.");
          if (!players.length) throw new Error("Tambahkan pemain ke sesi sebelum menyimpan absensi.");
          if (players.some(player => !["Hadir", "Izin", "Sakit", "Alpa"].includes(attendanceDraft[player.id]))) {
            throw new Error("Pilih status absensi untuk setiap pemain.");
          }
          const evaluations = {};
          players.forEach(player => {
            const value = String(fd.get(`eval_${player.id}`) || "").trim();
            if (attendanceDraft[player.id] === "Hadir" && value) evaluations[player.id] = value;
          });
          const previous = JSON.parse(JSON.stringify(session));
          Object.assign(session, {
            title, date, attendance: Object.assign({}, attendanceDraft), attendanceSaved: true,
            notes: String(fd.get("notes") || "").trim(),
            drills,
            evaluations
          });
          if (!await persist()) {
            Object.assign(session, previous);
            return false;
          }
          toast("Absensi dan data sesi berhasil disimpan.");
          return "skip-persist";
        });
        const root = $("#modal-root");
        root.querySelectorAll("[data-edit-attendance]").forEach(button => button.addEventListener("click", () => {
          const playerId = button.dataset.editAttendance;
          attendanceDraft[playerId] = button.dataset.status;
          const row = button.closest("[data-session-player-row]");
          row.querySelectorAll("[data-edit-attendance]").forEach(statusButton => statusButton.classList.toggle("selected", statusButton.dataset.status === button.dataset.status));
          const evaluation = root.querySelector(`[data-session-evaluation="${playerId}"]`);
          if (evaluation) evaluation.hidden = button.dataset.status !== "Hadir";
        }));
        const filter = $("#session-player-filter", root);
        if (filter) filter.addEventListener("input", () => {
          const query = filter.value.trim().toLowerCase();
          root.querySelectorAll("[data-session-player-row]").forEach(row => { row.hidden = !row.dataset.playerName.includes(query); });
        });
        const saveAttendance = $("#save-session-attendance", root);
        if (saveAttendance) saveAttendance.addEventListener("click", async () => {
          if (!players.length) {
            toast("Tambahkan pemain ke sesi terlebih dahulu sebelum menyimpan absensi.");
            return;
          }
          const previousAttendance = session.attendance;
          const previousSaved = session.attendanceSaved;
          const previousEvaluations = session.evaluations;
          session.attendance = Object.assign({}, attendanceDraft);
          session.attendanceSaved = true;
          session.evaluations = Object.fromEntries(Object.entries(session.evaluations || {})
            .filter(([playerId]) => attendanceDraft[playerId] === "Hadir"));
          saveAttendance.disabled = true;
          if (await persist()) toast("Absensi berhasil disimpan.");
          else {
            session.attendance = previousAttendance;
            session.attendanceSaved = previousSaved;
            session.evaluations = previousEvaluations;
          }
          saveAttendance.disabled = false;
        });
      }
      function addEventModal(defaultType, eventId) {
        const event = eventId == null ? null : data.events.find(item => Number(item.id) === Number(eventId));
        if (eventId != null && !event) return;
        const eventDate = event ? event.date : selectedCalendarDate || todayISO();
        const eventTypes = ["Latihan pribadi", "Latihan tim", "Les", "Pertandingan", "Sparring", "Turnamen", "Istirahat", "Lainnya"];
        const selectedType = event ? event.type : defaultType;
        const availableTypes = selectedType && !eventTypes.includes(selectedType) ? [selectedType, ...eventTypes] : eventTypes;
        showModal(event ? "Edit kegiatan" : "Tambah kegiatan", `<form><div class="form-grid"><div class="field full"><label>Agenda</label><input name="title" required maxlength="100" value="${esc(event ? event.title : "")}" placeholder="Contoh: latihan tim sore"></div><div class="field"><label>Jenis kegiatan</label><select name="type">${availableTypes.map(type => `<option ${type === selectedType ? "selected" : ""}>${esc(type)}</option>`).join("")}</select></div><div class="field"><label>Tanggal</label><input name="date" type="date" value="${esc(eventDate)}" required></div><div class="field"><label>Waktu (opsional)</label><input name="time" type="time" value="${esc(event ? event.time || "" : "")}"></div><div class="field"><label>Tempat (opsional)</label><input name="location" maxlength="120" value="${esc(event ? event.location || "" : "")}" placeholder="Contoh: GOR Sekolah"></div><div class="field full"><label>Catatan (opsional)</label><textarea name="notes" maxlength="500" placeholder="Detail agenda">${esc(event ? event.notes || "" : "")}</textarea></div></div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">${event ? "Simpan perubahan" : "Simpan kegiatan"}</button></div></form>`, async fd => {
          const updated = {
            title: String(fd.get("title") || "").trim(),
            type: String(fd.get("type") || ""),
            date: String(fd.get("date") || ""),
            time: String(fd.get("time") || ""),
            location: String(fd.get("location") || "").trim(),
            notes: String(fd.get("notes") || "").trim()
          };
          if (!updated.title || !updated.date) return false;
          if (event) {
            const previous = { ...event };
            Object.assign(event, updated);
            if (!await persist()) {
              Object.assign(event, previous);
              return false;
            }
            toast("Kegiatan diperbarui.");
            return "skip-persist";
          }
          data.events.push({ id: Date.now(), ...updated });
          toast("Agenda berhasil ditambahkan.");
        });
      }
      function reviewCalendarEventModal(eventId) {
        const event = data.events.find(item => Number(item.id) === Number(eventId));
        if (!event) return;
        showModal(`${esc(event.title)} · Detail`, `<div class="note-item"><div class="note-title">Jenis kegiatan</div><div class="note-copy">${esc(event.type)}</div></div>
          <div class="note-item"><div class="note-title">Tanggal dan waktu</div><div class="note-copy">${formatDate(event.date)}${event.time ? ` · ${esc(event.time)}` : ""}</div></div>
          <div class="note-item"><div class="note-title">Tempat</div><div class="note-copy">${esc(event.location || "Belum diisi")}</div></div>
          <div class="note-item"><div class="note-title">Catatan</div><div class="note-copy">${esc(event.notes || "Belum ada catatan.")}</div></div>
          <div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Tutup</button><button type="button" class="button" data-calendar-event-edit="${event.id}">Edit</button></div>`);
        $("#modal-root [data-calendar-event-edit]").addEventListener("click", () => addEventModal(null, event.id));
      }
      async function deleteCalendarActivity(source, activityId) {
        const collection = source === "event" ? data.events
          : source === "session" ? data.sessions
            : source === "match" ? data.matches
              : null;
        const menu = calendarMenuForSource(source);
        if (!collection || !canDeleteMenu(menu)) return;
        const item = collection.find(entry => Number(entry.id) === Number(activityId));
        if (!item) return;
        const title = source === "match" ? item.name : item.title;
        const message = source === "session"
          ? `Hapus sesi "${title}" beserta catatan kehadiran dan evaluasinya?`
          : source === "match"
            ? `Hapus pertandingan "${title}" beserta statistik dan evaluasinya?`
            : `Hapus kegiatan "${title}"?`;
        if (!window.confirm(message)) return;
        const index = collection.indexOf(item);
        const previousSelectedMatchId = selectedMatchId;
        collection.splice(index, 1);
        if (source === "match" && Number(selectedMatchId) === Number(item.id)) {
          selectedMatchId = data.matches.length ? data.matches[0].id : null;
        }
        if (await persist()) {
          if (source === "match") matchStatsDirty = false;
          render();
          toast(source === "session" ? "Sesi latihan dihapus." : source === "match" ? "Pertandingan dihapus." : "Kegiatan dihapus.");
        } else {
          collection.splice(index, 0, item);
          selectedMatchId = previousSelectedMatchId;
          render();
        }
      }
      function addMatchModal(defaultDate, returnToCalendar) {
        showModal("Buat pertandingan dan pilih roster", `<form><div class="form-grid"><div class="field full"><label>Nama pertandingan</label><input name="name" required maxlength="100" placeholder="Uji Coba vs ..."></div><div class="field"><label>Lawan / turnamen</label><input name="opponent" maxlength="100" placeholder="Nama sekolah/tim"></div><div class="field"><label>Tanggal</label><input name="date" type="date" value="${esc(defaultDate || todayISO())}" required></div><div class="field full"><label>Tim yang bertanding</label>${matchTeamPickerMarkup("", false)}</div><div class="field full"><label>Pilih pemain yang hadir dan bertanding</label><div class="roster-pick" id="match-roster-picker"></div></div></div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan pertandingan</button></div></form>`, async fd => {
          const name = String(fd.get("name") || "").trim();
          const playerIds = Array.from(new Set(fd.getAll("roster").map(Number)));
          if (!name) return false;
          if (!playerIds.length) { toast("Pilih minimal satu pemain."); return false; }
          const match = {
            id: Date.now(), name, opponent: String(fd.get("opponent") || "").trim(),
            date: String(fd.get("date") || ""), teamId: fd.get("teamId") ? Number(fd.get("teamId")) : null,
            playerIds, stats: [], sets: [], notes: "", evaluations: {}
          };
          data.matches.unshift(match);
          const previousSelectedMatchId = selectedMatchId;
          selectedMatchId = match.id;
          if (!await persist()) {
            data.matches = data.matches.filter(item => item !== match);
            selectedMatchId = previousSelectedMatchId;
            return false;
          }
          matchStatsDirty = false;
          if (returnToCalendar) {
            currentPage = "schedule";
            toast("Pertandingan ditambahkan ke Kalender. Kelola pertandingan dari menu Pertandingan.");
            return "skip-persist";
          }
          currentPage = "matches";
          toast("Pertandingan dibuat. Mulai catat statistik live.");
          return "skip-persist";
        });
        bindMatchTeamPicker($("#modal-root"), null);
      }
      function editMatchModal(matchId, returnToCalendar) {
        const match = data.matches.find(item => Number(item.id) === Number(matchId));
        if (!match) return;
        const roster = new Set((Array.isArray(match.playerIds) ? match.playerIds : data.players.map(player => player.id)).map(Number));
        showModal("Edit pertandingan", `<form><div class="form-grid">
          <div class="field full"><label>Nama pertandingan</label><input name="name" required maxlength="100" value="${esc(match.name)}"></div>
          <div class="field"><label>Lawan / turnamen</label><input name="opponent" maxlength="100" value="${esc(match.opponent || "")}"></div>
          <div class="field"><label>Tanggal</label><input name="date" type="date" required value="${esc(match.date)}"></div>
          <div class="field full"><label>Tim yang bertanding</label>${matchTeamPickerMarkup(match.teamId, true)}</div>
          <div class="field full"><label>Pilih roster pemain yang hadir</label><div class="roster-pick" id="match-roster-picker"></div></div>
          </div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan perubahan</button></div></form>`, async fd => {
          const name = String(fd.get("name") || "").trim();
          const playerIds = Array.from(new Set(fd.getAll("roster").map(Number)));
          if (!name) return false;
          if (!playerIds.length) { toast("Pilih minimal satu pemain."); return false; }
          const previous = JSON.parse(JSON.stringify(match));
          Object.assign(match, {
            name, opponent: String(fd.get("opponent") || "").trim(), date: String(fd.get("date") || ""),
            teamId: fd.get("teamId") ? Number(fd.get("teamId")) : null, playerIds,
            stats: (match.stats || []).filter(stat => playerIds.includes(Number(stat.playerId))),
            evaluations: Object.fromEntries(Object.entries(match.evaluations || {}).filter(([playerId]) => playerIds.includes(Number(playerId))))
          });
          if (!await persist()) {
            Object.assign(match, previous);
            return false;
          }
          selectedMatchId = match.id;
          if (returnToCalendar) {
            currentPage = "schedule";
            selectedCalendarDate = match.date;
            calendarMonth = new Date(Number(match.date.slice(0, 4)), Number(match.date.slice(5, 7)) - 1, 1);
          } else currentPage = "training";
          matchStatsDirty = false;
          toast("Pertandingan diperbarui.");
          return "skip-persist";
        });
        bindMatchTeamPicker($("#modal-root"), Array.from(roster));
      }
      function previewMatchModal(matchId, returnToCalendar) {
        const match = data.matches.find(item => Number(item.id) === Number(matchId));
        if (!match) return;
        const playerIds = Array.isArray(match.playerIds) ? match.playerIds.map(Number) : data.players.map(player => Number(player.id));
        const roster = data.players.filter(player => playerIds.includes(Number(player.id)));
        const totals = matchSkillTotals([match]);
        const setResult = matchSetResult(match);
        const setRows = setResult.sets.length
          ? `<div class="table-wrap match-score-preview"><table><thead><tr><th>Set</th><th>${esc(matchTeamName(match))}</th><th>${esc(match.opponent || "Lawan")}</th></tr></thead><tbody>${setResult.sets.map(set => `<tr><td>Set ${set.index + 1}</td><td>${esc(set.teamPoints)}</td><td>${esc(set.opponentPoints)}</td></tr>`).join("")}</tbody></table></div><p class="card-sub">Hasil: ${setResult.winner === "team" ? "Menang" : setResult.winner === "opponent" ? "Kalah" : "Belum selesai"} ${setResult.teamSets}-${setResult.opponentSets}</p>`
          : '<div class="note-copy">Hasil per set belum diisi.</div>';
        const evaluations = Object.entries(match.evaluations || {}).map(([playerId, note]) => {
          const player = playerById(playerId);
          return player && note ? `<div class="note-item"><div class="note-title">${esc(player.name)}</div><div class="note-copy">${esc(note)}</div></div>` : "";
        }).join("");
        showModal(`${esc(match.name)} · Pratinjau`, `<div class="note-item"><div class="note-title">${esc(matchTeamName(match))} · Lawan / turnamen</div><div class="note-copy">${esc(match.opponent || "Belum diisi")} · ${formatDate(match.date)}</div></div>
          <div class="grid metrics" style="grid-template-columns:repeat(auto-fit,minmax(110px,1fr));margin:12px 0">${metric("Ace", totals.ace, "Seluruh roster", "↗")}${metric("Poin serangan", totals.attack, "Seluruh roster", "✓")}${metric("Poin receive", totals.receive, "Seluruh roster", "◎")}${metric("Poin blok", totals.block, "Seluruh roster", "▣")}</div>
          <div class="note-item"><div class="note-title">Roster (${roster.length})</div><div class="note-copy">${roster.map(player => esc(player.name)).join(", ") || "Belum ada pemain."}</div></div>
          <div class="note-item"><div class="note-title">Hasil per set</div>${setRows}</div>
          <div class="note-item"><div class="note-title">Catatan / Evaluasi Umum</div><div class="note-copy">${esc(match.notes || "Belum diisi.")}</div></div>
          <div class="note-item"><div class="note-title">Evaluasi Individu</div>${evaluations || '<div class="note-copy">Belum ada evaluasi individu.</div>'}</div>
          <div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Tutup</button><button type="button" class="button secondary" data-preview-edit="${match.id}">Edit</button><button type="button" class="button" data-preview-live="${match.id}">Catat live</button></div>`);
        $("#modal-root [data-preview-edit]").addEventListener("click", () => editMatchModal(match.id, returnToCalendar));
        $("#modal-root [data-preview-live]").addEventListener("click", () => {
          selectedMatchId = match.id;
          currentPage = "matches";
          render();
        });
      }
      function addStatModal() {
        const match = data.matches.find(m => Number(m.id) === Number(selectedMatchId)); if (!match) return;
        const rosterIds = Array.isArray(match.playerIds) ? match.playerIds.map(Number) : data.players.map(p => Number(p.id));
        const players = data.players.filter(player => rosterIds.includes(Number(player.id)));
        showModal("Input statistik aksi", `<form><div class="form-grid"><div class="field full"><label>Pemain</label><select name="playerId">${players.map(p => `<option value="${p.id}">${esc(p.name)} · ${esc(p.position)}</option>`).join("")}</select></div>        <div class="field"><label>Teknik</label><select name="skill">${["Ace", "Attack", "Block", "Serve", "Receive", "Dig", "Set"].map(s => `<option>${s}</option>`).join("")}</select></div><div class="field"><label>Aksi sukses</label><input name="success" type="number" min="0" max="999" value="0" required></div><div class="field"><label>Error</label><input name="errors" type="number" min="0" max="999" value="0" required></div></div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan statistik</button></div></form>`, fd => {
          match.stats.push({ playerId: Number(fd.get("playerId")), skill: fd.get("skill"), success: Number(fd.get("success")), errors: Number(fd.get("errors")) });
          toast("Statistik aksi tersimpan.");
        });
      }
      function accountProfileModal() {
        const avatar = signedInUser.avatar || "";
        const profileSummary = `<div class="profile-summary">${avatar ? `<img class="profile-avatar-large" src="${esc(avatar)}" alt="Foto ${esc(signedInUser.name)}">` : `<span class="profile-avatar-large profile-avatar-fallback">${esc(initials(signedInUser.name))}</span>`}<div><strong>${esc(signedInUser.name)}</strong><span>${esc(roles[signedInUser.role] || signedInUser.role)}</span><small>${esc(signedInUser.email)}</small>${signedInUser.createdAt ? `<small>Terdaftar ${formatDate(signedInUser.createdAt.slice(0, 10))}</small>` : ""}</div></div>`;
        showModal("Profil pengguna", `<div class="profile-overview">${profileSummary}</div><form><div class="form-grid">
          <div class="field full"><label for="profile-avatar">Foto profil · PNG, JPG, atau WebP · maks. 200 KB</label><input id="profile-avatar" name="avatarFile" type="file" accept="image/png,image/jpeg,image/webp">${avatar ? '<label class="switch-row"><span>Hapus foto profil</span><input name="clearAvatar" type="checkbox"></label>' : ""}</div>
          <div class="field full"><label>Nama pengguna</label><input name="name" required maxlength="80" value="${esc(signedInUser.name)}" autocomplete="name"></div>
          <div class="field full"><label>Username atau email</label><input name="email" type="text" required maxlength="254" value="${esc(signedInUser.email)}" autocomplete="username"></div>
          <div class="field full"><label>Kata sandi saat ini untuk menyimpan perubahan</label><input name="currentPassword" type="password" required autocomplete="current-password"></div>
          <div class="field"><label>Kata sandi baru (opsional, minimal ${MIN_PASSWORD_LENGTH} karakter)</label><input name="newPassword" type="password" minlength="${MIN_PASSWORD_LENGTH}" autocomplete="new-password"></div>
          <div class="field"><label>Ulangi kata sandi baru</label><input name="passwordConfirm" type="password" minlength="${MIN_PASSWORD_LENGTH}" autocomplete="new-password"></div>
          </div><p class="privacy-note">Kosongkan kata sandi baru jika tidak ingin menggantinya. Perubahan profil memerlukan verifikasi kata sandi saat ini.</p><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan profil</button></div></form>`, async fd => {
          const newPassword = String(fd.get("newPassword") || "");
          const passwordConfirm = String(fd.get("passwordConfirm") || "");
          if (newPassword && newPassword !== passwordConfirm) throw new Error("Konfirmasi kata sandi baru tidak sama.");
          const avatarFile = fd.get("avatarFile");
          let nextAvatar = avatar;
          if (avatarFile && avatarFile.size) nextAvatar = await readBrandingImage(avatarFile, "Foto profil", 200 * 1024);
          else if (fd.get("clearAvatar")) nextAvatar = "";
          const result = await api("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: String(fd.get("name")).trim(),
              email: String(fd.get("email")).trim(),
              currentPassword: String(fd.get("currentPassword")),
              newPassword,
              passwordConfirm,
              avatar: nextAvatar
            })
          });
          signedInUser = result.user;
          if (activeRole() === "admin") {
            const user = serverUsers.find(item => Number(item.id) === Number(result.user.id));
            if (user) Object.assign(user, { name: result.user.name, email: result.user.email, avatar: result.user.avatar });
          }
          toast("Profil berhasil diperbarui.");
          return "skip-persist";
        });
      }
      function editUserModal(userId) {
        const user = serverUsers.find(item => Number(item.id) === Number(userId));
        if (!user) return;
        const isAdmin = user.role === "admin";
        const roleField = isAdmin
          ? `<input type="hidden" name="role" value="admin"><input value="${esc(roles.admin)}" disabled>`
          : `<select name="role" id="edit-user-role">${Object.entries(roles).filter(([id]) => id !== "admin").map(([id, label]) => `<option value="${id}" ${user.role === id ? "selected" : ""}>${esc(label)}</option>`).join("")}</select>`;
        showModal("Edit akun pengguna", `<form><div class="form-grid">
          <div class="field full"><label>Nama lengkap</label><input name="name" required maxlength="80" value="${esc(user.name)}"></div>
          <div class="field full"><label>Username atau email</label><input name="email" type="text" required maxlength="254" value="${esc(user.email)}"></div>
          <div class="field full"><label>Role</label>${roleField}</div>
          <div class="field full"><label>Kata sandi baru (opsional, minimal ${MIN_PASSWORD_LENGTH} karakter)</label><input name="password" type="password" minlength="${MIN_PASSWORD_LENGTH}" autocomplete="new-password" placeholder="Kosongkan jika tidak diubah"></div>
          </div><p class="privacy-note">${isAdmin ? "Role admin tidak dapat diubah dari pengelolaan akun. Gunakan Profil untuk memperbarui nama, username, dan kata sandi admin." : "Role menentukan hak akses menu dan fitur yang tersedia."}</p><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan perubahan</button></div></form>`, async fd => {
          const role = String(fd.get("role"));
          const result = await api(`/api/admin/users/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: String(fd.get("name")).trim(),
              email: String(fd.get("email")).trim(),
              role,
              password: String(fd.get("password") || "")
            })
          });
          const updatedIndex = serverUsers.findIndex(item => Number(item.id) === Number(user.id));
          if (updatedIndex >= 0) serverUsers[updatedIndex] = result.user;
          if (Number(user.id) === Number(signedInUser.id)) signedInUser = Object.assign({}, signedInUser, result.user);
          toast("Akun pengguna berhasil diperbarui.");
          return "skip-persist";
        });
      }
      function addUserModal() {
        const adminExists = serverUsers.some(user => user.role === "admin");
        showModal("Tambah akun pengguna", `<form><div class="form-grid"><div class="field full"><label>Nama lengkap</label><input name="name" required maxlength="80" autocomplete="name"></div><div class="field full"><label>Email</label><input name="email" type="email" required autocomplete="email"></div><div class="field full"><label>Role</label><select name="role">${Object.entries(roles).map(([id, label]) => `<option value="${id}" ${id === (adminExists ? "coach" : "admin") ? "selected" : ""} ${adminExists && id === "admin" ? "disabled" : ""}>${esc(label)}${adminExists && id === "admin" ? " (sudah ada)" : ""}</option>`).join("")}</select></div><div class="field full"><label>Kata sandi sementara (minimal ${MIN_PASSWORD_LENGTH} karakter)</label><input name="password" type="password" required minlength="${MIN_PASSWORD_LENGTH}" autocomplete="new-password"></div></div><p class="privacy-note">${adminExists ? "Akun admin sudah tersedia dan tidak dapat ditambahkan lagi. " : ""}Bagikan kata sandi sementara melalui kanal aman.</p><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Buat akun</button></div></form>`, async fd => {
          const email = String(fd.get("email")).trim().toLowerCase();
          const password = String(fd.get("password"));
          const role = String(fd.get("role"));
          if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`);
          const result = await api("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: String(fd.get("name")).trim(), email, role, password })
          });
          serverUsers.push(result.user);
          toast("Akun pengguna berhasil dibuat.");
          return "skip-persist";
        });
      }
      function downloadCsv(filename, rows) {
        const csv = rows.map(row => row.map(value => '"' + String(value == null ? "" : value).replace(/"/g, '""') + '"').join(",")).join("\r\n");
        const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
        const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      function parseCsv(text) {
        const rows = [];
        let row = [], value = "", quoted = false;
        const source = String(text).replace(/^\uFEFF/, "");
        for (let index = 0; index < source.length; index++) {
          const char = source[index];
          if (char === '"' && quoted && source[index + 1] === '"') { value += '"'; index++; }
          else if (char === '"') quoted = !quoted;
          else if (char === "," && !quoted) { row.push(value); value = ""; }
          else if ((char === "\n" || char === "\r") && !quoted) {
            if (char === "\r" && source[index + 1] === "\n") index++;
            row.push(value); value = "";
            if (row.some(cell => cell.trim())) rows.push(row);
            row = [];
          } else value += char;
        }
        row.push(value);
        if (row.some(cell => cell.trim())) rows.push(row);
        if (quoted) throw new Error("Berkas CSV memiliki tanda kutip yang tidak berpasangan.");
        return rows;
      }
      async function downloadPlayerTemplate() {
        try {
          const response = await fetch("/api/players/template", { credentials: "same-origin" });
          if (!response.ok) {
            let payload = null;
            try { payload = await response.json(); } catch {}
            throw new Error(payload && payload.error ? payload.error : "Unduh template Excel gagal.");
          }
          const url = URL.createObjectURL(await response.blob());
          const link = document.createElement("a");
          link.href = url;
          link.download = "template-import-pemain-volleydesk.xlsx";
          link.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          toast("Template Excel berhasil diunduh.");
        } catch (error) { toast(error.message); }
      }
      async function importPlayers(file) {
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) throw new Error("Berkas impor maksimal 2 MB.");
        if (file.name.toLowerCase().endsWith(".xlsx") ||
            file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
          const result = await api("/api/players/import", {
            method: "POST",
            headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
            body: file
          });
          const stored = await api("/api/state");
          applyServerState(stored.data);
          selectedPlayerIds.clear();
          render();
          toast(`${result.added} pemain diimpor${result.skipped ? `, ${result.skipped} baris dilewati` : ""}.`);
          return;
        }
        const rows = parseCsv(await file.text());
        if (rows.length < 2) throw new Error("CSV belum berisi baris data pemain.");
        const normalize = value => String(value).trim().toLowerCase().replace(/\([^)]*\)/g, "").replace(/[^a-z0-9]/g, "");
        const headers = rows[0].map(normalize);
        const columns = {
          name: headers.indexOf("nama"),
          position: headers.indexOf("posisi"),
          number: headers.indexOf("nomorpunggung"),
          className: headers.indexOf("kelas"),
          height: headers.indexOf("tinggi"),
          weight: headers.indexOf("berat"),
          verticalJump: headers.indexOf("verticaljump"),
          spikeReach: headers.indexOf("spikereach"),
          blockReach: headers.indexOf("blockreach"),
          gender: headers.indexOf("jeniskelamin"),
          birthDate: headers.indexOf("tanggallahir")
        };
        if (Object.entries(columns).some(([field, index]) => !["gender", "birthDate", "verticalJump"].includes(field) && index < 0)) {
          throw new Error("Header tidak sesuai template. Unduh template Excel terlebih dahulu.");
        }
        const positions = ["Setter", "Outside Hitter", "Opposite", "Middle Blocker", "Libero"];
        let added = 0, skipped = 0;
        rows.slice(1).forEach((row, index) => {
          const value = key => String(row[columns[key]] || "").trim();
          const numbers = ["number", "height", "weight", "spikeReach", "blockReach"].map(key => Number(value(key)));
          const [number, height, weight, spikeReach, blockReach] = numbers;
          const verticalInput = value("verticalJump");
          const verticalJump = verticalInput ? Number(verticalInput) : null;
          const position = positions.find(item => item.toLowerCase() === value("position").toLowerCase());
          const name = value("name"), className = value("className");
          const gender = value("gender"), birthDate = value("birthDate");
          if (!name && !className && numbers.every(numberValue => !numberValue)) return;
          const valid = name.length <= 80 && name && className && className.length <= 40 && position &&
            Number.isInteger(number) && number >= 0 && number <= 99 &&
            Number.isFinite(height) && height >= 100 && height <= 230 &&
            Number.isFinite(weight) && weight >= 20 && weight <= 180 &&
            (verticalJump == null || (Number.isFinite(verticalJump) && verticalJump >= 0 && verticalJump <= 120)) &&
            Number.isFinite(spikeReach) && spikeReach >= 100 && spikeReach <= 350 &&
            Number.isFinite(blockReach) && blockReach >= 100 && blockReach <= 350 &&
            (!gender || ["Perempuan", "Laki-laki"].includes(gender)) &&
            (!birthDate || validBirthDate(birthDate));
          if (!valid || data.players.some(player => player.name.toLowerCase() === name.toLowerCase() && player.className.toLowerCase() === className.toLowerCase())) {
            skipped++;
            return;
          }
          const record = { date: todayISO(), height, weight, verticalJump, spikeReach, blockReach };
          data.players.push({ id: Date.now() + index, name, position, number, className, gender, birthDate, height, weight, verticalJump, spikeReach, blockReach, history: [record] });
          added++;
        });
        if (!added) throw new Error("Tidak ada baris pemain yang valid. Isi semua kolom wajib dan gunakan posisi serta rentang angka sesuai template.");
        if (!await persist()) return;
        selectedPlayerIds.clear();
        render();
        toast(`${added} pemain diimpor${skipped ? `, ${skipped} baris dilewati` : ""}.`);
      }
      async function deletePlayers(playerIds, confirmation) {
        const selected = Array.from(new Set(playerIds.map(Number))).filter(id => playerById(id));
        if (!selected.length) return;
        if (!window.confirm(confirmation)) return;
        const previousData = JSON.stringify(data);
        const removed = new Set(selected);
        data.players = data.players.filter(player => !removed.has(Number(player.id)));
        data.teams = (data.teams || []).map(team => ({ ...team, playerIds: (team.playerIds || []).filter(id => !removed.has(Number(id))) }));
        data.sessions.forEach(session => {
          if (Array.isArray(session.playerIds)) session.playerIds = session.playerIds.filter(id => !removed.has(Number(id)));
          selected.forEach(id => {
            if (session.attendance) delete session.attendance[id];
            if (session.evaluations) delete session.evaluations[id];
          });
        });
        data.matches.forEach(match => {
          match.stats = (match.stats || []).filter(stat => !removed.has(Number(stat.playerId)));
          if (Array.isArray(match.playerIds)) match.playerIds = match.playerIds.filter(id => !removed.has(Number(id)));
        });
        selected.forEach(id => Object.keys(data.targets || {}).forEach(key => { if (key.startsWith(`${id}:`)) delete data.targets[key]; }));
        selectedPlayerIds.clear();
        if (!await persist()) {
          data = JSON.parse(previousData);
          render();
          return;
        }
        selectedPlayerId = null;
        currentPage = "players";
        render();
        toast(selected.length === 1 ? "Pemain dan catatan terkait dihapus." : `${selected.length} pemain dan catatan terkait dihapus.`);
      }
      async function deleteSelectedPlayers() {
        const selected = Array.from(selectedPlayerIds);
        if (!selected.length) return;
        await deletePlayers(selected, `Hapus ${selected.length} pemain beserta catatan terkait?`);
      }
      function exportReport(attendanceOnly) {
        const report = reportData(attendanceOnly);
        downloadCsv(report.filename, report.rows);
        toast("Laporan CSV berhasil diekspor.");
      }
      function exportFilteredReport(reportType, format) {
        const report = reportData(reportType, reportDateRange());
        if (format === "pdf") {
          exportReportDocument("pdf", report);
          return;
        }
        downloadCsv(report.filename, report.rows);
        toast("Laporan CSV berhasil diekspor.");
      }
      function reportData(reportType, dateRange) {
        const range = dateRange || { start: "0000-01-01", end: "9999-12-31" };
        const rangeLabel = dateRange ? `${formatDate(range.start)} – ${formatDate(range.end)}` : "Semua tanggal";
        const filenameSuffix = dateRange ? `-${range.start}-sampai-${range.end}` : "";
        if (reportType === true || reportType === "attendance") {
          const rows = [["Nama pemain", "Kelas", "Tanggal sesi", "Sesi latihan", "Status"]];
          data.sessions.filter(session => session.date >= range.start && session.date <= range.end)
            .slice().sort((a, b) => a.date.localeCompare(b.date)).forEach(session =>
              sessionPlayers(session).forEach(player => rows.push([
                player.name, player.className, session.date, session.title,
                (session.attendance || {})[player.id] || "Belum dicatat"
              ]))
            );
          return {
            type: "attendance",
            title: "Laporan Kehadiran",
            rangeLabel,
            filename: `laporan-kehadiran${filenameSuffix}.csv`,
            rows
          };
        }
        if (reportType === "anthropometry") {
          const rows = [["Nama pemain", "Kelas", "Posisi", "Tanggal pengukuran", "Tinggi (cm)", "Berat badan (kg)", "Vertical jump (cm)", "Spike reach (cm)", "Block reach (cm)", "Keterangan"]];
          data.players.forEach(player => {
            const records = (player.history || []).filter(record => record.date >= range.start && record.date <= range.end)
              .slice().sort((a, b) => a.date.localeCompare(b.date));
            if (records.length) {
              records.forEach(record => rows.push([
                player.name, player.className, player.position, record.date,
                record.height, record.weight, record.verticalJump == null ? "" : record.verticalJump, record.spikeReach, record.blockReach, ""
              ]));
            } else {
              rows.push([player.name, player.className, player.position, "", "", "", "", "", "", "Tidak ada pengukuran pada periode ini"]);
            }
          });
          return {
            type: "anthropometry",
            title: "Laporan Antropometri Seluruh Pemain",
            rangeLabel,
            filename: `laporan-antropometri${filenameSuffix}.csv`,
            rows
          };
        }
        if (reportType === "match-statistics") {
          const skills = [["Ace", "Ace"], ["Attack", "Serangan"], ["Block", "Blok"], ["Serve", "Servis"], ["Receive", "Receive"]];
          const rows = [["Pertandingan", "Tim", "Lawan / turnamen", "Tanggal", "Hasil set", "Nama pemain", "Kelas", "Posisi", ...skills.flatMap(([, label]) => [`${label} sukses`, `${label} gagal`])]];
          data.matches.filter(match => match.date >= range.start && match.date <= range.end)
            .slice().sort((a, b) => a.date.localeCompare(b.date)).forEach(match => {
              const roster = Array.isArray(match.playerIds)
                ? data.players.filter(player => match.playerIds.some(id => Number(id) === Number(player.id)))
                : data.players;
              const result = matchSetResult(match);
              const setScores = result.sets.length
                ? result.sets.map(set => `${set.teamPoints}-${set.opponentPoints}`).join(", ")
                : "Belum diisi";
              roster.forEach(player => {
                const playerStats = (match.stats || []).filter(stat => Number(stat.playerId) === Number(player.id));
                const values = skills.flatMap(([skill]) => {
                  const skillStats = playerStats.filter(stat => stat.skill === skill);
                  return [
                    skillStats.reduce((sum, stat) => sum + Number(stat.success || 0), 0),
                    skillStats.reduce((sum, stat) => sum + Number(stat.errors || 0), 0)
                  ];
                });
                rows.push([
                  match.name, matchTeamName(match), match.opponent || "—", match.date, setScores,
                  player.name, player.className, player.position, ...values
                ]);
              });
            });
          return {
            type: "match-statistics",
            title: "Rekap Statistik Semua Pemain per Pertandingan",
            rangeLabel,
            filename: `rekap-statistik-pertandingan${filenameSuffix}.csv`,
            rows
          };
        }
        if (reportType === "grades") {
          const rows = [["Nama siswa", "Kelas", "Ekstrakurikuler", "Predikat", "Kehadiran", "Catatan pembinaan"]];
          data.players.forEach(p => {
            const latestEvaluation = data.sessions.slice().sort((a, b) => b.date.localeCompare(a.date)).map(s => s.evaluations && s.evaluations[p.id]).find(Boolean) || "";
            rows.push([p.name, p.className, "Bola Voli", p.grade || "Belum dinilai", attendanceRate(p.id) + "%", latestEvaluation]);
          });
          return { title: "Nilai Ekstrakurikuler Voli", filename: "nilai-ekstrakurikuler-voli.csv", rows };
        }
        const rows = [["Nama", "Posisi", "Nomor", "Kelas", "Tinggi cm", "Berat kg", "Spike reach cm", "Block reach cm", "Kehadiran %", "Efisiensi attack %"]];
        data.players.forEach(p => rows.push([p.name, p.position, p.number, p.className, p.height, p.weight, p.spikeReach, p.blockReach, attendanceRate(p.id), skillEfficiency(p.id, "Attack") == null ? "" : skillEfficiency(p.id, "Attack")]));
        return { title: "Laporan Progres Pemain VolleyDesk", filename: "laporan-progres-volleydesk.csv", rows };
      }
      function reportDocument(report, includeSignatures) {
        const headers = report.rows[0] || [];
        const rows = report.rows.slice(1);
        return `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${esc(report.title)}</title><style>
          body{font-family:Arial,sans-serif;color:#1f2937;margin:28px;font-size:12px}
          .letterhead-layout{display:flex;align-items:center;gap:14px;min-height:56px}.letterhead-logo{height:auto;max-height:80px;object-fit:contain}.letterhead-title,.letterhead-subtitle{line-height:1.35}.letterhead-rule{border:0;border-top:2px solid #263248;margin:12px 0 18px}
          h1{font-size:21px;margin:0 0 6px}p{color:#586174;margin:4px 0 18px}
          table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd2df;padding:7px;text-align:left;vertical-align:top}
          th{background:#eaf0ff;color:#203a85}tr:nth-child(even) td{background:#f7f9fc}
          .pdf-signatures{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:38px 0 8px;break-inside:avoid}.pdf-signature-side{min-height:130px}.pdf-signature-right{text-align:right}.pdf-signature-space{height:68px}.pdf-signature-name{display:inline-block;min-width:58%;min-height:19px;border-top:1px solid #1f2937;padding-top:2px}
          @media print{body{margin:12mm}thead{display:table-header-group}tr{break-inside:avoid}}
        </style></head><body>${letterheadMarkup(applicationBranding)}<h1>${esc(report.title)}</h1><p>${esc(applicationBranding.appName)} · Dicetak ${esc(formatDate(todayISO()))}${report.rangeLabel ? ` · Periode ${esc(report.rangeLabel)}` : ""} · ${rows.length} baris</p><table><thead><tr>${headers.map(cell => `<th>${esc(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>${includeSignatures ? pdfSignatureMarkup(applicationBranding) : ""}</body></html>`;
      }
      function playerStatsDocument(player) {
        const sessions = data.sessions.slice().sort((a, b) => b.date.localeCompare(a.date));
        const matches = data.matches.filter(match =>
          (Array.isArray(match.playerIds) && match.playerIds.some(id => Number(id) === Number(player.id))) ||
          (match.stats || []).some(stat => Number(stat.playerId) === Number(player.id))
        ).sort((a, b) => b.date.localeCompare(a.date));
        const skills = [["Ace", "Ace"], ["Attack", "Serangan"], ["Block", "Blok"], ["Serve", "Servis"], ["Receive", "Receive"]];
        const table = (headers, rows, emptyMessage) => `<table><thead><tr>${headers.map(value => `<th>${esc(value)}</th>`).join("")}</tr></thead><tbody>${rows.length
          ? rows.map(row => `<tr>${row.map(value => `<td>${esc(value)}</td>`).join("")}</tr>`).join("")
          : `<tr><td colspan="${headers.length}">${esc(emptyMessage)}</td></tr>`}</tbody></table>`;
        const attendanceRows = sessions.map(session => {
          const participates = !Array.isArray(session.playerIds) || session.playerIds.some(id => Number(id) === Number(player.id));
          const status = participates ? (session.attendance || {})[player.id] || "Belum dicatat" : "Tidak ikut sesi";
          return [formatDate(session.date), session.title, status];
        });
        const matchRows = matches.map(match => {
          const result = matchSetResult(match);
          const setScore = result.sets.length ? `${result.teamSets}-${result.opponentSets}` : "Belum diisi";
          const skillValues = skills.map(([skill]) => {
            const stats = (match.stats || []).filter(stat => Number(stat.playerId) === Number(player.id) && stat.skill === skill);
            return `${stats.reduce((sum, stat) => sum + Number(stat.success || 0), 0)} / ${stats.reduce((sum, stat) => sum + Number(stat.errors || 0), 0)}`;
          });
          return [match.name, match.opponent || "Lawan belum diisi", formatDate(match.date), setScore, ...skillValues];
        });
        const historyRows = (player.history || []).slice().sort((a, b) => b.date.localeCompare(a.date)).map(record =>
          [formatDate(record.date), record.height, record.weight, record.verticalJump == null ? "" : record.verticalJump, record.spikeReach, record.blockReach]
        );
        const summaries = [
          ["Kehadiran", `${attendanceRate(player.id)}%`],
          ["Pertandingan", matches.length],
          ["Ace berhasil", (matches.flatMap(match => match.stats || []).filter(stat => Number(stat.playerId) === Number(player.id) && stat.skill === "Ace")).reduce((sum, stat) => sum + Number(stat.success || 0), 0)],
          ["Serangan berhasil", (matches.flatMap(match => match.stats || []).filter(stat => Number(stat.playerId) === Number(player.id) && stat.skill === "Attack")).reduce((sum, stat) => sum + Number(stat.success || 0), 0)]
        ];
        return `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Statistik pemain · ${esc(player.name)}</title><style>
          body{font-family:Arial,sans-serif;color:#1f2937;margin:28px;font-size:11px}
          .letterhead-layout{display:flex;align-items:center;gap:14px;min-height:56px}.letterhead-logo{height:auto;max-height:80px;object-fit:contain}.letterhead-title,.letterhead-subtitle{line-height:1.35}.letterhead-rule{border:0;border-top:2px solid #263248;margin:12px 0 18px}
          h1{font-size:21px;margin:0 0 5px}h2{font-size:14px;margin:20px 0 8px}p{color:#586174;margin:4px 0 12px}
          table{width:100%;border-collapse:collapse;margin:6px 0 14px}th,td{border:1px solid #cbd2df;padding:6px;text-align:left;vertical-align:top}
          th{background:#eaf0ff;color:#203a85}tr:nth-child(even) td{background:#f7f9fc}
          .pdf-signatures{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:38px 0 8px;break-inside:avoid}.pdf-signature-side{min-height:130px}.pdf-signature-right{text-align:right}.pdf-signature-space{height:68px}.pdf-signature-name{display:inline-block;min-width:58%;min-height:19px;border-top:1px solid #1f2937;padding-top:2px}
          @page{size:landscape;margin:12mm}@media print{body{margin:0}thead{display:table-header-group}tr{break-inside:avoid}h2{break-after:avoid}}
        </style></head><body>${letterheadMarkup(applicationBranding)}<h1>Statistik pemain</h1><p>${esc(player.name)} · ${esc(player.position)} · #${esc(player.number)} · ${esc(player.className)}<br>${esc(applicationBranding.appName)} · Dicetak ${esc(formatDate(todayISO()))}</p>
          <h2>Ringkasan</h2>${table(["Metrik", "Capaian"], summaries, "")}
          <h2>Riwayat kehadiran</h2>${table(["Tanggal", "Sesi", "Status"], attendanceRows, "Belum ada sesi latihan.")}
          <h2>Riwayat antropometri</h2>${table(["Tanggal pengukuran", "Tinggi (cm)", "Berat badan (kg)", "Vertical jump (cm)", "Spike reach (cm)", "Block reach (cm)"], historyRows, "Riwayat antropometri belum tersedia.")}
          <h2>Statistik setiap pertandingan</h2>${table(["Pertandingan", "Lawan / turnamen", "Tanggal", "Hasil set", ...skills.map(([, label]) => label)], matchRows, "Belum ada statistik pertandingan.")}${pdfSignatureMarkup(applicationBranding)}</body></html>`;
      }
      function printPlayerStats(playerId) {
        const player = playerById(playerId);
        if (!player) return;
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          toast("Izinkan pop-up browser untuk mencetak statistik pemain.");
          return;
        }
        printWindow.document.open();
        printWindow.document.write(playerStatsDocument(player));
        printWindow.document.close();
        window.setTimeout(() => { printWindow.focus(); printWindow.print(); }, 250);
        toast("Pilih Simpan sebagai PDF pada dialog cetak.");
      }
      function exportReportDocument(format, reportType) {
        const report = reportType && typeof reportType === "object" ? reportType : reportData(reportType);
        const html = reportDocument(report, format === "pdf");
        if (format === "word") {
          const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = report.filename.replace(/\.csv$/, ".doc");
          link.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          toast("Laporan Word berhasil diunduh.");
          return;
        }
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          toast("Izinkan pop-up browser untuk membuat PDF.");
          return;
        }
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        window.setTimeout(() => { printWindow.focus(); printWindow.print(); }, 250);
        toast("Pilih Simpan sebagai PDF pada dialog cetak.");
      }
      function applyServerState(state) {
        const storedAdminMenus = state && state.menuVisibility && state.menuVisibility.admin;
        const needsAdminSettingsMigration = !Array.isArray(storedAdminMenus) || !storedAdminMenus.includes("settings");
        const needsActivityLogMigration = !Array.isArray(storedAdminMenus) || !storedAdminMenus.includes("activityLog");
        const needsAccessMigration = !state || !state.accessPermissions;
        const needsBrandingMigration = !state || !state.branding || !state.branding.appName;
        const hasLegacyPlayerRole = ["menuVisibility", "highlights", "bottomNav", "bottomHighlights", "accessPermissions"]
          .some(key => state && state[key] && Object.prototype.hasOwnProperty.call(state[key], "player"));
        data = Object.assign(JSON.parse(JSON.stringify(defaultData)), state || {});
        data.menuVisibility = Object.assign({}, defaultData.menuVisibility, data.menuVisibility || {});
        data.highlights = Object.assign({}, defaultData.highlights, data.highlights || {});
        data.bottomNav = Object.assign({}, defaultData.bottomNav, data.bottomNav || {});
        data.bottomHighlights = Object.assign({}, defaultData.bottomHighlights, data.bottomHighlights || {});
        data.targets = data.targets || {};
        data.teams = Array.isArray(data.teams) ? data.teams : [];
        data.sessions = Array.isArray(data.sessions) ? data.sessions : [];
        data.events = Array.isArray(data.events) ? data.events : [];
        data.matches = Array.isArray(data.matches) ? data.matches : [];
        data.strategyBoards = Array.isArray(data.strategyBoards) ? data.strategyBoards : [];
        data.branding = Object.assign({}, brandingDefaults, applicationBranding, data.branding || {});
        data.accessPermissions = Object.assign(JSON.parse(JSON.stringify(defaultAccessPermissions)), data.accessPermissions || {});
        delete data.menuVisibility.player;
        delete data.highlights.player;
        delete data.bottomNav.player;
        delete data.bottomHighlights.player;
        delete data.accessPermissions.player;
        Object.keys(roles).forEach(role => {
          data.accessPermissions[role] = Object.assign({}, defaultAccessPermissions[role], data.accessPermissions[role] || {});
          Object.keys(data.accessPermissions[role]).forEach(menu => {
            if (!["view", "edit", "full"].includes(data.accessPermissions[role][menu])) {
              data.accessPermissions[role][menu] = defaultAccessPermissions[role][menu] || "view";
            }
          });
        });
        data.menuConfigVersion = 1;
        if (!data.menuVisibility.admin.includes("settings")) data.menuVisibility.admin.push("settings");
        if (!data.menuVisibility.admin.includes("activityLog")) data.menuVisibility.admin.push("activityLog");
        let needsMenuMigration = false;
        ["admin", "coach"].forEach(role => {
          if (!data.menuVisibility[role].includes("teams")) {
            data.menuVisibility[role].push("teams");
            needsMenuMigration = true;
          }
          if (!data.menuVisibility[role].includes("strategy")) {
            data.menuVisibility[role].push("strategy");
            needsMenuMigration = true;
          }
        });
        const validPageIds = new Set(pages.map(page => page.id));
        Object.keys(roles).forEach(role => {
          const menus = Array.isArray(data.menuVisibility[role]) ? data.menuVisibility[role] : [];
          const cleanMenus = menus.filter(id => validPageIds.has(id));
          if (JSON.stringify(cleanMenus) !== JSON.stringify(menus)) needsMenuMigration = true;
          data.menuVisibility[role] = cleanMenus;
          const bottom = Array.isArray(data.bottomNav[role]) ? data.bottomNav[role] : [];
          const cleanBottom = bottom.filter(id => cleanMenus.includes(id)).slice(0, 5);
          if (JSON.stringify(cleanBottom) !== JSON.stringify(bottom)) needsMenuMigration = true;
          data.bottomNav[role] = cleanBottom;
          if (!cleanMenus.includes(data.highlights[role])) {
            data.highlights[role] = cleanMenus[0] || "";
            needsMenuMigration = true;
          }
          if (!cleanBottom.includes(data.bottomHighlights[role])) {
            data.bottomHighlights[role] = cleanBottom[0] || "";
            needsMenuMigration = true;
          }
        });
        const needsCalendarMigration = migrateCalendarActivities();
        data.role = signedInUser.role;
        settingsRoleKey = signedInUser.role;
        selectedMatchId = data.matches[0] ? data.matches[0].id : null;
        selectedTargetPlayerId = data.players[0] ? data.players[0].id : null;
        return hasLegacyPlayerRole || needsMenuMigration || needsAdminSettingsMigration || needsActivityLogMigration || needsAccessMigration || needsBrandingMigration || needsCalendarMigration;
      }
      async function saveBackupSchedule() {
        try {
          backupSettings = await api("/api/admin/backup-settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              enabled: $("#backup-enabled").checked,
              time: $("#backup-time").value,
              botToken: $("#telegram-bot-token").value.trim(),
              chatId: $("#telegram-chat-id").value.trim(),
              clearCredentials: $("#clear-telegram-credentials").checked
            })
          });
          render();
          toast("Jadwal backup disimpan.");
        } catch (error) {
          toast(error.message);
        }
      }
      async function sendBackupNow() {
        try {
          backupSettings = await api("/api/admin/backup/telegram", { method: "POST" });
          render();
          toast("Backup berhasil dikirim ke Telegram.");
        } catch (error) {
          toast(error.message);
        }
      }
      async function generatePublicPortal() {
        if (publicPortal && publicPortal.enabled && !window.confirm("Buat tautan baru? Tautan lama akan langsung dinonaktifkan.")) return;
        try {
          publicPortal = await api("/api/admin/public-portal", { method: "POST" });
          render();
          toast("Tautan dan QR portal publik berhasil dibuat.");
        } catch (error) {
          toast(error.message);
        }
      }
      async function disablePublicPortal() {
        if (!window.confirm("Nonaktifkan portal publik? Tautan yang dibagikan tidak akan dapat digunakan lagi.")) return;
        try {
          publicPortal = await api("/api/admin/public-portal", { method: "DELETE" });
          render();
          toast("Portal publik dinonaktifkan.");
        } catch (error) {
          toast(error.message);
        }
      }
      async function copyPublicPortalLink() {
        try {
          await navigator.clipboard.writeText(publicPortal.url);
          toast("Tautan portal disalin.");
        } catch (error) {
          toast("Tautan tidak dapat disalin. Salin alamat pada kolom tautan publik.");
        }
      }
      async function downloadBackup() {
        try {
          const response = await fetch("/api/admin/backup/download", { credentials: "same-origin" });
          if (!response.ok) {
            let payload = null;
            try { payload = await response.json(); } catch {}
            throw new Error(payload && payload.error ? payload.error : "Unduh backup gagal.");
          }
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `volleydesk-backup-${todayISO()}.json`;
          link.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          toast("Backup berhasil diunduh.");
        } catch (error) {
          toast(error.message);
        }
      }
      async function restoreBackup() {
        const fileInput = $("#backup-restore-file");
        const file = fileInput.files && fileInput.files[0];
        if (!file) {
          toast("Pilih berkas backup JSON terlebih dahulu.");
          return;
        }
        if (!window.confirm("Pemulihan akan mengganti seluruh data pemain, absensi, jadwal, latihan, dan statistik saat ini. Lanjutkan?")) return;
        try {
          const backup = JSON.parse(await file.text());
          await api("/api/admin/restore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ backup })
          });
          window.alert("Data dan akun berhasil dipulihkan. Silakan masuk kembali menggunakan akun yang ada di backup.");
          window.location.reload();
        } catch (error) {
          toast(error.message || "Berkas backup tidak valid.");
        }
      }
      function bindContentEvents() {
        $("#content").querySelectorAll("[data-team-roster-toggle]").forEach(button => button.addEventListener("click", () => {
          const expanded = button.getAttribute("aria-expanded") !== "true";
          const panel = document.getElementById(button.getAttribute("aria-controls"));
          button.setAttribute("aria-expanded", String(expanded));
          panel.inert = !expanded;
          panel.classList.toggle("is-open", expanded);
        }));
        $("#content").querySelectorAll("[data-page]").forEach(el => el.addEventListener("click", () => {
          if (!canLeaveStrategy(el.dataset.page)) return;
          currentPage = el.dataset.page; render();
        }));
        $("#content").querySelectorAll("[data-calendar-day]").forEach(el => el.addEventListener("click", () => {
          selectedCalendarDate = el.dataset.calendarDay;
          calendarMonth = new Date(Number(selectedCalendarDate.slice(0, 4)), Number(selectedCalendarDate.slice(5, 7)) - 1, 1);
          if (calendarView === "year") calendarView = "month";
          render();
        }));
        $("#content").querySelectorAll("[data-calendar-detail-source]").forEach(el => el.addEventListener("click", () => {
          const id = el.dataset.calendarDetailId;
          if (el.dataset.calendarDetailSource === "event") reviewCalendarEventModal(id);
          else if (el.dataset.calendarDetailSource === "session") reviewSessionModal(id);
          else if (el.dataset.calendarDetailSource === "match") previewMatchModal(id, true);
        }));
        $("#content").querySelectorAll("[data-calendar-edit-source]").forEach(el => el.addEventListener("click", () => {
          const id = el.dataset.calendarEditId;
          if (el.dataset.calendarEditSource === "event") addEventModal(null, id);
          else if (el.dataset.calendarEditSource === "session") editSessionModal(id);
          else if (el.dataset.calendarEditSource === "match") editMatchModal(id, true);
        }));
        $("#content").querySelectorAll("[data-calendar-delete-source]").forEach(el => el.addEventListener("click", async () => {
          await deleteCalendarActivity(el.dataset.calendarDeleteSource, el.dataset.calendarDeleteId);
        }));
        $("#content").querySelectorAll("[data-calendar-month]").forEach(el => el.addEventListener("click", () => {
          const direction = el.dataset.calendarMonth === "next" ? 1 : -1;
          calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + direction * (calendarView === "year" ? 12 : 1), 1);
          const selectedKey = selectedCalendarDate.slice(0, calendarView === "year" ? 4 : 7);
          const visibleKey = dateKey(calendarMonth).slice(0, calendarView === "year" ? 4 : 7);
          if (selectedKey && selectedKey !== visibleKey) selectedCalendarDate = "";
          render();
        }));
        $("#content").querySelectorAll("[data-calendar-view]").forEach(el => el.addEventListener("click", () => {
          calendarView = el.dataset.calendarView;
          render();
        }));
        $("#content").querySelectorAll("[data-calendar-open-month]").forEach(el => el.addEventListener("click", () => {
          calendarMonth = new Date(calendarMonth.getFullYear(), Number(el.dataset.calendarOpenMonth), 1);
          if (selectedCalendarDate.slice(0, 7) !== dateKey(calendarMonth).slice(0, 7)) selectedCalendarDate = "";
          calendarView = "month";
          render();
        }));
        const calendarToday = $("#content [data-calendar-today]");
        if (calendarToday) calendarToday.addEventListener("click", () => {
          calendarMonth = new Date();
          calendarMonth.setDate(1);
          selectedCalendarDate = "";
          calendarView = "month";
          render();
        });
        const calendarClear = $("#content [data-calendar-clear]");
        if (calendarClear) calendarClear.addEventListener("click", () => { selectedCalendarDate = ""; render(); });
        $("#content").querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", async () => {
          switch (el.dataset.action) {
            case "add-player": addPlayerModal(); break;
            case "add-team": teamModal(); break;
            case "add-strategy": strategyModal(); break;
            case "new-session": {
              const fromCalendar = el.hasAttribute("data-calendar-date");
              if (fromCalendar) selectedCalendarDate = el.dataset.calendarDate;
              newSessionModal(el.dataset.calendarDate, fromCalendar);
              break;
            }
            case "add-event": addEventModal(); break;
            case "add-training-activity": addEventModal("Latihan tim"); break;
            case "add-match": {
              const fromCalendar = el.hasAttribute("data-calendar-date");
              if (fromCalendar) selectedCalendarDate = el.dataset.calendarDate;
              addMatchModal(el.dataset.calendarDate, fromCalendar);
              break;
            }
            case "add-stat": addStatModal(); break;
            case "add-user": addUserModal(); break;
            case "player-template": downloadPlayerTemplate(); break;
            case "player-import": $("#player-import-file").click(); break;
            case "delete-selected": await deleteSelectedPlayers(); break;
            case "save-backup-settings": await saveBackupSchedule(); break;
            case "generate-public-portal": await generatePublicPortal(); break;
            case "disable-public-portal": await disablePublicPortal(); break;
            case "copy-public-portal": await copyPublicPortalLink(); break;
            case "save-strategy": {
              const board = data.strategyBoards.find(item => Number(item.id) === Number(selectedStrategyId));
              if (!board || !strategyDraft) break;
              const name = String(strategyDraft.name || "").trim();
              if (!name) { toast("Nama strategi wajib diisi."); break; }
              const previous = JSON.parse(JSON.stringify(board));
              Object.assign(board, JSON.parse(JSON.stringify(strategyDraft)), { name });
              if (await persist()) {
                strategyDraft = JSON.parse(JSON.stringify(board));
                strategyDirty = false;
                render();
                toast("Papan strategi tersimpan.");
              } else {
                Object.assign(board, previous);
              }
              break;
            }
            case "save-branding": await saveBranding(); break;
            case "save-live-stats":
              {
                const match = data.matches.find(item => Number(item.id) === Number(selectedMatchId));
                if (!match) break;
                const rows = Array.from($("#content").querySelectorAll("[data-match-set]"));
                const setCount = rows.reduce((maximum, input) => Math.max(maximum, Number(input.dataset.matchSet) + 1), 0);
                const sets = [];
                let reachedEmptySet = false;
                let invalidScores = false;
                for (let index = 0; index < setCount; index += 1) {
                  const teamInput = rows.find(input => Number(input.dataset.matchSet) === index && input.dataset.setSide === "teamPoints");
                  const opponentInput = rows.find(input => Number(input.dataset.matchSet) === index && input.dataset.setSide === "opponentPoints");
                  const teamScore = teamInput ? teamInput.value.trim() : "";
                  const opponentScore = opponentInput ? opponentInput.value.trim() : "";
                  if (!teamScore && !opponentScore) { reachedEmptySet = true; continue; }
                  if (!teamScore || !opponentScore) { toast(`Lengkapi skor kedua tim pada Set ${index + 1}.`); invalidScores = true; break; }
                  if (reachedEmptySet) { toast("Isi skor set secara berurutan dari Set 1."); invalidScores = true; break; }
                  const teamPoints = Number(teamScore), opponentPoints = Number(opponentScore);
                  if (!Number.isInteger(teamPoints) || !Number.isInteger(opponentPoints) || teamPoints < 0 || opponentPoints < 0 || teamPoints > 99 || opponentPoints > 99) {
                    toast("Skor set harus berupa bilangan bulat antara 0 dan 99."); invalidScores = true; break;
                  }
                  if (teamPoints === opponentPoints) { toast(`Skor Set ${index + 1} tidak boleh imbang.`); invalidScores = true; break; }
                  sets.push({ teamPoints, opponentPoints });
                }
                if (invalidScores) break;
                match.sets = sets;
              }
              if (matchStatsDirty && await persist()) {
                matchStatsDirty = false;
                render();
                toast("Pertandingan berhasil disimpan.");
              }
              break;
            case "backup-now": await sendBackupNow(); break;
            case "refresh-activity-log": await loadActivityLog(true); break;
            case "download-backup": await downloadBackup(); break;
            case "restore-backup": await restoreBackup(); break;
            case "export-report": exportReport(false); break;
            case "export-attendance": exportReport(true); break;
            case "export-grades": exportReport("grades"); break;
            case "export-pdf": exportReportDocument("pdf", false); break;
            case "export-word": exportReportDocument("word", false); break;
            case "export-attendance-pdf": exportReportDocument("pdf", true); break;
            case "export-attendance-word": exportReportDocument("word", true); break;
            case "export-filtered-report": exportFilteredReport(el.dataset.reportType, el.dataset.reportFormat); break;
            case "refresh-recommendations": toast("Analisis rekomendasi diperbarui."); render(); break;
            case "save-target": {
              const player = playerById(selectedTargetPlayerId);
              if (!player) break;
              const values = {};
              let invalid = false;
              $("#content").querySelectorAll("[data-target-value]").forEach(input => {
                if (!input.value.trim()) return;
                const value = Number(input.value);
                if (!Number.isFinite(value) || value < 0) invalid = true;
                else values[input.dataset.targetValue] = value;
              });
              if (invalid) { toast("Nilai target harus berupa angka nol atau lebih."); break; }
              data.targets = data.targets || {};
              data.targets[`${player.id}:${selectedTargetPeriod}`] = values;
              if (await persist()) { render(); toast("Target performa tersimpan."); }
              break;
            }
          }
        }));
        const strategyBoardSelect = $("#strategy-board-select");
        if (strategyBoardSelect) strategyBoardSelect.addEventListener("change", () => {
          if (strategyDirty && !window.confirm("Perubahan strategi belum disimpan. Ganti papan strategi?")) {
            strategyBoardSelect.value = String(selectedStrategyId);
            return;
          }
          selectedStrategyId = Number(strategyBoardSelect.value);
          strategyDraft = null;
          strategyDirty = false;
          render();
        });
        const updateStrategyDraft = (key, value) => {
          if (!strategyDraft) return;
          strategyDraft[key] = value;
          strategyDirty = true;
          const message = $("#content .strategy-save .card-sub");
          const saveButton = $('#content [data-action="save-strategy"]');
          if (message) message.textContent = "Ada perubahan yang belum disimpan.";
          if (saveButton) saveButton.disabled = false;
        };
        const strategyName = $("#strategy-name");
        if (strategyName) strategyName.addEventListener("input", () => updateStrategyDraft("name", strategyName.value));
        const strategyOpponent = $("#strategy-opponent");
        if (strategyOpponent) strategyOpponent.addEventListener("input", () => updateStrategyDraft("opponent", strategyOpponent.value));
        const strategyReceive = $("#strategy-receive");
        if (strategyReceive) strategyReceive.addEventListener("change", () => {
          updateStrategyDraft("receiveFormation", strategyReceive.value);
        });
        const strategyTactics = $("#strategy-tactics");
        if (strategyTactics) strategyTactics.addEventListener("input", () => updateStrategyDraft("tactics", strategyTactics.value));
        const strategySetPlay = $("#strategy-set-play");
        if (strategySetPlay) strategySetPlay.addEventListener("input", () => updateStrategyDraft("setPlay", strategySetPlay.value));
        const assignLineupPlayer = (position, playerId) => {
          if (!strategyDraft || !["1", "2", "3", "4", "5", "6"].includes(position)) return;
          strategyDraft.lineup = strategyDraft.lineup || {};
          const numericPlayerId = playerId ? Number(playerId) : null;
          Object.keys(strategyDraft.lineup).forEach(key => {
            if (Number(strategyDraft.lineup[key]) === numericPlayerId && numericPlayerId != null) strategyDraft.lineup[key] = null;
          });
          strategyDraft.lineup[position] = numericPlayerId;
          strategyDirty = true;
          render();
        };
        $("#content").querySelectorAll("[data-lineup-select]").forEach(select => select.addEventListener("change", () =>
          assignLineupPlayer(select.dataset.lineupSelect, select.value)
        ));
        $("#content").querySelectorAll("[data-lineup-player]").forEach(player => player.addEventListener("dragstart", event => {
          event.dataTransfer.setData("text/plain", player.dataset.lineupPlayer);
          event.dataTransfer.effectAllowed = "move";
        }));
        $("#content").querySelectorAll("[data-lineup-position]").forEach(slot => {
          slot.addEventListener("dragover", event => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; });
          slot.addEventListener("drop", event => {
            event.preventDefault();
            assignLineupPlayer(slot.dataset.lineupPosition, event.dataTransfer.getData("text/plain"));
          });
        });
        const rotateStrategy = $("#content [data-strategy-rotate]");
        if (rotateStrategy) rotateStrategy.addEventListener("click", () => {
          if (!strategyDraft) return;
          const current = strategyDraft.lineup || {};
          strategyDraft.lineup = {
            "1": current["2"] || null, "2": current["3"] || null, "3": current["4"] || null,
            "4": current["5"] || null, "5": current["6"] || null, "6": current["1"] || null
          };
          strategyDirty = true;
          render();
        });
        $("#content").querySelectorAll("[data-delete-strategy]").forEach(button => button.addEventListener("click", async () => {
          const board = data.strategyBoards.find(item => Number(item.id) === Number(button.dataset.deleteStrategy));
          if (!board || !window.confirm(`Hapus papan strategi "${board.name}"?`)) return;
          const index = data.strategyBoards.indexOf(board);
          const previousSelected = selectedStrategyId;
          data.strategyBoards.splice(index, 1);
          selectedStrategyId = data.strategyBoards.length ? data.strategyBoards[0].id : null;
          strategyDraft = null;
          strategyDirty = false;
          if (await persist()) { render(); toast("Papan strategi dihapus."); }
          else {
            data.strategyBoards.splice(index, 0, board);
            selectedStrategyId = previousSelected;
            strategyDraft = JSON.parse(JSON.stringify(board));
            render();
          }
        }));
        $("#content").querySelectorAll("[data-session-review]").forEach(el => el.addEventListener("click", () => reviewSessionModal(el.dataset.sessionReview)));
        $("#content").querySelectorAll("[data-session-edit]").forEach(el => el.addEventListener("click", () => editSessionModal(el.dataset.sessionEdit)));
        $("#content").querySelectorAll("[data-edit-player]").forEach(el => el.addEventListener("click", () => editPlayerModal(el.dataset.editPlayer)));
        $("#content").querySelectorAll("[data-player-stats]").forEach(el => el.addEventListener("click", () => openPlayerStats(el.dataset.playerStats)));
        $("#content").querySelectorAll("[data-update-anthropometry]").forEach(el => el.addEventListener("click", () => anthropometryModal(el.dataset.updateAnthropometry)));
        $("#content").querySelectorAll("[data-player-stats-print]").forEach(el => el.addEventListener("click", () => printPlayerStats(el.dataset.playerStatsPrint)));
        $("#content").querySelectorAll("[data-delete-player]").forEach(el => el.addEventListener("click", async () => {
          const player = playerById(el.dataset.deletePlayer);
          if (player) await deletePlayers([player.id], `Hapus pemain ${player.name} beserta riwayat kehadiran, evaluasi, dan statistiknya?`);
        }));
        $("#content").querySelectorAll("[data-edit-team]").forEach(el => el.addEventListener("click", () => teamModal(el.dataset.editTeam)));
        $("#content").querySelectorAll("[data-delete-team]").forEach(el => el.addEventListener("click", async () => {
          const team = data.teams.find(item => Number(item.id) === Number(el.dataset.deleteTeam));
          if (!team || !window.confirm(`Hapus tim ${team.name}? Biodata pemain tidak akan dihapus.`)) return;
          data.teams = data.teams.filter(item => Number(item.id) !== Number(team.id));
          if (await persist()) { render(); toast("Tim dihapus."); }
        }));
        $("#content").querySelectorAll("[data-delete-event]").forEach(el => el.addEventListener("click", async () => {
          const event = data.events.find(item => Number(item.id) === Number(el.dataset.deleteEvent));
          if (!event || !window.confirm(`Hapus kegiatan "${event.title}"?`)) return;
          const index = data.events.indexOf(event);
          data.events.splice(index, 1);
          if (await persist()) { render(); toast("Kegiatan dihapus."); }
          else { data.events.splice(index, 0, event); render(); }
        }));
        $("#content").querySelectorAll("[data-delete-session]").forEach(el => el.addEventListener("click", async () => {
          const session = data.sessions.find(item => Number(item.id) === Number(el.dataset.deleteSession));
          if (!session || !window.confirm(`Hapus sesi "${session.title}" beserta catatan kehadiran dan evaluasinya?`)) return;
          const index = data.sessions.indexOf(session);
          data.sessions.splice(index, 1);
          if (await persist()) { render(); toast("Sesi latihan dihapus."); }
          else { data.sessions.splice(index, 0, session); render(); }
        }));
        $("#content").querySelectorAll("[data-delete-stat]").forEach(el => el.addEventListener("click", () => {
          const [mid, pid, skill] = el.dataset.deleteStat.split(":"); const m = data.matches.find(x => Number(x.id) === Number(mid));
          if (m) { m.stats = m.stats.filter(s => !(Number(s.playerId) === Number(pid) && s.skill === skill)); persist(); render(); }
        }));
        $("#content").querySelectorAll("[data-edit-user]").forEach(el => el.addEventListener("click", () => editUserModal(el.dataset.editUser)));
        $("#content").querySelectorAll("[data-delete-user]").forEach(el => el.addEventListener("click", async () => {
          const user = serverUsers.find(item => Number(item.id) === Number(el.dataset.deleteUser));
          if (!user || !window.confirm(`Hapus akun ${user.name}?`)) return;
          try {
            await api(`/api/admin/users/${user.id}`, { method: "DELETE" });
            serverUsers = serverUsers.filter(item => Number(item.id) !== Number(user.id));
            render();
            toast("Akun pengguna dihapus.");
          } catch (error) { toast(error.message); }
        }));
        $("#content").querySelectorAll("[data-live-stat]").forEach(el => el.addEventListener("click", () => {
          const [playerId, skill, result, deltaValue] = el.dataset.liveStat.split(":");
          const match = data.matches.find(item => Number(item.id) === Number(selectedMatchId));
          const delta = Number(deltaValue);
          if (!match || !["success", "errors"].includes(result) || ![-1, 1].includes(delta)) return;
          match.stats = match.stats || [];
          let stat = match.stats.find(item => Number(item.playerId) === Number(playerId) && item.skill === skill);
          if (!stat) {
            if (delta < 0) return;
            stat = { playerId: Number(playerId), skill, success: 0, errors: 0 };
            match.stats.push(stat);
          }
          if (delta < 0 && Number(stat[result] || 0) < 1) return;
          stat[result] = Number(stat[result] || 0) + delta;
          if (!stat.success && !stat.errors) match.stats = match.stats.filter(item => item !== stat);
          matchStatsDirty = true;
          render();
        }));
        $("#content").querySelectorAll("[data-match-set]").forEach(input => input.addEventListener("input", () => {
          const match = data.matches.find(item => Number(item.id) === Number(selectedMatchId));
          if (!match) return;
          const index = Number(input.dataset.matchSet);
          match.sets = Array.isArray(match.sets) ? match.sets.slice() : [];
          while (match.sets.length <= index) match.sets.push({ teamPoints: "", opponentPoints: "" });
          match.sets[index] = Object.assign({ teamPoints: "", opponentPoints: "" }, match.sets[index], {
            [input.dataset.setSide]: input.value
          });
          matchStatsDirty = true;
          const saveButton = $('#content [data-action="save-live-stats"]');
          if (saveButton) saveButton.disabled = false;
        }));
        $("#content").querySelectorAll("[data-preview-match]").forEach(el => el.addEventListener("click", () => previewMatchModal(el.dataset.previewMatch)));
        $("#content").querySelectorAll("[data-edit-match]").forEach(el => el.addEventListener("click", () => editMatchModal(el.dataset.editMatch)));
        $("#content").querySelectorAll("[data-open-live-match]").forEach(el => el.addEventListener("click", () => {
          selectedMatchId = Number(el.dataset.openLiveMatch);
          currentPage = "matches";
          render();
        }));
        $("#content").querySelectorAll("[data-delete-match]").forEach(el => el.addEventListener("click", async () => {
          const match = data.matches.find(item => Number(item.id) === Number(el.dataset.deleteMatch));
          if (!match || !window.confirm(`Hapus pertandingan "${match.name}" beserta statistik dan evaluasinya?`)) return;
          const index = data.matches.indexOf(match);
          const previousSelectedMatchId = selectedMatchId;
          data.matches.splice(index, 1);
          if (Number(selectedMatchId) === Number(match.id)) selectedMatchId = data.matches.length ? data.matches[0].id : null;
          if (await persist()) {
            matchStatsDirty = false;
            render();
            toast("Pertandingan dihapus.");
          } else {
            data.matches.splice(index, 0, match);
            selectedMatchId = previousSelectedMatchId;
            render();
          }
        }));
        const generalNotes = $("#match-general-notes");
        if (generalNotes) generalNotes.addEventListener("input", () => {
          const match = data.matches.find(item => Number(item.id) === Number(selectedMatchId));
          if (!match) return;
          match.notes = generalNotes.value;
          matchStatsDirty = true;
          const saveButton = $('#content [data-action="save-live-stats"]');
          if (saveButton) saveButton.disabled = false;
        });
        $("#content").querySelectorAll("[data-match-evaluation]").forEach(input => input.addEventListener("input", () => {
          const match = data.matches.find(item => Number(item.id) === Number(selectedMatchId));
          if (!match) return;
          match.evaluations = match.evaluations || {};
          match.evaluations[input.dataset.matchEvaluation] = input.value;
          matchStatsDirty = true;
          const saveButton = $('#content [data-action="save-live-stats"]');
          if (saveButton) saveButton.disabled = false;
        }));
        const matchSelect = $("#match-select");
        if (matchSelect) matchSelect.addEventListener("change", () => { selectedMatchId = Number(matchSelect.value); render(); });
        const playerSearch = $("#player-search");
        if (playerSearch) playerSearch.addEventListener("input", () => { searchTerm = playerSearch.value; const pos = playerSearch.selectionStart; render(); const field = $("#player-search"); field.focus(); field.setSelectionRange(pos, pos); });
        const settingsRole = $("#settings-role");
        if (settingsRole) settingsRole.addEventListener("change", () => { settingsRoleKey = settingsRole.value; render(); });
        $("#content").querySelectorAll(".menu-switch").forEach(el => el.addEventListener("change", async () => {
          const role = settingsRoleKey;
          const previousMenus = (data.menuVisibility[role] || []).slice();
          const previousBottom = (data.bottomNav[role] || []).slice();
          const previousHighlight = data.highlights[role];
          const previousBottomHighlight = data.bottomHighlights[role];
          data.menuVisibility[role] = el.checked
            ? Array.from(new Set(previousMenus.concat(el.dataset.menu)))
            : previousMenus.filter(id => id !== el.dataset.menu);
          data.bottomNav[role] = previousBottom.filter(id => data.menuVisibility[role].includes(id));
          if (!data.menuVisibility[role].includes(data.highlights[role])) {
            data.highlights[role] = data.menuVisibility[role][0] || "";
          }
          if (!data.bottomNav[role].includes(data.bottomHighlights[role])) {
            data.bottomHighlights[role] = data.bottomNav[role][0] || "";
          }
          if (await persist()) {
            render();
            toast("Hak akses menu diperbarui.");
          } else {
            data.menuVisibility[role] = previousMenus;
            data.bottomNav[role] = previousBottom;
            data.highlights[role] = previousHighlight;
            data.bottomHighlights[role] = previousBottomHighlight;
            render();
          }
        }));
        $("#content").querySelectorAll("[data-access-menu]").forEach(el => el.addEventListener("change", async () => {
          const role = settingsRoleKey;
          const menu = el.dataset.accessMenu;
          const previous = data.accessPermissions[role][menu];
          data.accessPermissions[role][menu] = el.value;
          if (await persist()) {
            render();
            toast(`Hak tindakan menu ${menu} diperbarui.`);
          } else {
            data.accessPermissions[role][menu] = previous;
            render();
          }
        }));
        const highlight = $("#highlight-select");
        if (highlight) highlight.addEventListener("change", async () => {
          const role = settingsRoleKey, previous = data.highlights[role];
          data.highlights[role] = highlight.value;
          if (await persist()) { render(); toast("Menu sorotan diperbarui."); }
          else { data.highlights[role] = previous; render(); }
        });
        $("#content").querySelectorAll(".bottom-menu-switch").forEach(el => el.addEventListener("change", async () => {
          const role = settingsRoleKey;
          const list = (data.bottomNav[role] || []).filter(id => data.menuVisibility[role].includes(id));
          if (el.checked && list.length >= 5) {
            el.checked = false;
            toast("Navigasi bawah maksimal lima menu.");
            return;
          }
          const previous = list.slice();
          const previousHighlight = data.bottomHighlights[role];
          data.bottomNav[role] = el.checked ? list.concat(el.dataset.bottomMenu) : list.filter(id => id !== el.dataset.bottomMenu);
          if (!data.bottomNav[role].includes(data.bottomHighlights[role])) data.bottomHighlights[role] = data.bottomNav[role][0] || "";
          if (await persist()) { render(); toast("Navigasi bawah diperbarui."); }
          else { data.bottomNav[role] = previous; data.bottomHighlights[role] = previousHighlight; render(); }
        }));
        const bottomHighlight = $("#bottom-highlight-select");
        if (bottomHighlight) bottomHighlight.addEventListener("change", async () => {
          const role = settingsRoleKey, previous = data.bottomHighlights[role];
          data.bottomHighlights[role] = bottomHighlight.value;
          if (await persist()) { render(); toast("Highlight navigasi bawah diperbarui."); }
          else { data.bottomHighlights[role] = previous; render(); }
        });
        ["logo", "favicon"].forEach(type => {
          const input = $(`#branding-${type}-file`);
          const clear = $(`#branding-clear-${type}`);
          if (input && clear) input.addEventListener("change", async () => {
            if (input.files.length) {
              clear.checked = false;
              if (type === "logo") {
                try {
                  const logo = await readBrandingImage(input.files[0], "Logo aplikasi", 200 * 1024);
                  const branding = brandingFormValues();
                  branding.logo = logo;
                  $("#letterhead-preview").innerHTML = letterheadMarkup(branding);
                } catch (error) {
                  toast(error.message);
                }
              }
            }
            updateLetterheadPreview();
          });
          if (clear) clear.addEventListener("change", updateLetterheadPreview);
        });
        const brandingForm = $("#content .branding-form");
        if (brandingForm) brandingForm.querySelectorAll("input, select").forEach(input => {
          if (input.type !== "file") {
            input.addEventListener("input", updateLetterheadPreview);
            input.addEventListener("change", updateLetterheadPreview);
          }
        });
        const targetPlayer = $("#target-player");
        if (targetPlayer) targetPlayer.addEventListener("change", () => { selectedTargetPlayerId = Number(targetPlayer.value); render(); });
        const targetPeriod = $("#target-period");
        if (targetPeriod) targetPeriod.addEventListener("change", () => { selectedTargetPeriod = targetPeriod.value; render(); });
        const reportPeriodSelect = $("#report-period");
        if (reportPeriodSelect) reportPeriodSelect.addEventListener("change", () => {
          if (reportPeriodSelect.value === "custom" && (!reportCustomStart || !reportCustomEnd)) {
            const today = new Date();
            reportCustomStart = dateKey(new Date(today.getFullYear(), today.getMonth(), 1));
            reportCustomEnd = dateKey(today);
          }
          reportPeriod = reportPeriodSelect.value;
          render();
        });
        const reportStartInput = $("#report-start");
        const reportEndInput = $("#report-end");
        if (reportStartInput && reportEndInput) {
          const updateReportRange = () => {
            const start = reportStartInput.value;
            const end = reportEndInput.value;
            if (!start || !end) {
              toast("Pilih tanggal mulai dan tanggal akhir.");
              render();
              return;
            }
            if (start > end) {
              toast("Tanggal mulai tidak boleh melewati tanggal akhir.");
              render();
              return;
            }
            reportCustomStart = start;
            reportCustomEnd = end;
            render();
          };
          reportStartInput.addEventListener("change", updateReportRange);
          reportEndInput.addEventListener("change", updateReportRange);
        }
        const selectAll = $("#select-all-players");
        if (selectAll) selectAll.addEventListener("change", () => {
          data.players.filter(player => (player.name + " " + player.position + " " + player.className).toLowerCase().includes(searchTerm.toLowerCase()))
            .forEach(player => selectAll.checked ? selectedPlayerIds.add(Number(player.id)) : selectedPlayerIds.delete(Number(player.id)));
          render();
        });
        $("#content").querySelectorAll("[data-select-player]").forEach(el => el.addEventListener("change", () => {
          if (el.checked) selectedPlayerIds.add(Number(el.dataset.selectPlayer));
          else selectedPlayerIds.delete(Number(el.dataset.selectPlayer));
          render();
        }));
        const importFile = $("#player-import-file");
        if (importFile) importFile.addEventListener("change", async () => {
          try { await importPlayers(importFile.files && importFile.files[0]); }
          catch (error) { toast(error.message || "Impor data pemain gagal."); }
          importFile.value = "";
        });
        $("#content").querySelectorAll("[data-grade]").forEach(el => el.addEventListener("change", () => {
          const player = playerById(el.dataset.grade);
          if (player && ["admin", "coach"].includes(activeRole())) { player.grade = el.value; persist(); toast("Predikat rapor disimpan."); }
        }));
      }
      $("#theme-toggle").addEventListener("click", () => { data.theme = data.theme === "dark" ? "light" : "dark"; persist(); render(); });
      $("#menu-toggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
      const sidebar = $("#sidebar");
      const sidebarToggle = $("#sidebar-toggle");
      const desktopSidebar = window.matchMedia("(min-width: 761px)");
      const hoverSidebar = window.matchMedia("(min-width: 761px) and (hover: hover) and (pointer: fine)");
      function updateSidebarToggle() {
        const app = $("#app");
        const collapsed = app.classList.contains("sidebar-collapsed");
        sidebarToggle.textContent = collapsed ? "›" : "‹";
        sidebarToggle.setAttribute("aria-expanded", String(!collapsed || app.classList.contains("sidebar-peek")));
        sidebarToggle.setAttribute("aria-label", collapsed ? "Tampilkan sidebar tetap" : "Minimalkan sidebar");
        sidebarToggle.title = collapsed ? "Tampilkan sidebar tetap" : "Minimalkan sidebar";
      }
      sidebarToggle.addEventListener("click", () => {
        if (!desktopSidebar.matches) return;
        $("#app").classList.toggle("sidebar-collapsed");
        $("#app").classList.remove("sidebar-peek");
        updateSidebarToggle();
      });
      sidebar.addEventListener("pointerenter", () => {
        if (hoverSidebar.matches && $("#app").classList.contains("sidebar-collapsed")) {
          $("#app").classList.add("sidebar-peek");
          updateSidebarToggle();
        }
      });
      sidebar.addEventListener("pointerleave", () => {
        $("#app").classList.remove("sidebar-peek");
        updateSidebarToggle();
      });
      sidebar.addEventListener("focusin", () => {
        if (desktopSidebar.matches && $("#app").classList.contains("sidebar-collapsed")) {
          $("#app").classList.add("sidebar-peek");
          updateSidebarToggle();
        }
      });
      sidebar.addEventListener("focusout", event => {
        if (!sidebar.contains(event.relatedTarget)) {
          $("#app").classList.remove("sidebar-peek");
          updateSidebarToggle();
        }
      });
      document.addEventListener("keydown", event => { if (event.key === "Escape") $("#modal-root").innerHTML = ""; });
      window.addEventListener("beforeunload", event => {
        if (!strategyDirty) return;
        event.preventDefault();
        event.returnValue = "";
      });
      $("#login-form").addEventListener("submit", async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const submitButton = $("#login-submit");
        const errorMessage = $("#login-error");
        const formData = new FormData(form);
        errorMessage.hidden = true;
        submitButton.disabled = true;
        submitButton.textContent = "Memeriksa akun...";
        try {
          await api("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: String(formData.get("identifier")).trim().toLowerCase(),
              password: String(formData.get("password"))
            })
          });
          window.location.reload();
        } catch (error) {
          errorMessage.textContent = error.message || "Tidak dapat masuk. Silakan coba lagi.";
          errorMessage.hidden = false;
          submitButton.disabled = false;
          submitButton.textContent = `Masuk ke ${applicationBranding.appName}`;
        }
      });
      $("#logout-button").addEventListener("click", async () => {
        try {
          await api("/api/logout", { method: "POST" });
          window.location.reload();
        } catch (error) {
          toast(error.message);
        }
      });
      $("#profile-button").addEventListener("click", accountProfileModal);
      async function initializeApp() {
        $("#session-loading").hidden = false;
        try {
          try {
            const branding = await api("/api/branding");
            applyBranding(branding.branding);
          } catch (error) {
            console.error("Pengaturan logo aplikasi tidak dapat dimuat.", error);
          }
          const session = await api("/api/session");
          signedInUser = session.user;
          if (!signedInUser) {
            $("#app").hidden = true;
            $("#session-loading").hidden = true;
            $("#login-screen").hidden = false;
            return;
          }
          const stored = await api("/api/state");
          if (stored.data) {
            const needsAppMigration = applyServerState(stored.data);
            if (needsAppMigration && signedInUser.role === "admin") await persist();
          } else {
            if (signedInUser.role !== "admin") {
              throw new Error("Administrator harus login terlebih dahulu untuk menyiapkan data aplikasi.");
            }
            let initialData = defaultData;
            let importLegacy = false;
            if (stored.isInitial && signedInUser.role === "admin" &&
                legacyData && ["players", "sessions", "events", "matches"].every(key => Array.isArray(legacyData[key]))) {
              try {
                importLegacy = localStorage.getItem(LEGACY_IMPORTED_KEY) !== "1" &&
                  window.confirm("Ditemukan data VolleyDesk lama di browser ini. Impor data tersebut ke database bersama?");
              } catch (error) {
                console.error("Migrasi data lama tidak tersedia.", error);
              }
            }
            if (importLegacy) initialData = legacyData;
            applyServerState(initialData);
            await api("/api/state/initialize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ data })
            });
            try { localStorage.setItem(LEGACY_IMPORTED_KEY, "1"); }
            catch (error) { console.error("Penanda migrasi browser tidak dapat disimpan.", error); }
          }
          if (signedInUser.role === "admin") {
            const result = await api("/api/admin/users");
            serverUsers = result.users;
            backupSettings = await api("/api/admin/backup-settings");
            publicPortal = await api("/api/admin/public-portal");
          }
          restoreLastPage();
          $("#session-loading").hidden = true;
          $("#login-screen").hidden = true;
          $("#app").hidden = false;
          render();
        } catch (error) {
          $("#app").hidden = true;
          $("#session-loading").hidden = true;
          $("#login-screen").hidden = false;
          if (error.status === 401) return;
          const message = $("#login-error");
          message.textContent = error.message || "Login demo tidak dapat dijalankan pada browser ini.";
          message.hidden = false;
        }
      }
      initializeApp();
    })();
