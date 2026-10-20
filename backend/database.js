const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'untiltherock.db');
const db = new sqlite3.Database(dbPath);

const initialize = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Table admin
      db.run(`CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Table portfolio (pour chaque service)
      db.run(`CREATE TABLE IF NOT EXISTS portfolio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        audio_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Table réservations matériel
      db.run(`CREATE TABLE IF NOT EXISTS booking_equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        equipment TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Table réservations studio
      db.run(`CREATE TABLE IF NOT EXISTS booking_studio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        studio_type TEXT NOT NULL,
        date DATE NOT NULL,
        time_slot TEXT NOT NULL,
        duration INTEGER NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Table sessions enregistrement
      db.run(`CREATE TABLE IF NOT EXISTS recording_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        project_type TEXT NOT NULL,
        date DATE NOT NULL,
        duration INTEGER NOT NULL,
        message TEXT,
        demo_path TEXT,
        demo_original_name TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Table contacts
      db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'unread',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Table calendrier
      db.run(`CREATE TABLE IF NOT EXISTS calendar_appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        date DATE NOT NULL,
        time_slot TEXT NOT NULL,
        service_type TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Publications de la page Événements & prestations
      db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        event_date DATE NOT NULL,
        end_date DATE,
        location TEXT,
        excerpt TEXT,
        content TEXT,
        image_url TEXT,
        is_pinned INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Créer un admin par défaut si n'existe pas
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      db.run(`INSERT OR IGNORE INTO admin (username, password, email) 
              VALUES ('admin', ?, 'admin@untiltherock.com')`, 
              [defaultPassword], 
              (err) => {
        if (err) {
          console.error('Erreur création admin:', err);
          reject(err);
        } else {
          console.log('✅ Base de données initialisée');
          console.log('📌 Admin par défaut: username="admin", password="admin123"');
          resolve();
        }
      });
    });
  });
};

module.exports = { db, initialize };
