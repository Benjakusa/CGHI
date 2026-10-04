# CGP — Center for Global Health & Pandemic Intelligence

**CGP** is the institution's web platform: a public website presenting CGP's mandate,
capabilities, projects, initiatives, insights and partners, plus an admin dashboard for
managing heroes, news, partners, jobs, resources and **contact enquiries**.

> The repository and directory retain the legacy `CGHI` name; the institution's public
> identity is **CGP** throughout the application (see `frontend/src/config/site.js`).

## Tech Stack

| Layer   | Technology                                              |
|---------|---------------------------------------------------------|
| Frontend| React 19 + Vite + React Router v7                       |
| Backend | Node.js + Express + better-sqlite3                      |
| Auth    | JWT (bcryptjs + jsonwebtoken), 8h expiry                |
| Deploy  | Frontend → Vercel, Backend → Render or any Node host    |
| DB      | SQLite (`backend/data/cghi.db` — legacy filename kept)  |

## Project Structure

```
CGHI/
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── components/     # Navbar, Footer, Layout, Seo, cards, Skeleton…
│   │   ├── config/         # site.js — brand, domain, contact, social (single source)
│   │   ├── content/        # navigation, capabilities, projects, initiatives, insights…
│   │   ├── context/        # AuthContext (token + API base)
│   │   ├── hooks/          # useApi, useCountUp, useScrollAnimations
│   │   ├── pages/          # Public pages + /admin/* admin pages
│   │   ├── index.css       # Base reset
│   │   ├── style.css       # Brand/legacy component styles
│   │   └── styles/site.css # Public-site design system
│   ├── public/             # Icons, OG image, robots.txt, sitemap.xml, manifest
│   ├── scripts/            # generate-sitemap.mjs (runs before every build)
│   └── vercel.json         # Vercel deployment config
├── backend/                # Express REST API
│   ├── routes/             # auth, heroes, news, partners, jobs, resources, contact
│   ├── middleware/         # auth middleware
│   ├── db.js               # SQLite setup + seed data
│   ├── server.js           # Express app entrypoint
│   └── data/               # SQLite DB + uploads (gitignored)
├── docs/DEPLOYMENT.md      # Domain, environment and go-live checklist
├── .env                    # Backend env (gitignored)
├── frontend/.env           # Frontend env (gitignored)
└── README.md
```

## Features

### Public Pages

The information architecture: **Home → Who We Are → What We Do → Projects →
Initiatives → Media Insights and Research → Partners → Partner With Us**.

- **Home** — Hero, five capability cards, "CGP at a Glance", featured projects, initiatives, latest insights, selected partners
- **About** — Who we are, mission, vision, approach, expertise, leadership status, partners
- **Leadership** — Leadership/team page (renders an explicit content-pending state until verified profiles are supplied)
- **What We Do** — The five capability areas in full
- **Projects** — Outcome-led project record with impact figures; detail pages at `/projects/:slug`
- **Initiatives** — The six active programmes, cross-linked to related projects and insights
- **Insights** — Research/news listing with search + category filtering; articles at `/insights/:slug` (`/news` permanently redirects to `/insights`)
- **Partners** — Full partner and collaborator directory
- **Resources** — Document/resource library
- **Careers** — Open roles with an application form
- **Partner With Us** — Contact details, map and validated enquiry form (the legacy `/contact` URL permanently redirects here, preserving the `#contact-form` / `#contact-details` anchors)
- **Privacy / Terms / Accessibility** — Policy pages, plus a branded 404 page

### Admin Dashboard (`/admin/*`, requires auth)
- **Dashboard** — Stats overview (total/published/unpublished per entity)
- **Heroes** — CRUD for hero cards
- **News Admin** — CRUD for news articles
- **Partners Admin** — CRUD for partner logos/links
- **Careers Admin** — CRUD for job postings
- **Resources Admin** — CRUD for resources/documents
- **Job Applications** — Review and delete submitted applications
- **Enquiries** — Contact-form inbox: filter by status, read, triage and delete
- **Login** — JWT-based admin authentication

### API Endpoints

Public reads are unauthenticated; managing the same content uses the
`/admin` sub-path with an admin Bearer token.

| Method | Endpoint                                   | Auth | Description                          |
|--------|--------------------------------------------|------|--------------------------------------|
| POST   | `/api/auth/login`                          | No   | Admin login → JWT token              |
| POST   | `/api/upload`, `/api/upload/file`          | Yes  | Upload image/file (≤5MB)             |
| GET    | `/api/heroes`, `/api/news`, `/api/partners`, `/api/jobs`, `/api/resources` | No | Public content reads |
| CRUD   | `/api/*/admin`                             | Yes  | Content management                   |
| POST   | `/api/job-applications`                    | No   | Submit a job application             |
| GET    | `/api/job-applications`                    | Yes  | List applications                    |
| DELETE | `/api/job-applications/:id`                | Yes  | Remove an application                |
| POST   | `/api/contact`                             | No   | Contact enquiry (honeypot + rate limit) |
| GET    | `/api/contact`, `/api/contact/:id`, `/api/contact/stats` | Yes | Read enquiries / counts |
| PUT    | `/api/contact/:id`                         | Yes  | Update enquiry status/notes          |
| DELETE | `/api/contact/:id`                         | Yes  | Delete an enquiry                    |
| GET    | `/api/admin/stats`                         | Yes  | Dashboard statistics                 |

## Setup

### Prerequisites
- Node.js ≥ 20
- npm

### 1. Clone & Install

```bash
git clone https://github.com/Benjakusa/CGHI.git
cd CGHI
```

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set JWT_SECRET, FRONTEND_URL, SEED_ADMIN_PASSWORD
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: set VITE_API_BASE_URL (backend URL) and VITE_SITE_URL (official domain)
```

### 2. Environment Variables

**`backend/.env`** (documented in `backend/.env.example`)
```env
JWT_SECRET=<openssl rand -hex 32>
PORT=4000
FRONTEND_URL=https://pandemicintelcenter.org
SEED_ADMIN_EMAIL=admin@pandemicintelcenter.org
SEED_ADMIN_PASSWORD=<strong-password>
# Optional:
IP_HASH_SALT=<any long random string>
# DB_PATH=./data/cghi.db
```

**`frontend/.env`** (documented in `frontend/.env.example`)
```env
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_SITE_URL=https://pandemicintelcenter.org
```

`VITE_SITE_URL` is the canonical origin used for `<link rel="canonical">`,
Open Graph/Twitter URLs, `sitemap.xml` and `robots.txt`. It must be the official
domain — never a `vercel.app` host. See `docs/DEPLOYMENT.md`.

Generate a secure JWT secret:
```bash
openssl rand -hex 32
```

### 3. Run Development Servers

**Backend** (port from `.env`; 4000 by default):
```bash
cd backend
npm run dev
```

**Frontend** (port 5173):
```bash
cd frontend
npm run dev
```

### 4. Build for Production

```bash
cd frontend
npm run build    # Outputs to dist/
```

### 5. Seed Admin Account

On first backend startup against an empty database, one admin account is created
from `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`. `SEED_ADMIN_PASSWORD` has **no
default**: if it is unset, no admin is created and the server logs a warning
instead. (The previously published fallback password was deliberately removed.)
If an existing database still uses that old published password, the server warns
at every boot until it is changed.

Login with the seeded email and password to get a JWT token sent as a Bearer token for authenticated API calls.

## Deployment

See `docs/DEPLOYMENT.md` for the full go-live checklist (domain, DNS, environment
variables). At minimum:

### Frontend (Vercel)
`frontend/vercel.json` configures Vercel to use Vite, output from `dist/`, and rewrite all routes to `index.html` for React Router. Set `VITE_API_BASE_URL` and `VITE_SITE_URL` (the official domain) in the Vercel environment. `npm run build` also regenerates `sitemap.xml` and the Sitemap line in `robots.txt` from `VITE_SITE_URL`.

### Backend
Standalone Express server. Deploy to any Node.js host (Render, Railway, VPS, etc.). Ensure:
- `JWT_SECRET` is set and secure
- `FRONTEND_URL` matches your production frontend URL (for CORS); `*.vercel.app` preview origins are allowed automatically
- SQLite DB directory is writable **and persistent** (on Render, mount a disk — otherwise content managed through `/admin` is lost on deploy)
- Uploads directory persists across restarts
- Deploy the backend **before** releasing the frontend that submits the contact form, so `POST /api/contact` exists

## Database Schema

| Table      | Key Fields                                                        |
|------------|-------------------------------------------------------------------|
| `admins`   | email, password_hash, name                                        |
| `heroes`   | title, topic, description, btn1/2_text/link, image_url, sort_order, published |
| `news`     | title, category, excerpt, content, image_url, author, published_at, published |
| `partners` | name, logo_url, website, sort_order, published                    |
| `jobs`     | title, department, location, employment_type, description, qualifications, apply_email, closing_date, document_url, published |
| `resources`| title, description, document_url, date, published                 |
| `job_applications` | name, email, phone, job_title, cover_letter_url, cv_url, certificates_urls, created_at |
| `contact_messages` | name, email, phone, organisation, topic, subject, message, consent, status, notes, ip_hash, user_agent, created_at, updated_at |

All content tables have `published` (0/1), `created_at`, and `updated_at` fields.

## License

Private — All rights reserved.
