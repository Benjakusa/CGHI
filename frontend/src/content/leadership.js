/**
 * CGP leadership and team.
 *
 * STATUS — PLACEHOLDER FILE.
 *
 * The repository contains no leadership, board, advisory or staff records of
 * any kind (verified by searching every source file, the SQLite schema in
 * `backend/db.js` and the admin CRUD routes). Rather than invent people, this
 * file declares the shape of the data plus an explicit, visible placeholder
 * roster so the page renders as a designed template that CGP can populate
 * from the admin panel or by editing this file.
 *
 * TODO(stakeholder): supply name, position, expertise areas, photograph and
 * profile/LinkedIn URL for each leader. Until then `LEADERSHIP_PENDING` is
 * true and the page shows a "content pending" state instead of fake headshots.
 *
 * Suggested shape once real data is available:
 *
 *   {
 *     id: 'jane-doe',
 *     name: 'Full Name',
 *     position: 'Director, Epidemic Intelligence',
 *     expertise: ['Forecasting', 'Surveillance'],
 *     photo: '/uploads/leadership/jane-doe.jpg',   // must include width/height
 *     bio: 'Two or three sentences.',
 *     profileUrl: 'https://www.linkedin.com/in/…',
 *   }
 */

export const LEADERSHIP_PENDING = true;

/** Groups shown on /about and /leadership. */
export const LEADERSHIP_GROUPS = [
  { id: 'executive', title: 'Executive Leadership', icon: 'bi-person-badge' },
  { id: 'technical', title: 'Technical & Research Leadership', icon: 'bi-diagram-3' },
  { id: 'advisory', title: 'Advisory Board', icon: 'bi-clipboard2-pulse' },
];

export const LEADERS = [];

/** Card fields CGP must supply before /leadership can go live. */
export const LEADERSHIP_REQUIRED_FIELDS = [
  'name',
  'position',
  'expertise',
  'photo',
  'bio',
  'profileUrl',
];

/**
 * Expertise tags shown on /about, derived from the five capability areas so
 * the two pages cannot drift apart.
 */
export const EXPERTISE_AREAS = [
  { id: 'epidemiology', label: 'Epidemiology & Surveillance' },
  { id: 'data-science', label: 'Data Science, AI & Geospatial Intelligence' },
  { id: 'emergency-management', label: 'Emergency Management & Preparedness' },
  { id: 'one-health', label: 'One Health & Veterinary Public Health' },
  { id: 'health-systems', label: 'Health Systems & Policy' },
  { id: 'community-engagement', label: 'Community Engagement & RCCE' },
  { id: 'research-methods', label: 'Research Methods & M&E' },
  { id: 'IHR', label: 'International Health Regulations' },
];
