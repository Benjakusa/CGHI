/**
 * 404 — branded error page.
 *
 * Served by the `path="*"` route. Marked `noindex` so a soft-404 never enters
 * an index, and offers the two recovery routes the audit specified: Return Home
 * and Explore Our Work, plus the site's main sections as a fallback in case
 * neither is what the visitor wanted.
 */

import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Seo, { BASE_JSONLD } from '../components/Seo';
import SmartLink from '../components/SmartLink';
import { BRAND } from '../config/site';
import { PAGE_META } from '../content/navigation';

const DESTINATIONS = [
  { to: '/what-we-do', icon: 'bi-tools', label: 'What We Do', note: 'Our five areas of expertise' },
  { to: '/projects', icon: 'bi-kanban-fill', label: 'Projects & Impact', note: 'Our project record' },
  { to: '/insights', icon: 'bi-journal-richtext', label: 'Media Insights and Research', note: 'Publications and updates' },
  { to: '/partners', icon: 'bi-people-fill', label: 'Partners', note: 'Who we work with' },
  { to: '/partner-with-us', icon: 'bi-envelope-fill', label: 'Contact', note: 'Talk to our team' },
];

export default function NotFound() {
  const location = useLocation();

  const title = `Page Not Found (404) | ${BRAND.name}`;

  const jsonLd = useMemo(
    () => [
      ...BASE_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Page Not Found',
        isPartOf: { '@id': '/#website' },
      },
    ],
    []
  );

  return (
    <Layout navId={PAGE_META['/404'].navId}>
      <Seo
        title={title}
        description="The page you were looking for could not be found. Return to the CGP homepage or explore our work."
        path={location.pathname}
        imageAlt={`${BRAND.abbr} — ${BRAND.tagline}`}
        noIndex
        jsonLd={jsonLd}
      />

      <section className="error-page">
        <div className="wrap">
          <p className="error-code" aria-hidden="true">
            404
          </p>
          <span className="section-label">Page not found</span>
          <h1>We couldn’t find that page</h1>
          <p className="dek">
            The page may have been moved, renamed, or the link may be out of date. Here is where
            most people are heading.
          </p>

          <div className="button-row button-row--center">
            <SmartLink className="btn btn-primary" to="/">
              <i className="bi bi-house-door" aria-hidden="true" /> Return Home
            </SmartLink>
            <SmartLink className="btn btn-outline" to="/projects">
              Explore Our Work <i className="bi bi-arrow-right" aria-hidden="true" />
            </SmartLink>
          </div>

          <nav className="error-destinations" aria-label="Popular pages">
            <h2 className="sr-only">Popular pages</h2>
            <ul>
              {DESTINATIONS.map((d) => (
                <li key={d.to}>
                  <SmartLink to={d.to}>
                    <i className={`bi ${d.icon}`} aria-hidden="true" />
                    <span>
                      <strong>{d.label}</strong>
                      <em>{d.note}</em>
                    </span>
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          <p className="error-help">
            Think something is broken?{' '}
            <SmartLink to="/partner-with-us#contact-form">Let our team know</SmartLink> and include the
            address you were trying to reach.
          </p>
        </div>
      </section>
    </Layout>
  );
}
