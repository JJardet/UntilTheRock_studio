const express = require('express');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Créneaux disponibles par défaut (admin peut les personnaliser)
const DEFAULT_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

// Un créneau studio est enregistré sous la forme « 09h00 - 12h00 ».
// Cette fonction permet de le comparer aux créneaux horaires du calendrier global.
function studioBookingCoversSlot(studioSlot, calendarSlot) {
  const range = String(studioSlot).match(/(\d{1,2})h?\d*\s*-\s*(\d{1,2})h?\d*/);
  if (!range) return false;
  const hour = Number(String(calendarSlot).split(':')[0]);
  return hour >= Number(range[1]) && hour < Number(range[2]);
}

// -------------------------------------------------------
// PUBLIC : récupérer les RDV d'un mois (juste statuts)
// -------------------------------------------------------
router.get('/month/:year/:month', (req, res) => {
  const { year, month } = req.params;
  // Premier et dernier jour du mois
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const to   = `${year}-${String(month).padStart(2, '0')}-31`;

  db.all(
    `SELECT date, time_slot, status, service_type, 'appointment' AS source FROM calendar_appointments
     WHERE date >= ? AND date <= ? AND status != 'cancelled'
     UNION ALL
     SELECT date, time_slot, status, studio_type AS service_type, 'studio' AS source FROM booking_studio
     WHERE date >= ? AND date <= ? AND status != 'cancelled'`,
    [from, to, from, to],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      res.json(rows);
    }
  );
});

// PUBLIC : disponibilités d'une salle de répétition (A ou B)
router.get('/studio/:room/month/:year/:month', (req, res) => {
  const { room, year, month } = req.params;
  const allowedRooms = { A: 'Studio A - Grand format', B: 'Studio B - Enregistrement' };
  if (!allowedRooms[room]) return res.status(400).json({ error: 'Salle invalide' });
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const to = `${year}-${String(month).padStart(2, '0')}-31`;
  db.all(`SELECT date, time_slot, status FROM booking_studio
          WHERE studio_type = ? AND date >= ? AND date <= ? AND status != 'cancelled'`,
    [allowedRooms[room], from, to], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      res.json(rows);
    });
});

// -------------------------------------------------------
// PUBLIC : récupérer les créneaux dispo d'un jour
// -------------------------------------------------------
router.get('/slots/:date', (req, res) => {
  const { date } = req.params;

  // Récupérer les créneaux déjà pris ce jour-là
  db.all(
    `SELECT time_slot FROM calendar_appointments
     WHERE date = ? AND status != 'cancelled'`,
    [date],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });

      db.all(
        `SELECT time_slot FROM booking_studio WHERE date = ? AND status != 'cancelled'`,
        [date],
        (studioError, studioRows) => {
          if (studioError) return res.status(500).json({ error: 'Erreur serveur' });
          const calendarTaken = rows.map(r => r.time_slot);
          const studioTaken = DEFAULT_SLOTS.filter(slot => studioRows.some(booking => studioBookingCoversSlot(booking.time_slot, slot)));
          const taken = [...new Set([...calendarTaken, ...studioTaken])];
          const available = DEFAULT_SLOTS.filter(s => !taken.includes(s));
          res.json({ date, available, taken });
        }
      );
    }
  );
});

// -------------------------------------------------------
// PUBLIC : demander un RDV
// -------------------------------------------------------
router.post('/request', (req, res) => {
  const { name, email, phone, date, time_slot, service_type, message } = req.body;

  if (!name || !email || !phone || !date || !time_slot || !service_type) {
    return res.status(400).json({ error: 'Tous les champs obligatoires sont requis' });
  }

  // Vérifier que le créneau est encore libre
  db.get(
    `SELECT id FROM calendar_appointments WHERE date = ? AND time_slot = ? AND status != 'cancelled'`,
    [date, time_slot],
    (err, existing) => {
      if (err)      return res.status(500).json({ error: 'Erreur serveur' });
      if (existing) return res.status(409).json({ error: 'Ce créneau est déjà réservé' });

      db.all(`SELECT time_slot FROM booking_studio WHERE date = ? AND status != 'cancelled'`, [date], (studioError, studioRows) => {
        if (studioError) return res.status(500).json({ error: 'Erreur serveur' });
        if (studioRows.some(booking => studioBookingCoversSlot(booking.time_slot, time_slot))) {
          return res.status(409).json({ error: 'Ce créneau est déjà réservé' });
        }
        db.run(
          `INSERT INTO calendar_appointments (name, email, phone, date, time_slot, service_type, message, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [name, email, phone, date, time_slot, service_type, message || ''],
          function(err) {
            if (err) return res.status(500).json({ error: 'Erreur lors de la demande' });
            res.json({ message: 'Demande envoyée avec succès', id: this.lastID });
          }
        );
      });
    }
  );
});

// -------------------------------------------------------
// ADMIN : tous les RDV
// -------------------------------------------------------
router.get('/all', authMiddleware, (req, res) => {
  db.all(
    `SELECT * FROM calendar_appointments ORDER BY date ASC, time_slot ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      res.json(rows);
    }
  );
});

// -------------------------------------------------------
// ADMIN : changer le statut d'un RDV
// -------------------------------------------------------
router.put('/:id/status', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Statut invalide' });

  db.run(`UPDATE calendar_appointments SET status = ? WHERE id = ?`, [status, id], function(err) {
    if (err) return res.status(500).json({ error: 'Erreur mise à jour' });
    res.json({ message: 'Statut mis à jour' });
  });
});

// -------------------------------------------------------
// ADMIN : supprimer un RDV
// -------------------------------------------------------
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM calendar_appointments WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: 'Erreur suppression' });
    res.json({ message: 'RDV supprimé' });
  });
});

// -------------------------------------------------------
// ADMIN : ajouter un blocage (indisponibilité)
// -------------------------------------------------------
router.post('/block', authMiddleware, (req, res) => {
  const { date, time_slot, reason } = req.body;

  db.run(
    `INSERT INTO calendar_appointments (name, email, phone, date, time_slot, service_type, message, status)
     VALUES ('BLOQUÉ', 'admin@untiltherock.com', '0000000000', ?, ?, 'blocked', ?, 'confirmed')`,
    [date, time_slot, reason || 'Indisponible'],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erreur lors du blocage' });
      res.json({ message: 'Créneau bloqué', id: this.lastID });
    }
  );
});

module.exports = router;
