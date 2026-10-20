const { db } = require('./database');

/**
 * Système de migrations pour gérer les évolutions de la base de données
 */

const migrations = [
  {
    version: 1,
    description: "Tables initiales",
    up: () => {
      // Déjà créé dans database.js
      console.log("✅ Migration v1 - Tables initiales (déjà créées)");
    }
  },
  // Ajoutez vos futures migrations ici
  {
    version: 2,
    description: "Ajout colonne video_url au portfolio",
    up: () => {
      return new Promise((resolve, reject) => {
        db.run(`ALTER TABLE portfolio ADD COLUMN video_url TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.log('⚠️  Colonne video_url existe déjà ou erreur:', err.message);
          } else {
            console.log("✅ Migration v2 - Colonne video_url ajoutée");
          }
          resolve();
        });
      });
    }
  },
  {
    version: 3,
    description: 'Suppression du service mastering',
    up: () => {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('DROP TABLE IF EXISTS mastering_requests', (dropError) => {
            if (dropError) {
              reject(dropError);
              return;
            }

            db.run("DELETE FROM portfolio WHERE service_type = 'mastering'", (deleteError) => {
              if (deleteError) reject(deleteError);
              else resolve();
            });
          });
        });
      });
    }
  },
  {
    version: 4,
    description: 'Ajout des maquettes aux demandes d’enregistrement',
    up: () => {
      return new Promise((resolve, reject) => {
        db.run(
          'ALTER TABLE recording_sessions ADD COLUMN demo_path TEXT',
          (pathError) => {
            if (pathError && !pathError.message.includes('duplicate column')) {
              reject(pathError);
              return;
            }

            db.run(
              'ALTER TABLE recording_sessions ADD COLUMN demo_original_name TEXT',
              (nameError) => {
                if (nameError && !nameError.message.includes('duplicate column')) reject(nameError);
                else resolve();
              }
            );
          }
        );
      });
    }
  },
  {
    version: 5,
    description: 'Ajout des publications événements',
    up: () => new Promise((resolve, reject) => {
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
      )`, err => err ? reject(err) : resolve());
    })
  },
  {
    version: 6,
    description: 'Ajout de publications événements de démonstration',
    up: () => new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) AS count FROM events', [], (err, row) => {
        if (err) return reject(err);
        if (row.count > 0) return resolve();
        const posts = [
          ['Release Party — Until The Rock', '2026-11-14', 'Le Club, Paris', 'Une soirée dédiée aux artistes et productions du studio.', 1],
          ['Résidence live : Les Satellites', '2026-12-05', 'UntilTheRock Studio', 'Deux jours de répétitions ouvertes et captation live.', 1],
          ['Prestation son & lumière — Night Session', '2026-09-19', 'La Halle 18', 'Installation son et lumière complète pour une soirée électro.', 0],
          ['Open Studio #04', '2026-07-03', 'UntilTheRock Studio', 'Portes ouvertes, écoutes et rencontres autour des sorties du studio.', 0]
        ];
        const stmt = db.prepare('INSERT INTO events (title, event_date, location, excerpt, is_pinned) VALUES (?, ?, ?, ?, ?)');
        posts.forEach(post => stmt.run(post));
        stmt.finalize(error => error ? reject(error) : resolve());
      });
    })
  },
  {
    version: 7,
    description: 'Ajout de photos portfolio de démonstration',
    up: () => new Promise((resolve, reject) => {
      const photos = [
        ['equipment', 'Régie & système son', 'Aperçu du matériel disponible à la location.', '/assets/generated/studio-showcase-v1.png'],
        ['equipment', 'Matériel du studio', 'Sélection de matériel professionnel.', '/assets/uploads/images/1409279-1788351433853-915413674.png'],
        ['studio', 'Salle de répétition', 'Un espace prêt à accueillir vos sessions.', '/assets/generated/studio-showcase-v1.png'],
        ['studio', 'Ambiance du studio', 'Un lieu pensé pour créer et répéter.', '/assets/uploads/images/prout.jpg'],
        ['recording', 'Session en régie', 'Prise de son et mixage au studio.', '/assets/generated/studio-showcase-v1.png'],
        ['recording', 'Univers UntilTheRock', 'Une ambiance chaleureuse pour vos productions.', '/assets/uploads/images/prout.jpg']
      ];
      const stmt = db.prepare('INSERT INTO portfolio (service_type, title, description, image_url) VALUES (?, ?, ?, ?)');
      photos.forEach(photo => stmt.run(photo));
      stmt.finalize(err => err ? reject(err) : resolve());
    })
  }
];


// Table pour tracker les migrations appliquées
const createMigrationTable = () => {
  return new Promise((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      description TEXT,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Obtenir la version actuelle
const getCurrentVersion = () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT MAX(version) as version FROM migrations', [], (err, row) => {
      if (err) reject(err);
      else resolve(row?.version || 0);
    });
  });
};

// Appliquer une migration
const applyMigration = (migration) => {
  return new Promise(async (resolve, reject) => {
    try {
      await migration.up();
      
      db.run(
        'INSERT INTO migrations (version, description) VALUES (?, ?)',
        [migration.version, migration.description],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

// Exécuter toutes les migrations en attente
const runMigrations = async () => {
  try {
    await createMigrationTable();
    const currentVersion = await getCurrentVersion();
    
    console.log(`📊 Version actuelle de la base de données: ${currentVersion}`);
    
    const pendingMigrations = migrations.filter(m => m.version > currentVersion);
    
    if (pendingMigrations.length === 0) {
      console.log('✅ Base de données à jour');
      return;
    }
    
    console.log(`🔄 ${pendingMigrations.length} migration(s) à appliquer...`);
    
    for (const migration of pendingMigrations) {
      console.log(`⏳ Application de la migration v${migration.version}: ${migration.description}`);
      await applyMigration(migration);
    }
    
    console.log('✅ Toutes les migrations ont été appliquées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    throw error;
  }
};

module.exports = { runMigrations };
