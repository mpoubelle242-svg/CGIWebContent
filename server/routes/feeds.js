const express = require('express');
const Parser = require('rss-parser');
const { getDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const parser = new Parser({ timeout: 10000 });

// All routes require authentication
router.use(authMiddleware);

// GET /api/feeds - list all feeds for the user
router.get('/', (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM feeds WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ feeds: rows });
  });
});

// GET /api/feeds/:id/items - parse RSS feed and return items
router.get('/:id/items', (req, res) => {
  const db = getDb();
  db.get('SELECT * FROM feeds WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], async (err, feed) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!feed) return res.status(404).json({ error: 'Feed not found' });

    try {
      const parsed = await parser.parseURL(feed.url);
      const items = parsed.items.slice(0, 50).map((item) => ({
        title: item.title || 'No title',
        link: item.link || '',
        description: item.contentSnippet || item.content || '',
        pubDate: item.pubDate || item.isoDate || '',
        creator: item.creator || '',
      }));
      res.json({
        feedTitle: parsed.title || feed.title,
        feedDescription: parsed.description || feed.description,
        items,
      });
    } catch (parseErr) {
      res.status(400).json({ error: 'Failed to parse RSS feed: ' + parseErr.message });
    }
  });
});

// POST /api/feeds - add a new feed
router.post('/', async (req, res) => {
  const { url, title, description } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Feed URL is required' });
  }

  try {
    // Validate URL by attempting to parse
    const parsed = await parser.parseURL(url);
    const feedTitle = title || parsed.title || 'Untitled Feed';
    const feedDescription = description || parsed.description || '';

    const db = getDb();
    db.run(
      'INSERT INTO feeds (user_id, title, url, description) VALUES (?, ?, ?, ?)',
      [req.user.id, feedTitle, url, feedDescription],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Feed already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({
          message: 'Feed added successfully',
          feed: { id: this.lastID, title: feedTitle, url, description: feedDescription },
        });
      }
    );
  } catch (parseErr) {
    res.status(400).json({ error: 'Invalid RSS feed URL: ' + parseErr.message });
  }
});

// PUT /api/feeds/:id - update a feed
router.put('/:id', (req, res) => {
  const { title, description } = req.body;
  const db = getDb();

  db.run(
    'UPDATE feeds SET title = COALESCE(?, title), description = COALESCE(?, description) WHERE id = ? AND user_id = ?',
    [title, description, req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Feed not found' });
      res.json({ message: 'Feed updated successfully' });
    }
  );
});

// DELETE /api/feeds/:id - delete a feed
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.run('DELETE FROM feeds WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Feed not found' });
    res.json({ message: 'Feed deleted successfully' });
  });
});

module.exports = router;
