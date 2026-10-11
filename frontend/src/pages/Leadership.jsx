import React, { useMemo } from 'react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Seo, { BASE_JSONLD, breadcrumbJsonLd, pageJsonLd } from '../components/Seo';
import SmartImage from '../components/SmartImage';
import { SectionHeader } from '../components/cards';
import { AsyncSection, EmptyState } from '../components/Skeleton';
import useApi from '../hooks/useApi';
import { PAGE_META } from '../content/navigation';
import { resolveAssetUrl } from '../context/AuthContext';

const META = PAGE_META['/leadership'];

function TeamCard({ member }) {
  const links = Array.isArray(member.social_links) ? member.social_links : [];
  return <article className="leader-card">
    <div className="leader-card-media">
      {member.image_url ? <SmartImage className="leader-card-photo" src={resolveAssetUrl(member.image_url)} alt={`Portrait of ${member.name}`} width="480" height="480" /> : <div className="team-image-fallback" aria-hidden="true"><i className="bi bi-person" /></div>}
    </div>
    <div className="leader-card-body">
      <h3>{member.name}</h3><p className="leader-card-position">{member.role}</p>
      {member.biography && <p>{member.biography}</p>}
      {(member.email || member.phone || links.length > 0) && <div className="team-contact">
        {member.email && <a href={`mailto:${member.email}`}>{member.email}</a>}
        {member.phone && <a href={`tel:${member.phone.replace(/[^+\d]/g, '')}`}>{member.phone}</a>}
        {links.map((link) => <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>)}
      </div>}
    </div>
  </article>;
}

function TeamSkeleton() {
  return <div className="grid-auto" aria-hidden="true">{[0, 1, 2].map((item) => <article className="leader-card" key={item}><div className="leader-card-media skeleton" /><div className="leader-card-body"><span className="skeleton" /><span className="skeleton" /><span className="skeleton" /></div></article>)}</div>;
}

export default function Leadership() {
  const team = useApi('/api/team', []);
  const people = team.data || [];
  const jsonLd = useMemo(() => [
    ...BASE_JSONLD,
    pageJsonLd({ name: META.title, path: '/leadership', description: META.description }),
    breadcrumbJsonLd(META.breadcrumb),
  ], []);
  return <Layout navId="leadership" pageId="leadership">
    <Seo title={META.title} description={META.description} path="/leadership" jsonLd={jsonLd} />
    <PageHeader trail={META.breadcrumb} eyebrow="Who We Are" h1="Leadership & Team" dek="Meet the people behind our work in epidemic intelligence, One Health, preparedness and data science." />
    <section aria-labelledby="team-heading"><div className="wrap">
      <SectionHeader id="team-heading" title="Our team" eyebrow={team.loading ? 'Loading profiles' : `${people.length} ${people.length === 1 ? 'profile' : 'profiles'}`} />
      <AsyncSection loading={team.loading} error={team.error ? 'Team profiles could not be loaded.' : null} onRetry={team.retry} label="Loading team profiles" skeleton={<TeamSkeleton />}>
        {people.length ? <div className="grid-auto">{people.map((member) => <TeamCard key={member.id} member={member} />)}</div> : <EmptyState icon="bi-people" title="Team profiles are being prepared" />}
      </AsyncSection>
    </div></section>
  </Layout>;
}
