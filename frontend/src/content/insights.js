/**
 * Media Insights and Research.
 *
 * Articles are served by `GET /api/news` and edited through /admin/news — that
 * stays the source of truth so editors keep their existing workflow. This file
 * provides the category taxonomy, the search/filter configuration and a single
 * fallback article so /insights and /insights/:slug never render an empty
 * page when the API is unavailable.
 *
 * PROVENANCE: FALLBACK_ARTICLES is transcribed from the single article seeded
 * in `backend/db.js` (seedIfEmpty) and the hard-coded teaser that previously
 * lived in `src/pages/Home.jsx`. The image URL points at the organisation's
 * existing media library, which is where the seeded record points today.
 */

export const INSIGHT_CATEGORIES = [
  { id: 'research', label: 'Research' },
  { id: 'policy', label: 'Policy' },
  { id: 'one-health', label: 'One Health' },
  { id: 'data-ai', label: 'Data & AI' },
  { id: 'news', label: 'News' },
];

/** Categories that apply when an article has no category assigned. */
export const DEFAULT_CATEGORY = 'news';

export function categoryLabel(id) {
  const match = INSIGHT_CATEGORIES.find((c) => c.id === id);
  return match ? match.label : id;
}

/**
 * Map a free-text category from the database onto one of the taxonomy ids.
 * Editors may type anything into the admin `category` field, so this is
 * deliberately forgiving.
 */
const CATEGORY_ALIASES = [
  [/one\s*health/i, 'one-health'],
  [/\b(data|ai|digital)\b/i, 'data-ai'],
  [/research|study|analysis/i, 'research'],
  [/policy|guideline|brief/i, 'policy'],
  [/news|update|announce/i, 'news'],
];

export function normaliseCategory(raw) {
  if (!raw) return DEFAULT_CATEGORY;
  const value = String(raw).trim();
  const direct = INSIGHT_CATEGORIES.find(
    (c) => c.id.toLowerCase() === value.toLowerCase() || c.label.toLowerCase() === value.toLowerCase()
  );
  if (direct) return direct.id;
  const alias = CATEGORY_ALIASES.find(([re]) => re.test(value));
  return alias ? alias[1] : 'news';
}

/** Stable, human-readable slug for an article id. used for indexable URLs. */
export function articleSlug(article) {
  if (article.slug) return article.slug;
  const base = String(article.title || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return base ? `${base}-${article.id}` : `article-${article.id}`;
}

/** Format an ISO-ish date for display, falling back to the raw string. */
export function formatDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** ISO 8601 for structured data, or null when the value is unparseable. */
export function isoDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export const FALLBACK_ARTICLES = [
  {
    id: 'dmt-phe-kenya',
    slug: 'dmt-phe-kenya',
    title:
      'Kenya Validates Groundbreaking Decision-Making Tool for Public Health Emergencies (DMT-PHE)',
    category: 'news',
    excerpt:
      'Kenya has unveiled the Decision-Making Tool for Public Health Emergencies (DMT-PHE), a first-of-its-kind framework validated under KNPHI leadership, with support from Palladium’s TDDAP2 and technical facilitation by CGP. The tool will be piloted in ten high-risk counties before national rollout.',
    content:
      'Kenya has unveiled the Decision-Making Tool for Public Health Emergencies (DMT-PHE), a first-of-its-kind framework validated under the Kenya National Public Health Institute (KNPHI), with support from Palladium’s TDDAP2 and technical facilitation by the Center for Global Health & Pandemic Intelligence (CGP).\n\nThe tool provides subnational decision-makers with a common, structured approach to grading and acting on public health emergency signals. It is being piloted in ten high-risk counties before national rollout.\n\nCGP is providing technical facilitation, supporting the integration of the tool with existing surveillance and 7-1-7 response monitoring so that early warnings translate into faster, coordinated action.',
    author: 'CGP',
    published_at: 'October 2025',
    image_url:
      'https://pandemicintelcenter.org/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-22-at-12.17.44-1-1024x683.jpeg',
    isFallback: true,
  },
];

/**
 * Normalise an article for display and routing.
 *
 * Slug precedence:
 *   1. an explicit `slug` on the record (the fallback article declares one),
 *   2. the declared slug of a fallback article with the same title — the API
 *      serves the same story without a slug, and the sitemap advertises the
 *      fallback slug, so the two must agree or the listed URL would 404,
 *   3. a title-derived slug with the record id appended for uniqueness.
 */
export function normaliseArticle(article) {
  const known = FALLBACK_ARTICLES.find((f) => f.title === article.title);
  return {
    ...article,
    slug: article.slug || known?.slug || articleSlug(article),
    category: normaliseCategory(article.category),
    isoPublished: isoDate(article.published_at),
  };
}

/** Apply `normaliseArticle` across an API payload or fallback list. */
export function normaliseArticles(list) {
  return (Array.isArray(list) ? list : []).map(normaliseArticle);
}

/** Articles per page on the insights listing. */
export const INSIGHTS_PAGE_SIZE = 9;
