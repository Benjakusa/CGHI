const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const now = () => new Date().toISOString();

// Public
router.get('/', (req, res) => {
    const items = db.prepare('SELECT * FROM partners WHERE published=1 ORDER BY sort_order ASC, id ASC').all();
    res.json(items);
});

// Admin: all
router.get('/admin', auth, (req, res) => {
    const items = db.prepare('SELECT * FROM partners ORDER BY sort_order ASC, id ASC').all();
    res.json(items);
});

// Admin: create
router.post('/admin', auth, (req, res) => {
    const { name, logo_url, website, sort_order, published } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });
    const result = db.prepare(`
    INSERT INTO partners (name,logo_url,website,sort_order,published,updated_at)
    VALUES (?,?,?,?,?,?)
  `).run(name, logo_url || '', website || '', sort_order || 0, published ? 1 : 0, now());
    res.json({ id: result.lastInsertRowid });
});

// Admin: update
router.put('/admin/:id', auth, (req, res) => {
    const { name, logo_url, website, sort_order, published } = req.body;
    const result = db.prepare(`
    UPDATE partners SET name=?,logo_url=?,website=?,sort_order=?,published=?,updated_at=?
    WHERE id=?
  `).run(name, logo_url || '', website || '', sort_order || 0, published ? 1 : 0, now(), req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
});

// Admin: toggle publish
router.patch('/admin/:id/publish', auth, (req, res) => {
    const item = db.prepare('SELECT published FROM partners WHERE id=?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found.' });
    db.prepare('UPDATE partners SET published=?, updated_at=? WHERE id=?').run(item.published ? 0 : 1, now(), req.params.id);
    res.json({ published: !item.published });
});

// Admin: delete
router.delete('/admin/:id', auth, (req, res) => {
    const result = db.prepare('DELETE FROM partners WHERE id=?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
});

module.exports = router;
