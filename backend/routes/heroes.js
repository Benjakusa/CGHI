const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const now = () => new Date().toISOString();

router.get('/', (req, res) => {
    const heroes = db.prepare('SELECT * FROM heroes WHERE published=1 ORDER BY sort_order ASC, id ASC').all();
    res.json(heroes);
});

router.get('/admin', auth, (req, res) => {
    const heroes = db.prepare('SELECT * FROM heroes ORDER BY sort_order ASC, id ASC').all();
    res.json(heroes);
});

router.post('/admin', auth, (req, res) => {
    const { title, topic, description, btn1_text, btn1_link, btn2_text, btn2_link, image_url, sort_order, published } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const result = db.prepare(`
    INSERT INTO heroes (title,topic,description,btn1_text,btn1_link,btn2_text,btn2_link,image_url,sort_order,published,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `).run(title, topic || '', description || '', btn1_text || '', btn1_link || '', btn2_text || '', btn2_link || '', image_url || '', sort_order || 0, published ? 1 : 0, now());
    res.json({ id: result.lastInsertRowid });
});

router.put('/admin/:id', auth, (req, res) => {
    const { title, topic, description, btn1_text, btn1_link, btn2_text, btn2_link, image_url, sort_order, published } = req.body;
    const result = db.prepare(`
    UPDATE heroes SET title=?,topic=?,description=?,btn1_text=?,btn1_link=?,btn2_text=?,btn2_link=?,image_url=?,sort_order=?,published=?,updated_at=?
    WHERE id=?
  `).run(title, topic || '', description || '', btn1_text || '', btn1_link || '', btn2_text || '', btn2_link || '', image_url || '', sort_order || 0, published ? 1 : 0, now(), req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
});

router.patch('/admin/:id/publish', auth, (req, res) => {
    const hero = db.prepare('SELECT published FROM heroes WHERE id=?').get(req.params.id);
    if (!hero) return res.status(404).json({ error: 'Not found.' });
    db.prepare('UPDATE heroes SET published=?, updated_at=? WHERE id=?').run(hero.published ? 0 : 1, now(), req.params.id);
    res.json({ published: !hero.published });
});

router.delete('/admin/:id', auth, (req, res) => {
    const result = db.prepare('DELETE FROM heroes WHERE id=?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
});

module.exports = router;
