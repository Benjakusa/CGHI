const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

if (!process.env.JWT_SECRET) {
    console.error(
        '[CGHI API] WARNING: JWT_SECRET is not set. ' +
        `Looked for .env at ${path.join(__dirname, '.env')}. ` +
        'Authenticated endpoints will refuse requests until this is fixed.'
    );
}

const app = express();
const PORT = process.env.PORT || 4000;

const uploadsDir = path.join(__dirname, 'data', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`[CGHI API] Created uploads directory: ${uploadsDir}`);
}

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        if (/^http:\/\/(\d{1,3}\.){3}\d{1,3}:(5173|3000|8080)$/.test(origin)) {
            return callback(null, true);
        }
        if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
            return callback(null, true);
        }
        console.warn(`[CGHI API] CORS blocked origin: ${origin}`);
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

app.use('/uploads', express.static(uploadsDir));

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
    limits: { fileSize: 5 * 1024 * 1024 },
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

const authMiddleware = require('./middleware/auth');
const db = require('./db');

app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

app.post('/api/upload/file', authMiddleware, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/heroes', require('./routes/heroes'));
app.use('/api/news', require('./routes/news'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/receipts', require('./routes/receipts'));

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
            jobs: stat('jobs'),
            resources: stat('resources')
        };
        res.json(payload);
    } catch (err) {
        console.error('[CGHI API] /api/admin/stats failed:', err);
        res.status(500).json({ error: 'Failed to compute dashboard statistics.' });
    }
});


// Job Applications
const applicationsDir = path.join(__dirname, 'data', 'uploads');
// Ensure the applications upload directory exists before multer writes to it
// (missing directory would crash/500 on Render's ephemeral filesystem).
if (!fs.existsSync(applicationsDir)) {
    fs.mkdirSync(applicationsDir, { recursive: true });
    console.log(`[CGHI API] Created applications directory: ${applicationsDir}`);
}

const jobApplicationsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, applicationsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const applicationsUpload = multer({
    storage: jobApplicationsStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) ||
            file.mimetype === 'application/msword' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.mimetype === 'application/pdf';
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only PDF, DOC, DOCX, and images are allowed'));
    }
});

// Create applications table
db.exec(`CREATE TABLE IF NOT EXISTS job_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    job_title TEXT NOT NULL,
    job_id INTEGER,
    cover_letter_url TEXT,
    cv_url TEXT,
    certificates_urls TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'pending'
)`);

// POST /api/job-applications
app.post('/api/job-applications', applicationsUpload.fields([
    { name: 'coverLetter', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
    { name: 'certificates', maxCount: 5 }
]), (req, res) => {
    const { name, email, phone, jobTitle, jobId } = req.body;

    if (!name || !email || !phone || !jobTitle) {
        return res.status(400).json({ error: 'Name, email, phone, and job title are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address.' });
    }

    try {
        let coverLetterUrl = null;
        let cvUrl = null;
        let certificatesUrls = '[]';

        if (req.files) {
            if (req.files.coverLetter && req.files.coverLetter[0]) {
                coverLetterUrl = '/uploads/' + req.files.coverLetter[0].filename;
            }
            if (req.files.cv && req.files.cv[0]) {
                cvUrl = '/uploads/' + req.files.cv[0].filename;
            }
            if (req.files.certificates && req.files.certificates.length > 0) {
                const certUrls = req.files.certificates.map(f => '/uploads/' + f.filename);
                certificatesUrls = JSON.stringify(certUrls);
            }
        }

        const result = db.prepare(
            `INSERT INTO job_applications (name, email, phone, job_title, job_id, cover_letter_url, cv_url, certificates_urls, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
            name.trim(), email.trim().toLowerCase(), phone.trim(), jobTitle.trim(),
            jobId ? parseInt(jobId) : null, coverLetterUrl, cvUrl, certificatesUrls, 'pending'
        );

        res.json({
            id: result.lastInsertRowid,
            message: 'Application submitted successfully',
            application: {
                id: result.lastInsertRowid,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                jobTitle: jobTitle.trim(),
                coverLetterUrl, cvUrl,
                certificatesUrls: JSON.parse(certificatesUrls)
            }
        });
    } catch (err) {
        console.error('[CGHI API] Error creating job application:', err);
        res.status(500).json({ error: 'Failed to submit application. Please try again.' });
    }
});

// GET /api/job-applications (admin only)
app.get('/api/job-applications', authMiddleware, (req, res) => {
    try {
        const applications = db.prepare('SELECT * FROM job_applications ORDER BY created_at DESC').all();
        const result = applications.map(app => ({
            ...app,
            certificates_urls: typeof app.certificates_urls === 'string' ? (JSON.parse(app.certificates_urls)||[]) : (app.certificates_urls||[])
        }));
        res.json(result);
    } catch (err) {
        console.error('[CGHI API] Error fetching job applications:', err);
        res.status(500).json({ error: 'Failed to fetch applications.' });
    }
});

// DELETE /api/job-applications/:id (admin only)
app.delete('/api/job-applications/:id', authMiddleware, (req, res) => {
    try {
        const app = db.prepare('SELECT * FROM job_applications WHERE id=?').get(req.params.id);
        if (!app) return res.status(404).json({ error: 'Application not found.' });

        if (app.cover_letter_url) {
            const p = path.join(__dirname, 'data', 'uploads', path.basename(app.cover_letter_url));
            if (fs.existsSync(p)) fs.unlinkSync(p);
        }
        if (app.cv_url) {
            const p = path.join(__dirname, 'data', 'uploads', path.basename(app.cv_url));
            if (fs.existsSync(p)) fs.unlinkSync(p);
        }
        const certs = typeof app.certificates_urls === 'string' ? (JSON.parse(app.certificates_urls)||[]) : (app.certificates_urls||[]);
        certs.forEach(url => {
            if (url) {
                const p = path.join(__dirname, 'data', 'uploads', path.basename(url));
                if (fs.existsSync(p)) fs.unlinkSync(p);
            }
        });

        const result = db.prepare('DELETE FROM job_applications WHERE id=?').run(req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: 'Application not found.' });
        res.json({ ok: true });
    } catch (err) {
        console.error('[CGHI API] Error deleting job application:', err);
        res.status(500).json({ error: 'Failed to delete application.' });
    }
});

app.use((err, req, res, next) => {
    console.error('[CGHI API] Error:', err.message);
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum 5MB.' });
        }
        return res.status(400).json({ error: err.message });
    }
    if (err && /Only images/.test(err.message)) {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`[CGHI API] Running on http://localhost:${PORT}`);
    console.log(`[CGHI API] Uploads served from ${uploadsDir}`);
    console.log(`[CGHI API] CORS allowed origins: ${ALLOWED_ORIGINS.join(', ')} + LAN IPs on :5173/:3000/:8080`);
});