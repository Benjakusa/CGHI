/**
 * Partners & Collaborators.
 *
 * The full network, on one page. The logo wall is driven by `GET /api/partners`
 * (editable at /admin/partners) and falls back to the bundled list, so the
 * page always renders the real network even if the API is down.
 *
 * Every tile is the same size and only becomes a link when a `website` value
 * exists in the database — no partner has a fabricated URL.
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
import { CtaStrip, PartnerGrid, SectionHeader } from '../components/cards';
import { AsyncSection } from '../components/Skeleton';
import useApi from '../hooks/useApi';
import { PAGE_META } from '../content/navigation';
import {
  COLLABORATOR_TYPES,
  FALLBACK_PARTNERS,
} from '../content/partners';

const META = PAGE_META['/partners'];

export default function Partners() {
  const partners = useApi('/api/partners', FALLBACK_PARTNERS);
  const [query, setQuery] = useState('');

  const list = partners.data?.length ? partners.data : FALLBACK_PARTNERS;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return list;
    return list.filter((p) => p.name.toLowerCase().includes(term));
  }, [list, query]);

  const linkedCount = list.filter((p) => p.website).length;

  const jsonLd = useMemo(
    () => [
      ...BASE_JSONLD,
      pageJsonLd({ name: META.title, path: '/partners', description: META.description }),
      breadcrumbJsonLd(META.breadcrumb),
      itemListJsonLd('Partners and collaborators', list.map((p) => ({ name: p.name, to: '/partners' }))),
    ],
    [list]
  );

  return (
    <Layout navId="partners">
      <Seo title={META.title} description={META.description} path="/partners" jsonLd={jsonLd} />

      <PageHeader
        trail={META.breadcrumb}
        eyebrow="Who We Are"
        h1="Our Partners & Collaborators"
        dek="CGP works with ministries, public health institutes, multilateral institutions, financing mechanisms, universities, implementing partners and communities to strengthen health security."
      />

      <section aria-labelledby="network-heading">
        <div className="wrap">
          <SectionHeader
            id="network-heading"
            eyebrow="Our network"
            title={`${list.length} partner${list.length === 1 ? '' : 's'} and collaborators`}
            lede={
              linkedCount > 0
                ? 'Select a partner to visit their website.'
                : 'Partner websites are published as each organisation supplies a verified link.'
            }
          />

          <div className="filter-bar">
            <div className="field field-inline">
              <label htmlFor="partner-search">Filter partners</label>
              <input
                id="partner-search"
                type="search"
                className="input"
                value={query}
                placeholder="e.g. WHO, Africa CDC, Palladium"
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
              />
            </div>
            <p className="filter-bar-count" role="status" aria-live="polite">
              {filtered.length === list.length
                ? `${list.length} shown`
                : `${filtered.length} of ${list.length} shown`}
            </p>
          </div>

          <AsyncSection
            loading={partners.loading}
            label="Loading partners"
            skeleton={
              <div className="partner-grid partner-grid--lg" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div className="partner-tile" key={i}>
                    <span className="skeleton" style={{ width: '70%', height: '2.4rem' }} />
                  </div>
                ))}
              </div>
            }
            onRetry={partners.retry}
          >
            {filtered.length > 0 ? (
              <PartnerGrid partners={filtered} size="lg" />
            ) : (
              <p className="empty-inline" role="status">
                No partners match “{query}”.{' '}
                <button type="button" className="link-button" onClick={() => setQuery('')}>
                  Clear filter
                </button>
              </p>
            )}
          </AsyncSection>
        </div>
      </section>

      <section className="section-surface" aria-labelledby="types-heading">
        <div className="wrap">
          <SectionHeader
            id="types-heading"
            eyebrow="How we work together"
            title="Types of collaborator"
            lede="CGP’s partnerships span government, multilateral, financing, academic, implementing and community channels."
          />
          <div className="grid-auto">
            {COLLABORATOR_TYPES.map((type) => (
              <article key={type.id} className="icon-card icon-card--compact">
                <div className="card-icon" aria-hidden="true">
                  <i className={`bi ${type.icon}`} />
                </div>
                <h3>{type.title}</h3>
                <p className="muted">{type.examples}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaStrip
        title="Become a partner"
        body="If your organisation works on global health security, preparedness or surveillance, we would like to hear from you."
        actions={[
          { label: 'Partner With Us', to: '/partner-with-us#contact-form', variant: 'white' },
          { label: 'Explore Our Work', to: '/projects', variant: 'white' },
        ]}
      />
    </Layout>
  );
}
