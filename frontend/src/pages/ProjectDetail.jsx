/**
 * Project detail — /projects/:slug
 *
 * One consistent template for every project, in the order the audit specified:
 * title, image, location, period, partners, background, objectives, CGP role,
 * activities, results, outputs, related publications.
 *
 * Fields with no approved content yet render a labelled placeholder rather
 * than being invented. The full list of those gaps is `PENDING_CONTENT` in
 * `src/content/projects.js`.
 */

import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Seo, {
  BASE_JSONLD,
  breadcrumbJsonLd,
  pageJsonLd,
} from '../components/Seo';
import SmartLink from '../components/SmartLink';
import {
  CapabilityChips,
  CtaStrip,
  InitiativeChips,
  InsightCard,
  PendingField,
  ProjectCard,
  SectionHeader,
} from '../components/cards';
import NotFound from './NotFound';
import useApi from '../hooks/useApi';
import { FALLBACK_ARTICLES } from '../content/insights';
import { PROJECTS, PROJECTS_BY_SLUG } from '../content/projects';
import { BRAND } from '../config/site';
import { PAGE_META } from '../content/navigation';

const META = PAGE_META['/projects'];

/** Definition-list fact used for the metadata strip. */
function Fact({ label, children, missing }) {
  return (
    <div className="fact">
      <dt>{label}</dt>
      <dd>
        {missing ? <span className="muted">To be confirmed</span> : children}
      </dd>
    </div>
  );
}

function ProjectBody({ project }) {
  const news = useApi('/api/news', FALLBACK_ARTICLES);
  const allArticles = news.data?.length ? news.data : FALLBACK_ARTICLES;

  const relatedArticles = useMemo(
    () => allArticles.filter((a) => (project.relatedPublications || []).includes(a.slug || String(a.id))),
    [allArticles, project.relatedPublications]
  );

  const moreProjects = useMemo(
    () => PROJECTS.filter((p) => p.slug !== project.slug).slice(0, 3),
    [project.slug]
  );

  return (
    <Layout navId="projects">
      <Seo
        title={`${project.title} | ${BRAND.name}`}
        description={project.summary}
        path={`/projects/${project.slug}`}
        type="article"
        imageAlt={`${project.title} — CGP project`}
        jsonLd={[
          ...BASE_JSONLD,
          pageJsonLd({
            name: project.title,
            path: `/projects/${project.slug}`,
            description: project.summary,
          }),
          breadcrumbJsonLd([
            ...META.breadcrumb,
            { label: project.title, to: `/projects/${project.slug}` },
          ]),
        ]}
      />

      <div className="page-header">
        <div className="wrap">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
              <li className="breadcrumb-item">
                <SmartLink to="/">Home</SmartLink>
                <span className="breadcrumb-sep" aria-hidden="true">/</span>
              </li>
              <li className="breadcrumb-item">
                <SmartLink to="/projects">Projects &amp; Impact</SmartLink>
                <span className="breadcrumb-sep" aria-hidden="true">/</span>
              </li>
              <li className="breadcrumb-item">
                <span aria-current="page">{project.title}</span>
              </li>
            </ol>
          </nav>
          <span className="pill">{project.tag}</span>
          <h1>{project.title}</h1>
          <p className="dek">{project.summary}</p>
        </div>
      </div>

      {/* ---------------- Key facts ---------------- */}
      <section className="section-tight" aria-label="Project at a glance">
        <div className="wrap">
          <dl className="fact-grid">
            <Fact label="Location" missing={!project.location}>{project.location}</Fact>
            <Fact label="Period" missing={!project.year}>{project.year}</Fact>
            <Fact label="Theme">{project.theme}</Fact>
            <Fact label="Partners" missing={!project.partnerNames?.length}>
              {project.partnerNames?.length ? (
                <ul className="inline-list">
                  {project.partnerNames.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              ) : null}
            </Fact>
          </dl>

          {project.metrics?.length > 0 && (
            <div className="stat-strip stat-strip--light">
              {project.metrics.map((metric) => (
                <div className="stat-strip-cell" key={metric.label}>
                  <span className="stat-strip-num">{metric.value}</span>
                  <span className="stat-strip-lbl">{metric.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- Narrative ---------------- */}
      <section aria-labelledby="about-project">
        <div className="wrap">
          <div className="prose">
            <h2 id="about-project">About this project</h2>

            <h3>Background</h3>
            {project.background ? (
              <p>{project.background}</p>
            ) : (
              <PendingField
                label="Background"
                note="A short description of the problem and its setting has not yet been approved for publication."
              />
            )}

            <h3>Objectives</h3>
            {project.objectives?.length ? (
              <ul>
                {project.objectives.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <PendingField
                label="Objectives"
                note="Project objectives have not yet been approved for publication."
              />
            )}

            <h3>CGP’s role</h3>
            {project.contribution ? (
              <p>{project.contribution}</p>
            ) : (
              <PendingField
                label="CGP role"
                note="A description of CGP’s specific contribution is pending sign-off."
              />
            )}

            <h3>Activities</h3>
            {project.activities?.length ? (
              <ul>
                {project.activities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <PendingField
                label="Activities"
                note="The activity log for this project is pending."
              />
            )}

            <h3>Results</h3>
            {project.results ? (
              <p className="lead">{project.results}</p>
            ) : (
              <PendingField
                label="Results"
                note="Outcome data for this project has not yet been verified and published."
              />
            )}

            <h3>Outputs</h3>
            {project.outputs?.length ? (
              <ul>
                {project.outputs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <PendingField
                label="Outputs"
                note="A list of produced deliverables (guidelines, plans, dashboards, briefs) is pending."
              />
            )}
          </div>
        </div>
      </section>

      {/* ---------------- Related ---------------- */}
      <section className="section-surface" aria-labelledby="related-heading">
        <div className="wrap">
          <div className="prose">
            <h2 id="related-heading" className="sr-only">Related content</h2>
            <h3>Related areas of work</h3>
            <CapabilityChips ids={project.capabilities} />
            <h3>Related initiatives</h3>
            <InitiativeChips ids={project.relatedInitiatives} />
          </div>

          {relatedArticles.length > 0 && (
            <>
              <div className="subheading-row">
                <h2 className="subheading">Related publications</h2>
              </div>
              <div className="grid-3">
                {relatedArticles.map((article) => (
                  <InsightCard key={article.id} article={article} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="more-projects">
        <div className="wrap">
          <SectionHeader
            id="more-projects"
            eyebrow="Project record"
            title="More CGP projects"
            action={{ label: 'All projects', to: '/projects' }}
          />
          <div className="grid-auto">
            {moreProjects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </div>
      </section>

      <CtaStrip
        title="Interested in this work?"
        body="We are happy to share more detail and discuss collaboration."
        actions={[
          { label: 'Contact Our Team', to: '/contact#contact-form', variant: 'white' },
          { label: 'Explore Our Work', to: '/projects', variant: 'white' },
        ]}
      />
    </Layout>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = PROJECTS_BY_SLUG[slug];

  if (!project) return <NotFound />;

  return <ProjectBody project={project} />;
}
