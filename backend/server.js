const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

// Startup sanity check — makes a missing .env obvious in the logs
// instead of turning into silent 401s on every authenticated request.
if (!process.env.JWT_SECRET) {
    console.error(
        '[CGHI API] WARNING: JWT_SECRET is not set. ' +
        `Looked for .env at ${path.join(__dirname, '.env')}. ` +
        'Authenticated endpoints will refuse requests until this is fixed.'
    );
}

const app = express();
const PORT = process.env.PORT || 4000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`[CGHI API] Created uploads directory: ${uploadsDir}`);
}

// ── CORS ────────────────────────────────────────────────────────────────
// Allow the common Vite / React dev origins, plus LAN access so you can
// test from a phone on the same network. Requests with no Origin header
// (curl, Postman, server-to-server) are always allowed.
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
];

const corsOptions = {
    origin(origin, callback) {
        // No origin (curl / same-origin / server-to-server) → allow
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        // Allow LAN IPs on the usual dev ports, e.g. http://192.168.1.20:5173
        if (/^http:\/\/(\d{1,3}\.){3}\d{1,3}:(5173|3000|8080)$/.test(origin)) {
            return callback(null, true);
        }
        console.warn(`[CGHI API] CORS blocked origin: ${origin}`);
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Serve uploaded images from public/uploads
app.use('/uploads', express.static(uploadsDir));

// ── MULTER CONFIG FOR FILE UPLOADS ─────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|svg|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpg, png, gif, webp, svg) and PDFs are allowed'));
    }
});

// Auth middleware (required for upload endpoint)
const authMiddleware = require('./middleware/auth');

// Hoist the db handle — routes already require it, so this is a no-op
// after the first load, but it makes the stats handler synchronous and
// avoids any "require inside request handler" surprises.
const db = require('./db');

// ── UPLOAD ENDPOINT ─────────────────────────────────────────────────────
app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Also handle 'file' field name (for careers/documents)
app.post('/api/upload/file', authMiddleware, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// ── ROUTES ──────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/heroes', require('./routes/heroes'));
app.use('/api/news', require('./routes/news'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/jobs', require('./routes/jobs'));

// Admin stats (overview)
app.get('/api/admin/stats', authMiddleware, (req, res) => {
    const stat = (table) => {
        try {
            const total = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get().c;
            const published = db.prepare(`SELECT COUNT(*) as c FROM ${table} WHERE published=1`).get().c;
            return { total, published, unpublished: total - published };
        } catch (err) {
            console.error(`[CGHI API] Error getting stats for ${table}:`, err.message);
            return { total: 0, published: 0, unpublished: 0 };
        }
    };

    try {
        const payload = {
            heroes: stat('heroes'),
            news: stat('news'),
            partners: stat('partners'),
            jobs: stat('jobs')
        };
        res.json(payload);
    } catch (err) {
        console.error('[CGHI API] /api/admin/stats failed:', err);
        res.status(500).json({ error: 'Failed to compute dashboard statistics.' });
    }
});

// ── ERROR HANDLING ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('[CGHI API] Error:', err.message);
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum 5MB.' });
        }
        return res.status(400).json({ error: err.message });
    }
    // Multer fileFilter rejections
    if (err && /Only images/.test(err.message)) {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── START SERVER ────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`[CGHI API] Running on http://localhost:${PORT}`);
    console.log(`[CGHI API] Uploads served from ${uploadsDir}`);
    console.log(`[CGHI API] CORS allowed origins: ${ALLOWED_ORIGINS.join(', ')} + LAN IPs on :5173/:3000/:8080`);
});