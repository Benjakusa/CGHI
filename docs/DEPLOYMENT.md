# Deployment & Domain Configuration

The public frontend is a static site hosted on cPanel at `https://cghpi.org`.
The Express backend remains hosted on Render. The frontend build reads its
public domain and API origin from `frontend/.env`.

## 1. Build the frontend for cPanel

1. In `frontend/`, copy `.env.example` to `.env` and set:

   ```env
   VITE_SITE_URL=https://cghpi.org
   VITE_API_BASE_URL=https://<your-render-service>.onrender.com
   ```

   Use the actual Render service URL and omit its trailing slash. These values
   are included in the public frontend build; never put secrets in this file.
2. Run `npm install` if dependencies are not installed, then run
   `npm run package:cpanel`. The command builds the site and produces
   `frontend/cghpi.org-site.zip`. It checks that the SPA rewrite and sitemap are
   present and reports the API URL used by the build.

## 2. Upload the site in cPanel

1. In cPanel, confirm `cghpi.org` is configured as the primary or an addon
   domain. Note its document root, commonly `public_html`. Point the domain's
   DNS to the cPanel hosting provider using the records supplied by that host.
2. Enable AutoSSL for `cghpi.org` (and `www.cghpi.org` if it is configured).
3. Open **File Manager**, navigate to the domain's document root, and back up or
   remove any old site files.
4. Upload `cghpi.org-site.zip` and use **Extract** in the document root. The
   files `index.html`, `.htaccess`, `assets/`, `favicon.ico`, and the other
   build outputs should be directly inside the document root, not inside an
   extra `dist` folder.
5. Once AutoSSL is active, enable cPanel's **Force HTTPS Redirect** or leave
   the supplied `.htaccess` HTTPS redirect active. The `.htaccess` also sends
   `www.cghpi.org` to the canonical apex host `https://cghpi.org` and routes
   application paths such as `/about` to React Router. Do not add a second
   redirect that sends the apex domain back to `www`.
6. Visit the homepage and a nested page directly, then refresh the nested page.
   Confirm both load over HTTPS.

The included `.htaccess` requires Apache's `mod_rewrite`. If your cPanel host
does not support it, ask the host to enable it; direct visits and refreshes of
nested React routes will otherwise return 404.

## 3. Keep the backend on Render

Deploy the `backend/` service on Render using the existing `backend/.render.yaml`
configuration. Set these service environment variables in the Render dashboard:

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Required signing secret. Generate with `openssl rand -hex 32`. |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | First-boot admin credentials. Set a strong unique password. |
| `FRONTEND_URL` | Set to `https://cghpi.org` for browser CORS access. |
| `IP_HASH_SALT` | Optional salt for contact-enquiry IP hashes; defaults to `JWT_SECRET`. |
| `DB_PATH` | SQLite path. Use a persistent Render disk mounted at `backend/data`, or admin-managed content and uploads are lost when the instance is replaced. |

Deploy the backend before releasing the frontend that submits contact forms.
The frontend's `VITE_API_BASE_URL` must match the live Render service URL. Since
Vite inserts it at build time, rebuild and re-upload the frontend if the API URL
changes. The repository's default is `https://cghi.onrender.com`; confirm that
this is the correct active Render service before packaging.

## 4. Post-deploy checks

1. Open `https://cghpi.org/robots.txt` and `/sitemap.xml`; URLs should use the
   `https://cghpi.org` origin.
2. View the homepage source and confirm canonical, Open Graph, and Twitter image
   URLs use `https://cghpi.org`.
3. In browser developer tools, confirm API requests go to the Render service,
   not localhost.
4. Open and refresh a nested route such as `/about` and a detail route.
5. Submit a test enquiry and confirm it appears in the admin inbox.
6. Change the seeded admin password after first login.
