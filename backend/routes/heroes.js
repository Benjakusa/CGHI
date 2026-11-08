const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const now = () => new Date().toISOString();

router.get('/', async (req, res, next) => {
  try {
    res.json(await db.all('SELECT * FROM heroes WHERE published=1 ORDER BY sort_order ASC, id ASC'));
  } catch (e) { next(e); }
});

router.get('/admin', auth, async (req, res, next) => {
  try {
    res.json(await db.all('SELECT * FROM heroes ORDER BY sort_order ASC, id ASC'));
  } catch (e) { next(e); }
});

router.post('/admin', auth, async (req, res, next) => {
  try {
    const { title, topic, description, btn1_text, btn1_link, btn2_text, btn2_link, image_url, sort_order, published } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const row = await db.get(
      `INSERT INTO heroes (title,topic,description,btn1_text,btn1_link,btn2_text,btn2_link,image_url,sort_order,published,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [title, topic || '', description || '', btn1_text || '', btn1_link || '', btn2_text || '', btn2_link || '', image_url || '', sort_order || 0, published ? 1 : 0, now()],
    );
    res.json({ id: row.id });
  } catch (e) { next(e); }
});

router.put('/admin/:id', auth, async (req, res, next) => {
  try {
    const { title, topic, description, btn1_text, btn1_link, btn2_text, btn2_link, image_url, sort_order, published } = req.body;
    const r = await db.run(
      `UPDATE heroes SET title=$1,topic=$2,description=$3,btn1_text=$4,btn1_link=$5,btn2_text=$6,btn2_link=$7,image_url=$8,sort_order=$9,published=$10,updated_at=$11 WHERE id=$12`,
      [title, topic || '', description || '', btn1_text || '', btn1_link || '', btn2_text || '', btn2_link || '', image_url || '', sort_order || 0, published ? 1 : 0, now(), req.params.id],
    );
    if (r.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.patch('/admin/:id/publish', auth, async (req, res, next) => {
  try {
    const hero = await db.get('SELECT published FROM heroes WHERE id=$1', [req.params.id]);
    if (!hero) return res.status(404).json({ error: 'Not found.' });
    await db.run('UPDATE heroes SET published=$1, updated_at=$2 WHERE id=$3', [hero.published ? 0 : 1, now(), req.params.id]);
    res.json({ published: !hero.published });
  } catch (e) { next(e); }
});

router.delete('/admin/:id', auth, async (req, res, next) => {
  try {
    const r = await db.run('DELETE FROM heroes WHERE id=$1', [req.params.id]);
    if (r.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
