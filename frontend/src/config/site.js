/**
 * Single source of truth for CGP brand, domain and site-wide configuration.
 *
 * BRANDING: the official abbreviation is "CGP" — Center for Global Health &
 * Pandemic Intelligence. Every visible string, <title>, Open Graph tag and
 * schema.org node in this app derives from this file so the site can never
 * drift back to a legacy "CGHI" spelling.
 *
 * DOMAIN: the canonical origin comes from the VITE_SITE_URL env var. The
 * default below is the institution's official domain, already published in
 * this project's own content (info@pandemicintelcenter.org, the seeded hero
 * images and the existing site). Set VITE_SITE_URL in the deployment to
 * override it — never to a preview/vercel.app host.
 * See docs/DEPLOYMENT.md for the DNS + Vercel steps.
 */

const DEFAULT_SITE_URL = 'https://pandemicintelcenter.org';

function normaliseOrigin(value) {
  if (!value) return DEFAULT_SITE_URL;
  const trimmed = String(value).trim().replace(/\/+$/, '');
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Canonical origin, no trailing slash. */
export const SITE_URL = normaliseOrigin(
  import.meta.env?.VITE_SITE_URL || DEFAULT_SITE_URL
);

export const BRAND = {
  /** Short, official abbreviation used in the logo lockup, nav and metadata. */
  abbr: 'CGP',
  /** Full legal name of the organisation. */
  name: 'Center for Global Health & Pandemic Intelligence',
  /** Alternate full name used where an ampersand is not appropriate. */
  nameAlt: 'Center for Global Health and Pandemic Intelligence',
  /** Legal entity name used in footers and policy documents. */
  legalName: 'The Center for Global Health and Pandemic Intelligence',
  tagline: 'Building Intelligence for a Safer World',
  logo: '/Assets/logo.png',
  logoAlt:
    'Center for Global Health & Pandemic Intelligence (CGP) logo',
  /**
   * Wordmark rendered next to the logo. The source logo already contains the
   * full name, so this stays hidden by default and is exposed for the compact
   * mobile header and for screen-reader-only text.
   */
  wordmark: 'CGP',
  foundingYear: null, // TODO(brand): confirm the official founding year.
};

export const SITE_DESCRIPTION =
  'CGP is a multidisciplinary policy, research and implementation hub strengthening global and regional health security through epidemic intelligence, One Health, community engagement and data science.';

export const DEK = {
  home:
    'CGP turns data, science and multisectoral partnerships into earlier warnings and faster, more equitable responses to public health threats.',
};

/**
 * Physical + contact details. `email` and `phone` are sourced from existing
 * site content (Footer, Contact, backend .env.example).
 * TODO(stakeholder): confirm the registered street address and whether a
 * public phone number should be published. The legacy site deliberately
 * removed phone numbers, so none is asserted here.
 */
export const CONTACT = {
  organisation: BRAND.name,
  email: 'info@pandemicintelcenter.org',
  pressEmail: null, // TODO(stakeholder): supply a press/communications inbox.
  phone: null, // Intentionally not published — confirm before adding.
  address: {
    street: null, // TODO(stakeholder): supply street address for schema.org PostalAddress.
    locality: 'Nairobi',
    area: 'Westlands',
    region: 'Nairobi County',
    country: 'KE',
    countryName: 'Kenya',
    formatted: 'Westlands, Nairobi, Kenya',
  },
  // Google Maps embed for the Westlands, Nairobi location already used on the
  // existing Contact page.
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8242553977706!2d36.7960048!3d-1.2690832!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f17325eb32fd3%3A0x5a7a41e5c6a23793!2sWestlands%2C%20Nairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1680000000000!5m2!1sen!2sus',
  mapLinkUrl: 'https://www.google.com/maps/search/?api=1&query=Westlands%2C%20Nairobi%2C%20Kenya',
  hours: {
    days: 'Monday to Friday',
    time: '08:00 – 16:00 EAT',
  },
};

/** Social profiles already published in the existing footer. */
export const SOCIAL = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/center-for-global-health-and-pandemic-intelligence/',
    icon: 'bi-linkedin',
  },
  {
    label: 'X',
    href: 'https://x.com/cghpintel',
    icon: 'bi-twitter-x',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61582543745887',
    icon: 'bi-facebook',
  },
];

/** Build an absolute URL against the canonical origin. */
export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Default share image used when a page does not declare its own. */
export const DEFAULT_OG_IMAGE = '/og/cgp-og-default.png';
