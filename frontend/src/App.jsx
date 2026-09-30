/**
 * Application shell and routes.
 *
 * Route structure follows the audit's information architecture:
 *
 *   Home → Who We Are (/about, /leadership, /partners, /careers)
 *        → What We Do (/what-we-do, /projects, /projects/:slug,
 *                      /initiatives, /resources)
 *        → Insights & Research (/insights, /insights/:slug)
 *        → Contact (/contact)
 *
 * Additions vs the previous router:
 *  - `React.lazy` on every page, so the initial bundle is the shell plus the
 *    homepage rather than all 18 routes at once.
 *  - A `path="*"` 404 route with a branded recovery page.
 *  - `/news` is kept as a permanent redirect to `/insights` and article
 *    query-string URLs are redirected to their new indexable `/insights/:slug`
 *    equivalents, so no existing link 404s.
 *  - A `RouteAnnouncer` gives assistive technology a polite live region that
 *    names the new page after each client-side navigation.
 */

import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, API_BASE } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Skeleton, SkeletonCard } from './components/Skeleton';
import { articleSlug } from './content/insights';
import './style.css';
import './site.css';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const WhatWeDo = lazy(() => import('./pages/WhatWeDo'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Initiatives = lazy(() => import('./pages/Initiatives'));
const Insights = lazy(() => import('./pages/Insights'));
const InsightDetail = lazy(() => import('./pages/InsightDetail'));
const Partners = lazy(() => import('./pages/Partners'));
const Leadership = lazy(() => import('./pages/Leadership'));
const Resources = lazy(() => import('./pages/Resources'));
const Contact = lazy(() => import('./pages/Contact'));
const Careers = lazy(() => import('./pages/Careers'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Accessibility = lazy(() => import('./pages/Accessibility'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Login = lazy(() => import('./pages/admin/Login'));
const { Dashboard } = lazy(() => import('./pages/admin/Dashboard'));
const HeroesAdmin = lazy(() => import('./pages/admin/Heroes'));
const NewsAdmin = lazy(() => import('./pages/admin/NewsAdmin'));
const PartnersAdmin = lazy(() => import('./pages/admin/PartnersAdmin'));
const CareersAdmin = lazy(() => import('./pages/admin/CareersAdmin'));
const ResourcesAdmin = lazy(() => import('./pages/admin/ResourcesAdmin'));
const JobApplications = lazy(() => import('./pages/admin/JobApplications'));

/** Fallback while a route chunk downloads. */
function RouteFallback() {
  return (
    <div className="route-loading" aria-busy="true">
      <span className="sr-only">Loading page…</span>
      <div className="wrap">
        <Skeleton width="220px" height="1.6rem" className="skeleton-block" />
        <div className="grid-3" style={{ marginTop: '32px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

/** Announce client-side navigations to screen readers. */
function RouteAnnouncer() {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // Prefer the document title the Seo component has just written.
    const id = window.setTimeout(() => setMessage(document.title), 120);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}

/**
 * Maps the legacy `/news?article=<id>` URL onto the new indexable
 * `/insights/<slug>` path so previously shared links keep working.
 */
function NewsRedirect() {
  const location = useLocation();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('article');
    if (!id) {
      setTarget('/insights');
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE}/api/news`)
      .then((r) => r.json())
      .then((all) => {
        if (cancelled) return;
        const match = Array.isArray(all)
          ? all.find((n) => String(n.id) === String(id))
          : null;
        setTarget(match ? `/insights/${articleSlug(match)}` : '/insights');
      })
      .catch(() => {
        if (!cancelled) setTarget('/insights');
      });
    return () => {
      cancelled = true;
    };
  }, [location.search]);

  if (!target) return <RouteFallback />;
  return <Navigate to={target} replace />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <RouteAnnouncer />
      <Routes>
        {/* ---------- Public ---------- */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/leadership" element={<Leadership />} />
        <Route path="/what-we-do" element={<WhatWeDo />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/initiatives" element={<Initiatives />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/insights/:slug" element={<InsightDetail />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/accessibility" element={<Accessibility />} />

        {/* Legacy news URLs, permanently redirected */}
        <Route path="/news" element={<NewsRedirect />} />
        <Route path="/news/*" element={<NewsRedirect />} />

        {/* ---------- Admin ---------- */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/heroes" element={<ProtectedRoute><HeroesAdmin /></ProtectedRoute>} />
        <Route path="/admin/news" element={<ProtectedRoute><NewsAdmin /></ProtectedRoute>} />
        <Route path="/admin/partners" element={<ProtectedRoute><PartnersAdmin /></ProtectedRoute>} />
        <Route path="/admin/careers" element={<ProtectedRoute><CareersAdmin /></ProtectedRoute>} />
        <Route path="/admin/resources" element={<ProtectedRoute><ResourcesAdmin /></ProtectedRoute>} />
        <Route path="/admin/job-applications" element={<ProtectedRoute><JobApplications /></ProtectedRoute>} />

        {/* ---------- 404 ---------- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
