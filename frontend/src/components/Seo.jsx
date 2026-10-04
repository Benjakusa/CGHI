

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BRAND,
  CONTACT,
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_URL,
  absoluteUrl,
} from '../config/site';

/** Tags managed by this component, so they can be removed when unset. */
const MANAGED = [
  ['name', 'description'],
  ['name', 'robots'],
  ['name', 'author'],
  ['property', 'og:type'],
  ['property', 'og:site_name'],
  ['property', 'og:title'],
  ['property', 'og:description'],
  ['property', 'og:url'],
  ['property', 'og:image'],
  ['property', 'og:image:alt'],
  ['property', 'og:locale'],
  ['name', 'twitter:card'],
  ['name', 'twitter:title'],
  ['name', 'twitter:description'],
  ['name', 'twitter:image'],
  ['name', 'twitter:image:alt'],
];

function upsertMeta(attr, key, content) {
  if (content == null) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', String(content));
}

function removeManaged() {
  MANAGED.forEach(([attr, key]) => {
    const el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (el) el.remove();
  });
}

/** Point `<link rel="canonical">` at the configured origin, not the preview host. */
function setCanonical(pathname) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', absoluteUrl(pathname));
}

function setManagedJsonLd(nodes) {
  let el = document.head.querySelector('script[data-cgp-jsonld]');
  if (!nodes || nodes.length === 0) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-cgp-jsonld', '');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(
    nodes.length === 1 ? nodes[0] : { '@context': 'https://schema.org', '@graph': nodes },
    null,
    0
  );
}

export default function Seo({
  title,
  description = SITE_DESCRIPTION,
  path,
  type = 'website',
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  noIndex = false,
  keywords,
  publishedTime,
  modifiedTime,
  author,
  jsonLd = [],
  children,
}) {
  const location = useLocation();
  const pathname = path ?? location.pathname;
  const canonical = absoluteUrl(pathname);
  const ogImage = absoluteUrl(image);
  const jsonLdKey = jsonLd.length ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    document.title = title;

    removeManaged();

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'author', author || BRAND.name);
    upsertMeta(
      'name',
      'robots',
      noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'
    );
    if (keywords) upsertMeta('name', 'keywords', keywords);

    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', BRAND.name);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:image:alt', imageAlt || title);
    upsertMeta('property', 'og:locale', 'en_GB');
    if (publishedTime) upsertMeta('property', 'article:published_time', publishedTime);
    if (modifiedTime) upsertMeta('property', 'article:modified_time', modifiedTime);
    if (author) upsertMeta('property', 'article:author', author);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', ogImage);
    upsertMeta('name', 'twitter:image:alt', imageAlt || title);

    setCanonical(pathname);
    setManagedJsonLd(jsonLdKey ? JSON.parse(jsonLdKey) : []);

    if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [
    title,
    description,
    pathname,
    canonical,
    ogImage,
    imageAlt,
    type,
    noIndex,
    keywords,
    publishedTime,
    modifiedTime,
    author,
    jsonLdKey,
    location.hash,
  ]);

  return children || null;
}

/* ------------------------------------------------------------------ */
/* Structured data builders                                            */
/* ------------------------------------------------------------------ */

/** Organisation node, emitted on every page. */
export function organisationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    '@id': `${SITE_URL}/#organisation`,
    name: BRAND.name,
    alternateName: BRAND.nameAlt,
    acronym: BRAND.abbr,
    url: `${SITE_URL}/`,
    description: SITE_DESCRIPTION,
    slogan: BRAND.tagline,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(BRAND.logo),
      caption: BRAND.logoAlt,
    },
    image: absoluteUrl(BRAND.logo),
    email: CONTACT.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: CONTACT.address.locality,
      addressRegion: CONTACT.address.region,
      addressCountry: CONTACT.address.country,
    },
    areaServed: 'Global',
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: BRAND.name,
    publisher: { '@id': `${SITE_URL}/#organisation` },
    inLanguage: 'en-GB',
  };
}

export function breadcrumbJsonLd(trail) {
  if (!trail || trail.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { label: 'Home', to: '/' },
      ...trail,
    ].map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      item: absoluteUrl(crumb.to),
    })),
  };
}

export function pageJsonLd({ name, path, description }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': absoluteUrl(path),
    url: absoluteUrl(path),
    name,
    description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organisation` },
    inLanguage: 'en-GB',
  };
}

export function articleJsonLd(article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: [absoluteUrl(article.image_url || DEFAULT_OG_IMAGE)],
    datePublished: article.isoPublished || article.published_at,
    dateModified: article.isoModified || article.isoPublished || article.published_at,
    author: {
      '@type': article.author ? 'Person' : 'Organization',
      name: article.author || BRAND.name,
    },
    publisher: { '@id': `${SITE_URL}/#organisation` },
    mainEntityOfPage: { '@id': absoluteUrl(article.path) },
    articleSection: article.categoryLabel,
  };
}

export function itemListJsonLd(name, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.to),
    })),
  };
}

/** Every page carries the organisation + website identity nodes. */
export const BASE_JSONLD = [organisationJsonLd(), websiteJsonLd()];
