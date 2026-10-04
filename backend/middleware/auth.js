const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
} else {
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
        return res.status(401).json({ error: 'Unauthorized – invalid or expired token' });
    }
};