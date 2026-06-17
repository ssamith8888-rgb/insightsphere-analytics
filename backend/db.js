const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'analytics.db');
const db = new sqlite3.Database(dbPath);

// Helper function to run DB queries with Promises
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Helper function to get all rows with Promises
const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Helper function to get single row with Promises
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initialize the database schema
const initDb = async () => {
  console.log('Initializing SQLite database schema...');
  
  await run(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY,
      country TEXT,
      browser TEXT,
      device TEXT,
      referrer TEXT,
      created_at TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      event_type TEXT,
      event_name TEXT,
      metadata TEXT,
      created_at TEXT,
      FOREIGN KEY (session_id) REFERENCES sessions (session_id)
    )
  `);

  console.log('Database tables verified/created successfully.');
};

module.exports = {
  db,
  initDb,
  run,
  all,
  get
};
