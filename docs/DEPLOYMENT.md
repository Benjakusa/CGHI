# Deployment & Domain Configuration

This document covers what must be configured **outside the repository** before the
public site goes live on the official CGP domain. Nothing in this file invents a
domain or a credential: every value marked _confirm_ must be supplied by CGP.

## 1. Canonical site URL (frontend)

Everything SEO-related derives from one value:

| Where | Variable | Used for |
|-------|----------|----------|
| Vercel env | `VITE_SITE_URL` | `<link rel="canonical">`, Open Graph / Twitter URLs, `sitemap.xml`, the Sitemap line in `robots.txt` |

- The code default is `https://pandemicintelcenter.org` — the institution's
  existing official domain, as published in the project's own content
  (`info@pandemicintelcenter.org`, the seeded media URLs). Change the default in
  `frontend/src/config/site.js` only if the confirmed production domain differs.
- **Never set `VITE_SITE_URL` to a `*.vercel.app` host.** Preview and production
  deployments should both point canonical URLs at the official domain, or search
  engines will index the preview host instead.
- `npm run build` runs `scripts/generate-sitemap.mjs` first, which rewrites the
  canonical/OG tags in `dist/index.html`, regenerates `public/sitemap.xml` and
  rewrites the Sitemap line in `public/robots.txt` from `VITE_SITE_URL`.

## 2. Vercel (frontend hosting)

1. Project root: `frontend/`. `frontend/vercel.json` already configures the Vite
   framework, `dist` output and the SPA rewrite.
2. Environment variables (Production **and** Preview):
   - `VITE_SITE_URL` — the official HTTPS origin, no trailing slash. _confirm_
   - `VITE_API_BASE_URL` — the deployed API origin, no trailing slash (e.g. the
     Render service URL). _confirm_
   > **Warning:** `VITE_API_BASE_URL` is inlined at build time. `.env` files are
   > gitignored, so a Vercel build without this variable falls back to
   > `http://localhost:4000` and every API call (content, login, contact form)
   > breaks. The prebuild script now **fails the build on Vercel** when the
   > variable is missing or points at localhost, and warns on local builds.
3. Add the custom domain in **Project → Settings → Domains** and create the DNS
   records Vercel shows (typically `A`/`ALIAS` for the apex and `CNAME` for
   `www`). Keep Vercel's automatic HTTPS.
4. Decide the apex vs `www` form once, set it in `VITE_SITE_URL`, and redirect
   the other with a Vercel domain redirect so canonical URLs and the sitemap
   cannot disagree.

## 3. Backend API

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Signs admin tokens. **Required.** Generate with `openssl rand -hex 32`. |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | First-boot admin only. The server now refuses to seed without `SEED_ADMIN_PASSWORD`, so the old published default can no longer appear on a fresh database. |
| `FRONTEND_URL` | Comma-separated browser origins allowed by CORS. Include the official domain (and any operational preview origins). |
| `IP_HASH_SALT` | Salt for contact-enquiry IP hashes. Optional; falls back to `JWT_SECRET`. |
| `DB_PATH` | SQLite location. On Render, mount a persistent disk at `backend/data`, otherwise content managed through `/admin` is lost on each deploy. |

Deploy the backend **before** releasing the frontend that submits the contact
form: `POST /api/contact` must exist or the form will report a send failure.

## 4. Contact form

- `POST /api/contact` validates every field server-side and stores enquiries in
  the `contact_messages` table (created automatically on boot).
- Spam controls: honeypot field, minimum fill time, per-IP rate limit (5 per
  10 minutes), field length limits. Bot submissions receive an HTTP 202 that
  looks like success and are not stored.
- Admin access: `GET /api/contact` (with Bearer token) lists enquiries;
  `PUT /api/contact/:id` updates status/notes; `DELETE /api/contact/:id` removes.

## 5. Post-deploy checklist

1. `VITE_SITE_URL` and `VITE_API_BASE_URL` are set in Vercel for Production.
2. `https://<official-domain>/robots.txt` and `/sitemap.xml` show the official
   origin (not a vercel.app host).
3. View-source on the homepage: `canonical`, `og:url`, `og:image` all use the
   official origin.
4. Browser devtools → Network: page requests go to the `VITE_API_BASE_URL`
   origin (no calls to `localhost` or `127.0.0.1` from a real visitor's
   session).
5. Submit a test enquiry through `/contact` and confirm it arrives in the admin
   list.
6. Rotate the admin password away from the legacy seed password (the API logs a
   warning at boot while it is still in use).
