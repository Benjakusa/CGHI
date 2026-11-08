const express = require('express');
const crypto = require('node:crypto');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const now = () => new Date().toISOString();

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const attempts = new Map();

function rateLimit(req, res, next) {
  const nowMs = Date.now();
  const key = req.ip || 'unknown';
  const list = (attempts.get(key) || []).filter((t) => nowMs - t < RATE_WINDOW_MS);
  if (list.length >= RATE_MAX) {
    const retryAfter = Math.ceil((RATE_WINDOW_MS - (nowMs - list[0])) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({ error: 'Too many messages sent. Please wait a few minutes and try again.' });
  }
  list.push(nowMs);
  attempts.set(key, list);
  next();
}

setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  for (const [key, list] of attempts) {
    const kept = list.filter((t) => t > cutoff);
    if (kept.length === 0) attempts.delete(key);
    else attempts.set(key, kept);
  }
}, RATE_WINDOW_MS).unref();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOPICS = new Set(['general','partnership','research','funding','training','media','jobs','other']);
const LIMITS = { name: 120, email: 200, phone: 40, organisation: 160, subject: 160, message: 5000 };
const str = (value) => (typeof value === 'string' ? value.trim() : '');

function validate(body) {
  const errors = {};
  const value = {};
  value.name = str(body.name);
  value.email = str(body.email).toLowerCase();
  value.phone = str(body.phone);
  value.organisation = str(body.organisation);
  value.subject = str(body.subject);
  value.message = str(body.message);
  value.topic = (str(body.topic) || str(body.enquiryType)).toLowerCase() || 'general';

  if (!value.name) errors.name = 'Please enter your name.';
  else if (value.name.length > LIMITS.name) errors.name = `Name must be under ${LIMITS.name} characters.`;
  if (!value.email) errors.email = 'Please enter your email address.';
  else if (value.email.length > LIMITS.email || !EMAIL_RE.test(value.email)) errors.email = 'Please enter a valid email address.';
  if (value.phone.length > LIMITS.phone) errors.phone = `Phone number must be under ${LIMITS.phone} characters.`;
  if (value.organisation.length > LIMITS.organisation) errors.organisation = `Organisation must be under ${LIMITS.organisation} characters.`;
  if (value.subject.length > LIMITS.subject) errors.subject = `Subject must be under ${LIMITS.subject} characters.`;
  if (!value.message) errors.message = 'Please enter a message.';
  else if (value.message.length < 10) errors.message = 'Please give us a little more detail (at least 10 characters).';
  else if (value.message.length > LIMITS.message) errors.message = `Message must be under ${LIMITS.message} characters.`;
  if (!TOPICS.has(value.topic)) value.topic = 'general';
  value.consent = body.consent === true || body.consent === 'true' || body.consent === 'on' ? 1 : 0;
  if (!value.consent) errors.consent = 'Please confirm you agree to be contacted about your enquiry.';
  return { errors, value };
}

function hashIp(ip) {
  const salt = process.env.IP_HASH_SALT || process.env.JWT_SECRET || 'cghpi-contact';
  return crypto.createHash('sha256').update(`${salt}:${ip || 'unknown'}`).digest('hex').slice(0, 32);
}

router.post('/', rateLimit, async (req, res, next) => {
  try {
    const body = req.body || {};
    if (str(body.website) !== '' || str(body.company_url) !== '') {
      return res.status(202).json({ ok: true, message: 'Thank you — your message has been received.' });
    }
    const startedAt = Number(body.formStartedAt);
    if (Number.isFinite(startedAt) && startedAt > 0) {
      const elapsed = Date.now() - startedAt;
      if (elapsed < 3000) return res.status(202).json({ ok: true, message: 'Thank you — your message has been received.' });
    }
    const { errors, value } = validate(body);
    if (Object.keys(errors).length > 0) return res.status(400).json({ error: 'Please check the highlighted fields.', errors });

    const row = await db.get(
      `INSERT INTO contact_messages
         (name, email, phone, organisation, topic, subject, message, consent,
          status, ip_hash, user_agent, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'new',$9,$10,$11,$12) RETURNING id`,
      [value.name, value.email, value.phone || null, value.organisation || null, value.topic,
       value.subject || null, value.message, value.consent,
       hashIp(req.ip), str(req.get('user-agent')).slice(0, 300) || null, now(), now()],
    );
    console.log(`[CGHPI API] Contact enquiry #${row.id} — ${value.topic} — ${value.email}`);
    res.status(201).json({
      ok: true,
      id: row.id,
      reference: `CGHPI-${String(row.id).padStart(5, '0')}`,
      message: 'Thank you — your message has been received. Our team replies to enquiries within two working days.',
    });
  } catch (err) {
    console.error('[CGHPI API] Failed to store contact enquiry:', err.message);
    res.status(500).json({ error: 'Something went wrong while sending your message. Please try again, or email us directly.' });
  }
});

router.get('/stats', auth, async (req, res, next) => {
  try {
    const counts = await db.get(`
      SELECT
        COUNT(*)::int AS total,
        COALESCE(SUM(CASE WHEN status='new' THEN 1 ELSE 0 END),0)::int AS new_count,
        COALESCE(SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END),0)::int AS in_progress,
        COALESCE(SUM(CASE WHEN status='closed' THEN 1 ELSE 0 END),0)::int AS closed
      FROM contact_messages
    `);
    res.json({ total: counts.total, new: counts.new_count, inProgress: counts.in_progress, closed: counts.closed });
  } catch (err) {
    console.error('[CGHPI API] Contact stats failed:', err.message);
    res.status(500).json({ error: 'Failed to compute contact statistics.' });
  }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const { status, topic, limit } = req.query;
    const clauses = [];
    const params = [];
    if (status && ['new','in_progress','closed','spam'].includes(status)) { params.push(status); clauses.push(`status = $${params.length}`); }
    if (topic && TOPICS.has(String(topic))) { params.push(String(topic)); clauses.push(`topic = $${params.length}`); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const capped = Math.min(parseInt(limit, 10) || 200, 500);
    params.push(capped);
    const messages = await db.all(`
      SELECT id, name, email, phone, organisation, topic, subject, message,
             consent, status, created_at, updated_at
      FROM contact_messages
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length}
    `, params);
    res.json(messages);
  } catch (err) {
    console.error('[CGHPI API] Failed to list contact enquiries:', err.message);
    res.status(500).json({ error: 'Failed to fetch enquiries.' });
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const message = await db.get('SELECT * FROM contact_messages WHERE id = $1', [req.params.id]);
    if (!message) return res.status(404).json({ error: 'Enquiry not found.' });
    res.json(message);
  } catch (err) {
    console.error('[CGHPI API] Failed to fetch contact enquiry:', err.message);
    res.status(500).json({ error: 'Failed to fetch the enquiry.' });
  }
});

const STATUSES = ['new','in_progress','closed','spam'];

router.put('/:id', auth, async (req, res, next) => {
  try {
    const { status, notes } = req.body || {};
    if (status !== undefined && !STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${STATUSES.join(', ')}.` });
    }
    if (notes !== undefined && typeof notes !== 'string') {
      return res.status(400).json({ error: 'Notes must be text.' });
    }
    const existing = await db.get('SELECT id FROM contact_messages WHERE id = $1', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Enquiry not found.' });
    const nextStatus = status ?? 'new';
    const nextNotes = notes !== undefined ? notes.trim() : null;
    await db.run('UPDATE contact_messages SET status=$1, notes=$2, updated_at=$3 WHERE id=$4', [nextStatus, nextNotes, now(), req.params.id]);
    res.json({ ok: true, id: existing.id, status: nextStatus });
  } catch (err) {
    console.error('[CGHPI API] Failed to update contact enquiry:', err.message);
    res.status(500).json({ error: 'Failed to update the enquiry.' });
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const r = await db.run('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);
    if (r.changes === 0) return res.status(404).json({ error: 'Enquiry not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[CGHPI API] Failed to delete contact enquiry:', err.message);
    res.status(500).json({ error: 'Failed to delete the enquiry.' });
  }
});

module.exports = router;
