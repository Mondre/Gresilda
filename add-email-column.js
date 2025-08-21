const Database = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'gestionale.db');
const db = new Database(dbPath);

// Aggiungi colonna email se non esiste
db.run(`ALTER TABLE customers ADD COLUMN email TEXT`, (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('Errore aggiunta colonna email:', err.message);
  } else {
    console.log('✅ Colonna email aggiunta con successo (o già esistente)');
  }
  
  db.close();
});
