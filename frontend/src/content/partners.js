

/**
 * Offline fallback for the partner list. `website` is each institution's own
 * site, so a logo card can still link out when the API is unreachable; the
 * bundled copy carries no logos, so those tiles fall back to initials.
 */
export const FALLBACK_PARTNERS = [
  { name: 'Ministry of Health, Kenya', website: 'https://www.health.go.ke/' },
  { name: 'Kenya National Public Health Institute', website: 'https://nphi.go.ke/' },
  { name: 'Africa CDC', website: 'https://africacdc.org/' },
  { name: 'University of Nairobi', website: 'https://www.uonbi.ac.ke/' },
  { name: 'Global Fund', website: 'https://www.theglobalfund.org/' },
  { name: 'UNICEF', website: 'https://www.unicef.org/' },
  { name: 'FAO', website: 'https://www.fao.org/' },
  { name: 'WHO', website: 'https://www.who.int/' },
  { name: 'UNEP', website: 'https://www.unep.org/' },
  { name: 'Taskforce for Global Health', website: 'https://www.taskforce.org/' },
  { name: 'GIZ', website: 'https://www.giz.de/' },
  { name: 'Palladium', website: 'https://thepalladiumgroup.com/' },
].map((partner, i) => ({
  id: `fallback-${i + 1}`,
  name: partner.name,
  logo_url: null,
  website: partner.website,
  sort_order: i + 1,
}));

/** How many partner logos the homepage shows before linking to /partners. */
export const HOMEPAGE_PARTNER_COUNT = 8;

/**
 * Verified official websites keyed by the exact partner name.
 *
 * Every URL below (and in FALLBACK_PARTNERS) is the organisation's own
 * registered domain — no URL is ever guessed. `verifiedWebsite` lets a record
 * served by the API fall back to the curated URL when its `website` column is
 * empty, so a logo is only ever a link when a real, verified address exists.
 */
const VERIFIED_WEBSITES = FALLBACK_PARTNERS.reduce((map, partner) => {
  map[partner.name] = partner.website;
  return map;
}, {});

/** The verified official website for a partner, or null if none is known. */
export function verifiedWebsite(partner) {
  if (!partner) return null;
  return partner.website || VERIFIED_WEBSITES[partner.name] || null;
}

/**
 * Categories of collaborator, transcribed from the existing "Strategic
 * Partnerships" paragraph in the pre-existing About page. Used as a
 * descriptive band on /partners so the page reads as a network rather than a
 * bare logo dump.
 */
export const COLLABORATOR_TYPES = [
  {
    id: 'government',
    icon: 'bi-bank',
    title: 'Ministries & National Public Health Institutes',
    examples: 'Ministries of Health, National Public Health Institutes',
  },
  {
    id: 'multilateral',
    icon: 'bi-globe2',
    title: 'Multilateral & Global Health Institutions',
    examples: 'WHO, FAO, UNICEF, UNEP, IOM',
  },
  {
    id: 'finance',
    icon: 'bi-cash-stack',
    title: 'Global Financing Mechanisms',
    examples: 'The Global Fund, the Pandemic Fund',
  },
  {
    id: 'regional',
    icon: 'bi-geo-alt',
    title: 'Regional & Continental Bodies',
    examples: 'Africa CDC, AU-IBAR',
  },
  {
    id: 'academic',
    icon: 'bi-mortarboard',
    title: 'Universities & Research Institutions',
    examples: 'University of Nairobi and regional academic partners',
  },
  {
    id: 'implementing',
    icon: 'bi-people',
    title: 'Implementing & Technical Partners',
    examples: 'Palladium, GIZ, Taskforce for Global Health, KRCS, MSF, non-state actors',
  },
  {
    id: 'bilateral',
    icon: 'bi-globe',
    title: 'Bilateral Donors & Agencies',
    examples: 'USAID and other bilateral partners',
  },
  {
    id: 'communities',
    icon: 'bi-house-heart',
    title: 'Communities & Civil Society',
    examples: 'Community Health Volunteers, local leaders, community influencers',
  },
];
