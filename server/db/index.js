const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database file
const dbPath = path.join(__dirname, 'queuemate.db');
const db = new sqlite3.Database(dbPath);

// Helper to run queries with promises
const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const getQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const allQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Create tables function
const createTables = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      price REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      role TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      service_id INTEGER REFERENCES services(id),
      staff_id INTEGER REFERENCES staff(id),
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS queue_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      token_number INTEGER NOT NULL,
      customer_name TEXT,
      status TEXT DEFAULT 'waiting',
      called_at DATETIME,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const query of queries) {
    try {
      await runQuery(query);
      console.log('Table created/verified');
    } catch (err) {
      console.error('Error creating table:', err.message);
    }
  }
  console.log('All tables setup complete');
};

module.exports = { db, runQuery, getQuery, allQuery, createTables };