// backend/db.js — Postgres/Neon version (replaces better-sqlite3)
require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
  console.error("[db] FATAL: DATABASE_URL is not set.");
  process.exit(1);
}
const connectionString = rawUrl
  .replace(/[&?]channel_binding=require/gi, "")
  .replace(/([?&])sslmode=require\b/gi, "$1sslmode=verify-full");

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
pool.on("error", (err) => console.error("[db] idle client error:", err.message));

const query = (text, params = []) => pool.query(text, params);
const all   = async (text, params = []) => (await pool.query(text, params)).rows;
const get   = async (text, params = []) => (await pool.query(text, params)).rows[0];
const run   = async (text, params = []) => {
  const r = await pool.query(text, params);
  return { changes: r.rowCount, rows: r.rows };
};

const slugify = (value) =>
  String(value || "article").toLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "").slice(0, 90) || "article";

async function getMeta(key) {
  const row = await get("SELECT value FROM meta WHERE key = $1", [key]);
  return row ? row.value : null;
}
async function setMeta(key, value) {
  await run(
    "INSERT INTO meta (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
    [key, String(value)],
  );
}

async function createSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS admins (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS heroes (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title TEXT NOT NULL, topic TEXT, description TEXT,
      btn1_text TEXT, btn1_link TEXT, btn2_text TEXT, btn2_link TEXT,
      image_url TEXT, sort_order INTEGER NOT NULL DEFAULT 0,
      published SMALLINT NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS news (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title TEXT NOT NULL, category TEXT, excerpt TEXT, content TEXT,
      image_url TEXT, author TEXT, published_at TEXT,
      published SMALLINT NOT NULL DEFAULT 1,
      type TEXT NOT NULL DEFAULT 'news',
      slug TEXT, cover_image TEXT, cover_caption TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_news_slug ON news(slug) WHERE slug IS NOT NULL;
    CREATE TABLE IF NOT EXISTS partners (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL, logo_url TEXT, website TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      published SMALLINT NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS team_members (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL, role TEXT NOT NULL, biography TEXT,
      image_url TEXT, email TEXT, phone TEXT,
      social_links TEXT NOT NULL DEFAULT '[]',
      published SMALLINT NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS jobs (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title TEXT NOT NULL, department TEXT, location TEXT, employment_type TEXT,
      description TEXT, qualifications TEXT, preferred_experience TEXT,
      apply_email TEXT, apply_subject TEXT, closing_date TEXT, document_url TEXT,
      published SMALLINT NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS resources (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title TEXT NOT NULL, description TEXT, document_url TEXT, date TEXT,
      published SMALLINT NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS contact_messages (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, organisation TEXT,
      topic TEXT NOT NULL DEFAULT 'general', subject TEXT, message TEXT NOT NULL,
      consent SMALLINT NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT, ip_hash TEXT, user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status, created_at DESC);
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY, value TEXT
    );
    CREATE TABLE IF NOT EXISTS article_blocks (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      article_id BIGINT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      block_type TEXT NOT NULL CHECK (block_type IN ('text','image')),
      text TEXT, image_url TEXT, caption TEXT, alt_text TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_article_blocks_article_position ON article_blocks(article_id, position);
    CREATE TABLE IF NOT EXISTS news_comments (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      article_id BIGINT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
      name TEXT NOT NULL, comment TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_news_comments_article_created ON news_comments(article_id, created_at, id);
    CREATE TABLE IF NOT EXISTS job_applications (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      job_id BIGINT REFERENCES jobs(id) ON DELETE SET NULL,
      name TEXT, email TEXT, phone TEXT, cover_letter TEXT, cv_url TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function initDb() {
  await createSchema();
}

module.exports = { pool, query, all, get, run, getMeta, setMeta, slugify, initDb };
console.log("[db] module loaded (Postgres / Neon).");
