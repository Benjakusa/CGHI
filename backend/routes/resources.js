const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const now = () => new Date().toISOString();

// Public
router.get('/', (req, res) => {
    const items = db.prepare('SELECT * FROM resources WHERE published=1 ORDER BY id DESC').all();
    res.json(items);
});

// Admin: all
router.get('/admin', auth, (req, res) => {
    const items = db.prepare('SELECT * FROM resources ORDER BY id DESC').all();
    res.json(items);
});

// Admin: create
router.post('/admin', auth, (req, res) => {
    const { title, description, document_url, date, published } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const result = db.prepare(`
    INSERT INTO resources (title,description,document_url,date,published,updated_at)
    VALUES (?,?,?,?,?,?)
  `).run(title, description || '', document_url || '', date || '', published ? 1 : 0, now());
    res.json({ id: result.lastInsertRowid });
});

// Admin: update
router.put('/admin/:id', auth, (req, res) => {
    const { title, description, document_url, date, published } = req.body;
    const result = db.prepare(`
    UPDATE resources SET title=?,description=?,document_url=?,date=?,published=?,updated_at=?
    WHERE id=?
  `).run(title, description || '', document_url || '', date || '', published ? 1 : 0, now(), req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
});

// Admin: toggle publish
router.patch('/admin/:id/publish', auth, (req, res) => {
    const item = db.prepare('SELECT published FROM resources WHERE id=?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found.' });
    db.prepare('UPDATE resources SET published=?, updated_at=? WHERE id=?').run(item.published ? 0 : 1, now(), req.params.id);
    res.json({ published: !item.published });
});

// Admin: delete
router.delete('/admin/:id', auth, (req, res) => {
    const result = db.prepare('DELETE FROM resources WHERE id=?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
});

module.exports = router;