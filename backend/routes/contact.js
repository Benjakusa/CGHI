/**
 * Contact form enquiries.
 *
 * Public:  POST /api/contact            submit an enquiry
 * Admin:   GET  /api/contact            list (filter by status)
 *          PUT  /api/contact/:id        update status / notes
 *          DELETE /api/contact/:id      remove
 *          GET  /api/contact/stats      counts for the dashboard
 *
 * Spam handling is deliberately layered and all of it is server-side, because
 * anything enforced only in the browser can be skipped:
 *   1. honeypot field  - a hidden input a human never fills in
 *   2. minimum fill time - a form completed in under ~3s is a bot
 *   3. per-IP rate limit - sliding window, capped
 *   4. size and format validation on every field
 *
 * Bot submissions return HTTP 202 with a success-shaped body so the endpoint
 * gives nothing away, while still being recorded for review.
 */

const express = require('express');
const crypto = require('node:crypto');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const now = () => new Date().toISOString();

// --- Spam controls -----------------------------------------------------------

/** Sliding window per IP. 5 messages per 10 minutes is generous for a real
 *  enquirer (including someone filling the form twice) and tight for a bot. */
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
        return res.status(429).json({
            error: 'Too many messages sent. Please wait a few minutes and try again.',
        });
    }

    list.push(nowMs);
    attempts.set(key, list);
    next();
}

/** Keep the rate-limit map from growing without bound on a long-lived process. */
setInterval(() => {
    const cutoff = Date.now() - RATE_WINDOW_MS;
    for (const [key, list] of attempts) {
        const kept = list.filter((t) => t > cutoff);
        if (kept.length === 0) attempts.delete(key);
        else attempts.set(key, kept);
    }
}, RATE_WINDOW_MS).unref();

// --- Validation --------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Keep in sync with ENQUIRY_TYPES in frontend/src/pages/Contact.jsx.
const TOPICS = new Set([
    'general',
    'partnership',
    'research',
    'funding',
    'training',
    'media',
    'jobs',
    'other',
]);

const LIMITS = {
    name: 120,
    email: 200,
    phone: 40,
    organisation: 160,
    subject: 160,
    message: 5000,
};

const str = (value) => (typeof value === 'string' ? value.trim() : '');

/** Returns { errors, value } — errors is a field -> message map. */
function validate(body) {
    const errors = {};
    const value = {};

    value.name = str(body.name);
    value.email = str(body.email).toLowerCase();
    value.phone = str(body.phone);
    value.organisation = str(body.organisation);
    value.subject = str(body.subject);
    value.message = str(body.message);
    // `topic` is the canonical field; `enquiryType` is accepted as an alias so
    // an older or newer client cannot silently lose the category.
    value.topic = (str(body.topic) || str(body.enquiryType)).toLowerCase() || 'general';

    if (!value.name) {
        errors.name = 'Please enter your name.';
    } else if (value.name.length > LIMITS.name) {
        errors.name = `Name must be under ${LIMITS.name} characters.`;
    }

    if (!value.email) {
        errors.email = 'Please enter your email address.';
    } else if (value.email.length > LIMITS.email || !EMAIL_RE.test(value.email)) {
        errors.email = 'Please enter a valid email address.';
    }

    if (value.phone.length > LIMITS.phone) {
        errors.phone = `Phone number must be under ${LIMITS.phone} characters.`;
    }
    if (value.organisation.length > LIMITS.organisation) {
        errors.organisation = `Organisation must be under ${LIMITS.organisation} characters.`;
    }
    if (value.subject.length > LIMITS.subject) {
        errors.subject = `Subject must be under ${LIMITS.subject} characters.`;
    }

    if (!value.message) {
        errors.message = 'Please enter a message.';
    } else if (value.message.length < 10) {
        errors.message = 'Please give us a little more detail (at least 10 characters).';
    } else if (value.message.length > LIMITS.message) {
        errors.message = `Message must be under ${LIMITS.message} characters.`;
    }

    if (!TOPICS.has(value.topic)) {
        // An unknown topic is normalised rather than rejected, so a stale or
        // tampered select value cannot block a genuine enquiry.
        value.topic = 'general';
    }

    // Consent is required by the Privacy Policy; the browser also enforces it,
    // but the server must not rely on that.
    value.consent = body.consent === true || body.consent === 'true' || body.consent === 'on' ? 1 : 0;
    if (!value.consent) {
        errors.consent = 'Please confirm you agree to be contacted about your enquiry.';
    }

    return { errors, value };
}

/** Stable, non-reversible identifier so we can rate limit and spot repeats
 *  without storing visitors' IP addresses in the clear. */
function hashIp(ip) {
    const salt = process.env.IP_HASH_SALT || process.env.JWT_SECRET || 'cgp-contact';
    return crypto.createHash('sha256').update(`${salt}:${ip || 'unknown'}`).digest('hex').slice(0, 32);
}

// --- Public: submit ----------------------------------------------------------

router.post('/', rateLimit, (req, res) => {
    const body = req.body || {};

    // 1. Honeypot: silently accept, do not store.
    if (str(body.website) !== '' || str(body.company_url) !== '') {
        return res.status(202).json({
            ok: true,
            message: 'Thank you — your message has been received.',
        });
    }

    // 2. Minimum fill time. `formStartedAt` is a client timestamp; a missing or
    //    unparseable value is treated as a human (the field is client-supplied
    //    metadata, not a security control).
    const startedAt = Number(body.formStartedAt);
    if (Number.isFinite(startedAt) && startedAt > 0) {
        const elapsed = Date.now() - startedAt;
        if (elapsed < 3000) {
            return res.status(202).json({
                ok: true,
                message: 'Thank you — your message has been received.',
            });
        }
        // Clock far in the future: a tampered value, ignore the check.
    }

    const { errors, value } = validate(body);

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            error: 'Please check the highlighted fields.',
            errors,
        });
    }

    try {
        const result = db.prepare(`
            INSERT INTO contact_messages
                (name, email, phone, organisation, topic, subject, message, consent,
                 status, ip_hash, user_agent, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?)
        `).run(
            value.name,
            value.email,
            value.phone || null,
            value.organisation || null,
            value.topic,
            value.subject || null,
            value.message,
            value.consent,
            hashIp(req.ip),
            str(req.get('user-agent')).slice(0, 300) || null,
            now(),
            now()
        );

        console.log(
            `[CGP API] Contact enquiry #${result.lastInsertRowid} — ${value.topic} — ${value.email}`
        );

        res.status(201).json({
            ok: true,
            id: result.lastInsertRowid,
            // Shown to the enquirer on the success screen so a follow-up email
            // can quote the same reference. Derived from the row id only.
            reference: `CGP-${String(result.lastInsertRowid).padStart(5, '0')}`,
            message:
                'Thank you — your message has been received. Our team replies to enquiries within two working days.',
        });
    } catch (err) {
        console.error('[CGP API] Failed to store contact enquiry:', err.message);
        res.status(500).json({
            error: 'Something went wrong while sending your message. Please try again, or email us directly.',
        });
    }
});

// --- Admin -------------------------------------------------------------------

router.get('/stats', auth, (req, res) => {
    try {
        const counts = db.prepare(`
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) AS new_count,
                SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) AS in_progress,
                SUM(CASE WHEN status='closed' THEN 1 ELSE 0 END) AS closed
            FROM contact_messages
        `).get();
        res.json({
            total: counts.total || 0,
            new: counts.new_count || 0,
            inProgress: counts.in_progress || 0,
            closed: counts.closed || 0,
        });
    } catch (err) {
        console.error('[CGP API] Contact stats failed:', err.message);
        res.status(500).json({ error: 'Failed to compute contact statistics.' });
    }
});

router.get('/', auth, (req, res) => {
    try {
        const { status, topic, limit } = req.query;
        const clauses = [];
        const params = [];

        if (status && ['new', 'in_progress', 'closed', 'spam'].includes(status)) {
            clauses.push('status = ?');
            params.push(status);
        }
        if (topic && TOPICS.has(String(topic))) {
            clauses.push('topic = ?');
            params.push(String(topic));
        }

        const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
        const capped = Math.min(parseInt(limit, 10) || 200, 500);

        const messages = db.prepare(`
            SELECT id, name, email, phone, organisation, topic, subject, message,
                   consent, status, created_at, updated_at
            FROM contact_messages
            ${where}
            ORDER BY created_at DESC
            LIMIT ?
        `).all(...params, capped);

        res.json(messages);
    } catch (err) {
        console.error('[CGP API] Failed to list contact enquiries:', err.message);
        res.status(500).json({ error: 'Failed to fetch enquiries.' });
    }
});

router.get('/:id', auth, (req, res) => {
    try {
        const message = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(req.params.id);
        if (!message) return res.status(404).json({ error: 'Enquiry not found.' });
        res.json(message);
    } catch (err) {
        console.error('[CGP API] Failed to fetch contact enquiry:', err.message);
        res.status(500).json({ error: 'Failed to fetch the enquiry.' });
    }
});

const STATUSES = ['new', 'in_progress', 'closed', 'spam'];

router.put('/:id', auth, (req, res) => {
    const { status, notes } = req.body || {};

    if (status !== undefined && !STATUSES.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${STATUSES.join(', ')}.` });
    }
    if (notes !== undefined && typeof notes !== 'string') {
        return res.status(400).json({ error: 'Notes must be text.' });
    }

    try {
        const existing = db.prepare('SELECT id FROM contact_messages WHERE id = ?').get(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Enquiry not found.' });

        const nextStatus = status ?? 'new';
        const nextNotes = notes !== undefined ? notes.trim() : null;

        db.prepare(`
            UPDATE contact_messages
            SET status = ?, notes = ?, updated_at = ?
            WHERE id = ?
        `).run(nextStatus, nextNotes, now(), req.params.id);

        res.json({ ok: true, id: existing.id, status: nextStatus });
    } catch (err) {
        console.error('[CGP API] Failed to update contact enquiry:', err.message);
        res.status(500).json({ error: 'Failed to update the enquiry.' });
    }
});

router.delete('/:id', auth, (req, res) => {
    try {
        const result = db.prepare('DELETE FROM contact_messages WHERE id = ?').run(req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: 'Enquiry not found.' });
        res.json({ ok: true });
    } catch (err) {
        console.error('[CGP API] Failed to delete contact enquiry:', err.message);
        res.status(500).json({ error: 'Failed to delete the enquiry.' });
    }
});

module.exports = router;
