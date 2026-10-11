const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const now = () => new Date().toISOString();
const commentAttempts = new Map();
const COMMENT_RATE_WINDOW_MS = 10 * 60 * 1000;
function limitCommentPosts(req, res, next) {
  const timestamp = Date.now();
  const key = req.ip || 'unknown';
  const recent = (commentAttempts.get(key) || []).filter((time) => timestamp - time < COMMENT_RATE_WINDOW_MS);
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
    const recent = times.filter((time) => time > cutoff);
    if (recent.length) commentAttempts.set(key, recent);
    else commentAttempts.delete(key);
  }
}, COMMENT_RATE_WINDOW_MS).unref();
const slugify = (value) => String(value || 'article').toLowerCase()
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'article';
const fs = require('fs');
const uploadDir = path.join(__dirname, '..', 'data', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const uploads = multer({
  dest: uploadDir,
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

function withBlocks(article) {
  if (!article) return null;
  return { ...article, blocks: db.prepare(
    'SELECT id, position, block_type, text, image_url, caption, alt_text FROM article_blocks WHERE article_id=? ORDER BY position, id'
  ).all(article.id) };
}
function uniqueSlug(title, existingId) {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (db.prepare('SELECT id FROM news WHERE slug=? AND id != ?').get(slug, existingId || -1)) slug = `${base}-${n++}`;
  return slug;
}
function saveArticle(article, body) {
  const published = body.status ? body.status === 'published' : !!body.published;
  const publishedAt = published ? (body.published_at || article?.published_at || now()) : (body.published_at || article?.published_at || null);
  const values = [body.type === 'research' ? 'research' : 'news', body.title.trim(), uniqueSlug(body.title, article?.id), body.excerpt || '', body.author || '', body.category || '', body.cover_image || body.image_url || '', body.cover_caption || '', published ? 1 : 0, publishedAt, now()];
  const persist = db.transaction(() => {
    let id = article?.id;
    if (id) {
      db.prepare(`UPDATE news SET type=?,title=?,slug=?,excerpt=?,author=?,category=?,cover_image=?,cover_caption=?,image_url=?,content='',published=?,published_at=?,updated_at=? WHERE id=?`)
        .run(...values.slice(0, 8), values[6], values[8], values[9], values[10], id);
    } else {
      id = db.prepare(`INSERT INTO news (type,title,slug,excerpt,author,category,cover_image,cover_caption,image_url,content,published,published_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,'',?,?,?)`)
        .run(...values.slice(0, 8), values[6], values[8], values[9], values[10]).lastInsertRowid;
    }
    db.prepare('DELETE FROM article_blocks WHERE article_id=?').run(id);
    const insert = db.prepare('INSERT INTO article_blocks (article_id,position,block_type,text,image_url,caption,alt_text) VALUES (?,?,?,?,?,?,?)');
    (Array.isArray(body.blocks) ? body.blocks : []).forEach((block, index) => {
      insert.run(id, index, block.type === 'image' || block.block_type === 'image' ? 'image' : 'text', block.text || '', block.image_url || '', block.caption || '', block.alt_text || '');
    });
    return id;
  });
  return persist();
}

// Public routes never include drafts.
router.get('/', (req, res) => {
  const type = ['news', 'research'].includes(req.query.type) ? ' AND type=?' : '';
  const rows = db.prepare(`SELECT * FROM news WHERE published=1${type} ORDER BY COALESCE(published_at, created_at) DESC, id DESC`)
    .all(...(type ? [req.query.type] : []));
  res.json(rows.map(withBlocks));
});
router.get('/slug/:slug', (req, res) => {
  const article = db.prepare('SELECT * FROM news WHERE slug=? AND published=1').get(req.params.slug);
  if (!article) return res.status(404).json({ error: 'Article not found.' });
  res.json(withBlocks(article));
});

router.get('/slug/:slug/comments', (req, res) => {
  const article = db.prepare('SELECT id FROM news WHERE slug=? AND published=1').get(req.params.slug);
  if (!article) return res.status(404).json({ error: 'Article not found.' });
  const comments = db.prepare(`
    SELECT id, name, comment, created_at
    FROM news_comments WHERE article_id=?
    ORDER BY created_at ASC, id ASC
  `).all(article.id);
  res.json(comments);
});

router.post('/slug/:slug/comments', limitCommentPosts, (req, res) => {
  const article = db.prepare('SELECT id FROM news WHERE slug=? AND published=1').get(req.params.slug);
  if (!article) return res.status(404).json({ error: 'Article not found.' });
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const comment = typeof req.body?.comment === 'string' ? req.body.comment.trim() : '';
  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({ error: 'Name must be between 2 and 80 characters.' });
  }
  if (comment.length < 1 || comment.length > 2000) {
    return res.status(400).json({ error: 'Comment must be between 1 and 2000 characters.' });
  }
  const result = db.prepare('INSERT INTO news_comments (article_id, name, comment) VALUES (?, ?, ?)')
    .run(article.id, name, comment);
  const saved = db.prepare('SELECT id, name, comment, created_at FROM news_comments WHERE id=?').get(result.lastInsertRowid);
  res.status(201).json(saved);
});

router.get('/admin', auth, (req, res) => {
  const typeFilter = ['news', 'research'].includes(req.query.type) ? ' AND type=?' : '';
  const statusFilter = ['draft', 'published'].includes(req.query.status) ? ' AND published=?' : '';
  const params = [];
  if (typeFilter) params.push(req.query.type);
  if (statusFilter) params.push(req.query.status === 'published' ? 1 : 0);
  const rows = db.prepare(`SELECT * FROM news WHERE 1=1${typeFilter}${statusFilter} ORDER BY COALESCE(published_at, created_at) DESC, id DESC`).all(...params);
  res.json(rows.map(withBlocks));
});
router.get('/admin/:id', auth, (req, res) => {
  const article = db.prepare('SELECT * FROM news WHERE id=?').get(req.params.id);
  if (!article) return res.status(404).json({ error: 'Not found.' });
  res.json(withBlocks(article));
});
router.post('/admin/upload', auth, uploads.array('images', 20), (req, res) => {
  res.json({ urls: (req.files || []).map((file) => `/uploads/${file.filename}`) });
});
router.post('/admin', auth, (req, res) => {
  if (!req.body.title?.trim()) return res.status(400).json({ error: 'Title is required.' });
  const id = saveArticle(null, req.body);
  res.status(201).json(withBlocks(db.prepare('SELECT * FROM news WHERE id=?').get(id)));
});
router.put('/admin/:id', auth, (req, res) => {
  const article = db.prepare('SELECT * FROM news WHERE id=?').get(req.params.id);
  if (!article) return res.status(404).json({ error: 'Not found.' });
  if (!req.body.title?.trim()) return res.status(400).json({ error: 'Title is required.' });
  saveArticle(article, req.body);
  res.json(withBlocks(db.prepare('SELECT * FROM news WHERE id=?').get(article.id)));
});
router.patch('/admin/:id/publish', auth, (req, res) => {
  const article = db.prepare('SELECT * FROM news WHERE id=?').get(req.params.id);
  if (!article) return res.status(404).json({ error: 'Not found.' });
  const publish = req.body?.status ? req.body.status === 'published' : !article.published;
  db.prepare('UPDATE news SET published=?, published_at=?, updated_at=? WHERE id=?')
    .run(publish ? 1 : 0, publish ? (article.published_at || now()) : article.published_at, now(), article.id);
  res.json({ published: publish });
});
router.delete('/admin/:id', auth, (req, res) => {
  const result = db.prepare('DELETE FROM news WHERE id=?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Not found.' });
  res.json({ ok: true });
});

module.exports = router;
