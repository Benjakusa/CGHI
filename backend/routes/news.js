const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const now = () => new Date().toISOString();

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

/* ---------- comment rate limit ---------- */
const commentAttempts = new Map();
const COMMENT_RATE_WINDOW_MS = 10 * 60 * 1000;
function limitCommentPosts(req, res, next) {
  const timestamp = Date.now();
  const key = req.ip || 'unknown';
  const recent = (commentAttempts.get(key) || []).filter((t) => timestamp - t < COMMENT_RATE_WINDOW_MS);
  if (recent.length >= 5) {
    res.set('Retry-After', String(Math.ceil((COMMENT_RATE_WINDOW_MS - (timestamp - recent[0])) / 1000)));
    return res.status(429).json({ error: 'Too many comments. Please wait a few minutes and try again.' });
  }
  recent.push(timestamp);
  commentAttempts.set(key, recent);
  next();
}
setInterval(() => {
  const cutoff = Date.now() - COMMENT_RATE_WINDOW_MS;
  for (const [key, times] of commentAttempts) {
    const recent = times.filter((t) => t > cutoff);
    if (recent.length) commentAttempts.set(key, recent);
    else commentAttempts.delete(key);
  }
}, COMMENT_RATE_WINDOW_MS).unref();

/* ---------- helpers ---------- */
const slugify = (value) => String(value || 'article').toLowerCase()
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'article';

const uploads = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 20 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp']);
    if (!allowed.has(ext) || !['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG and WebP images are allowed.'));
    }
    cb(null, true);
  },
});

async function withBlocks(article) {
  if (!article) return null;
  const blocks = await db.all(
    'SELECT id, position, block_type, text, image_url, caption, alt_text FROM article_blocks WHERE article_id=$1 ORDER BY position, id',
    [article.id],
  );
  return { ...article, blocks };
}

async function uniqueSlug(title, existingId) {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (await db.get('SELECT id FROM news WHERE slug=$1 AND id != $2', [slug, existingId || -1])) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

async function saveArticle(article, body) {
  const published = body.status ? body.status === 'published' : !!body.published;
  const publishedAt = published
    ? (body.published_at || article?.published_at || now())
    : (body.published_at || article?.published_at || null);

  const type = body.type === 'research' ? 'research' : 'news';
  const title = body.title.trim();
  const slug = await uniqueSlug(title, article?.id);
  const excerpt = body.excerpt || '';
  const author = body.author || '';
  const category = body.category || '';
  const cover_image = body.cover_image || body.image_url || '';
  const cover_caption = body.cover_caption || '';
  const publishedNum = published ? 1 : 0;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    let id = article?.id;
    if (id) {
      await client.query(
        `UPDATE news SET type=$1,title=$2,slug=$3,excerpt=$4,author=$5,category=$6,cover_image=$7,cover_caption=$8,image_url=$9,content='',published=$10,published_at=$11,updated_at=$12 WHERE id=$13`,
        [type, title, slug, excerpt, author, category, cover_image, cover_caption, cover_image, publishedNum, publishedAt, now(), id],
      );
    } else {
      const r = await client.query(
        `INSERT INTO news (type,title,slug,excerpt,author,category,cover_image,cover_caption,image_url,content,published,published_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'',$10,$11,$12) RETURNING id`,
        [type, title, slug, excerpt, author, category, cover_image, cover_caption, cover_image, publishedNum, publishedAt, now()],
      );
      id = r.rows[0].id;
    }
    await client.query('DELETE FROM article_blocks WHERE article_id=$1', [id]);
    const blocks = Array.isArray(body.blocks) ? body.blocks : [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      await client.query(
        'INSERT INTO article_blocks (article_id,position,block_type,text,image_url,caption,alt_text) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [id, i, (b.type === 'image' || b.block_type === 'image') ? 'image' : 'text', b.text || '', b.image_url || '', b.caption || '', b.alt_text || ''],
      );
    }
    await client.query('COMMIT');
    return id;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    throw err;
  } finally {
    client.release();
  }
}

/* ---------- public routes ---------- */
router.get('/', async (req, res, next) => {
  try {
    const typeFilter = ['news', 'research'].includes(req.query.type) ? ' AND type=$1' : '';
    const params = typeFilter ? [req.query.type] : [];
    const rows = await db.all(
      `SELECT * FROM news WHERE published=1${typeFilter} ORDER BY id DESC`,
      params,
    );
    const enriched = [];
    for (const r of rows) enriched.push(await withBlocks(r));
    res.json(enriched);
  } catch (e) { next(e); }
});

router.get('/slug/:slug', async (req, res, next) => {
  try {
    const article = await db.get('SELECT * FROM news WHERE slug=$1 AND published=1', [req.params.slug]);
    if (!article) return res.status(404).json({ error: 'Article not found.' });
    res.json(await withBlocks(article));
  } catch (e) { next(e); }
});

router.get('/slug/:slug/comments', async (req, res, next) => {
  try {
    const article = await db.get('SELECT id FROM news WHERE slug=$1 AND published=1', [req.params.slug]);
    if (!article) return res.status(404).json({ error: 'Article not found.' });
    const comments = await db.all(
      'SELECT id, name, comment, created_at FROM news_comments WHERE article_id=$1 ORDER BY created_at ASC, id ASC',
      [article.id],
    );
    res.json(comments);
  } catch (e) { next(e); }
});

router.post('/slug/:slug/comments', limitCommentPosts, async (req, res, next) => {
  try {
    const article = await db.get('SELECT id FROM news WHERE slug=$1 AND published=1', [req.params.slug]);
    if (!article) return res.status(404).json({ error: 'Article not found.' });
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const comment = typeof req.body?.comment === 'string' ? req.body.comment.trim() : '';
    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({ error: 'Name must be between 2 and 80 characters.' });
    }
    if (comment.length < 1 || comment.length > 2000) {
      return res.status(400).json({ error: 'Comment must be between 1 and 2000 characters.' });
    }
    const saved = await db.get(
      'INSERT INTO news_comments (article_id, name, comment) VALUES ($1,$2,$3) RETURNING id, name, comment, created_at',
      [article.id, name, comment],
    );
    res.status(201).json(saved);
  } catch (e) { next(e); }
});

/* ---------- admin ---------- */
router.get('/admin', auth, async (req, res, next) => {
  try {
    const params = [];
    let sql = 'SELECT * FROM news WHERE 1=1';
    if (['news', 'research'].includes(req.query.type)) { params.push(req.query.type); sql += ` AND type=$${params.length}`; }
    if (['draft', 'published'].includes(req.query.status)) { params.push(req.query.status === 'published' ? 1 : 0); sql += ` AND published=$${params.length}`; }
    sql += ' ORDER BY id DESC';
    const rows = await db.all(sql, params);
    const enriched = [];
    for (const r of rows) enriched.push(await withBlocks(r));
    res.json(enriched);
  } catch (e) { next(e); }
});

router.get('/admin/:id', auth, async (req, res, next) => {
  try {
    const article = await db.get('SELECT * FROM news WHERE id=$1', [req.params.id]);
    if (!article) return res.status(404).json({ error: 'Not found.' });
    res.json(await withBlocks(article));
  } catch (e) { next(e); }
});

router.post('/admin/upload', auth, uploads.array('images', 20), async (req, res, next) => {
  try {
    const urls = [];
    for (const file of req.files || []) {
      urls.push(await putToR2(file.buffer, file.originalname, file.mimetype, 'news'));
    }
    res.json({ urls });
  } catch (e) { next(e); }
});

router.post('/admin', auth, async (req, res, next) => {
  try {
    if (!req.body.title?.trim()) return res.status(400).json({ error: 'Title is required.' });
    const id = await saveArticle(null, req.body);
    const row = await db.get('SELECT * FROM news WHERE id=$1', [id]);
    res.status(201).json(await withBlocks(row));
  } catch (e) { next(e); }
});

router.put('/admin/:id', auth, async (req, res, next) => {
  try {
    const article = await db.get('SELECT * FROM news WHERE id=$1', [req.params.id]);
    if (!article) return res.status(404).json({ error: 'Not found.' });
    if (!req.body.title?.trim()) return res.status(400).json({ error: 'Title is required.' });
    await saveArticle(article, req.body);
    const row = await db.get('SELECT * FROM news WHERE id=$1', [article.id]);
    res.json(await withBlocks(row));
  } catch (e) { next(e); }
});

router.patch('/admin/:id/publish', auth, async (req, res, next) => {
  try {
    const article = await db.get('SELECT * FROM news WHERE id=$1', [req.params.id]);
    if (!article) return res.status(404).json({ error: 'Not found.' });
    const publish = req.body?.status ? req.body.status === 'published' : !article.published;
    await db.run(
      'UPDATE news SET published=$1, published_at=$2, updated_at=$3 WHERE id=$4',
      [publish ? 1 : 0, publish ? (article.published_at || now()) : article.published_at, now(), article.id],
    );
    res.json({ published: publish });
  } catch (e) { next(e); }
});

router.delete('/admin/:id', auth, async (req, res, next) => {
  try {
    const r = await db.run('DELETE FROM news WHERE id=$1', [req.params.id]);
    if (!r.changes) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
