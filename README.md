# CGHI — Pandemic Intel Center

**CGHI** (Connected Global Health Intelligence) is a web platform for the Pandemic Intelligence Center, providing public-facing content and an admin dashboard for managing heroes, news, partners, jobs, and resources.

## Tech Stack

| Layer   | Technology                                      |
|---------|------------------------------------------------|
| Frontend| React 19 + Vite + React Router v7              |
| Backend | Node.js + Express + better-sqlite3             |
| Auth    | JWT (bcryptjs + jsonwebtoken), 8h expiry       |
| Deploy  | Frontend → Vercel, Backend → self-hosted/VPS   |
| DB      | SQLite (`backend/data/cghi.db`)                |

## Project Structure

```
CGHI/
├── frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── components/   # Navbar, Footer, ProtectedRoute
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # Public pages + /admin/* admin pages
│   │   └── assets/
│   ├── public/
│   └── vercel.json       # Vercel deployment config
├── backend/           # Express REST API
│   ├── routes/        # auth, heroes, news, partners, jobs, resources
│   ├── middleware/    # auth middleware
│   ├── db.js          # SQLite setup + seed data
│   ├── server.js      # Express app entrypoint
│   └── data/          # SQLite DB + uploads (gitignored)
├── .env               # Backend env (gitignored)
├── frontend/.env      # Frontend env (gitignored)
└── README.md
```

## Features

### Public Pages
- **Home** — Hero section, featured projects, initiatives overview
- **About** — Organization info
- **Projects** — Project cards with tags (EBS, CBS, IDSR, 7-1-7, etc.)
- **Initiatives** — Programmatic initiatives with activities and outcomes
- **News** — News listing with category, excerpt, author, published date
- **Careers** — Job listings with department, location, type, apply info
- **Resources** — Document/resource library
- **Contact** — Contact page
- **Privacy** — Privacy policy

### Admin Dashboard (`/admin/*`, requires auth)
- **Dashboard** — Stats overview (total/published/unpublished per entity)
- **Heroes** — CRUD for hero cards
- **News Admin** — CRUD for news articles
- **Partners Admin** — CRUD for partner logos/links
- **Careers Admin** — CRUD for job postings
- **Resources Admin** — CRUD for resources/documents
- **Login** — JWT-based admin authentication

### API Endpoints

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | `/api/auth/login`     | No   | Admin login → JWT token  |
| POST   | `/api/upload`         | Yes  | Upload image (≤5MB)      |
| POST   | `/api/upload/file`    | Yes  | Upload file (≤5MB)       |
| CRUD   | `/api/heroes`         | Yes  | Heroes management        |
| CRUD   | `/api/news`           | Yes  | News management          |
| CRUD   | `/api/partners`       | Yes  | Partners management      |
| CRUD   | `/api/jobs`           | Yes  | Jobs management          |
| CRUD   | `/api/resources`      | Yes  | Resources management     |
| GET    | `/api/admin/stats`    | Yes  | Dashboard statistics     |

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
# Edit .env: set VITE_API_BASE_URL to your backend URL
```

### 2. Environment Variables

**`backend/.env`**
```env
JWT_SECRET=<openssl rand -hex 32>
PORT=4000
FRONTEND_URL=https://your-domain.com
SEED_ADMIN_PASSWORD=<strong-password>
```

**`frontend/.env`**
```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

Generate a secure JWT secret:
```bash
openssl rand -hex 32
```

### 3. Run Development Servers

**Backend** (port 4000):
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

On first backend startup, if no admin exists, the server auto-seeds one using `SEED_ADMIN_PASSWORD` and `SEED_ADMIN_EMAIL` from `.env`. The default fallback credentials are:

| Field   | Value                          |
|---------|--------------------------------|
| Email   | `admin@pandemicintelcenter.org` |
| Password| `Admin@CGHI2025!`              |

These can be overridden via environment variables.

Login with the seeded email and password to get a JWT token sent as a Bearer token for authenticated API calls.

## Deployment

### Frontend (Vercel)
`frontend/vercel.json` configures Vercel to use Vite, output from `dist/`, and rewrite all routes to `index.html` for React Router. Set `VITE_API_BASE_URL` in Vercel env vars.

### Backend
Standalone Express server. Deploy to any Node.js host (VPS, Railway, Render, etc.). Ensure:
- `JWT_SECRET` is set and secure
- `FRONTEND_URL` matches your production frontend URL (for CORS)
- SQLite DB directory is writable
- Uploads directory persists across restarts

## Database Schema

| Table      | Key Fields                                                        |
|------------|-------------------------------------------------------------------|
| `admins`   | email, password_hash, name                                        |
| `heroes`   | title, topic, description, btn1/2_text/link, image_url, sort_order, published |
| `news`     | title, category, excerpt, content, image_url, author, published_at, published |
| `partners` | name, logo_url, website, sort_order, published                    |
| `jobs`     | title, department, location, employment_type, description, qualifications, apply_email, closing_date, document_url, published |
| `resources`| title, description, document_url, date, published                 |

All content tables have `published` (0/1), `created_at`, and `updated_at` fields.

## License

Private — All rights reserved.
