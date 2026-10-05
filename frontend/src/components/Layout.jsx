

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
      {/*
        Route announcements: the <main> landmark is re-keyed on navigation so
        screen readers announce the new page instead of silently swapping
        content behind the user.

        The skip link is not here. index.html owns it, outside #root, so it is
        present before hydration and stays put afterwards — rendering a second
        copy here put two "Skip to main content" links in the tab order.
      */}
      <Navbar activePage={navId} key="navbar" />

      <main id="main-content" tabIndex={-1} key={location.pathname}>
        {children}
      </main>

      <Footer />
    </div>
  );
}
