/**
 * Projects & Impact.
 *
 * Outcome-led listing. Each card states the challenge context, what CGP
 * contributed and what changed, rather than listing activities — the audit's
 * "cards should communicate outcomes, not just activities" finding.
 *
 * A theme filter is provided because the project record spans financing,
 * detection, preparedness, governance, capacity and data.
 */

import React, { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Seo, {
  BASE_JSONLD,
  breadcrumbJsonLd,
  itemListJsonLd,
  pageJsonLd,
} from '../components/Seo';
import SmartLink from '../components/SmartLink';
import { CtaStrip, ProjectCard, SectionHeader } from '../components/cards';
import { PAGE_META } from '../content/navigation';
import { PROJECTS } from '../content/projects';
import { PROJECT_STATS } from '../content/impact';

const META = PAGE_META['/projects'];

export default function Projects() {
  const [theme, setTheme] = useState('all');

  const themes = useMemo(() => {
    const unique = [...new Set(PROJECTS.map((p) => p.theme).filter(Boolean))].sort();
    return ['all', ...unique];
  }, []);

  const filtered = useMemo(
    () => (theme === 'all' ? PROJECTS : PROJECTS.filter((p) => p.theme === theme)),
    [theme]
  );

  const jsonLd = useMemo(
    () => [
      ...BASE_JSONLD,
      pageJsonLd({ name: META.title, path: '/projects', description: META.description }),
      breadcrumbJsonLd(META.breadcrumb),
      itemListJsonLd('CGP projects', PROJECTS.map((p) => ({ name: p.title, to: `/projects/${p.slug}` }))),
    ],
    []
  );

  return (
    <Layout navId="projects">
      <Seo title={META.title} description={META.description} path="/projects" jsonLd={jsonLd} />

      <PageHeader
        trail={META.breadcrumb}
        h1="Projects & Impact"
        dek="Pandemic Fund leadership, 7-1-7 readiness, AI surveillance, digital One Health pilots and simulation readiness — and what each of them changed."
      />

      {/* ---------------- Impact figures ---------------- */}
      <section className="section-dark section-tight" aria-label="Project record at a glance">
        <div className="wrap">
          <div className="stats-single-card">
            <div className="stats-single-card-grid stats-single-card-grid--4">
              {PROJECT_STATS.map((figure) => (
                <div className="stat-cell" key={figure.id}>
                  <span className="stat-num">{figure.display}</span>
                  <span className="stat-lbl">{figure.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Listing ---------------- */}
      <section aria-labelledby="record-heading">
        <div className="wrap">
          <SectionHeader
            id="record-heading"
            eyebrow="Project Record"
            title="Flagship projects"
            lede="Each entry summarises the problem, CGP’s contribution and the result."
          />

          <div className="filter-bar">
            <div className="field field-inline">
              <label htmlFor="project-theme">Filter by theme</label>
              <select
                id="project-theme"
                className="input"
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
              >
                {themes.map((t) => (
                  <option key={t} value={t}>
                    {t === 'all' ? `All themes (${PROJECTS.length})` : t}
                  </option>
                ))}
              </select>
            </div>
            <p className="filter-bar-count" role="status" aria-live="polite">
              {filtered.length === PROJECTS.length
                ? `${PROJECTS.length} projects`
                : `${filtered.length} of ${PROJECTS.length} projects`}
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className="grid-auto">
              {filtered.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          ) : (
            <p className="empty-inline" role="status">
              No projects in this theme.
            </p>
          )}

          <p className="section-trailing-link">
            <SmartLink className="text-link" to="/partner-with-us#contact-form">
              Ask us about a project <i className="bi bi-arrow-right" aria-hidden="true" />
            </SmartLink>
          </p>
        </div>
      </section>

      <CtaStrip
        title="See CGP in action"
        body="Explore the subnational initiatives that put these projects into practice."
        actions={[
          { label: 'CGP Initiatives', to: '/initiatives', variant: 'white' },
          { label: 'Partner With Us', to: '/partner-with-us#contact-form', variant: 'white' },
        ]}
      />
    </Layout>
  );
}
