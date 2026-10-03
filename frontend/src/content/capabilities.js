/**
 * The five areas of CGP technical expertise.
 *
 * These are the canonical definitions of "What We Do": the homepage renders
 * one card per entry, the /what-we-do page renders the full description, and
 * /projects + /initiatives cross-reference the relevant ids.
 */
export const CAPABILITIES = [
  {
    id: 'epidemic-pandemic-intelligence',
    short: 'Epidemic Intelligence',
    title: 'Epidemic & Pandemic Intelligence',
    tag: 'EPI',
    icon: 'bi-graph-up-arrow',
    summary:
      'Integrating AI-powered forecasting, 7-1-7 response monitoring and multi-source surveillance data to accelerate outbreak detection and response.',
    body: [
      'CGP builds and applies epidemic intelligence systems that integrate AI-powered forecasting, 7-1-7 response monitoring, and multi-source surveillance data — including IDSR, community-based surveillance (CBS), and environmental signals — to accelerate detection of and response to disease threats. Our epidemic intelligence work supports subnational, national and regional decision-makers with timely, actionable information.',
      'Key activities include outbreak risk assessment, risk modelling, early warning system design, and scenario planning for priority diseases across Kenya and the broader East Africa region.',
    ],
    relatedInitiatives: ['ewin', 'ai-forecasting', 'climate-disease-surveillance'],
    relatedProjects: ['pandemic-fund', '7-1-7-readiness', 'precision-public-health'],
    cta: { label: 'See the EWIN initiative', to: '/initiatives#ewin' },
  },
  {
    id: 'phe-preparedness-response',
    short: 'Preparedness & Response',
    title: 'Public Health Emergency Preparedness & Response',
    tag: 'PHEPR',
    icon: 'bi-tools',
    summary:
      'IHR/JEE facilitation, simulation exercises, NAPHS development and emergency guidelines for Marburg, Mpox and other priority hazards.',
    body: [
      'CGP provides technical leadership for public health emergency preparedness and response systems at national and county level. This includes IHR 2005 compliance support, JEE and SPAR facilitation, NAPHS development, and Intra-Action Reviews (IARs) and After Action Reviews (AARs) for priority outbreak responses.',
      'CGP has supported the development of the Marburg Preparedness and 72-Hour Response Plans, and the Mpox Response Plans for Kenya (2024). CGP also designs and facilitates simulation exercises — including Rift Valley fever, Ebola, and COHESION, a One Health cross-border simulation with Kenya, Somalia, and Ethiopia.',
    ],
    relatedInitiatives: ['7-1-7-pilot', 'one-health-urban'],
    relatedProjects: ['emergency-guidelines', 'ihr-jee-naphs', '7-1-7-readiness'],
    cta: { label: 'See emergency preparedness projects', to: '/projects#emergency-guidelines' },
  },
  {
    id: 'one-health',
    short: 'One Health',
    title: 'One Health',
    tag: 'ONE HEALTH',
    icon: 'bi-tree-fill',
    summary:
      'Bridging human, animal and environmental health data to build early warning and response systems for zoonotic and climate-sensitive diseases.',
    body: [
      'CGP operates at the intersection of human, animal, and environmental health — applying a One Health framework to disease surveillance, early warning, and response. This approach is especially important in East Africa, where zoonotic diseases, climate variability, and informal human–animal contact contribute to recurring outbreaks.',
      "CGP's climate-sensitive disease work integrates meteorological, environmental, and health data to build GIS-based risk models and early warning dashboards. CGP's One Health work extends into urban informal settlements, where high population density, poor sanitation, and human–animal proximity create unique surveillance challenges.",
    ],
    relatedInitiatives: ['climate-disease-surveillance', 'one-health-urban'],
    relatedProjects: ['ihr-jee-naphs', 'event-based-surveillance'],
    cta: { label: 'See climate and One Health initiatives', to: '/initiatives#climate-disease-surveillance' },
  },
  {
    id: 'community-engagement',
    short: 'Community Engagement',
    title: 'Community Engagement & Resilience Building',
    tag: 'CER',
    icon: 'bi-people-fill',
    summary:
      'Community-led risk communication, rumour tracking and community-based surveillance training in marginalised and high-risk areas.',
    body: [
      'CGP builds community-centred preparedness and risk communication systems that leverage trusted local structures — including Community Health Volunteers (CHVs), youth leaders, and community influencers — to strengthen early warning and response in marginalised areas.',
      'Activities include developing culturally contextualised information, education and communication tools, establishing WhatsApp- and SMS-based rumour-tracking channels, and integrating grassroots reporting with county surveillance and RCCE platforms. CGP also provides capacity building through training of community health workers on CBS, EBS, and community-led preparedness approaches.',
    ],
    relatedInitiatives: ['community-risk-communication', '7-1-7-pilot'],
    relatedProjects: ['event-based-surveillance', 'workforce-capacity'],
    cta: { label: 'See community risk communication initiative', to: '/initiatives#community-risk-communication' },
  },
  {
    id: 'data-science-digital-health',
    short: 'Data & Digital Health',
    title: 'Data Science & Digital Health',
    tag: 'DSH',
    icon: 'bi-cpu-fill',
    summary:
      'AI/ML model development, geospatial intelligence, real-time dashboards and decision-support platforms for frontline responders.',
    body: [
      'CGP leverages AI, machine learning, geospatial intelligence, and digital health tools to transform disease surveillance and outbreak response. Our data science work includes building machine learning-based early warning models, real-time visualisation dashboards, decision-support tools, and mobile-enabled alert systems accessible to county and national actors.',
      "CGP's precision public health work supports KNPHI on the Standardized Decision-Making Tool for Public Health Emergencies (DMT-PHE) — a first-of-its-kind framework now validated and piloted across 10 high-risk counties in Kenya. AI/ML models are being developed and back-tested for priority diseases including cholera, mpox, kala-azar, and dengue.",
    ],
    relatedInitiatives: ['ai-forecasting', 'ewin'],
    relatedProjects: ['precision-public-health', 'event-based-surveillance'],
    cta: { label: 'See AI epidemic forecasting initiative', to: '/initiatives#ai-forecasting' },
  },
];

export const CAPABILITY_BY_ID = Object.fromEntries(
  CAPABILITIES.map((c) => [c.id, c])
);
