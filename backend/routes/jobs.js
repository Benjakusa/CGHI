const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const now = () => new Date().toISOString();

// Public
router.get('/', (req, res) => {
    const items = db.prepare('SELECT * FROM jobs WHERE published=1 ORDER BY id DESC').all();
    res.json(items.map(j => ({
        ...j,
        qualifications: parseJSON(j.qualifications),
        preferred_experience: parseJSON(j.preferred_experience)
    })));
});

// Admin: all
router.get('/admin', auth, (req, res) => {
    const items = db.prepare('SELECT * FROM jobs ORDER BY id DESC').all();
    res.json(items.map(j => ({
        ...j,
        qualifications: parseJSON(j.qualifications),
        preferred_experience: parseJSON(j.preferred_experience)
    })));
});

// Admin: create
router.post('/admin', auth, (req, res) => {
    const { title, department, location, employment_type, description, qualifications, preferred_experience, apply_email, apply_subject, closing_date, document_url, published } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const result = db.prepare(`
    INSERT INTO jobs (title,department,location,employment_type,description,qualifications,preferred_experience,apply_email,apply_subject,closing_date,document_url,published,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
        title, department || '', location || '', employment_type || '', description || '',
        JSON.stringify(qualifications || []), JSON.stringify(preferred_experience || []),
        apply_email || '', apply_subject || '', closing_date || '', document_url || '', published ? 1 : 0, now()
    );
    res.json({ id: result.lastInsertRowid });
});

// Admin: update
router.put('/admin/:id', auth, (req, res) => {
    const { title, department, location, employment_type, description, qualifications, preferred_experience, apply_email, apply_subject, closing_date, document_url, published } = req.body;
    const result = db.prepare(`
    UPDATE jobs SET title=?,department=?,location=?,employment_type=?,description=?,qualifications=?,preferred_experience=?,apply_email=?,apply_subject=?,closing_date=?,document_url=?,published=?,updated_at=?
    WHERE id=?
  `).run(
        title, department || '', location || '', employment_type || '', description || '',
        JSON.stringify(qualifications || []), JSON.stringify(preferred_experience || []),
        apply_email || '', apply_subject || '', closing_date || '', document_url || '', published ? 1 : 0, now(), req.params.id
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
});

// Admin: toggle publish
router.patch('/admin/:id/publish', auth, (req, res) => {
    const item = db.prepare('SELECT published FROM jobs WHERE id=?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found.' });
    db.prepare('UPDATE jobs SET published=?, updated_at=? WHERE id=?').run(item.published ? 0 : 1, now(), req.params.id);
    res.json({ published: !item.published });
});

// Admin: delete
router.delete('/admin/:id', auth, (req, res) => {
    const result = db.prepare('DELETE FROM jobs WHERE id=?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
});

function parseJSON(val) {
    try { return JSON.parse(val || '[]'); } catch { return []; }
}

module.exports = router;
