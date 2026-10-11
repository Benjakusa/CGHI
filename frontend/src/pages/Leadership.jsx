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
import SmartLink from '../components/SmartLink';
import ShareProfileButton from '../components/ShareProfileButton';

const META = PAGE_META['/leadership'];

function TeamCard({ member }) {
  return <article className="leader-card">
    <SmartLink className="leader-card-media" to={`/leadership/${member.id}`} aria-label={`View ${member.name}'s profile`}>
      {member.image_url ? <SmartImage className="leader-card-photo" src={resolveAssetUrl(member.image_url)} alt={`Portrait of ${member.name}`} width="480" height="480" /> : <div className="team-image-fallback" aria-hidden="true"><i className="bi bi-person" /></div>}
    </SmartLink>
    <div className="leader-card-body">
      <div className="team-card-meta">
        <h3><SmartLink to={`/leadership/${member.id}`}>{member.name}</SmartLink></h3>
        <p className="leader-card-position">{member.role}</p>
      </div>
      <div className="team-card-actions">
        <ShareProfileButton compact name={member.name} url={`/leadership/${member.id}`} />
        <SmartLink className="team-read-more" to={`/leadership/${member.id}`}>Read more</SmartLink>
      </div>
    </div>
  </article>;
}

function TeamSkeleton() {
  return <div className="grid-auto" aria-hidden="true">{[0, 1, 2].map((item) => <article className="leader-card" key={item}><div className="leader-card-media skeleton" /><div className="leader-card-body"><span className="skeleton" /><span className="skeleton" /></div></article>)}</div>;
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
