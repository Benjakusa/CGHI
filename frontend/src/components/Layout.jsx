

import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import useScrollAnimations from '../hooks/useScrollAnimations';

export default function Layout({ children, navId }) {
  const location = useLocation();
  useScrollAnimations(location.pathname);

  return (
    <div className="site-shell" data-hero={location.pathname === '/' ? 'true' : undefined}>
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
