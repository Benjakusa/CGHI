

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
  wordmark: 'CGP',
  foundingYear: null,
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
  pressEmail: null,
  phone: null,
  address: {
    street: null,
    locality: 'Nairobi',
    area: 'Westlands',
    region: 'Nairobi County',
    country: 'KE',
    countryName: 'Kenya',
    formatted: 'Westlands, Nairobi, Kenya',
  },
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8242553977706!2d36.7960048!3d-1.2690832!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f17325eb32fd3%3A0x5a7a41e5c6a23793!2sWestlands%2C%20Nairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1680000000000!5m2!1sen!2sus',
  mapLinkUrl: 'https://www.google.com/maps/search/?api=1&query=Westlands%2C%20Nairobi%2C%20Kenya',
  hours: {
    days: 'Monday to Friday',
    time: '08:00 – 16:00 EAT',
  },
};

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

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export const DEFAULT_OG_IMAGE = '/og/cgp-og-default.png';
