

export const GLANCE = [
  {
    id: 'projects',
    value: 7,
    display: '7',
    label: 'Major project areas across Kenya and the region',
    note: 'Pandemic financing, 7-1-7 readiness, emergency guidelines, IHR core capacities, precision public health, workforce capacity and event-based surveillance.',
    verified: true,
  },
  {
    id: 'financing',
    value: 145,
    display: '$145M',
    label: 'Pandemic Fund financing coordinated for Kenya, 2023–2025',
    note: 'Requested funding across national, multi-country and regional proposals.',
    verified: true,
  },
  {
    id: 'response-time',
    value: 30,
    display: '30%',
    label: 'Reduction in detection-to-response time across four counties',
    note: 'Measured through Intra-Action Reviews of the Migori cholera and 2024 mpox outbreaks against 7-1-7 targets.',
    verified: true,
  },
  {
    id: 'counties',
    value: 10,
    display: '10',
    label: 'High-risk counties piloting the DMT-PHE decision tool',
    note: 'Decision-Making Tool for Public Health Emergencies, validated October 2025 ahead of national rollout.',
    verified: true,
  },
  {
    id: 'capabilities',
    value: 5,
    display: '5',
    label: 'Interconnected areas of technical expertise',
    note: 'Epidemic intelligence, preparedness and response, One Health, community engagement, and data science and digital health.',
    verified: true,
  },
  {
    id: 'initiatives',
    value: 6,
    display: '6',
    label: 'Active subnational and community-level initiatives',
    note: 'From the EWIN flagship through One Health urban surveillance.',
    verified: true,
  },
  {
    id: 'partners',
    value: null,
    display: null,
    label: 'Partner and collaborator institutions',
    note: 'The full list is published on the Partners page; a verified total should be confirmed and added here.',
    verified: false,
  },
  {
    id: 'trained',
    value: null,
    display: null,
    label: 'Health professionals and community workers trained',
    note: 'CGP runs FELTP, ISAVET, CBS and EBS training. Participant counts are not currently recorded on the site.',
    verified: false,
  },
  {
    id: 'outputs',
    value: null,
    display: null,
    label: 'Research outputs, tools and policy publications',
    note: 'The Resources library is being built; counts will be published once the inventory is complete.',
    verified: false,
  },
];

/** Figures still awaiting an official source. */
export const PENDING_FIGURES = GLANCE.filter((g) => !g.verified).map((g) => ({
  id: g.id,
  label: g.label,
}));

/**
 * Compact headline set used on /projects. Subset of GLANCE, phrased for the
 * project record page.
 */
export const PROJECT_STATS = GLANCE.filter((g) =>
  ['financing', 'response-time', 'counties', 'projects'].includes(g.id)
);
