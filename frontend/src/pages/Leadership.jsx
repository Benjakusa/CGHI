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
import { nameToSlug } from '../lib/slug';

const META = PAGE_META['/leadership'];

function SocialIcon({ label, url }) {
  const v = `${label || ''} ${url || ''}`.toLowerCase();
  if (v.includes('facebook') || v.includes('fb.com')) return <i className="bi bi-facebook" aria-hidden="true" />;
  if (v.includes('linkedin')) return <i className="bi bi-linkedin" aria-hidden="true" />;
  if (v.includes('twitter') || v.includes('x.com')) return <i className="bi bi-twitter-x" aria-hidden="true" />;
  if (v.includes('instagram')) return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="18" cy="6" r="1" /></svg>;
  if (v.includes('youtube') || v.includes('youtu.be')) return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="4" /><path d="m10 9 6 3-6 3z" /></svg>;
  return <i className="bi bi-link-45deg" aria-hidden="true" />;
}

function TeamCard({ member }) {
  const links = Array.isArray(member.social_links) ? member.social_links : [];
  const profilePath = `/leadership/${nameToSlug(member.name)}`;
  return <article className="leader-card">
    <SmartLink className="leader-card-media" to={profilePath} aria-label={`View ${member.name}'s profile`}>
      {member.image_url ? <SmartImage className="leader-card-photo" src={resolveAssetUrl(member.image_url)} alt={`Portrait of ${member.name}`} width="480" height="480" /> : <div className="team-image-fallback" aria-hidden="true"><i className="bi bi-person" /></div>}
    </SmartLink>
    <div className="leader-card-body">
      <div className="leader-card-toprow">
        <h3><SmartLink to={profilePath}>{member.name}</SmartLink></h3>
        {links.length > 0 && <nav className="leader-card-socials" aria-label={`${member.name} social links`}>
          {links.map((l) => <a key={`${l.label}-${l.url}`} href={l.url} target="_blank" rel="noopener noreferrer" aria-label={`${l.label} profile`} title={l.label}><SocialIcon label={l.label} url={l.url} /></a>)}
        </nav>}
      </div>
      <p className="leader-card-position">{member.role}</p>
      <div className="leader-card-footrow">
        <ShareProfileButton compact name={member.name} url={profilePath} imageUrl={member.image_url ? resolveAssetUrl(member.image_url) : undefined} />
        <SmartLink className="team-read-more" to={profilePath}>Read more</SmartLink>
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
