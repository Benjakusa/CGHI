/**
 * Media Insights and Research — /insights
 *
 * Replaces the old `/news` page. The audit asked for search and category
 * filters, and for cards with image, category, date, title, summary and a
 * "Read more" link, all of which `InsightCard` provides.
 *
 * Search and filter state live in the URL query string so a filtered view can
 * be linked, shared and indexed, and the browser's back button works.
 */

import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Seo, {
  BASE_JSONLD,
  breadcrumbJsonLd,
  itemListJsonLd,
  pageJsonLd,
} from '../components/Seo';
import { CtaStrip, InsightCard } from '../components/cards';
import { AsyncSection, EmptyState, SkeletonCard } from '../components/Skeleton';
import useApi from '../hooks/useApi';
import { PAGE_META } from '../content/navigation';
import {
  FALLBACK_ARTICLES,
  INSIGHT_CATEGORIES,
  normaliseArticles,
} from '../content/insights';

const META = PAGE_META['/insights'];
const ALL = 'all';

export default function Insights() {
  const [params, setParams] = useSearchParams();
  const news = useApi('/api/news', FALLBACK_ARTICLES);

  const query = params.get('q') || '';
  const category = params.get('category') || ALL;

  const update = (next) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === ALL) merged.delete(key);
      else merged.set(key, value);
    });
    setParams(merged, { replace: true });
  };

  const articles = useMemo(() => {
    const list = news.data?.length ? news.data : FALLBACK_ARTICLES;
    return normaliseArticles(list);
  }, [news.data]);

  // Facet counts reflect the corpus, not the current filter, so the numbers
  // next to each category do not jump around as the user clicks.
  const counts = useMemo(() => {
    const map = { [ALL]: articles.length };
    INSIGHT_CATEGORIES.forEach((c) => {
      map[c.id] = articles.filter((a) => a.category === c.id).length;
    });
    return map;
  }, [articles]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return articles
      .filter((a) => (category === ALL ? true : a.category === category))
      .filter((a) => {
        if (!term) return true;
        return [a.title, a.excerpt, a.content, a.author, a.category]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(term);
      });
  }, [articles, category, query]);

  // Keep the taxonomy honest: an admin-entered category with no taxonomy entry
  // still appears as a chip rather than silently disappearing from the filter.
  const categories = useMemo(() => {
    const known = new Set(INSIGHT_CATEGORIES.map((c) => c.id));
    const extra = [...new Set(articles.map((a) => a.category))].filter((c) => !known.has(c));
    return [
      { id: ALL, label: 'All' },
      ...INSIGHT_CATEGORIES.filter((c) => counts[c.id] > 0 || c.id === category),
      ...extra.map((c) => ({ id: c, label: c })),
    ];
  }, [articles, counts, category]);

  const isFiltered = query.trim() !== '' || category !== ALL;

  const jsonLd = useMemo(
    () => [
      ...BASE_JSONLD,
      pageJsonLd({ name: META.title, path: '/insights', description: META.description }),
      breadcrumbJsonLd(META.breadcrumb),
      itemListJsonLd('Insights and research', articles.map((a) => ({ name: a.title, to: `/insights/${a.slug}` }))),
    ],
    [articles]
  );

  return (
    <Layout navId="insights">
      <Seo
        title={
          isFiltered
            ? `${query || 'Filtered results'} | Media Insights and Research | ${META.title.split('|')[1]?.trim()}`
            : META.title
        }
        description={META.description}
        path="/insights"
        jsonLd={jsonLd}
      />

      <PageHeader
        trail={META.breadcrumb}
        h1="Media Insights and Research"
        dek="Research, policy, One Health and data & AI publications, plus updates from CGP's field work and technical partnerships."
      />

      <section aria-labelledby="insights-heading">
        <div className="wrap">
          <h2 id="insights-heading" className="sr-only">
            Browse insights
          </h2>

          {/* ---------------- Search + filters ---------------- */}
          <div className="insights-controls">
            <div className="field field-inline field-search">
              <label htmlFor="insight-search">Search insights</label>
              <div className="search-input-wrap">
                <i className="bi bi-search" aria-hidden="true" />
                <input
                  id="insight-search"
                  type="search"
                  className="input"
                  value={query}
                  placeholder="Search by title, topic or author"
                  onChange={(event) => update({ q: event.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>

            <fieldset className="filter-chips">
              <legend>Filter by category</legend>
              <div className="filter-chip-row">
                {categories.map((c) => (
                  <label
                    key={c.id}
                    className={`filter-chip${category === c.id ? ' is-active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="insight-category"
                      value={c.id}
                      checked={category === c.id}
                      onChange={() => update({ category: c.id })}
                    />
                    <span>
                      {c.label} <span className="filter-chip-count">{counts[c.id] ?? 0}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <p className="filter-bar-count" role="status" aria-live="polite">
              {results.length === articles.length
                ? `${articles.length} article${articles.length === 1 ? '' : 's'}`
                : `${results.length} of ${articles.length} articles`}
            </p>
          </div>

          {/* ---------------- Results ---------------- */}
          <AsyncSection
            loading={news.loading}
            label="Loading insights"
            skeleton={
              <div className="grid-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            }
            onRetry={news.retry}
          >
            {results.length > 0 ? (
              <div className="grid-3">
                {results.map((article) => (
                  <InsightCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="bi-search"
                title="No insights match your search"
                action={{ label: 'Clear filters', to: '/insights' }}
              >
                Try a different keyword, or clear the filters to see all published insights.
              </EmptyState>
            )}
          </AsyncSection>

          {isFiltered && (
            <p className="section-trailing-link">
              <button
                type="button"
                className="link-button"
                onClick={() => setParams(new URLSearchParams(), { replace: true })}
              >
                Clear search and filters
              </button>
            </p>
          )}
        </div>
      </section>

      <CtaStrip
        title="See CGP's project record"
        body="Learn more about the projects behind the DMT-PHE and other CGP initiatives."
        actions={[
          { label: 'Explore Our Projects', to: '/projects', variant: 'white' },
          { label: 'CGP Initiatives', to: '/initiatives', variant: 'white' },
        ]}
      />
    </Layout>
  );
}
