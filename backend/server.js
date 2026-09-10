const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`[CGHI API] Created uploads directory: ${uploadsDir}`);
}

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080'],
    credentials: true
}));
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
    const db = require('./db');
    const stat = (table) => {
        try {
            const total = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get().c;
            const published = db.prepare(`SELECT COUNT(*) as c FROM ${table} WHERE published=1`).get().c;
            return { total, published, unpublished: total - published };
        } catch (err) {
            console.error(`Error getting stats for ${table}:`, err.message);
            return { total: 0, published: 0, unpublished: 0 };
        }
    };
    res.json({
        heroes: stat('heroes'),
        news: stat('news'),
        partners: stat('partners'),
        jobs: stat('jobs')
    });
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
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── START SERVER ────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`[CGHI API] Running on http://localhost:${PORT}`);
    console.log(`[CGHI API] Uploads served from ${uploadsDir}`);
});