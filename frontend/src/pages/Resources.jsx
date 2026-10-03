/**
 * Resource Library.
 *
 * Documents come from `GET /api/resources` and are managed at /admin/resources.
 * The page adds a search box and a type filter, an explicit empty state, and
 * skeleton loading, so an empty library reads as designed rather than broken.
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
import { CtaStrip, SectionHeader } from '../components/cards';
import { AsyncSection, EmptyState, SkeletonCard } from '../components/Skeleton';
import useApi from '../hooks/useApi';
import { resolveAssetUrl } from '../context/AuthContext';
import { PAGE_META } from '../content/navigation';

const META = PAGE_META['/resources'];

const FILTERS = [
  { id: 'all', label: 'All documents' },
  { id: 'pdf', label: 'PDF' },
  { id: 'other', label: 'Other formats' },
];

function isPdf(url) {
  return Boolean(url) && /\.pdf($|\?)/i.test(url);
}

function ResourceCard({ resource }) {
  const pdf = isPdf(resource.document_url);
  return (
    <article className="resource-card">
      <div className="resource-card-icon" aria-hidden="true">
        <i className={pdf ? 'bi bi-file-earmark-pdf' : 'bi bi-file-earmark-text'} />
      </div>
      <div className="resource-card-body">
        {resource.date && <p className="resource-card-meta">{resource.date}</p>}
        <h3>{resource.title}</h3>
        {resource.description && <p>{resource.description}</p>}
        {resource.document_url ? (
          <a
            className="resource-card-link"
            href={resolveAssetUrl(resource.document_url)}
            target="_blank"
            rel="noopener noreferrer"
          >
            View document
            <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <span className="resource-card-link resource-card-link-disabled">
            Document not yet available
          </span>
        )}
      </div>
    </article>
  );
}

export default function Resources() {
  const resources = useApi('/api/resources', []);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const list = useMemo(() => resources.data ?? [], [resources.data]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return list
      .filter((r) => {
        if (filter === 'pdf') return isPdf(r.document_url);
        if (filter === 'other') return !isPdf(r.document_url);
        return true;
      })
      .filter((r) => {
        if (!term) return true;
        return [r.title, r.description].filter(Boolean).join(' ').toLowerCase().includes(term);
      });
  }, [list, query, filter]);

  const jsonLd = useMemo(
    () => [
      ...BASE_JSONLD,
      pageJsonLd({ name: META.title, path: '/resources', description: META.description }),
      breadcrumbJsonLd(META.breadcrumb),
      ...(list.length
        ? [itemListJsonLd('CGP resources', list.map((r) => ({ name: r.title, to: '/resources' })))]
        : []),
    ],
    [list]
  );

  return (
    <Layout navId="resources">
      <Seo title={META.title} description={META.description} path="/resources" jsonLd={jsonLd} />

      <PageHeader
        trail={META.breadcrumb}
        h1="Resource Library"
        dek="Reports, tools, guidelines, and publications from CGP's research and implementation work."
      />

      <section aria-labelledby="library-heading">
        <div className="wrap">
          <h2 id="library-heading" className="sr-only">
            Browse resources
          </h2>

          <AsyncSection
            loading={resources.loading}
            label="Loading resources"
            skeleton={
              <div className="grid-3">
                <SkeletonCard image={false} />
                <SkeletonCard image={false} />
                <SkeletonCard image={false} />
              </div>
            }
            onRetry={resources.retry}
          >
            {list.length === 0 ? (
              <EmptyState
                icon="bi-journal-richtext"
                title="The resource library is being built"
                action={{ label: 'Explore Our Projects', to: '/projects' }}
              >
                We are preparing policy briefs, technical guidelines, epidemic intelligence tools
                and research outputs. In the meantime, the project record and published insights
                are available now.
              </EmptyState>
            ) : (
              <>
                <div className="insights-controls">
                  <div className="field field-inline field-search">
                    <label htmlFor="resource-search">Search resources</label>
                    <div className="search-input-wrap">
                      <i className="bi bi-search" aria-hidden="true" />
                      <input
                        id="resource-search"
                        type="search"
                        className="input"
                        value={query}
                        placeholder="Search by title or topic"
                        onChange={(event) => setQuery(event.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <fieldset className="filter-chips">
                    <legend>Filter by format</legend>
                    <div className="filter-chip-row">
                      {FILTERS.map((f) => (
                        <label
                          key={f.id}
                          className={`filter-chip${filter === f.id ? ' is-active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="resource-filter"
                            value={f.id}
                            checked={filter === f.id}
                            onChange={() => setFilter(f.id)}
                          />
                          <span>{f.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <p className="filter-bar-count" role="status" aria-live="polite">
                    {filtered.length === list.length
                      ? `${list.length} document${list.length === 1 ? '' : 's'}`
                      : `${filtered.length} of ${list.length} documents`}
                  </p>
                </div>

                {filtered.length > 0 ? (
                  <div className="grid-3">
                    {filtered.map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="bi-search" title="No documents match your search">
                    Try a different keyword, or switch the format filter.
                  </EmptyState>
                )}
              </>
            )}
          </AsyncSection>
        </div>
      </section>

      <section className="section-surface" aria-labelledby="related-heading">
        <div className="wrap">
          <SectionHeader
            id="related-heading"
            align="center"
            eyebrow="Related"
            title="Looking for something else?"
          />
          <div className="button-row button-row--center">
            <SmartLink className="btn" to="/projects">
              Explore Our Projects
            </SmartLink>
            <SmartLink className="btn btn-outline" to="/insights">
              Read the Research
            </SmartLink>
          </div>
        </div>
      </section>

      <CtaStrip
        title="Request a resource"
        body="If you need a specific report, tool or dataset, tell us and we will point you to it."
        actions={[
          { label: 'Contact Our Team', to: '/partner-with-us#contact-form', variant: 'white' },
        ]}
      />
    </Layout>
  );
}
