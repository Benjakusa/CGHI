import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Seo, { BASE_JSONLD, breadcrumbJsonLd, pageJsonLd } from '../components/Seo';
import SmartImage from '../components/SmartImage';
import SmartLink from '../components/SmartLink';
import useApi from '../hooks/useApi';
import { resolveAssetUrl } from '../context/AuthContext';
import { PAGE_META } from '../content/navigation';
import ShareProfileButton from '../components/ShareProfileButton';
import { BRAND } from '../config/site';
import { nameToSlug } from '../lib/slug';

const META = PAGE_META['/leadership'];

function getSocialSymbol(label, url) {
  const value = `${label || ''} ${url || ''}`.toLowerCase();
  if (value.includes('facebook') || value.includes('fb.com')) return <i className="bi bi-facebook" aria-hidden="true" />;
  if (value.includes('linkedin')) return <i className="bi bi-linkedin" aria-hidden="true" />;
  if (value.includes('twitter') || value.includes('x.com')) return <i className="bi bi-twitter-x" aria-hidden="true" />;
  if (value.includes('instagram')) return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle className="social-symbol-dot" cx="18" cy="6" r="1" /></svg>;
  if (value.includes('youtube') || value.includes('youtu.be')) return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="4" /><path className="social-symbol-fill" d="m10 9 6 3-6 3z" /></svg>;
  return <i className="bi bi-link-45deg" aria-hidden="true" />;
}

export default function TeamProfile() {
  const { id: slug } = useParams();
  const team = useApi('/api/team', []);
  const member = (team.data || []).find((person) => nameToSlug(person.name) === slug);
  const links = Array.isArray(member?.social_links) ? member.social_links : [];
  const canonicalPath = member ? `/leadership/${nameToSlug(member.name)}` : `/leadership/${slug}`;
  const jsonLd = [
    ...BASE_JSONLD,
    pageJsonLd({ name: member?.name || 'Team profile', path: canonicalPath, description: member?.biography || META.description }),
    breadcrumbJsonLd([
      ...META.breadcrumb,
      { label: member?.name || 'Team profile', to: canonicalPath },
    ]),
  ];

  return <Layout navId="leadership" pageId="leadership-detail">
    {member && <Seo
      title={`${member.name} | ${BRAND.abbr} Team`}
      description={member.biography || `${member.name}, ${member.role} at ${BRAND.abbr}.`}
      path={canonicalPath}
      type="profile"
      image={member.image_url ? resolveAssetUrl(member.image_url) : undefined}
      imageAlt={`Portrait of ${member.name}`}
      jsonLd={jsonLd}
    />}
    <header className="page-header">
      <div className="wrap">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol className="breadcrumb-list">
            <li className="breadcrumb-item"><SmartLink to="/">Home</SmartLink><span className="breadcrumb-sep" aria-hidden="true">/</span></li>
            <li className="breadcrumb-item"><SmartLink to="/leadership">Leadership &amp; Team</SmartLink><span className="breadcrumb-sep" aria-hidden="true">/</span></li>
            <li className="breadcrumb-item"><span aria-current="page">{member?.name || 'Team profile'}</span></li>
          </ol>
        </nav>
        <p className="section-label">Leadership &amp; Team</p>
      </div>
    </header>
    <section className="section-surface" aria-live="polite">
      <div className="wrap">
        {member ? <article className="team-profile-card" data-prerender-ready="true">
          <div className="team-profile-media">
            {member.image_url
              ? <SmartImage className="team-profile-photo" src={resolveAssetUrl(member.image_url)} alt={`Portrait of ${member.name}`} width="900" height="1200" />
              : <div className="team-profile-photo team-image-fallback" aria-hidden="true"><i className="bi bi-person" /></div>}
          </div>
          <div className="team-profile-copy">
            <h1>{member.name}</h1>
            <p className="team-profile-role">{member.role}</p>
            {member.biography
              ? <div className="team-profile-bio">{member.biography}</div>
              : <p className="muted">A biography has not been added yet.</p>}
            {(member.email || member.phone) && <div className="team-profile-contacts" aria-label="Contact details">
              {member.email && <a href={`mailto:${member.email}`}>{member.email}</a>}
              {member.phone && <a href={`tel:${member.phone.replace(/[^+\d]/g, '')}`}>{member.phone}</a>}
            </div>}
            <div className="team-profile-foot">
              {links.length > 0 && <nav className="team-profile-socials" aria-label="Social media links">
                {links.map((link) => <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`${link.label} profile`} title={link.label}>{getSocialSymbol(link.label, link.url)}</a>)}
              </nav>}
              <ShareProfileButton name={member.name} url={canonicalPath} imageUrl={member.image_url ? resolveAssetUrl(member.image_url) : undefined} />
            </div>
            <p className="team-profile-back"><SmartLink className="text-link" to="/leadership">← Back to Leadership &amp; Team</SmartLink></p>
          </div>
        </article> : team.loading
          ? <p>Loading team profile…</p>
          : <div className="empty-state"><h1>Profile unavailable</h1><p>{team.error ? 'Team profiles could not be loaded.' : 'This profile could not be found.'}</p><SmartLink className="text-link" to="/leadership">Back to Leadership &amp; Team</SmartLink></div>}
      </div>
    </section>
  </Layout>;
}
