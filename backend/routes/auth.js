const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
    // Guard: never sign with an undefined secret. jsonwebtoken will
    // silently coerce undefined to the literal string "undefined" as
    // the HMAC key, producing tokens that can never be verified by a
    // process that has the real secret loaded.
    if (!process.env.JWT_SECRET) {
        console.error('[CGHI auth] Login attempted but JWT_SECRET is not set.');
        return res.status(500).json({ error: 'Server misconfigured: JWT_SECRET is not set.' });
    }

    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = db
        .prepare('SELECT * FROM admins WHERE email = ?')
        .get(String(email).toLowerCase().trim());

    if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = bcrypt.compareSync(password, admin.password_hash);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
        { id: admin.id, email: admin.email, name: admin.name },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    res.json({
        token,
        admin: { id: admin.id, email: admin.email, name: admin.name }
    });
});

module.exports = router;