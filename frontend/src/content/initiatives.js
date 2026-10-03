/**
 * CGP initiatives — six active programmes, transcribed verbatim from
 * `src/pages/Initiatives.jsx` and `src/pages/Home.jsx` (both of which carried
 * near-identical hard-coded copies of this content).
 *
 * `/initiatives` renders the full `<details>` disclosure from this file; the
 * homepage renders the `summary` of each card. Anchors are addressable as
 * `/initiatives#<id>` so capability cards and project pages can deep-link.
 *
 * Section structure (`background` / `objectives` / `activities` / `outcomes`)
 * mirrors the headings the original accordion used, so no copy was dropped in
 * the move to a data file.
 */

export const INITIATIVES = [
  {
    id: 'ewin',
    title: 'Early Warning & Intelligence Node (EWIN)',
    label: 'EWIN Flagship',
    icon: 'bi-broadcast-pin',
    status: 'Flagship',
    location: 'Subnational, Kenya',
    summary:
      "CGP's flagship model for subnational epidemic intelligence, integrating AI-powered forecasting, 7-1-7 response monitoring and community-based early warning in the One Health approach.",
    background: [
      "The EWIN initiative is CGP's flagship model for subnational epidemic intelligence — integrating AI-powered forecasting, 7-1-7 response monitoring, and community-based early warning. Anchored in the One Health approach, EWIN pilots will demonstrate how predictive analytics, trust-building communication, and digital surveillance tools can accelerate detection and save lives in vulnerable counties.",
    ],
    objectives: null,
    activities: null,
    outcomes: null,
    relatedProjects: ['pandemic-fund', 'precision-public-health', '7-1-7-readiness'],
    capabilities: ['epidemic-pandemic-intelligence', 'one-health'],
  },
  {
    id: '7-1-7-pilot',
    title: '7-1-7 Performance Improvement Pilot',
    label: 'Performance Improvement',
    icon: 'bi-speedometer2',
    status: 'Pilot',
    location: 'Five counties, Kenya',
    showSevenOneSeven: true,
    summary:
      'Pilot implementation of the WHO-endorsed 7-1-7 model in five counties in Kenya using digital tools and quality improvement (QI) methods to track and enhance outbreak response timelines.',
    background: [
      "The WHO-endorsed 7-1-7 framework aims to strengthen outbreak detection and response by ensuring signals are detected within 7 days, notified within 1 day, and responded to within 7 days. Many countries struggle to meet these timelines due to systemic gaps in data flow, workforce capacity, and coordination. We propose a pilot implementation of the 7-1-7 model in five counties in Kenya, using CGP's digital tools and quality improvement (QI) methods to track and enhance performance.",
    ],
    objectives: null,
    activities: [
      'Monthly QI cycles involving health, veterinary, and emergency response units.',
      'After Action Review (AAR) and dissemination of findings at the national Technical Working Group (TWG).',
    ],
    outcomes: [
      'Reduced time from detection to response for priority diseases.',
      'Improved multisectoral coordination at county level.',
      'A functional 7-1-7 dashboard generating real-time metrics.',
      'National uptake of the pilot methodology for scale-up.',
    ],
    relatedProjects: ['7-1-7-readiness', 'event-based-surveillance'],
    capabilities: [
      'epidemic-pandemic-intelligence',
      'phe-preparedness-response',
      'community-engagement',
    ],
  },
  {
    id: 'ai-forecasting',
    title: 'AI-Powered Epidemic Forecasting',
    label: 'AI & Machine Learning',
    icon: 'bi-cpu',
    status: 'Pilot',
    location: 'Kenya',
    summary:
      'Pilot an AI-powered epidemic forecasting platform using IDSR, CBS and climatic signals to anticipate outbreaks and generate risk alerts targeting 7–14 day improved lead time.',
    background: [
      'Sub-Saharan Africa faces increasing risks of emerging and re-emerging infectious diseases. Traditional surveillance systems, while improving, are still largely reactive and struggle to integrate multisectoral, community-level, and environmental data. The rise of AI and machine learning (ML) offers an opportunity to transform disease forecasting and response planning at the subnational level. CGP seeks to pilot an AI-powered epidemic forecasting platform that leverages IDSR, CBS, and climatic or environmental signals to anticipate outbreaks, generate risk alerts, and support decision-making by frontline health teams in Kenya.',
    ],
    objectives: [
      'Build and pilot a machine learning-based early warning model using multi-source surveillance data.',
      'Integrate forecasts into a real-time visualization dashboard accessible to county and national actors.',
      'Train health officers, data managers, and decision-makers to interpret model outputs for preparedness planning.',
      'Generate evidence on the feasibility, acceptability, and scalability of AI-driven forecasting tools in Kenya.',
    ],
    activities: [
      'AI model development and back-testing for two disease categories (e.g. cholera, mpox, kala-azar, dengue).',
      'Dashboard design and user-interface testing.',
      'Capacity-building workshops with the Ministry of Health and surveillance stakeholders.',
      'Dissemination of results through policy briefs and national technical forums.',
    ],
    outcomes: [
      'A functional prototype of an AI-based epidemic forecasting tool.',
      'Improved lead time for outbreak alerts by 7–14 days.',
      'Increased local capacity to generate, interpret, and act on forecasts.',
      'High-level stakeholder buy-in for potential national scale-up.',
    ],
    relatedProjects: ['precision-public-health'],
    capabilities: ['data-science-digital-health', 'epidemic-pandemic-intelligence'],
  },
  {
    id: 'community-risk-communication',
    title: 'Community-Led Risk Communication in Marginalized Areas',
    label: 'Community Risk Comm.',
    icon: 'bi-chat-heart-fill',
    status: 'Active',
    location: 'Marginalized areas, Kenya',
    summary:
      'A community-driven risk communication model for marginalized areas leveraging trusted local structures, WhatsApp/SMS rumour-tracking and CHV networks to strengthen early warning.',
    background: [
      'Communities in remote and underserved regions — including pastoralist, informal, and border areas — face systemic challenges in accessing timely, credible, and actionable health information. Structural barriers, cultural mistrust, and inadequate integration into formal health systems hamper early detection, signal reporting, and public trust during emergencies. This concept proposes a community-driven risk communication model that leverages trusted local structures and digital innovations to strengthen early warning, rumour tracking, and community trust.',
    ],
    objectives: [
      'Enhance public trust and communication pathways in at-risk marginalized communities.',
      'Establish real-time rumour-tracking and feedback loops to support early detection.',
      'Build local capacity of Community Health Volunteers (CHVs), youth leaders, and influencers as trusted communicators.',
      'Integrate grassroots reporting with county surveillance and RCCE platforms.',
    ],
    activities: [
      'Development of culturally contextualized IEC tools and mobile messaging formats.',
      'Establishment of WhatsApp- and SMS-based rumour-tracking channels.',
      'Linkage with county disease surveillance and health promotion units.',
    ],
    outcomes: [
      'Improved early detection through grassroots signal and rumour alerts.',
      'Increased uptake of public health guidance in high-risk communities.',
      'Institutionalization of community feedback within RCCE systems.',
    ],
    relatedProjects: ['event-based-surveillance', '7-1-7-readiness'],
    capabilities: ['community-engagement', 'one-health'],
  },
  {
    id: 'climate-disease-surveillance',
    title: 'Climate-Sensitive Disease Surveillance & Early Warning Systems',
    label: 'Climate & Health',
    icon: 'bi-cloud-rain-fill',
    status: 'Active',
    location: 'East Africa',
    summary:
      'Integrating meteorological, environmental and health data to build GIS-based early warning and response systems for climate-sensitive outbreaks including cholera and Rift Valley fever.',
    background: [
      'Climate variability and extreme weather events are increasingly influencing the emergence and transmission of infectious diseases in East Africa. Floods, droughts, and changing vector habitats are contributing to recurrent outbreaks of cholera, Rift Valley fever, and other climate-sensitive diseases. CGP proposes a pilot to integrate meteorological, environmental, and health data to build early warning and response systems for climate-sensitive outbreaks.',
    ],
    objectives: [
      'Identify and prioritize climate-sensitive diseases and risk indicators.',
      'Establish integrated data-sharing protocols between climate and health sectors.',
      'Develop GIS-based risk models and early-warning dashboards.',
    ],
    activities: [
      'Desk review and stakeholder consultations on climate-disease linkages.',
      'Data integration from the Kenya Meteorological Department, NDMA, and MoH systems.',
      'Development and piloting of GIS tools for disease-risk prediction.',
      'Capacity building for surveillance officers and county disaster committees.',
      'Dissemination of pilot results through workshops and policy briefs.',
    ],
    outcomes: [
      'Improved predictive capacity for disease outbreaks linked to climate variability.',
      'A functioning climate-sensitive surveillance system in two pilot counties.',
      'Strengthened cross-sectoral coordination and risk-informed planning.',
      'Scalable evidence for national and regional early-warning strategies.',
    ],
    relatedProjects: ['event-based-surveillance', 'ihr-jee-naphs'],
    capabilities: ['one-health', 'epidemic-pandemic-intelligence'],
  },
  {
    id: 'one-health-urban',
    title: 'One Health Surveillance in Urban Informal Settlements',
    label: 'One Health Urban',
    icon: 'bi-buildings-fill',
    status: 'Active',
    location: 'Urban informal settlements',
    summary:
      'A One Health surveillance model for urban informal settlements, integrating community reporting, animal health indicators and environmental risk factors for improved early detection.',
    background: [
      'Urban informal settlements in sub-Saharan Africa are home to millions living in conditions that exacerbate disease transmission: high population density, poor sanitation, and close proximity between humans, animals, and waste. CGP proposes a One Health surveillance model specifically tailored to urban informal settlements, integrating community-level reporting, animal health indicators, and environmental risk factors.',
    ],
    objectives: [
      'Establish sentinel One Health surveillance sites in two high-risk informal settlements.',
      'Enhance event-based and syndromic surveillance by training human and animal health informants.',
      'Improve multisectoral data sharing and coordinated response at county level.',
    ],
    activities: [
      'Deployment of mobile surveillance tools and reporting apps.',
      'Routine joint data-review meetings involving human, animal, and environmental health actors.',
      'Documentation and dissemination of lessons learned.',
    ],
    outcomes: [
      'Improved early detection and response to outbreaks in informal urban settlements.',
      'Strengthened multisectoral collaboration using a One Health approach.',
      'A tested and documented One Health surveillance model for replication.',
    ],
    relatedProjects: ['ihr-jee-naphs', 'event-based-surveillance'],
    capabilities: ['one-health', 'community-engagement'],
  },
];

export const INITIATIVE_BY_ID = Object.fromEntries(
  INITIATIVES.map((i) => [i.id, i])
);

export const SECTIONS = [
  { key: 'background', heading: 'Background and Rationale' },
  { key: 'objectives', heading: 'Objectives' },
  { key: 'activities', heading: 'Key Activities' },
  { key: 'outcomes', heading: 'Expected Outcomes' },
];
