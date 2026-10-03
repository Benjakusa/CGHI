/**
 * CGP project record — the single data source behind /projects, the project
 * detail template at /projects/:slug, and the project teasers on the
 * homepage and /about.
 *
 * PROVENANCE: every `summary`, `results` and `contribution` string below is a
 * restatement of copy that already existed in `src/pages/Projects.jsx` and
 * `src/pages/Home.jsx` (flagged in the repo's git history). No new facts,
 * partners, figures or dates have been introduced.
 *
 * Where the existing site carried no information for a template field the
 * value is `null` and the page renders a clearly labelled placeholder. Every
 * such field is listed in `PENDING_CONTENT` below so the outstanding content
 * requests are exact rather than guesswork.
 */

export const PROJECTS = [
  {
    slug: 'pandemic-fund',
    title: 'Pandemic Preparedness',
    tag: 'Pandemic Fund',
    year: '2023–2025',
    theme: 'Financing & Preparedness',
    location: 'Kenya',
    partnerNames: null, // Not named in existing content. See PENDING_CONTENT.
    image: null,
    featured: true,
    summary:
      'Coordinated development of National, multi-country and regional proposals to the Pandemic Fund (2023–2025). Requested funding: $145 million.',
    challenge: null, // See PENDING_CONTENT.
    contribution:
      'CGP coordinated the development of national, multi-country and regional proposals submitted to the Pandemic Fund.',
    results: null, // See PENDING_CONTENT.
    outputs: null, // See PENDING_CONTENT.
    metrics: [
      { value: '$145M', label: 'Requested Pandemic Fund financing' },
      { value: '2023–2025', label: 'Proposal development period' },
    ],
    activities: null, // See PENDING_CONTENT.
    objectives: null, // See PENDING_CONTENT.
    background: null, // See PENDING_CONTENT.
    relatedPublications: [],
    relatedInitiatives: ['ewin'],
    capabilities: ['epidemic-pandemic-intelligence', 'phe-preparedness-response'],
  },
  {
    slug: '7-1-7-readiness',
    title: '7-1-7 Readiness Initiative',
    tag: '7-1-7 Readiness',
    year: '2024',
    theme: 'Detection & Response',
    location: 'Kenya',
    partnerNames: null,
    image: null,
    featured: true,
    summary:
      'Facilitated the Intra-Action Review (IAR) of the cholera outbreak in Migori and the Intra-Action Review of Kenya’s mpox outbreak (2024) using 7-1-7 targets. Reduced detection-to-response time by 30% in four counties.',
    challenge: null,
    contribution:
      'CGP facilitated the Intra-Action Reviews of the Migori cholera outbreak and Kenya’s 2024 mpox outbreak against the WHO-endorsed 7-1-7 targets.',
    results:
      'Detection-to-response time reduced by 30% across four counties in Kenya.',
    outputs: null,
    metrics: [
      { value: '30%', label: 'Reduction in detection-to-response time' },
      { value: '4', label: 'Counties covered' },
      { value: '2', label: 'Intra-Action Reviews facilitated' },
    ],
    activities: null,
    objectives: null,
    background: null,
    relatedPublications: [],
    relatedInitiatives: ['7-1-7-pilot', 'ewin'],
    capabilities: [
      'epidemic-pandemic-intelligence',
      'phe-preparedness-response',
      'community-engagement',
    ],
  },
  {
    slug: 'emergency-guidelines',
    title: 'Emergency Guidelines',
    tag: 'Emergency Guidelines',
    year: '2024',
    theme: 'Preparedness & Response',
    location: 'Kenya',
    partnerNames: null,
    image: null,
    featured: true,
    summary:
      'Supported development of the Marburg Preparedness and 72-Hour Response Plans, and the Mpox Response Plans for Kenya (2024).',
    challenge: null,
    contribution:
      'CGP supported the development of hazard-specific national preparedness and response plans.',
    results: null,
    outputs: null,
    metrics: [
      { value: '3', label: 'Response plans supported' },
      { value: '72h', label: 'Marburg response target' },
    ],
    activities: null,
    objectives: null,
    background: null,
    relatedPublications: [],
    relatedInitiatives: ['7-1-7-pilot'],
    capabilities: ['phe-preparedness-response'],
  },
  {
    slug: 'workforce-capacity',
    title: 'Workforce Capacity Readiness',
    tag: 'Workforce Capacity',
    year: null, // Not stated in existing content. See PENDING_CONTENT.
    theme: 'Capacity Building',
    location: 'Kenya',
    partnerNames: null,
    image: null,
    featured: false,
    summary:
      'Review of Kenya’s public health emergency management (PHEM) curriculum. Capacity building and knowledge exchange through FELTP and ISAVET programmes.',
    challenge: null,
    contribution:
      'CGP reviewed Kenya’s public health emergency management curriculum and supported capacity building and knowledge exchange through the FELTP and ISAVET programmes.',
    results: null,
    outputs: null,
    metrics: [],
    activities: null,
    objectives: null,
    background: null,
    relatedPublications: [],
    relatedInitiatives: [],
    capabilities: ['phe-preparedness-response', 'community-engagement'],
  },
  {
    slug: 'ihr-jee-naphs',
    title: 'International Health Regulations (IHR 2005)',
    tag: 'IHR 2005 · JEE · SPAR · NAPHS',
    year: '2024–2025',
    theme: 'Health Security Governance',
    location: 'Kenya, Somalia & Ethiopia',
    partnerNames: null,
    image: null,
    featured: true,
    summary:
      'Supporting the Ministry of Health and KNPHI in conducting the Joint External Evaluation (JEE 2024) and the States Parties Self-Assessment Annual Report (SPAR); development of the National Action Plan for Health Security (NAPHS 2.0, 2025); and simulation exercises including Rift Valley fever, Ebola and COHESION, a One Health cross-border simulation with Kenya, Somalia and Ethiopia.',
    challenge: null,
    contribution:
      'CGP supports the Ministry of Health and the Kenya National Public Health Institute on IHR 2005 core capacity assessment and planning, and designs and facilitates multi-hazard and One Health simulation exercises.',
    results: null,
    outputs: null,
    metrics: [
      { value: '3', label: 'Countries in the COHESION simulation' },
      { value: '2025', label: 'NAPHS 2.0 horizon year' },
    ],
    activities: [
      'Joint External Evaluation (JEE 2024) support for the Ministry of Health and KNPHI.',
      'States Parties Self-Assessment Annual Report (SPAR) support.',
      'Development of the National Action Plan for Health Security (NAPHS 2.0 — 2025).',
      'Simulation exercises: Rift Valley fever, Ebola, and COHESION — a One Health cross-border simulation with Kenya, Somalia, and Ethiopia.',
    ],
    objectives: null,
    background: null,
    relatedPublications: [],
    relatedInitiatives: ['one-health-urban'],
    capabilities: ['phe-preparedness-response', 'one-health'],
  },
  {
    slug: 'precision-public-health',
    title: 'Precision Public Health (DMT-PHE)',
    tag: 'Precision Public Health',
    year: '2025',
    theme: 'Data & Digital Health',
    location: 'Kenya — 10 high-risk counties',
    partnerNames: ['KNPHI', 'Palladium (TDDAP2)'],
    image: null,
    featured: true,
    summary:
      'Supporting KNPHI on the Standardized Decision-Making Tool for Public Health Emergencies (DMT-PHE). Validated in October 2025 under KNPHI leadership with support from Palladium’s TDDAP2 and technical facilitation by CGP. Now piloted in 10 high-risk counties before national rollout.',
    challenge: null,
    contribution:
      'CGP provided technical facilitation for the DMT-PHE, supporting KNPHI leadership alongside Palladium’s TDDAP2.',
    results:
      'The DMT-PHE was validated in October 2025 and is being piloted in 10 high-risk counties ahead of national rollout.',
    outputs: null,
    metrics: [
      { value: '10', label: 'High-risk counties piloting the tool' },
      { value: 'Oct 2025', label: 'Validation milestone' },
    ],
    activities: null,
    objectives: null,
    background: null,
    relatedPublications: ['dmt-phe-kenya'],
    relatedInitiatives: ['ewin', 'ai-forecasting'],
    capabilities: ['data-science-digital-health', 'epidemic-pandemic-intelligence'],
  },
  {
    slug: 'event-based-surveillance',
    title: 'Event-Based Surveillance (EBS)',
    tag: 'Event-Based Surveillance',
    year: null,
    theme: 'Detection & Response',
    location: 'Kenya',
    partnerNames: null,
    image: null,
    featured: true,
    summary:
      'Training health workers and communities, integrating Community-Based Surveillance (CBS), deploying digital tools for real-time alerts, and enhancing multisectoral collaboration through alignment with IDSR and 7-1-7 targets.',
    challenge: null,
    contribution:
      'CGP trains health workers and communities, integrates CBS, and deploys digital alerting aligned with IDSR and 7-1-7 targets.',
    results: null,
    outputs: null,
    metrics: [],
    activities: null,
    objectives: null,
    background: null,
    relatedPublications: [],
    relatedInitiatives: ['community-risk-communication', 'one-health-urban'],
    capabilities: [
      'community-engagement',
      'epidemic-pandemic-intelligence',
      'data-science-digital-health',
    ],
  },
];

export const PROJECTS_BY_SLUG = Object.fromEntries(
  PROJECTS.map((p) => [p.slug, p])
);

/** Projects promoted on the homepage, capped by the caller. */
export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);

/**
 * Machine-readable list of every template field that still needs official
 * content. Surfaced in the UI as a visible placeholder and used to generate
 * the outstanding-work list in the audit report.
 */
export const PENDING_CONTENT = PROJECTS.flatMap((p) =>
  ['year', 'challenge', 'background', 'objectives', 'contribution', 'activities', 'results', 'outputs', 'image']
    .filter((f) => p[f] == null)
    .map((f) => ({ kind: 'project', slug: p.slug, field: f }))
);
