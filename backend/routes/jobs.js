const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const now = () => new Date().toISOString();

function parseJSON(val) {
  try { return JSON.parse(val || '[]'); } catch { return []; }
}
function present(j) {
  return { ...j, qualifications: parseJSON(j.qualifications), preferred_experience: parseJSON(j.preferred_experience) };
}

router.get('/', async (req, res, next) => {
  try {
    const items = await db.all('SELECT * FROM jobs WHERE published=1 ORDER BY id DESC');
    res.json(items.map(present));
  } catch (e) { next(e); }
});

router.get('/admin', auth, async (req, res, next) => {
  try {
    const items = await db.all('SELECT * FROM jobs ORDER BY id DESC');
    res.json(items.map(present));
  } catch (e) { next(e); }
});

router.post('/admin', auth, async (req, res, next) => {
  try {
    const { title, department, location, employment_type, description, qualifications, preferred_experience, apply_email, apply_subject, closing_date, document_url, published } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const row = await db.get(
      `INSERT INTO jobs (title,department,location,employment_type,description,qualifications,preferred_experience,apply_email,apply_subject,closing_date,document_url,published,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
      [title, department || '', location || '', employment_type || '', description || '',
       JSON.stringify(qualifications || []), JSON.stringify(preferred_experience || []),
       apply_email || '', apply_subject || '', closing_date || '', document_url || '', published ? 1 : 0, now()],
    );
    res.json({ id: row.id });
  } catch (e) { next(e); }
});

router.put('/admin/:id', auth, async (req, res, next) => {
  try {
    const { title, department, location, employment_type, description, qualifications, preferred_experience, apply_email, apply_subject, closing_date, document_url, published } = req.body;
    const r = await db.run(
      `UPDATE jobs SET title=$1,department=$2,location=$3,employment_type=$4,description=$5,qualifications=$6,preferred_experience=$7,apply_email=$8,apply_subject=$9,closing_date=$10,document_url=$11,published=$12,updated_at=$13 WHERE id=$14`,
      [title, department || '', location || '', employment_type || '', description || '',
       JSON.stringify(qualifications || []), JSON.stringify(preferred_experience || []),
       apply_email || '', apply_subject || '', closing_date || '', document_url || '', published ? 1 : 0, now(), req.params.id],
    );
    if (r.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.patch('/admin/:id/publish', auth, async (req, res, next) => {
  try {
    const item = await db.get('SELECT published FROM jobs WHERE id=$1', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Not found.' });
    await db.run('UPDATE jobs SET published=$1, updated_at=$2 WHERE id=$3', [item.published ? 0 : 1, now(), req.params.id]);
    res.json({ published: !item.published });
  } catch (e) { next(e); }
});

router.delete('/admin/:id', auth, async (req, res, next) => {
  try {
    const r = await db.run('DELETE FROM jobs WHERE id=$1', [req.params.id]);
    if (r.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
