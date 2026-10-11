

import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import useScrollAnimations from '../hooks/useScrollAnimations';
import PAGE_BACKGROUNDS from '../config/pageBackgrounds';

export default function Layout({ children, navId, pageId }) {
  const location = useLocation();
  useScrollAnimations(location.pathname);
  const baseRoute = location.pathname.split('/')[1] || 'home';
  const routeId = pageId || (baseRoute === 'projects' && location.pathname.split('/')[2] ? 'project-detail' : baseRoute === 'insights' && location.pathname.split('/')[2] ? 'insights-detail' : baseRoute === 'leadership' && location.pathname.split('/')[2] ? 'leadership-detail' : baseRoute) || 'home';
  const background = PAGE_BACKGROUNDS[routeId] || PAGE_BACKGROUNDS.notFound;

  return (
    <div className="site-shell" data-page={routeId} data-bg-treatment={background.treatment} data-hero={location.pathname === '/' ? 'true' : undefined} style={{ '--page-bg-image': `url("${background.image}")`, '--page-bg-position': background.position || 'center' }}>
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
