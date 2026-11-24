"use strict";

const fs = require("node:fs");
const path = require("node:path");
const initSqlJs = require("sql.js");

let SQL;
let db;
let databasePath;

function writeDatabase() {
  const temporaryPath = `${databasePath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, Buffer.from(db.export()), { mode: 0o600 });
    fs.renameSync(temporaryPath, databasePath);
  } catch (error) {
    try { fs.unlinkSync(temporaryPath); } catch {}
    throw error;
  }
}

function get(sql, parameters) {
  const statement = db.prepare(sql);
  try {
    statement.bind(parameters || []);
    return statement.step() ? statement.getAsObject() : null;
  } finally {
    statement.free();
  }
}

function all(sql, parameters) {
  const statement = db.prepare(sql);
  const rows = [];
  try {
    statement.bind(parameters || []);
    while (statement.step()) rows.push(statement.getAsObject());
    return rows;
  } finally {
    statement.free();
  }
}

function run(sql, parameters) {
  db.run(sql, parameters || []);
  return db.getRowsModified();
}

function transaction(work) {
  const previous = Buffer.from(db.export());
  db.run("BEGIN IMMEDIATE");
  let restored = false;
  try {
    const result = work();
    db.run("COMMIT");
    try {
      writeDatabase();
    } catch (error) {
      db.close();
      db = new SQL.Database(previous);
      restored = true;
      throw error;
    }
    return result;
  } catch (error) {
    if (!restored) {
      try { db.run("ROLLBACK"); } catch {}
    }
    throw error;
  }
}

async function initializeDatabase() {
  databasePath = path.resolve(process.env.SQLITE_PATH || path.join(__dirname, "data", "volleydesk.sqlite"));
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  SQL = await initSqlJs({
    locateFile: filename => require.resolve(`sql.js/dist/${filename}`)
  });
  db = fs.existsSync(databasePath)
    ? new SQL.Database(fs.readFileSync(databasePath))
    : new SQL.Database();
  db.run("PRAGMA foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 80),
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      role TEXT NOT NULL CHECK(role IN ('admin', 'principal', 'curriculum', 'coach')),
      password_hash TEXT NOT NULL,
      avatar_data_url TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TRIGGER IF NOT EXISTS app_users_single_admin_insert
    BEFORE INSERT ON app_users
    WHEN NEW.role = 'admin' AND EXISTS(SELECT 1 FROM app_users WHERE role = 'admin')
    BEGIN
      SELECT RAISE(ABORT, 'Only one admin account is allowed');
    END;
    CREATE TRIGGER IF NOT EXISTS app_users_single_admin_update
    BEFORE UPDATE OF role ON app_users
    WHEN NEW.role = 'admin' AND EXISTS(SELECT 1 FROM app_users WHERE role = 'admin' AND id != NEW.id)
    BEGIN
      SELECT RAISE(ABORT, 'Only one admin account is allowed');
    END;
    CREATE TABLE IF NOT EXISTS auth_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS auth_sessions_expiry ON auth_sessions(expires_at);
    CREATE TABLE IF NOT EXISTS player_user_links (
      user_id INTEGER PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
      player_id INTEGER NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      state_json TEXT NOT NULL,
      is_initial INTEGER NOT NULL DEFAULT 0 CHECK(is_initial IN (0, 1)),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS backup_settings (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0, 1)),
      time_local TEXT NOT NULL DEFAULT '23:00',
      last_scheduled_date TEXT,
      last_attempt_at INTEGER,
      last_result TEXT,
      last_message TEXT,
      last_run_at TEXT,
      telegram_bot_token TEXT,
      telegram_chat_id TEXT
    );
    INSERT OR IGNORE INTO backup_settings (id) VALUES (1);
    CREATE TABLE IF NOT EXISTS public_portal (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      token TEXT,
      enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0, 1)),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    INSERT OR IGNORE INTO public_portal (id) VALUES (1);
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_id INTEGER,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS activity_log_created_at ON activity_log(created_at DESC, id DESC);
  `);
  const userColumns = all("PRAGMA table_info(app_users)");
  if (!userColumns.some(column => column.name === "avatar_data_url")) {
    db.run("ALTER TABLE app_users ADD COLUMN avatar_data_url TEXT");
  }
  const backupColumns = all("PRAGMA table_info(backup_settings)");
  if (!backupColumns.some(column => column.name === "last_attempt_at")) {
    db.run("ALTER TABLE backup_settings ADD COLUMN last_attempt_at INTEGER");
  }
  if (!backupColumns.some(column => column.name === "telegram_bot_token")) {
    db.run("ALTER TABLE backup_settings ADD COLUMN telegram_bot_token TEXT");
  }
  if (!backupColumns.some(column => column.name === "telegram_chat_id")) {
    db.run("ALTER TABLE backup_settings ADD COLUMN telegram_chat_id TEXT");
  }
  writeDatabase();
  return {
    get,
    all,
    run,
    transaction,
    writeDatabase,
    close() {
      if (db) {
        writeDatabase();
        db.close();
        db = null;
      }
    }
  };
}

module.exports = { initializeDatabase };
