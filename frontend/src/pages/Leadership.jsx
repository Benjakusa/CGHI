/**
 * Leadership & Team.
 *
 * The repository holds no leadership records of any kind, so `LEADERS` in
 * `src/content/leadership.js` is empty and `LEADERSHIP_PENDING` is true. This
 * page renders a complete, designed card template plus a visible "content
 * pending" state rather than inventing names, roles or photographs.
 *
 * To go live: populate `LEADERS` (see the shape documented in that file), or
 * add a `leadership` table + admin screen following the pattern used for
 * partners, then flip `LEADERSHIP_PENDING` to false.
 */

import React, { useMemo } from 'react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Seo, {
  BASE_JSONLD,
  breadcrumbJsonLd,
  pageJsonLd,
} from '../components/Seo';
import SmartLink from '../components/SmartLink';
import SmartImage from '../components/SmartImage';
import { CtaStrip, SectionHeader } from '../components/cards';
import { BRAND } from '../config/site';
import { PAGE_META } from '../content/navigation';
import {
  EXPERTISE_AREAS,
  LEADERS,
  LEADERSHIP_GROUPS,
  LEADERSHIP_PENDING,
  LEADERSHIP_REQUIRED_FIELDS,
} from '../content/leadership';

const META = PAGE_META['/leadership'];

function LeaderCard({ leader }) {
  return (
    <article className="leader-card">
      <div className="leader-card-media">
        <SmartImage
          className="leader-card-photo"
          src={leader.photo}
          alt={`Portrait of ${leader.name}`}
          width="480"
          height="480"
        />
      </div>
      <div className="leader-card-body">
        <h3>{leader.name}</h3>
        <p className="leader-card-position">{leader.position}</p>
        {leader.expertise?.length > 0 && (
          <ul className="chip-list chip-list--static" aria-label="Areas of expertise">
            {leader.expertise.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        {leader.bio && <p>{leader.bio}</p>}
        {leader.profileUrl && (
          <a
            className="text-link"
            href={leader.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View profile <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
            <span className="sr-only"> for {leader.name} (opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  );
}

export default function Leadership() {
  const jsonLd = useMemo(
    () => [
      ...BASE_JSONLD,
      pageJsonLd({ name: META.title, path: '/leadership', description: META.description }),
      breadcrumbJsonLd(META.breadcrumb),
    ],
    []
  );

  const grouped = LEADERSHIP_GROUPS.map((group) => ({
    ...group,
    members: LEADERS.filter((l) => (l.group ?? 'executive') === group.id),
  })).filter((group) => group.members.length > 0);

  return (
    <Layout navId="leadership">
      <Seo title={META.title} description={META.description} path="/leadership" jsonLd={jsonLd} />

      <PageHeader
        trail={META.breadcrumb}
        eyebrow="Who We Are"
        h1="Leadership & Team"
        dek={`Meet the people behind ${BRAND.abbr}’s work in epidemic intelligence, One Health, preparedness and data science.`}
      />

      {LEADERSHIP_PENDING || LEADERS.length === 0 ? (
        <section aria-labelledby="pending-heading">
          <div className="wrap">
            <div className="notice-panel" role="note">
              <h2 id="pending-heading">Leadership profiles are being published</h2>
              <p>
                We are preparing individual profiles for {BRAND.abbr}’s executive, technical and
                advisory leadership, including each person’s role, areas of expertise and a link
                to their professional profile.
              </p>
              <p>
                In the meantime, the disciplines {BRAND.abbr} works across are listed below, and our
                full partner and collaborator network is published on the{' '}
                <SmartLink to="/partners">Partners page</SmartLink>.
              </p>
              <p className="notice-panel-meta">
                <i className="bi bi-info-circle" aria-hidden="true" /> Content pending CGP
                sign-off. Required fields per profile:{' '}
                {LEADERSHIP_REQUIRED_FIELDS.join(', ')}.
              </p>
            </div>
          </div>
        </section>
      ) : (
        grouped.map((group) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <div className="wrap">
              <SectionHeader
                id={`group-${group.id}`}
                eyebrow={`${group.members.length} ${group.members.length === 1 ? 'profile' : 'profiles'}`}
                title={group.title}
              />
              <div className="grid-auto">
                {group.members.map((leader) => (
                  <LeaderCard key={leader.id} leader={leader} />
                ))}
              </div>
            </div>
          </section>
        ))
      )}

      <section className="section-surface" aria-labelledby="disciplines-heading">
        <div className="wrap">
          <SectionHeader
            id="disciplines-heading"
            eyebrow="Expertise"
            title="Disciplines on our team"
            lede={`${BRAND.abbr} brings together expertise across the following areas.`}
          />
          <ul className="chip-list chip-list--static">
            {EXPERTISE_AREAS.map((area) => (
              <li key={area.id}>{area.label}</li>
            ))}
          </ul>
          <p className="section-trailing-link">
            <SmartLink className="text-link" to="/careers">
              See current openings <i className="bi bi-arrow-right" aria-hidden="true" />
            </SmartLink>
          </p>
        </div>
      </section>

      <CtaStrip
        title="Want to work with our team?"
        body="We welcome collaborations with researchers, practitioners and institutions."
        actions={[
          { label: 'Partner With Us', to: '/partner-with-us#contact-form', variant: 'white' },
          { label: 'Careers', to: '/careers', variant: 'white' },
        ]}
      />
    </Layout>
  );
}
