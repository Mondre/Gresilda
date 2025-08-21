import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';

let db: Database | null = null;

export function getDatabase(): Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'database', 'gresilda.db');
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        initializeTables();
      }
    });
  }
  return db;
}

function initializeTables() {
  const db = getDatabase();

  // Tabella clienti
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      birthday DATE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabella appuntamenti
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      date DATE NOT NULL,
      time TIME NOT NULL,
      duration INTEGER DEFAULT 60,
      service TEXT NOT NULL,
      price DECIMAL(10,2),
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers (id)
    )
  `);

  // Tabella magazzino/prodotti
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT,
      category TEXT,
      description TEXT,
      price_purchase DECIMAL(10,2),
      price_sale DECIMAL(10,2),
      quantity INTEGER DEFAULT 0,
      minimum_stock INTEGER DEFAULT 0,
      expiry_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabella servizi
  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      duration INTEGER DEFAULT 60,
      price DECIMAL(10,2) NOT NULL,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Inserisci servizi di base
  db.run(`
    INSERT OR IGNORE INTO services (id, name, description, duration, price) VALUES
    (1, 'Taglio Donna', 'Taglio e piega per capelli femminili', 60, 25.00),
    (2, 'Taglio Uomo', 'Taglio per capelli maschili', 30, 15.00),
    (3, 'Colore', 'Colorazione completa', 120, 45.00),
    (4, 'Cerimonia', 'Acconciatura per cerimonie ed eventi', 90, 50.00),
    (5, 'Trucco', 'Make-up professionale', 45, 30.00),
    (6, 'Meches', 'Colpi di sole', 90, 35.00),
    (7, 'Piega', 'Solo piega', 30, 12.00),
    (8, 'Trattamento', 'Maschera ristrutturante', 45, 20.00)
  `);
}

// Funzioni helper per le query
export function runQuery(sql: string, params: (string | number | null)[] = []): Promise<{ id: number; changes: number }> {
  return new Promise((resolve, reject) => {
    getDatabase().run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

export function getQuery<T = unknown>(sql: string, params: (string | number | null)[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    getDatabase().get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as T);
      }
    });
  });
}

export function allQuery<T = unknown>(sql: string, params: (string | number | null)[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    getDatabase().all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as T[]);
      }
    });
  });
}
