/**
 * Partners and collaborators.
 *
 * The authoritative list is the `partners` table served by `GET /api/partners`
 * and editable through /admin/partners — that is what /partners and the
 * homepage logo grid render. `FALLBACK_PARTNERS` below is only used when the
 * API is unreachable, so the page never renders an empty shell.
 *
 * PROVENANCE: the fallback list mirrors the 12 organisations seeded in
 * `backend/db.js` (seedIfEmpty) plus the collaborator types named in the
 * existing About page copy. No partner website URL has been invented —
 * entries render as plain, non-linking text unless the database supplies a
 * `website` value.
 */

export const FALLBACK_PARTNERS = [
  'Ministry of Health, Kenya',
  'Kenya National Public Health Institute',
  'Africa CDC',
  'University of Nairobi',
  'Global Fund',
  'UNICEF',
  'FAO',
  'WHO',
  'UNEP',
  'Taskforce for Global Health',
  'GIZ',
  'Palladium',
].map((name, i) => ({
  id: `fallback-${i + 1}`,
  name,
  logo_url: null,
  website: '',
  sort_order: i + 1,
}));

/** How many partner logos the homepage shows before linking to /partners. */
export const HOMEPAGE_PARTNER_COUNT = 8;

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
