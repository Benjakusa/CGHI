/**
 * CGP Initiatives.
 *
 * Renders the six programmes from `src/content/initiatives.js` as a list of
 * `<details>` disclosures — native, keyboard-accessible, and openable via a
 * deep link (`/initiatives#ewin`), which is what the capability cards and
 * project pages point at.
 *
 * This replaces a page whose copy was duplicated a third time in Home.jsx.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Seo, {
  BASE_JSONLD,
  breadcrumbJsonLd,
  itemListJsonLd,
  pageJsonLd,
} from '../components/Seo';
import SmartLink from '../components/SmartLink';
import { CtaStrip, ProjectChips, SectionHeader } from '../components/cards';
import { PAGE_META } from '../content/navigation';
import { INITIATIVES, INITIATIVE_BY_ID, SECTIONS } from '../content/initiatives';

const META = PAGE_META['/initiatives'];

function SectionList({ initiative }) {
  const present = SECTIONS.filter((s) => initiative[s.key]?.length);
  if (present.length === 0) return null;

  return (
    <div className="accordion-body">
      {initiative.showSevenOneSeven && (
        <div className="seven-one-seven" aria-label="The 7-1-7 targets: 7 days to detect, 1 day to notify, 7 days to respond">
          <div className="sos-cell">
            <span className="n">7</span>
            <span className="d">days to detect a signal</span>
          </div>
          <div className="sos-cell">
            <span className="n">1</span>
            <span className="d">day to notify</span>
          </div>
          <div className="sos-cell">
            <span className="n">7</span>
            <span className="d">days to respond</span>
          </div>
        </div>
      )}

      {present.map((section) => (
        <div key={section.key} className="accordion-section">
          <h4>{section.heading}</h4>
          {initiative[section.key].map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      ))}

      {initiative.relatedProjects?.length > 0 && (
        <div className="accordion-section">
          <h4>Related projects</h4>
          <ProjectChips ids={initiative.relatedProjects} />
        </div>
      )}
    </div>
  );
}

export default function Initiatives() {
  const location = useLocation();
  const firstRender = useRef(true);

  // Open and scroll to the initiative named in the URL hash.
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (!hash || !INITIATIVE_BY_ID[hash]) return;
    if (firstRender.current) firstRender.current = false;

    const target = document.getElementById(hash);
    if (!target) return;
    const details = target.closest('details') || target.querySelector('details');
    if (details) details.open = true;
    // Defer so the browser lays the content out before we scroll to it.
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [location.hash]);

  const jsonLd = useMemo(
    () => [
      ...BASE_JSONLD,
      pageJsonLd({ name: META.title, path: '/initiatives', description: META.description }),
      breadcrumbJsonLd(META.breadcrumb),
      itemListJsonLd('CGP initiatives', INITIATIVES.map((i) => ({ name: i.title, to: `/initiatives#${i.id}` }))),
    ],
    []
  );

  return (
    <Layout navId="initiatives">
      <Seo title={META.title} description={META.description} path="/initiatives" jsonLd={jsonLd} />

      <PageHeader
        trail={META.breadcrumb}
        h1="CGP Initiatives"
        dek="Six subnational and community-level programmes through which CGP puts its epidemic-intelligence approach into practice."
      />

      {/* ---------------- At a glance ---------------- */}
      <section className="section-tight section-surface" aria-label="Initiatives at a glance">
        <div className="wrap">
          <ul className="initiative-index">
            {INITIATIVES.map((initiative) => (
              <li key={initiative.id}>
                <SmartLink to={`/initiatives#${initiative.id}`}>
                  <span className="initiative-icon" aria-hidden="true">
                    <i className={`bi ${initiative.icon}`} />
                  </span>
                  <span>
                    <strong>{initiative.title}</strong>
                    <em>
                      {initiative.status}
                      {initiative.location ? ` · ${initiative.location}` : ''}
                    </em>
                  </span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Full detail ---------------- */}
      <section aria-labelledby="programmes-heading">
        <div className="wrap">
          <SectionHeader
            id="programmes-heading"
            eyebrow="Active programmes"
            title="Initiative detail"
            lede="Background, objectives, key activities and expected outcomes for each programme."
          />

          <div className="accordion-list">
            {INITIATIVES.map((initiative, index) => (
              <details
                className="accordion-item"
                key={initiative.id}
                id={initiative.id}
                open={index === 0}
              >
                <summary>
                  <span className="accordion-icon" aria-hidden="true">
                    <i className={`bi ${initiative.icon}`} />
                  </span>
                  <span className="accordion-summary-text">
                    <span className="accordion-summary-title">{initiative.title}</span>
                    <span className="accordion-summary-meta">
                      {initiative.status}
                      {initiative.location ? ` · ${initiative.location}` : ''}
                    </span>
                  </span>
                  <span className="accordion-tag">{initiative.label}</span>
                  <span className="accordion-plus" aria-hidden="true" />
                </summary>
                <div className="accordion-panel">
                  <p className="lead">{initiative.summary}</p>
                  <SectionList initiative={initiative} />
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaStrip
        title="Learn more about CGP's projects"
        body="See the full project record behind these initiatives."
        actions={[
          { label: 'Explore Our Projects', to: '/projects', variant: 'white' },
          { label: 'Partner With Us', to: '/partner-with-us#contact-form', variant: 'white' },
        ]}
      />
    </Layout>
  );
}
