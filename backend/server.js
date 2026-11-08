const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

if (!process.env.JWT_SECRET) {
  console.error('[CGHPI API] WARNING: JWT_SECRET is not set. Authenticated endpoints will refuse requests.');
}
if (!process.env.DATABASE_URL) {
  console.error('[CGHPI API] FATAL: DATABASE_URL is not set. Exiting.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

/* ---------- R2 client ---------- */
const r2 = new S3Client({
  region: 'auto',
  endpoint: 'https://' + process.env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
async function putToR2(buffer, originalname, mimetype, prefix) {
  const ext = path.extname(originalname || '').toLowerCase() || '.bin';
  const key = `${prefix}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype || 'application/octet-stream',
  }));
  return `${process.env.R2_PUBLIC_BASE}/${key}`;
}
async function deleteFromR2(url) {
  if (!url || !process.env.R2_PUBLIC_BASE) return;
  const prefix = process.env.R2_PUBLIC_BASE.replace(/\/+$/, '') + '/';
  if (!url.startsWith(prefix)) return;
  const Key = url.slice(prefix.length);
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key }));
  } catch (e) {
    console.error('[CGHPI API] R2 delete failed for', Key, '-', e.message);
  }
}

/* ---------- CORS ---------- */
const ALLOWED_ORIGINS = [
  'http://localhost:5173', 'http://127.0.0.1:5173',
  'http://localhost:3000', 'http://127.0.0.1:3000',
  'http://localhost:8080', 'http://127.0.0.1:8080',
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean)
    : []),
];
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    if (/^http:\/\/(\d{1,3}\.){3}\d{1,3}:(5173|3000|8080)$/.test(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

/* ---------- upload middleware ---------- */
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images (jpg, png, gif, webp, svg) and PDFs are allowed'));
  },
});

const applicationsUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/pdf';
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only PDF, DOC, DOCX, and images are allowed'));
  },
});

const authMiddleware = require('./middleware/auth');
const db = require('./db');

/* ---------- generic uploads ---------- */
app.post('/api/upload', authMiddleware, imageUpload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = await putToR2(req.file.buffer, req.file.originalname, req.file.mimetype, 'uploads');
    res.json({ url });
  } catch (e) { next(e); }
});

app.post('/api/upload/file', authMiddleware, imageUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = await putToR2(req.file.buffer, req.file.originalname, req.file.mimetype, 'uploads');
    res.json({ url });
  } catch (e) { next(e); }
});

/* ---------- routes ---------- */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/heroes', require('./routes/heroes'));
app.use('/api/news', require('./routes/news'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/team', require('./routes/team'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/receipts', require('./routes/receipts'));
app.use('/api/contact', require('./routes/contact'));

/* ---------- admin dashboard stats ---------- */
app.get('/api/admin/stats', authMiddleware, async (req, res, next) => {
  try {
    const stat = async (table) => {
      try {
        const t = await db.get(`SELECT COUNT(*)::int AS c FROM ${table}`);
        const p = await db.get(`SELECT COUNT(*)::int AS c FROM ${table} WHERE published=1`);
        return { total: t.c, published: p.c, unpublished: t.c - p.c };
      } catch { return { total: 0, published: 0, unpublished: 0 }; }
    };
    res.json({
      heroes: await stat('heroes'),
      news: await stat('news'),
      partners: await stat('partners'),
      jobs: await stat('jobs'),
      resources: await stat('resources'),
    });
  } catch (e) { next(e); }
});

/* ---------- job applications ---------- */
app.post('/api/job-applications', applicationsUpload.fields([
  { name: 'coverLetter', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
  { name: 'certificates', maxCount: 5 },
]), async (req, res, next) => {
  try {
    const { name, email, phone, jobTitle, jobId } = req.body;
    if (!name || !email || !phone || !jobTitle) {
      return res.status(400).json({ error: 'Name, email, phone, and job title are required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    let coverLetterUrl = null;
    let cvUrl = null;
    const certificateUrls = [];

    if (req.files) {
      if (req.files.coverLetter?.[0]) {
        const f = req.files.coverLetter[0];
        coverLetterUrl = await putToR2(f.buffer, f.originalname, f.mimetype, 'applications');
      }
      if (req.files.cv?.[0]) {
        const f = req.files.cv[0];
        cvUrl = await putToR2(f.buffer, f.originalname, f.mimetype, 'applications');
      }
      if (req.files.certificates?.length) {
        for (const f of req.files.certificates) {
          certificateUrls.push(await putToR2(f.buffer, f.originalname, f.mimetype, 'applications'));
        }
      }
    }

    const row = await db.get(
      `INSERT INTO job_applications (name, email, phone, job_title, job_id, cover_letter_url, cv_url, certificates_urls, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [name.trim(), email.trim().toLowerCase(), phone.trim(), jobTitle.trim(),
       jobId ? parseInt(jobId) : null, coverLetterUrl, cvUrl, JSON.stringify(certificateUrls), 'pending'],
    );

    res.json({
      id: row.id,
      message: 'Application submitted successfully',
      application: {
        id: row.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        jobTitle: jobTitle.trim(),
        coverLetterUrl, cvUrl,
        certificatesUrls: certificateUrls,
      },
    });
  } catch (e) { next(e); }
});

app.get('/api/job-applications', authMiddleware, async (req, res, next) => {
  try {
    const applications = await db.all('SELECT * FROM job_applications ORDER BY created_at DESC');
    const result = applications.map((a) => ({
      ...a,
      certificates_urls: typeof a.certificates_urls === 'string' ? (JSON.parse(a.certificates_urls) || []) : (a.certificates_urls || []),
    }));
    res.json(result);
  } catch (e) { next(e); }
});

app.delete('/api/job-applications/:id', authMiddleware, async (req, res, next) => {
  try {
    const application = await db.get('SELECT * FROM job_applications WHERE id=$1', [req.params.id]);
    if (!application) return res.status(404).json({ error: 'Application not found.' });

    await deleteFromR2(application.cover_letter_url);
    await deleteFromR2(application.cv_url);
    const certs = typeof application.certificates_urls === 'string'
      ? (JSON.parse(application.certificates_urls) || [])
      : (application.certificates_urls || []);
    for (const url of certs) await deleteFromR2(url);

    const r = await db.run('DELETE FROM job_applications WHERE id=$1', [req.params.id]);
    if (r.changes === 0) return res.status(404).json({ error: 'Application not found.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

/* ---------- error handler ---------- */
app.use((err, req, res, next) => {
  console.error('[CGHPI API] Error:', err.message);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large. Maximum 5MB (10MB for applications).' });
    return res.status(400).json({ error: err.message });
  }
  if (err && /Only images|Only PDF/.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: err.message || 'Internal server error' });
});

/* ---------- boot ---------- */
(async () => {
  try {
    await db.initDb();
    console.log('[CGHPI API] Database schema verified.');
  } catch (e) {
    console.error('[CGHPI API] FATAL: could not initialize database:', e.message);
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`[CGHPI API] Running on http://localhost:${PORT}`);
    console.log(`[CGHPI API] R2 bucket: ${process.env.R2_BUCKET || '(unset)'} | public base: ${process.env.R2_PUBLIC_BASE || '(unset)'}`);
    console.log(`[CGHPI API] CORS allowed origins: ${ALLOWED_ORIGINS.join(', ')} + LAN IPs on :5173/:3000/:8080`);
  });
})();
