const jwt = require('jsonwebtoken');

// Fail fast and loudly if the secret is missing. Without this guard,
// jwt.verify throws with a generic message and the client only sees a
// bare 401 — which makes "token expired" indistinguishable from
// "JWT_SECRET was never loaded from .env".
if (!process.env.JWT_SECRET) {
    console.error(
        '[CGHI auth] FATAL: process.env.JWT_SECRET is not set. ' +
        'Make sure backend/.env exists and server.js calls dotenv before requiring routes.'
    );
} else {
    console.log(
        `[CGHI auth] JWT_SECRET loaded (length=${process.env.JWT_SECRET.length}).`
    );
}

module.exports = function authMiddleware(req, res, next) {
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            error: 'Server misconfigured: JWT_SECRET is not set.'
        });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized – no token provided' });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ error: 'Unauthorized – malformed token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        // Log enough to distinguish the three failure modes without ever
        // printing the secret itself:
        //   - "invalid signature"      → token signed with a different secret
        //   - "jwt malformed"          → token is not a real JWT
        //   - "jwt expired"            → token older than 8h
        console.warn(
            `[CGHI auth] Token verification failed (${err.name}: ${err.message}). ` +
            `Token length=${token.length}, prefix=${token.slice(0, 10)}…, ` +
            `secret length=${process.env.JWT_SECRET.length}.`
        );
        return res.status(401).json({ error: 'Unauthorized – invalid or expired token' });
    }
};