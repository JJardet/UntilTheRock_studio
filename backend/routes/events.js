const express = require('express');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');
const { logger } = require('../logger');

const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM events ORDER BY is_pinned DESC, event_date ASC, created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(rows);
  });
});

router.post('/', authMiddleware, (req, res) => {
  const { title, event_date, end_date, location, excerpt, content, image_url, is_pinned } = req.body;
  if (!title || !event_date) return res.status(400).json({ error: 'Le titre et la date sont requis' });
  db.run(`INSERT INTO events (title, event_date, end_date, location, excerpt, content, image_url, is_pinned)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, event_date, end_date || null, location || '', excerpt || '', content || '', image_url || '', is_pinned ? 1 : 0],
    function(err) {
      if (err) return res.status(500).json({ error: 'Impossible de créer l’événement' });
      logger.admin('Création événement', req.admin.id, { eventId: this.lastID });
      res.status(201).json({ id: this.lastID, message: 'Événement créé' });
    });
});

router.put('/:id', authMiddleware, (req, res) => {
  const { title, event_date, end_date, location, excerpt, content, image_url, is_pinned } = req.body;
  if (!title || !event_date) return res.status(400).json({ error: 'Le titre et la date sont requis' });
  db.run(`UPDATE events SET title=?, event_date=?, end_date=?, location=?, excerpt=?, content=?, image_url=?, is_pinned=? WHERE id=?`,
    [title, event_date, end_date || null, location || '', excerpt || '', content || '', image_url || '', is_pinned ? 1 : 0, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Impossible de modifier l’événement' });
      res.json({ message: 'Événement mis à jour' });
    });
});

router.delete('/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM events WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Impossible de supprimer l’événement' });
    res.json({ message: 'Événement supprimé' });
  });
});

module.exports = router;
