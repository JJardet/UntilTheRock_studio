const express = require('express');
const fs = require('fs');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');
const { recordingDemoUpload } = require('../upload');
const { logger } = require('../logger');
const { stripeClient } = require('./payments');
const { sendStudioBookingDecision } = require('../notifications');

const router = express.Router();

// Réservation matériel
router.post('/equipment', (req, res) => {
  const { name, email, phone, equipment, start_date, end_date, message } = req.body;

  db.run(
    `INSERT INTO booking_equipment (name, email, phone, equipment, start_date, end_date, message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, equipment, start_date, end_date, message],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la réservation' });
      }
      logger.booking('equipment', { id: this.lastID, name, email });
      res.json({ message: 'Réservation enregistrée', id: this.lastID });
    }
  );
});

// Les réservations de salle doivent obligatoirement passer par Stripe Checkout.
// Cette ancienne route est conservée uniquement pour refuser explicitement les appels clients obsolètes.
router.post('/studio', (req, res) => {
  res.status(410).json({ error: 'Utilisez la session de paiement pour réserver une salle.' });
});

// Session enregistrement
router.post('/recording', recordingDemoUpload, (req, res) => {
  const { name, email, phone, project_type, date, duration, message } = req.body;
  const demoPath = req.file?.path || null;
  const demoOriginalName = req.file?.originalname || null;

  db.run(
    `INSERT INTO recording_sessions
      (name, email, phone, project_type, date, duration, message, demo_path, demo_original_name)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, project_type, date, duration, message, demoPath, demoOriginalName],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la réservation' });
      }
      logger.booking('recording', { id: this.lastID, name, email });
      res.json({ message: 'Session enregistrée', id: this.lastID });
    }
  );
});

router.get('/recording/:id/demo', authMiddleware, (req, res) => {
  db.get(
    'SELECT demo_path, demo_original_name FROM recording_sessions WHERE id = ?',
    [req.params.id],
    (err, recording) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      if (!recording?.demo_path) {
        return res.status(404).json({ error: 'Maquette introuvable' });
      }

      res.download(recording.demo_path, recording.demo_original_name);
    }
  );
});

// Admin: Récupérer toutes les réservations
router.get('/all', authMiddleware, (req, res) => {
  const queries = {
    equipment: 'SELECT * FROM booking_equipment ORDER BY created_at DESC',
    studio: 'SELECT * FROM booking_studio ORDER BY created_at DESC',
    recording: `SELECT id, name, email, phone, project_type, date, duration, message, status, created_at,
      CASE WHEN demo_path IS NOT NULL THEN 1 ELSE 0 END AS has_demo
      FROM recording_sessions ORDER BY created_at DESC`
  };

  const results = {};
  let completed = 0;

  Object.keys(queries).forEach(key => {
    db.all(queries[key], [], (err, rows) => {
      if (!err) results[key] = rows;
      completed++;
      if (completed === Object.keys(queries).length) {
        res.json(results);
      }
    });
  });
});

// Admin: Mettre à jour le statut
router.put('/:type/:id/status', authMiddleware, async (req, res) => {
  const { type, id } = req.params;
  const { status } = req.body;

  const tableMap = {
    equipment: 'booking_equipment',
    studio: 'booking_studio',
    recording: 'recording_sessions'
  };

  const table = tableMap[type];
  if (!table) {
    return res.status(400).json({ error: 'Type invalide' });
  }
  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }

  try {
    const booking = await new Promise((resolve, reject) => db.get(`SELECT * FROM ${table} WHERE id = ?`, [id], (err, row) => err ? reject(err) : resolve(row)));
    if (!booking) return res.status(404).json({ error: 'Réservation non trouvée' });
    if (type === 'studio' && booking.status === 'payment_pending') {
      return res.status(409).json({ error: 'Cette réservation n’a pas encore été payée.' });
    }

    let refundAmount = 0;
    if (type === 'studio' && status === 'cancelled' && booking.payment_status === 'paid' && !booking.stripe_refund_id) {
      const stripe = stripeClient();
      if (!stripe) return res.status(503).json({ error: 'Stripe n’est pas configuré : remboursement impossible.' });
      let paymentIntentId = booking.stripe_payment_intent_id;
      if (!paymentIntentId && booking.stripe_session_id) {
        const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id);
        paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
      }
      if (!paymentIntentId) return res.status(409).json({ error: 'Paiement Stripe introuvable : remboursement impossible.' });
      const refund = await stripe.refunds.create(
        { payment_intent: paymentIntentId, metadata: { booking_id: String(id) } },
        { idempotencyKey: `untiltherock-booking-${id}-refund` }
      );
      refundAmount = booking.amount_paid || 0;
      await new Promise((resolve, reject) => db.run(
        'UPDATE booking_studio SET stripe_payment_intent_id = ?, stripe_refund_id = ?, payment_status = ? WHERE id = ?',
        [paymentIntentId, refund.id, refund.status === 'succeeded' ? 'refunded' : 'refund_pending', id], err => err ? reject(err) : resolve()
      ));
    }

    await new Promise((resolve, reject) => db.run(`UPDATE ${table} SET status = ? WHERE id = ?`, [status, id], err => err ? reject(err) : resolve()));
    logger.admin('Mise à jour statut réservation', req.admin.id, { type, id, status });
    if (type === 'studio' && ['confirmed', 'cancelled'].includes(status)) await sendStudioBookingDecision(booking, status, refundAmount);
    res.json({ message: 'Statut mis à jour', refunded: Boolean(refundAmount), refundAmount });
  } catch (error) {
    logger.error('Mise à jour réservation impossible', error.message);
    res.status(500).json({ error: status === 'cancelled' && type === 'studio' ? 'Annulation ou remboursement impossible.' : 'Erreur mise à jour' });
  }
});

// Admin: Supprimer une réservation
router.delete('/:type/:id', authMiddleware, (req, res) => {
  const { type, id } = req.params;

  const tableMap = {
    equipment: 'booking_equipment',
    studio: 'booking_studio',
    recording: 'recording_sessions'
  };

  const table = tableMap[type];
  if (!table) {
    return res.status(400).json({ error: 'Type invalide' });
  }

  const deleteBooking = () => {
    db.run(`DELETE FROM ${table} WHERE id = ?`, [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la suppression' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Réservation non trouvée' });
      }

      logger.admin('Suppression réservation', req.admin.id, { type, id });
      res.json({ message: 'Réservation supprimée' });
    });
  };

  if (type === 'studio') {
    db.get('SELECT payment_status FROM booking_studio WHERE id = ?', [id], (err, booking) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      if (!booking) return res.status(404).json({ error: 'Réservation non trouvée' });
      if (['paid', 'refund_pending'].includes(booking.payment_status)) {
        return res.status(409).json({ error: 'Annulez d’abord cette réservation afin de rembourser le paiement.' });
      }
      deleteBooking();
    });
    return;
  }

  if (type !== 'recording') {
    deleteBooking();
    return;
  }

  db.get('SELECT demo_path FROM recording_sessions WHERE id = ?', [id], (err, recording) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (!recording) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    if (recording.demo_path) fs.unlink(recording.demo_path, () => {});
    deleteBooking();
  });
});

module.exports = router;
