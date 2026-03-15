const express = require('express');
const { getDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/favorites - list all favorites for the user
router.get('/', (req, res) => {
  const db = getDb();
  db.all(
    `SELECT f.*, fe.title as feed_title, fe.url as feed_url 
     FROM favorites f 
     JOIN feeds fe ON f.feed_id = fe.id 
     WHERE f.user_id = ? 
     ORDER BY f.created_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ favorites: rows });
    }
  );
});

// POST /api/favorites - add a favorite
router.post('/', (req, res) => {
  const { feed_id, title, link, description, pub_date } = req.body;

  if (!feed_id || !title || !link) {
    return res.status(400).json({ error: 'feed_id, title, and link are required' });
  }

  const db = getDb();
  // Verify feed belongs to user
  db.get('SELECT id FROM feeds WHERE id = ? AND user_id = ?', [feed_id, req.user.id], (err, feed) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!feed) return res.status(404).json({ error: 'Feed not found' });

    db.run(
      'INSERT INTO favorites (user_id, feed_id, title, link, description, pub_date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, feed_id, title, link, description || '', pub_date || ''],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Article already in favorites' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({
          message: 'Added to favorites',
          favorite: { id: this.lastID, feed_id, title, link, description, pub_date },
        });
      }
    );
  });
});

// DELETE /api/favorites/:id - remove a favorite
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.run('DELETE FROM favorites WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Favorite not found' });
    res.json({ message: 'Removed from favorites' });
  });
});

// DELETE /api/favorites/by-link - remove by link (for convenience)
router.delete('/by-link/:feed_id/:encodedLink', (req, res) => {
  const link = decodeURIComponent(req.params.encodedLink);
  const db = getDb();
  db.run(
    'DELETE FROM favorites WHERE feed_id = ? AND link = ? AND user_id = ?',
    [req.params.feed_id, link, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Favorite not found' });
      res.json({ message: 'Removed from favorites' });
    }
  );
});

module.exports = router;
