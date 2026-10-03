/**
 * Information architecture.
 *
 * The audit prescribes a single, coherent story:
 *
 *   Home → Who We Are → What We Do → Projects → Initiatives → Impact →
 *   Insights & Research → Partners → Contact
 *
 * `PRIMARY_NAV` drives the header, `FOOTER_NAV` drives the footer columns and
 * `ROUTES` is the canonical list of indexable URLs. Because all three read
 * from this one file, the header, the footer, the breadcrumb trail and
 * sitemap.xml cannot disagree with each other.
 */

import { BRAND, SITE_DESCRIPTION } from '../config/site';

/** Header navigation. Dropdowns open on click and on hover-capable pointers. */
export const PRIMARY_NAV = [
  { label: 'Home', to: '/', id: 'home' },
  {
    label: 'Who We Are',
    id: 'about',
    children: [
      { label: 'About CGP', to: '/about', id: 'about' },
      { label: 'Leadership & Team', to: '/leadership', id: 'leadership' },
      { label: 'Partners & Collaborators', to: '/partners', id: 'partners' },
    ],
  },
  {
    label: 'What We Do',
    id: 'what-we-do',
    children: [
      { label: 'Overview', to: '/what-we-do', id: 'what-we-do' },
      { label: 'Projects & Impact', to: '/projects', id: 'projects' },
      { label: 'CGP Initiatives', to: '/initiatives', id: 'initiatives' },
    ],
  },
  {
    label: 'Get Involved',
    id: 'get-involved',
    children: [
      { label: 'Partner With Us', to: '/contact#contact-form', id: 'partner-with-us' },
      { label: 'Careers', to: '/careers', id: 'careers' },
    ],
  },
  {
    label: 'Media Center',
    id: 'media',
    children: [
      { label: 'Insights & Research', to: '/insights', id: 'insights' },
      { label: 'Resource Library', to: '/resources', id: 'resources' },
      { label: 'Media & Press', to: '/contact#contact-details', id: 'media-press' },
    ],
  },
  { label: 'Contact Us', to: '/contact', id: 'contact' },
];

/** Persistent header call to action. */
export const HEADER_CTA = { label: 'Partner With Us', to: '/contact#contact-form' };

/** Route matching: which nav item should show as active for a pathname. */
export const NAV_IDS = [
  ...new Set(
    PRIMARY_NAV.flatMap((item) => [item.id, ...(item.children || []).map((c) => c.id)])
  ),
];

/** Footer columns (Red Cross pattern: quick links, then section columns). */
export const FOOTER_NAV = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Careers', to: '/careers' },
      { label: 'Resource Library', to: '/resources' },
      { label: 'Insights & Research', to: '/insights' },
      { label: 'Partners & Collaborators', to: '/partners' },
      { label: 'Contact Our Team', to: '/contact' },
    ],
  },
  {
    title: 'Who We Are',
    links: [
      { label: 'About CGP', to: '/about' },
      { label: 'Leadership & Team', to: '/leadership' },
      { label: 'What We Do', to: '/what-we-do' },
      { label: 'Projects & Impact', to: '/projects' },
      { label: 'CGP Initiatives', to: '/initiatives' },
    ],
  },
  {
    title: 'Media Center',
    links: [
      { label: 'Media & Press', to: '/contact#contact-details' },
      { label: 'Partner With Us', to: '/contact#contact-form' },
    ],
  },
];

/** Legal / secondary links rendered in the footer bottom bar. */
export const FOOTER_LEGAL = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Use', to: '/terms' },
  { label: 'Accessibility', to: '/accessibility' },
];

/**
 * Indexable routes used to build sitemap.xml and to seed the legacy search
 * index. `priority`/`changefreq` are standard sitemaps.org values.
 */
export const ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly', label: 'Home' },
  { path: '/about', priority: '0.9', changefreq: 'monthly', label: 'About CGP' },
  { path: '/what-we-do', priority: '0.9', changefreq: 'monthly', label: 'What We Do' },
  { path: '/projects', priority: '0.9', changefreq: 'monthly', label: 'Projects & Impact' },
  { path: '/initiatives', priority: '0.8', changefreq: 'monthly', label: 'CGP Initiatives' },
  { path: '/insights', priority: '0.8', changefreq: 'weekly', label: 'Insights & Research' },
  { path: '/partners', priority: '0.7', changefreq: 'monthly', label: 'Partners & Collaborators' },
  { path: '/leadership', priority: '0.6', changefreq: 'monthly', label: 'Leadership & Team' },
  { path: '/resources', priority: '0.6', changefreq: 'weekly', label: 'Resource Library' },
  { path: '/careers', priority: '0.5', changefreq: 'monthly', label: 'Careers' },
  { path: '/contact', priority: '0.8', changefreq: 'yearly', label: 'Contact' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly', label: 'Privacy Policy' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly', label: 'Terms of Use' },
  { path: '/accessibility', priority: '0.3', changefreq: 'yearly', label: 'Accessibility Statement' },
];

/** Metadata used by the SEO component, keyed by route path. */
export const PAGE_META = {
  '/': {
    title: `${BRAND.abbr} | ${BRAND.name}`,
    description: SITE_DESCRIPTION,
    navId: 'home',
    breadcrumb: [],
  },
  '/about': {
    title: `About CGP | ${BRAND.name}`,
    description:
      'Who CGP is: a multidisciplinary policy, research and implementation hub strengthening global and regional health security from Westlands, Nairobi.',
    navId: 'about',
    breadcrumb: [{ label: 'Who We Are', to: '/about' }],
  },
  '/leadership': {
    title: `Leadership & Team | ${BRAND.name}`,
    description:
      'Meet the leadership and technical leadership of the Center for Global Health & Pandemic Intelligence (CGP).',
    navId: 'leadership',
    breadcrumb: [
      { label: 'Who We Are', to: '/about' },
      { label: 'Leadership & Team', to: '/leadership' },
    ],
  },
  '/what-we-do': {
    title: `What We Do | ${BRAND.name}`,
    description:
      'CGP works across five interconnected areas: epidemic and pandemic intelligence, public health emergency preparedness and response, One Health, community engagement, and data science and digital health.',
    navId: 'what-we-do',
    breadcrumb: [{ label: 'What We Do', to: '/what-we-do' }],
  },
  '/projects': {
    title: `Projects & Impact | ${BRAND.name}`,
    description:
      'CGP’s project record: Pandemic Fund financing, 7-1-7 readiness, emergency guidelines, IHR core capacities, precision public health and event-based surveillance.',
    navId: 'projects',
    breadcrumb: [{ label: 'Projects & Impact', to: '/projects' }],
  },
  '/initiatives': {
    title: `CGP Initiatives | ${BRAND.name}`,
    description:
      'Six active CGP programmes: the EWIN early warning flagship, 7-1-7 performance improvement, AI epidemic forecasting, community risk communication, climate-sensitive surveillance and One Health urban.',
    navId: 'initiatives',
    breadcrumb: [{ label: 'CGP Initiatives', to: '/initiatives' }],
  },
  '/insights': {
    title: `Insights & Research | ${BRAND.name}`,
    description:
      'Research, policy, One Health and data & AI publications and updates from the Center for Global Health & Pandemic Intelligence.',
    navId: 'insights',
    breadcrumb: [{ label: 'Insights & Research', to: '/insights' }],
  },
  '/partners': {
    title: `Partners & Collaborators | ${BRAND.name}`,
    description:
      'The ministries, public health institutes, multilateral institutions, global financing mechanisms and implementing partners CGP works with.',
    navId: 'partners',
    breadcrumb: [
      { label: 'Who We Are', to: '/about' },
      { label: 'Partners & Collaborators', to: '/partners' },
    ],
  },
  '/resources': {
    title: `Resource Library | ${BRAND.name}`,
    description:
      'Reports, tools, guidelines and publications from CGP’s research and implementation work.',
    navId: 'resources',
    breadcrumb: [{ label: 'Resource Library', to: '/resources' }],
  },
  '/careers': {
    title: `Careers | ${BRAND.name}`,
    description:
      'Open roles at the Center for Global Health & Pandemic Intelligence, and the technical areas CGP recruits across.',
    navId: 'careers',
    breadcrumb: [
      { label: 'Who We Are', to: '/about' },
      { label: 'Careers', to: '/careers' },
    ],
  },
  '/contact': {
    title: `Contact CGP | ${BRAND.name}`,
    description:
      'Contact the Center for Global Health & Pandemic Intelligence in Westlands, Nairobi to discuss partnerships, technical collaboration or research enquiries.',
    navId: 'contact',
    breadcrumb: [{ label: 'Contact', to: '/contact' }],
  },
  '/privacy': {
    title: `Privacy Policy | ${BRAND.name}`,
    description: `How ${BRAND.legalName} collects, uses and protects personal data.`,
    navId: 'privacy',
    breadcrumb: [{ label: 'Privacy Policy', to: '/privacy' }],
  },
  '/terms': {
    title: `Terms of Use | ${BRAND.name}`,
    description: `Terms governing use of the ${BRAND.name} website and its content.`,
    navId: 'terms',
    breadcrumb: [{ label: 'Terms of Use', to: '/terms' }],
  },
  '/accessibility': {
    title: `Accessibility Statement | ${BRAND.name}`,
    description: `CGP’s commitment to an accessible, inclusive website, and how to report a barrier.`,
    navId: 'accessibility',
    breadcrumb: [{ label: 'Accessibility Statement', to: '/accessibility' }],
  },
  '/404': {
    title: `Page Not Found | ${BRAND.name}`,
    description: 'The page you were looking for could not be found.',
    navId: null,
    breadcrumb: [],
    noIndex: true,
  },
};

/** Fallback metadata for routes not present in PAGE_META. */
export function metaForPath(pathname) {
  return (
    PAGE_META[pathname] || {
      title: `Page Not Found | ${BRAND.name}`,
      description: SITE_DESCRIPTION,
      navId: null,
      breadcrumb: [],
      noIndex: true,
    }
  );
}
