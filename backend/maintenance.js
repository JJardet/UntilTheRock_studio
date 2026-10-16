#!/usr/bin/env node

const { db } = require('./database');
const { logger } = require('./logger');
const fs = require('fs');
const path = require('path');

/**
 * Script de maintenance automatique
 * Nettoie les données anciennes et optimise la base
 */

// Configuration
const DAYS_TO_KEEP = {
  bookings: 90,      // Garder les réservations 90 jours
  contacts: 180,     // Garder les contacts 180 jours
  logs: 30           // Garder les logs 30 jours
};

// Supprimer les vieilles réservations
function cleanOldBookings() {
  return new Promise((resolve, reject) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_KEEP.bookings);
    const cutoff = cutoffDate.toISOString().split('T')[0];

    const tables = [
      'booking_equipment',
      'booking_studio',
      'recording_sessions'
    ];

    let deleted = 0;
    let completed = 0;

    tables.forEach(table => {
      const query = `DELETE FROM ${table} WHERE created_at < ? AND status IN ('completed', 'cancelled')`;
      
      db.run(query, [cutoff], function(err) {
        if (err) {
          logger.error(`Erreur nettoyage ${table}:`, err);
        } else {
          deleted += this.changes;
          logger.info(`${table}: ${this.changes} réservation(s) supprimée(s)`);
        }
        
        completed++;
        if (completed === tables.length) {
          resolve(deleted);
        }
      });
    });
  });
}

// Supprimer les vieux contacts traités
function cleanOldContacts() {
  return new Promise((resolve, reject) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_KEEP.contacts);
    const cutoff = cutoffDate.toISOString().split('T')[0];

    const query = `DELETE FROM contacts WHERE created_at < ? AND status = 'read'`;
    
    db.run(query, [cutoff], function(err) {
      if (err) {
        logger.error('Erreur nettoyage contacts:', err);
        reject(err);
      } else {
        logger.info(`Contacts: ${this.changes} message(s) supprimé(s)`);
        resolve(this.changes);
      }
    });
  });
}

// Optimiser la base de données
function optimizeDatabase() {
  return new Promise((resolve, reject) => {
    logger.info('Optimisation de la base de données...');
    
    db.run('VACUUM', (err) => {
      if (err) {
        logger.error('Erreur VACUUM:', err);
      } else {
        logger.success('VACUUM effectué');
      }
    });

    db.run('ANALYZE', (err) => {
      if (err) {
        logger.error('Erreur ANALYZE:', err);
        reject(err);
      } else {
        logger.success('ANALYZE effectué');
        resolve();
      }
    });
  });
}

// Nettoyer les vieux logs
function cleanOldLogs() {
  const logsDir = path.join(__dirname, 'logs');
  const maxAge = DAYS_TO_KEEP.logs * 24 * 60 * 60 * 1000;
  
  return new Promise((resolve, reject) => {
    fs.readdir(logsDir, (err, files) => {
      if (err) {
        logger.error('Erreur lecture dossier logs:', err);
        reject(err);
        return;
      }

      let deleted = 0;
      let processed = 0;

      if (files.length === 0) {
        resolve(0);
        return;
      }

      files.forEach(file => {
        const filePath = path.join(logsDir, file);
        
        fs.stat(filePath, (err, stats) => {
          if (err) {
            processed++;
            return;
          }

          const fileAge = Date.now() - stats.mtime.getTime();
          
          if (fileAge > maxAge) {
            fs.unlink(filePath, (err) => {
              if (!err) {
                deleted++;
                logger.info(`Log supprimé: ${file}`);
              }
              processed++;
              
              if (processed === files.length) {
                resolve(deleted);
              }
            });
          } else {
            processed++;
            if (processed === files.length) {
              resolve(deleted);
            }
          }
        });
      });
    });
  });
}

// Statistiques de la base
function getDatabaseStats() {
  return new Promise((resolve, reject) => {
    const stats = {};

    const queries = {
      bookings_equipment: 'SELECT COUNT(*) as count FROM booking_equipment',
      bookings_studio: 'SELECT COUNT(*) as count FROM booking_studio',
      recording_sessions: 'SELECT COUNT(*) as count FROM recording_sessions',
      contacts: 'SELECT COUNT(*) as count FROM contacts',
      portfolio: 'SELECT COUNT(*) as count FROM portfolio'
    };

    let completed = 0;
    const total = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
      db.get(query, [], (err, row) => {
        if (!err) {
          stats[key] = row.count;
        }
        completed++;
        if (completed === total) {
          resolve(stats);
        }
      });
    });
  });
}

// Rapport de maintenance
async function generateReport() {
  logger.info('═══════════════════════════════════════');
  logger.info('📊 Rapport de Maintenance');
  logger.info('═══════════════════════════════════════');

  const stats = await getDatabaseStats();
  
  logger.info('\n📈 Statistiques actuelles:');
  logger.info(`   Réservations matériel: ${stats.bookings_equipment}`);
  logger.info(`   Réservations studio: ${stats.bookings_studio}`);
  logger.info(`   Sessions enregistrement: ${stats.recording_sessions}`);
  logger.info(`   Messages contact: ${stats.contacts}`);
  logger.info(`   Éléments portfolio: ${stats.portfolio}`);

  // Taille de la base
  const dbPath = path.join(__dirname, 'untiltherock.db');
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    logger.info(`\n💾 Taille de la base: ${sizeMB} MB`);
  }

  logger.info('\n═══════════════════════════════════════\n');
}

// Exécution principale
async function runMaintenance() {
  try {
    logger.info('🔧 Démarrage de la maintenance...\n');

    await generateReport();

    logger.info('🧹 Nettoyage des données anciennes...');
    const deletedBookings = await cleanOldBookings();
    const deletedContacts = await cleanOldContacts();
    const deletedLogs = await cleanOldLogs();

    logger.info(`\n✅ Nettoyage terminé:`);
    logger.info(`   ${deletedBookings} réservation(s) supprimée(s)`);
    logger.info(`   ${deletedContacts} contact(s) supprimé(s)`);
    logger.info(`   ${deletedLogs} fichier(s) log supprimé(s)`);

    logger.info('\n⚡ Optimisation de la base...');
    await optimizeDatabase();

    logger.info('\n📊 Statistiques après maintenance:');
    await generateReport();

    logger.success('✨ Maintenance terminée avec succès!');
    process.exit(0);

  } catch (error) {
    logger.error('❌ Erreur lors de la maintenance:', error);
    process.exit(1);
  }
}

// CLI
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔧 Script de Maintenance UntilTheRock

Usage: node maintenance.js [options]

Options:
  --help, -h      Afficher cette aide
  --stats         Afficher uniquement les statistiques
  --clean         Nettoyer sans optimiser
  --optimize      Optimiser sans nettoyer

Par défaut: Nettoyage + Optimisation complète

Exemples:
  node maintenance.js              # Maintenance complète
  node maintenance.js --stats      # Stats uniquement
  node maintenance.js --clean      # Nettoyage uniquement
  `);
  process.exit(0);
}

if (args.includes('--stats')) {
  generateReport().then(() => process.exit(0));
} else if (args.includes('--clean')) {
  (async () => {
    const deletedBookings = await cleanOldBookings();
    const deletedContacts = await cleanOldContacts();
    const deletedLogs = await cleanOldLogs();
    logger.success(`✅ ${deletedBookings + deletedContacts + deletedLogs} éléments supprimés`);
    process.exit(0);
  })();
} else if (args.includes('--optimize')) {
  optimizeDatabase().then(() => {
    logger.success('✅ Optimisation terminée');
    process.exit(0);
  });
} else {
  runMaintenance();
}
