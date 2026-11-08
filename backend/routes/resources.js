const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const now = () => new Date().toISOString();

router.get('/', async (req, res, next) => {
  try {
    res.json(await db.all('SELECT * FROM resources WHERE published=1 ORDER BY id DESC'));
  } catch (e) { next(e); }
});

router.get('/admin', auth, async (req, res, next) => {
  try {
    res.json(await db.all('SELECT * FROM resources ORDER BY id DESC'));
  } catch (e) { next(e); }
});

router.post('/admin', auth, async (req, res, next) => {
  try {
    const { title, description, document_url, date, published } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const row = await db.get(
      `INSERT INTO resources (title,description,document_url,date,published,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [title, description || '', document_url || '', date || '', published ? 1 : 0, now()],
    );
    res.json({ id: row.id });
  } catch (e) { next(e); }
});

router.put('/admin/:id', auth, async (req, res, next) => {
  try {
    const { title, description, document_url, date, published } = req.body;
    const r = await db.run(
      `UPDATE resources SET title=$1,description=$2,document_url=$3,date=$4,published=$5,updated_at=$6 WHERE id=$7`,
      [title, description || '', document_url || '', date || '', published ? 1 : 0, now(), req.params.id],
    );
    if (r.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.patch('/admin/:id/publish', auth, async (req, res, next) => {
  try {
    const item = await db.get('SELECT published FROM resources WHERE id=$1', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Not found.' });
    await db.run('UPDATE resources SET published=$1, updated_at=$2 WHERE id=$3', [item.published ? 0 : 1, now(), req.params.id]);
    res.json({ published: !item.published });
  } catch (e) { next(e); }
});

router.delete('/admin/:id', auth, async (req, res, next) => {
  try {
    const r = await db.run('DELETE FROM resources WHERE id=$1', [req.params.id]);
    if (r.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
