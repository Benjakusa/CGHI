const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const now = () => new Date().toISOString();

function parseJSON(val) {
  try { return JSON.parse(val || '[]'); } catch { return []; }
}

async function loadRoles(jobId) {
  const rows = await db.all(
    `SELECT id, title, location, description, qualifications, preferred_experience, sort_order
     FROM job_roles WHERE job_id = $1 ORDER BY sort_order, id`,
    [jobId],
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    location: r.location || '',
    description: r.description || '',
    qualifications: parseJSON(r.qualifications),
    preferred_experience: parseJSON(r.preferred_experience),
  }));
}

async function enrich(job) {
  const roles = await loadRoles(job.id);
  return {
    id: job.id,
    department: job.department || '',
    employment_type: job.employment_type || '',
    apply_email: job.apply_email || '',
    apply_subject: job.apply_subject || '',
    closing_date: job.closing_date,
    document_url: job.document_url || '',
    instructions: job.instructions || '',
    published: job.published,
    created_at: job.created_at,
    updated_at: job.updated_at,
    title: job.title,
    roles,
  };
}

function validateRoles(roles) {
  if (!Array.isArray(roles) || roles.length === 0) {
    return 'At least one role is required.';
  }
  for (let i = 0; i < roles.length; i++) {
    const r = roles[i];
    if (!r || typeof r.title !== 'string' || !r.title.trim()) {
      return `Role ${i + 1}: title is required.`;
    }
  }
  return null;
}

async function replaceRoles(client, jobId, roles) {
  await client.query('DELETE FROM job_roles WHERE job_id = $1', [jobId]);
  for (let i = 0; i < roles.length; i++) {
    const r = roles[i];
    await client.query(
      `INSERT INTO job_roles (job_id, title, location, description, qualifications, preferred_experience, sort_order, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        jobId,
        r.title.trim(),
        r.location || '',
        r.description || '',
        JSON.stringify(Array.isArray(r.qualifications) ? r.qualifications : []),
        JSON.stringify(Array.isArray(r.preferred_experience) ? r.preferred_experience : []),
        i,
        now(),
      ],
    );
  }
}

/* -------- Public list -------- */
router.get('/', async (req, res, next) => {
  try {
    const jobs = await db.all('SELECT * FROM jobs WHERE published=1 ORDER BY id DESC');
    const out = [];
    for (const j of jobs) out.push(await enrich(j));
    res.json(out);
  } catch (e) { next(e); }
});

/* -------- Admin list -------- */
router.get('/admin', auth, async (req, res, next) => {
  try {
    const jobs = await db.all('SELECT * FROM jobs ORDER BY id DESC');
    const out = [];
    for (const j of jobs) out.push(await enrich(j));
    res.json(out);
  } catch (e) { next(e); }
});

/* -------- Admin: single -------- */
router.get('/admin/:id', auth, async (req, res, next) => {
  try {
    const job = await db.get('SELECT * FROM jobs WHERE id=$1', [req.params.id]);
    if (!job) return res.status(404).json({ error: 'Not found.' });
    res.json(await enrich(job));
  } catch (e) { next(e); }
});

/* -------- Public: single advert -------- */
router.get('/:id', async (req, res, next) => {
  try {
    const job = await db.get('SELECT * FROM jobs WHERE id=$1 AND published=1', [req.params.id]);
    if (!job) return res.status(404).json({ error: 'Not found.' });
    res.json(await enrich(job));
  } catch (e) { next(e); }
});

/* -------- Create -------- */
router.post('/admin', auth, async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const b = req.body || {};
    const roles = Array.isArray(b.roles) ? b.roles : [];
    const err = validateRoles(roles);
    if (err) { client.release(); return res.status(400).json({ error: err }); }

    // A single-role advert takes its title from the role. A multi-role advert
    // must supply its own advert title, because no single role names it.
    const advertTitle = (b.title && String(b.title).trim())
      || (roles.length === 1 ? roles[0].title.trim() : '');
    if (!advertTitle) { client.release(); return res.status(400).json({ error: 'Advert title is required when there is more than one role.' }); }

    await client.query('BEGIN');
    const inserted = await client.query(
      `INSERT INTO jobs (title, department, location, employment_type, description,
                         qualifications, preferred_experience, apply_email, apply_subject,
                         closing_date, document_url, published, instructions, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
      [
        advertTitle,
        b.department || '',
        roles[0].location || '',
        b.employment_type || '',
        roles[0].description || '',
        JSON.stringify(Array.isArray(roles[0].qualifications) ? roles[0].qualifications : []),
        JSON.stringify(Array.isArray(roles[0].preferred_experience) ? roles[0].preferred_experience : []),
        b.apply_email || '',
        b.apply_subject || '',
        b.closing_date || null,
        b.document_url || '',
        b.published ? 1 : 0,
        b.instructions || '',
        now(),
      ],
    );
    const id = inserted.rows[0].id;
    await replaceRoles(client, id, roles);
    await client.query('COMMIT');
    const created = await db.get('SELECT * FROM jobs WHERE id=$1', [id]);
    res.status(201).json(await enrich(created));
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch {}
    client.release();
    next(e);
    return;
  }
  client.release();
});

/* -------- Update -------- */
router.put('/admin/:id', auth, async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const id = req.params.id;
    const existing = await db.get('SELECT id FROM jobs WHERE id=$1', [id]);
    if (!existing) { client.release(); return res.status(404).json({ error: 'Not found.' }); }

    const b = req.body || {};
    const roles = Array.isArray(b.roles) ? b.roles : [];
    const err = validateRoles(roles);
    if (err) { client.release(); return res.status(400).json({ error: err }); }

    const advertTitle = (b.title && String(b.title).trim())
      || (roles.length === 1 ? roles[0].title.trim() : '');
    if (!advertTitle) { client.release(); return res.status(400).json({ error: 'Advert title is required when there is more than one role.' }); }

    await client.query('BEGIN');
    await client.query(
      `UPDATE jobs SET title=$1, department=$2, location=$3, employment_type=$4,
                       description=$5, qualifications=$6, preferred_experience=$7,
                       apply_email=$8, apply_subject=$9, closing_date=$10,
                       document_url=$11, published=$12, instructions=$13, updated_at=$14 WHERE id=$15`,
      [
        advertTitle,
        b.department || '',
        roles[0].location || '',
        b.employment_type || '',
        roles[0].description || '',
        JSON.stringify(Array.isArray(roles[0].qualifications) ? roles[0].qualifications : []),
        JSON.stringify(Array.isArray(roles[0].preferred_experience) ? roles[0].preferred_experience : []),
        b.apply_email || '',
        b.apply_subject || '',
        b.closing_date || null,
        b.document_url || '',
        b.published ? 1 : 0,
        b.instructions || '',
        now(),
        id,
      ],
    );
    await replaceRoles(client, id, roles);
    await client.query('COMMIT');
    const updated = await db.get('SELECT * FROM jobs WHERE id=$1', [id]);
    res.json(await enrich(updated));
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch {}
    client.release();
    next(e);
    return;
  }
  client.release();
});

/* -------- Publish toggle -------- */
router.patch('/admin/:id/publish', auth, async (req, res, next) => {
  try {
    const item = await db.get('SELECT published FROM jobs WHERE id=$1', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Not found.' });
    await db.run('UPDATE jobs SET published=$1, updated_at=$2 WHERE id=$3',
      [item.published ? 0 : 1, now(), req.params.id]);
    res.json({ published: !item.published });
  } catch (e) { next(e); }
});

/* -------- Delete -------- */
router.delete('/admin/:id', auth, async (req, res, next) => {
  try {
    const r = await db.run('DELETE FROM jobs WHERE id=$1', [req.params.id]);
    if (r.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
