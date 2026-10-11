const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const now = () => new Date().toISOString();
const selectPublic = `SELECT id,name,role,biography,image_url,email,phone,social_links,sort_order,created_at,updated_at FROM team_members WHERE published=1 ORDER BY sort_order,id`;
function present(row) {
  if (!row) return row;
  let socialLinks = [];
  try { socialLinks = JSON.parse(row.social_links || '[]'); } catch (_) { socialLinks = []; }
  return { ...row, social_links: socialLinks };
}
function validate(body) {
  if (!body.name?.trim() || !body.role?.trim()) return 'Name and role are required.';
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return 'Enter a valid email address.';
  const links = Array.isArray(body.social_links) ? body.social_links : [];
  for (const link of links) {
    try { if (link.url && !['http:', 'https:'].includes(new URL(link.url).protocol)) throw new Error(); }
    catch (_) { return 'Social links must be valid HTTP or HTTPS URLs.'; }
  }
  return null;
}
function values(body) {
  return [body.name.trim(), body.role.trim(), body.biography || '', body.image_url || '', body.email || '', body.phone || '', JSON.stringify((body.social_links || []).filter((link) => link.label && link.url)), body.published ? 1 : 0, Number(body.sort_order) || 0, now()];
}

router.get('/', (req, res) => res.json(db.prepare(selectPublic).all().map(present)));
router.get('/admin', auth, (req, res) => res.json(db.prepare('SELECT * FROM team_members ORDER BY sort_order,id').all().map(present)));
router.post('/admin', auth, (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const result = db.prepare(`INSERT INTO team_members (name,role,biography,image_url,email,phone,social_links,published,sort_order,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(...values(req.body));
  res.status(201).json(present(db.prepare('SELECT * FROM team_members WHERE id=?').get(result.lastInsertRowid)));
});
router.put('/admin/:id', auth, (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const result = db.prepare(`UPDATE team_members SET name=?,role=?,biography=?,image_url=?,email=?,phone=?,social_links=?,published=?,sort_order=?,updated_at=? WHERE id=?`).run(...values(req.body), req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Team member not found.' });
  res.json(present(db.prepare('SELECT * FROM team_members WHERE id=?').get(req.params.id)));
});
router.delete('/admin/:id', auth, (req, res) => {
  const result = db.prepare('DELETE FROM team_members WHERE id=?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Team member not found.' });
  res.json({ ok: true });
});

module.exports = router;
