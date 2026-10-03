/**
 * Layout — the shell every public page renders inside.
 *
 * Provides the skip-to-content link (the first focusable element on the page),
 * the header, the `<main id="main-content">` landmark that the skip link
 * targets, and the footer. Admin pages deliberately do not use this shell.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, navId }) {
  const location = useLocation();

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/*
        Route announcements: the <main> landmark is re-keyed on navigation so
        screen readers announce the new page instead of silently swapping
        content behind the user.
      */}
      <Navbar activePage={navId} key="navbar" />

      <main id="main-content" tabIndex={-1} key={location.pathname}>
        {children}
      </main>

      <Footer />
    </div>
  );
}
