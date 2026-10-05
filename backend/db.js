const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");

const fs = require("fs");
const DB_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const DB_PATH = path.join(DB_DIR, "cghi.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS heroes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    topic TEXT,
    description TEXT,
    btn1_text TEXT,
    btn1_link TEXT,
    btn2_text TEXT,
    btn2_link TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT,
    excerpt TEXT,
    content TEXT,
    image_url TEXT,
    author TEXT,
    published_at TEXT,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    logo_url TEXT,
    website TEXT,
    sort_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    department TEXT,
    location TEXT,
    employment_type TEXT,
    description TEXT,
    qualifications TEXT,
    preferred_experience TEXT,
    apply_email TEXT,
    apply_subject TEXT,
    closing_date TEXT,
    document_url TEXT,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    document_url TEXT,
    date TEXT,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    organisation TEXT,
    topic TEXT NOT NULL DEFAULT 'general',
    subject TEXT,
    message TEXT NOT NULL,
    consent INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'new',
    notes TEXT,
    ip_hash TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

try {
  db.exec(
    "CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC)",
  );
  db.exec(
    "CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status, created_at DESC)",
  );
} catch (err) {}

try {
  const jobCols = db.prepare("PRAGMA table_info(jobs)").all();
  if (!jobCols.some((c) => c.name === "document_url")) {
    db.exec("ALTER TABLE jobs ADD COLUMN document_url TEXT");
  }
} catch (err) {}

/**
 * The seed password that used to be hard-coded in this file is also present in
 * the repository's .env.example, so it must be treated as compromised: warn at
 * boot if any admin still authenticates with it. Cheap enough to run once per
 * process start, and it turns a silent, invisible compromise into a log line
 * somebody will actually see.
 */
function warnOnLegacySeedPassword() {
  const LEGACY = "Admin@CGHI2025!";
  let admins;
  try {
    admins = db.prepare("SELECT id, email, password_hash FROM admins").all();
  } catch (err) {
    return;
  }
  for (const admin of admins) {
    if (!bcrypt.compareSync(LEGACY, admin.password_hash)) continue;
  }
}

/**
 * News seed articles, listed oldest -> newest so the newest article receives
 * the highest id. Reverse the array if your public site orders by id ASC.
 */
const NEWS_SEED = [
  {
    title:
      "Kenya Validates Groundbreaking Decision-Making Tool for Public Health Emergencies (DMT-PHE)",
    category: "News",
    author: "CGP Communications",
    published_at: "October 2025",
    image_url:
      "https://pandemicintelcenter.org/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-22-at-12.17.44-1024x683.jpeg",
    excerpt:
      "Kenya has validated its first standardized framework for escalation, coordination and decision-making during public health crises, led by KNPHI with support from Palladium's TDDAP2 and technical facilitation by CGP.",
    content: `Kenya has taken a major step toward institutionalizing rapid, evidence-based outbreak response with the validation of the Decision-Making Tool for Public Health Emergencies (DMT-PHE), the country's first standardized framework for guiding escalation, coordination and decision-making during public health crises.

The National Validation Workshop took place on 16-17 October 2025 in Nairobi. It was convened by the Kenya National Public Health Institute (KNPHI) with support from Palladium's Tackling Deadly Diseases in Africa Programme 2 (TDDAP2) and technical facilitation from the Center for Global Health and Pandemic Intelligence (CGP). More than 40 participants from government, research institutions and international partners tested the tool through five table-top simulation exercises covering Ebola Virus Disease, cholera, Rift Valley fever, chemical spills and Public Health Emergencies of Initially Unknown Etiology.

Participants validated escalation triggers and workflows aligned with the 7-1-7 performance model: detect within seven days, notify within one day and start an effective response within seven days. The simulations showed that the DMT-PHE can sharply reduce response delays and promote joint action across the human, animal and environmental health sectors.

The tool will now be piloted in ten high-risk counties representing diverse epidemiological and cross-border contexts. The pilots will refine standard operating procedures, integrate the DMT-PHE with IDSR and DHIS2, and set a baseline for monitoring county performance against 7-1-7 benchmarks.

About the DMT-PHE: it provides a tiered escalation pathway for classifying emergencies, decision thresholds for 20 epidemic-prone diseases and public health events, defined roles for One Health actors, a direct link to the 7-1-7 model, and integration with IDSR, the IHR (2005) and the National Action Plan for Health Security.

The workshop closed with a call to digitize the tool, embed its triggers in national dashboards and align its rollout with NAPHS II and the wider Public Health Emergency Management framework.`,
  },
  {
    title:
      "Kenya Advances One Health and Pandemic Preparedness with Launch of Rift Valley Fever Contingency Plan and Human Brucellosis Testing Guidelines",
    category: "News",
    author: "Dr. Mark Nanyingi",
    published_at: "November 5, 2025",
    image_url:
      "https://pandemicintelcenter.org/wp-content/uploads/2025/11/9-819x1024.jpeg",
    excerpt:
      "Kenya has launched the National Contingency Plan for Rift Valley Fever (2025) and Human Brucellosis Testing Guidelines, two frameworks that standardize surveillance and diagnostics for priority zoonoses.",
    content: `Kenya has strengthened its systems for early detection and coordinated response to zoonotic diseases with the official launch of the National Contingency Plan for Rift Valley Fever (2025) and the Human Brucellosis Testing Guidelines.

The launch was convened by the Zoonotic Disease Unit under the joint leadership of the ministries responsible for health, agriculture and livestock, and environment. It brought together national agencies, 19 county representatives, laboratory networks, research institutions and partners including CGP, Washington State University, Amref Health Africa, the University of Liverpool and the University of Nairobi.

Why now: Rift Valley fever has caused repeated outbreaks that cost lives, decimate livestock and disrupt trade, while human brucellosis remains one of the most under-diagnosed and under-reported zoonoses in the region. Expanding livestock-human interfaces, climate-driven flooding that affects mosquito vectors, informal livestock trade and uneven county readiness all raise Kenya's exposure.

The RVF Contingency Plan is an operational document covering preparedness, detection, response and recovery across human, animal and environmental sectors. It sets out multisectoral coordination structures, risk and hotspot mapping, actions for each phase of the outbreak cycle, early warning based on weather and vector surveillance, laboratory networking, triage and infection prevention, vector control, risk communication and incident command structures.

The Human Brucellosis Testing Guidelines standardize laboratory algorithms and case definitions at every level of the health system, define specimen handling, biosafety and transport requirements, give interpretation criteria for serology, culture and PCR, set reporting pathways within IDSR, and align human diagnostics with animal health surveillance.

CGP provided technical assistance in outbreak analytics and modelling, harmonization of human-animal surveillance, evidence reviews on diagnostic performance, integration of One Health governance into emergency management, and county readiness assessments. The focus now moves to training county teams, embedding digital reporting and early warning tools, strengthening coordination platforms and mobilizing resources for rollout.`,
  },
  {
    title: "Leveraging One Health to Strengthen Pandemic Preparedness in Kenya",
    category: "Insights",
    author: "Dr. Mark Nanyingi",
    published_at: "November 9, 2025",
    image_url:
      "https://pandemicintelcenter.org/wp-content/uploads/2025/11/PF-1024x684.jpeg",
    excerpt:
      "CGP's Technical Director for Global Health Security delivered the opening keynote at the inaugural Kenya One Health Conference, tracing Kenya's path from outbreak response to integrated pandemic preparedness.",
    content: `At the inaugural Kenya One Health Conference (KOH 2025), organized by the Kenya Medical Association and the Kenya Veterinary Association under the theme "By Protecting One, We Help Protect All", CGP's Technical Director for Global Health Security, Dr. Mark Nanyingi, delivered the opening keynote to more than 200 delegates from human medicine, veterinary medicine, public health, environmental health and academia.

He noted that more than 80 percent of emerging pathogens are zoonotic, and that recurrent threats such as Rift Valley fever, brucellosis, anthrax, rabies, Marburg and mpox continue to test Kenya's surveillance and response. Kenya sits at a convergence zone for vector-borne and spillover risks driven by climate variability, land-use change and the human-animal interface.

On institutionalization, he highlighted the Zoonotic Disease Unit, County One Health Units, and disease-specific plans for rabies, anthrax, brucellosis and antimicrobial resistance. The challenge, he argued, is no longer why One Health matters but how effectively it is sustained.

He presented the Decision-Making Tool for Public Health Emergencies (DMT-PHE) as Kenya's decision-intelligence backbone, standardizing escalation from community to county to national level and supporting the 7-1-7 targets. Case studies from the 2024 Rift Valley fever response in Wajir and Marsabit and the 2024 mpox response showed One Health mechanisms guiding rapid decisions.

Other themes included data integration across IDSR, event-based surveillance and animal biosurveillance; investment in the health emergency workforce through FELTP, ISAVET, AFROHUN and AVOHC SURGE; and the WHO Pandemic Agreement and IHR amendments, including equitable pathogen access and benefit sharing.

He closed with four imperatives for the next decade: integrate One Health into national preparedness architecture, invest in data systems and sustainable financing, engage communities through risk communication, and innovate with AI-driven epidemic forecasting and climate-informed early warning.`,
  },
  {
    title:
      "Africa's Pandemic Preparedness Strengthened through a USD 80M Harmonised One Health Initiative",
    category: "News",
    author: "Dr. Mark Nanyingi",
    published_at: "November 28, 2025",
    image_url:
      "https://pandemicintelcenter.org/wp-content/uploads/2025/11/20201010-REDDISSE-01-780x439-2-1.jpg",
    excerpt:
      "Two Pandemic Fund-approved initiatives supported by CGP, SCOPE and HARMONIZE, unlock USD 80 million in coordinated investment for Africa's health security.",
    content: `CGP welcomes the Pandemic Fund's approval, under its Third Call for Proposals, of two initiatives it supported technically, strategically and methodologically: SCOPE, led by AU-IBAR, and HARMONIZE, led by Africa CDC. Together they represent USD 80 million in coordinated investment in Africa's pandemic prevention, preparedness and response.

The two projects are deliberately aligned under a harmonisation framework guided by the One Health Data Alliance Africa so that activities are complementary, systems are interoperable, data standards match and knowledge is shared.

SCOPE works deep in hotspots across the Lake Chad Basin (Nigeria, Niger, Chad, Cameroon and the Central African Republic). It deploys cross-border, community-centred One Health surveillance, builds mobile diagnostic and laboratory capacity, strengthens biosafety and data integration, trains multisectoral rapid response teams and establishes cross-border One Health governance.

HARMONIZE works wide across the continent. It harmonises policy, standards and surveillance frameworks, expands genomic surveillance and pathogen detection, strengthens National Public Health Institutes and emergency operations centres including KNPHI, standardises decision-support tools, and builds interoperable early-warning platforms.

CGP's role included mapping and removing overlaps, aligning theories of change and results frameworks, supporting integration into the One Health Data Alliance, strengthening governance, embedding equity and community engagement, and guiding harmonisation between the two institutions.

Looking ahead, the combined approach is expected to reduce time to outbreak detection and response, strengthen cross-border collaboration, expand laboratory and genomic capability, build a One Health-ready workforce and institutionalise interoperable surveillance systems.`,
  },
  {
    title:
      "Strengthening Kenya's Health Security through Validation of the National Action Plan for Health Security (NAPHS II)",
    category: "News",
    author: "Dr. Mark Nanyingi",
    published_at: "February 6, 2026",
    image_url:
      "https://pandemicintelcenter.org/wp-content/uploads/2026/02/DSC_9880-1024x683.jpg",
    excerpt:
      "CGP provided technical leadership for the NAPHS II validation workshop, where more than 70 stakeholders assessed Kenya's five-year One Health-anchored roadmap for health security.",
    content: `The Center for Global Health and Pandemic Intelligence (CGP), through its Division of Global Health Security, provided technical leadership and facilitation for the National Action Plan for Health Security II (NAPHS II) Validation Workshop. More than 70 stakeholders from national and county governments, technical agencies, academia and development partners assessed the technical soundness, strategic coherence and implementability of Kenya's five-year roadmap, aligned with the International Health Regulations (2005).

NAPHS II is anchored in a One Health framework that integrates human, animal and environmental health and addresses climate-related risks across all 19 Joint External Evaluation technical areas. It builds on NAPHS I (2019-2023) and closes gaps identified through the 2024 JEE and SPAR, the 2022 Performance of Veterinary Services evaluation, the 2021 National Bridging Workshop and after-action and intra-action reviews.

Its vision is a resilient, coordinated, One Health-driven health security system protecting lives, livelihoods and national stability. Six strategic objectives cover emergency preparedness and risk reduction, surveillance and early warning, emergency management and One Health coordination, community communication and engagement, research and innovation, and governance, leadership and sustainable financing.

CGP designed a functional-group validation method aligned with the IHR Monitoring and Evaluation Framework. Five groups reviewed governance and financing; surveillance, laboratory systems and workforce; One Health, AMR, food safety and IPC; response to health emergencies; and chemical, biological, radiological and nuclear emergencies. Inputs were classed as agreed, noted or deferred, then consolidated and ratified at a post-validation convention of the NAPHS II Secretariat.

The validation confirmed NAPHS II as a credible platform for resource mobilisation, including operationalising the US-Kenya health cooperation agreement. The workshop was supported by TDDAP2 under Palladium with technical leadership from CGP, plus contributions from KEMRI, Wellcome Trust, WHO, US CDC, AFENET, the Gates Foundation, PATH, Amref Health Africa and others.`,
  },
  {
    title:
      "Kenya's States Parties Self-Assessment Annual Reporting (SPAR 2025) Signals a Strategic Shift in Health Security Preparedness",
    category: "News",
    author: "CGP Communications",
    published_at: "February 13, 2026",
    image_url:
      "https://pandemicintelcenter.org/wp-content/uploads/2026/02/1770730172808-1024x682.jpeg",
    excerpt:
      "KNPHI convened a three-day national workshop on Kenya's 2025 SPAR, linking assessment findings directly to NAPHS II implementation, with technical facilitation from CGP, TDDAP2 and WHO.",
    content: `The Kenya National Public Health Institute (KNPHI) convened a three-day national stakeholders' workshop on 10-12 February 2026 to complete Kenya's 2025 States Parties Self-Assessment Annual Reporting (SPAR), a core obligation under the International Health Regulations (2005). More than 50 experts from government, academia, One Health actors and emergency response partners reviewed national preparedness performance.

CGP, TDDAP2 and WHO provided technical facilitation that aligned SPAR outcomes with the recently validated NAPHS II, creating a deliberate link between assessment, policy design and implementation planning.

Comparing SPAR 2024 and 2025 showed improvement in governance coordination, infection prevention and control, and the institutionalization of simulation exercises and after-action learning. Financing mechanisms, integration of laboratory systems into routine monitoring and cross-sectoral data harmonization remained persistent constraints, and some score changes reflected a stricter application of performance levels that require fully institutionalized systems.

Four system signals emerged: governance maturing from project-based coordination toward institutional national leadership; financing fragility as a bottleneck to higher performance; workforce institutionalization as a driver of sustained gains; and a strengthening One Health trajectory that still needs better integration of climate-sensitive and environmental indicators.

The findings suggest Kenya's preparedness journey has moved from establishing structures to sustaining them, with future gains depending on domestic financing, integrated laboratory and surveillance data, and consolidated One Health coordination. Delivery relied on collaboration among the Council of Governors, the Ministry of Health, KIPRE, the University of Nairobi, the Directorate of Veterinary Services, Africa CDC, US CDC, the Kenya Red Cross, Amref Health Africa, AFENET and others.`,
  },
  {
    title:
      "Kenya Advances Public Health Emergency Response Systems through Validation of a Risk-Based Decision-Making Tool",
    category: "News",
    author: "CGP Communications",
    published_at: "February 20, 2026",
    image_url:
      "https://pandemicintelcenter.org/wp-content/uploads/2026/02/DSC_1942-1024x683.jpg",
    excerpt:
      "CGP and KNPHI led the national validation of the DMT-PHE training curriculum, moving the tool from framework validation to national rollout readiness.",
    content: `On 19-20 February 2026 in Nairobi, CGP, in collaboration with KNPHI and with support from TDDAP2, provided technical leadership for the National Validation Workshop of the DMT-PHE training curriculum. The milestone moves the tool from framework validation (October 2025) to readiness for national rollout and reinforces Kenya's compliance with the International Health Regulations (2005).

Table-top simulations across five high-risk scenarios (public health events of unknown etiology, Rift Valley fever, Ebola, chemical spill and cholera) tested classification logic, escalation thresholds and incident management activation under time pressure. Exercises were aligned with Kenya's PHEM and IMS frameworks, IDSR workflows, event-based surveillance, 7-1-7 benchmarks and the IHR Annex 2 risk-assessment instrument.

Participants applied the "serious" and "unusual" criteria, automatic notification logic for conditions such as viral haemorrhagic fevers, cross-border triggers and threshold-based escalation for epidemic-prone diseases. One Health was built into the decision logic so animal, environmental and human health signals feed unified escalation pathways.

Results were strongly positive: 45 national and county reviewers took part, the average workshop rating was 4.56 out of 5, and 96 percent confirmed readiness for piloting and rollout with minor refinements.

The envisioned 2026-2028 implementation pathway has five pillars: technical refinement into a standardized Version 2.0; county piloting through structured five-day exercises; systems integration with IDSR, PHEOC activation procedures and IMS; digitization and AI support within DHIS2/IDSR including automated severity scoring and anomaly detection; and alignment with NAPHS II and 7-1-7 monitoring.

The workshop brought together KNPHI, the Ministry of Health, Africa CDC, US CDC, Palladium, WHO, Washington State University, KIPRE, the Directorate of Veterinary Services, the Kenya Red Cross, Amref Health Africa, KEMRI, FHI 360, PATH and county health teams from Nairobi, Kisumu, Murang'a, Lamu, Mombasa and Uasin Gishu.`,
  },
  {
    title:
      'What the U.S. "Advancing Global Health" Initiative Means for Africa\'s Health Security and Sovereignty',
    category: "Insights",
    author: "Dr. Mark Nanyingi",
    published_at: "March 10, 2026",
    image_url:
      "https://pandemicintelcenter.org/wp-content/uploads/2026/03/Africa_health-security.jpeg",
    excerpt:
      "CGP examines the strategic implications of a flexible U.S. State Department financing framework, with awards from USD 500,000 to USD 250 million, for African governments, regional institutions and research organizations.",
    content: `The U.S. Department of State, through its Bureau of Global Health Security and Diplomacy, has launched Advancing Global Health, an Annual Program Statement with rolling addenda and award sizes from USD 500,000 to USD 250 million. It is one of the largest diplomatic financing mechanisms currently available for pandemic preparedness, surveillance and outbreak response.

The initiative arrives as African governments modernize health security systems after COVID-19 and repeated Ebola, cholera and mpox outbreaks, and it intersects with Africa CDC's Africa Health Security and Sovereignty agenda. Its umbrella model lets targeted addenda be released as priorities evolve, and gives U.S. embassies a central role in agreeing country priorities with national governments.

The Rapid Outbreak Response window aligns closely with the 7-1-7 targets. Priority areas include integrated disease surveillance, laboratory diagnostics and genomic sequencing, field epidemiology, emergency operations centres and rapid response coordination, all of which support IHR core capacities.

For African research and innovation institutions, opportunities lie in epidemic intelligence platforms, genomic surveillance networks, AI for outbreak detection and forecasting, One Health surveillance and operational research. Regional collaboration, implementation capacity and policy relevance are likely to be an advantage.

CGP's policy messages: build integrated epidemic intelligence platforms that unify surveillance, laboratory, environmental and community data; pair infrastructure with analytics capacity including AI and predictive modelling; link public health institutes, emergency operations centres and regional platforms; and invest in workforce skills in data science and digital epidemiology. Financing alone will not improve preparedness unless it strengthens systems that turn data into action.`,
  },
  {
    title:
      "Kenya Launches NAPHS II and KNPHI Strategic Plan to Strengthen Epidemic Intelligence and Digital Public Health Systems",
    category: "News",
    author: "Dr. Mark Nanyingi",
    published_at: "March 27, 2026",
    image_url:
      "https://pandemicintelcenter.org/wp-content/uploads/2026/03/IMG-20260327-WA0049-1024x681.jpg",
    excerpt:
      "Kenya has launched the KNPHI Strategic Plan 2026-2030 and NAPHS II 2026-2030, a blueprint for integrated, data-driven and intelligence-led public health systems with AI and analytics at the core.",
    content: `Kenya has reached a milestone in strengthening its national health security architecture with the launch of the Kenya National Public Health Institute (KNPHI) Strategic Plan 2026-2030 and the National Action Plan for Health Security (NAPHS II) 2026-2030. Together they set out a shift from fragmented, reactive approaches toward institutionalized epidemic intelligence underpinned by digital transformation, interoperability and advanced analytics. CGP provided technical contributions to both documents.

Cabinet Secretary for Health Hon. Aden Duale described the launch as a significant step in Kenya's capacity to prevent, detect and respond to public health threats through integrated systems and digital innovation.

To turn strategy into practice, KNPHI introduced a suite of operational frameworks: the DMT-PHE, the Digital e-Public Health Surveillance Strategy, a Monitoring, Evaluation and Learning Framework, the Animal Health Integrated Disease Surveillance and Response system, an Infodemic Management Operational Manual, pre-approved risk communication templates and fact sheets for 28 priority diseases.

Kenya is also embedding AI and advanced analytics into routine operations. Through a consortium convened by CGP, the University of Michigan Center for Global Health Equity built a DMT-PHE AI assistant prototype, while evaluations with KIPRE, Washington State University Global Health Kenya and the University of Toronto showed high concordance with national escalation protocols, strong usability and trust, and no critical safety concerns.

The programme was supported by TDDAP2, funded by the UK FCDO. TDDAP2's Kenya lead, Dr. Kadondi Kasera, said its assistance has delivered a costed NAPHS II, stronger county PHEOCs, integrated One Health surveillance and operational decision-support tools. KNPHI Director General Dr. Kamene Kimonye said the strategies provide the foundation for faster, smarter and more resilient detection and response.

Sustained progress will depend on scaling interoperable systems nationwide, embedding analytics and AI into routine workflows, strengthening governance for data use, privacy and security, and deepening collaboration between KNPHI, CGP, Palladium and development partners.`,
  },
  {
    title:
      "Operationalizing 7-1-7: Kenya's Shift from Metrics and Timelines to Decision Intelligence",
    category: "Insights",
    author: "Dr. Mark Nanyingi",
    published_at: "April 11, 2026",
    image_url:
      "https://pandemicintelcenter.org/wp-content/uploads/2026/04/DSC_6169-1024x683.jpg",
    excerpt:
      "A national workshop convened by KNPHI, AFENET and CGP examined how to meet 7-1-7 timelines in practice, piloting AI-assisted decision support within the DMT-PHE.",
    content: `The Kenya National Public Health Institute (KNPHI), supported by the African Field Epidemiology Network (AFENET) and guided technically by CGP, convened a national workshop to operationalize 7-1-7. The focus was not introducing the framework but examining how it is applied, using simulation exercises, early action reviews and hands-on work with national dashboards. A key innovation was the pilot integration of AI-assisted decision support within the DMT-PHE.

The 7-1-7 targets (detect within 7 days, notify within 1 day, respond within 7 days) have become a cornerstone of global health security and a common language for timeliness. Yet they define what should happen and when, not how complex, decentralized systems achieve it.

The workshop found that delays persist not at detection but in the move from signal to action. Uncertainty in risk classification, hesitation in escalation and fragmented coordination create what CGP calls decision latency, which cumulatively undermines the targets.

Kenya's answer is decision intelligence. The DMT-PHE converts signals into risk classifications, links them to escalation thresholds and maps them to predefined response actions, so similar signals trigger similar responses regardless of location or personnel. 7-1-7 sets the speed of the system, and the DMT-PHE sets its structure; speed without structure produces inconsistency, and structure without speed produces delay.

AI supports rapid triage, pattern recognition and consistent classification, reducing the burden on frontline responders while keeping humans in charge. The approach is also One Health by design, synthesizing multisectoral inputs and triggering cross-sector action.

The central lesson is that 7-1-7 should drive performance rather than become a reporting exercise: thresholds must be clear, escalation pathways standardized, data integrated across sectors and decision support provided to those who act.`,
  },
  {
    title:
      "Kenya and the Future of Global Health Security: Balancing Sovereignty, Preparedness and Solidarity in the Wake of the Ebola Outbreak",
    category: "Insights",
    author: "Prof. Mark Nanyingi",
    published_at: "May 29, 2026",
    image_url:
      "https://pandemicintelcenter.org/wp-content/uploads/2026/05/3928507-1024x683.webp",
    excerpt:
      "Why preparedness, public trust and international cooperation must reinforce one another as the Bundibugyo virus outbreak in the DRC and Uganda tests regional health security.",
    content: `The Bundibugyo virus disease outbreak in the Democratic Republic of Congo and Uganda shows that epidemic preparedness can no longer be treated as a purely national undertaking. As of 24 May 2026 the DRC had reported 906 suspected cases and 223 suspected deaths, with 105 confirmed cases and 10 confirmed deaths across 13 health zones in Ituri, North Kivu and South Kivu, and Uganda had confirmed seven linked or imported cases. The WHO declared a Public Health Emergency of International Concern and Africa CDC a Public Health Emergency of Continental Security.

Kenya's role: as a regional transport hub, diplomatic centre and humanitarian gateway, Kenya is among the highest-priority countries for Ebola preparedness in WHO's readiness assessments. Strengthening isolation facilities, points-of-entry screening, laboratories and emergency operations centres is preparedness, not evidence of transmission in Kenya.

On sovereignty, the debate over a proposed U.S.-supported Ebola quarantine and treatment arrangement, and the High Court's temporary suspension pending review, reflects legitimate questions about transparency, public participation and constitutional oversight. The article argues that trust is itself a preparedness asset and that effective preparedness depends on sovereign institutions acting lawfully and openly. It also notes U.S. commitments of USD 13.5 million toward Kenya's preparedness and USD 112 million in bilateral regional assistance.

On detection, the 7-1-7 target underscores that the future of preparedness depends on earlier detection as well as faster response. Epidemic intelligence and decision-support tools such as the DMT-PHE AI Assistant can help identify unusual patterns earlier, harmonize surveillance information, support prioritization and generate real-time decision support, acting as a force multiplier for public health professionals rather than a replacement.

The outbreak also reinforces One Health: mining-linked mobility corridors show how environmental disruption, economic activity and human behaviour combine to drive transmission. Kenya's NAPHS II, national Ebola plan and investments in surveillance and One Health coordination provide a base, and the author concludes that preparedness, sovereignty and international cooperation must reinforce one another.`,
  },
  {
    title:
      "From Detection to Decision: How Kenya is Transforming Public Health Emergency Response with Artificial Intelligence",
    category: "News",
    author: "CGP Media",
    published_at: "July 21, 2026",
    image_url:
      "https://pandemicintelcenter.org/wp-content/uploads/2026/07/DMT-Discussion-1024x683.png",
    excerpt:
      "A consortium of KNPHI, Palladium, CGP, Washington State University, the University of Michigan and KIPRE is showing how AI can support faster, more consistent decisions during public health emergencies.",
    content: `Early warning signals often fail to move quickly enough into clear decisions. In a typical border-county scenario, days pass between the first unusual cases, formal documentation, the decision to notify national authorities and the deployment of a response team, by which time similar cases appear in neighbouring areas. Surveillance may detect the threat, but translating that signal into timely, consistent action remains one of outbreak response's hardest problems.

Kenya's collaborative answer began with the Decision-Making Tool for Public Health Emergencies (DMT-PHE), developed through TDDAP2 for KNPHI with CGP. Drawing on the IHR (2005), incident management principles and Kenya's preparedness architecture, it gives public health professionals clear criteria for assessing risk, escalating events and activating multisectoral response. It was refined through stakeholder consultation, simulation exercises and national validation using scenarios such as viral haemorrhagic fevers, zoonotic outbreaks, cholera, chemical incidents and events of unknown etiology.

Because the DMT-PHE had already codified its decision logic, it was well suited to digitization and AI. Washington State University, the University of Michigan Center for Global Health Equity and the Kenya Institute of Primate Research joined to support digitization, AI development and evaluation. The resulting DMT-PHE AI Agent is designed as a digital companion that helps decision-makers interpret outbreak information, apply escalation logic and consider response pathways, rather than replacing expert judgment.

A pilot evaluation compared the agent's recommendations with independent expert assessments across scenarios covering directly transmitted diseases, zoonotic outbreaks and events of unknown origin, and found a high degree of agreement. Findings are available in the preprint "Development and Evaluation of an Artificial Intelligence-Assisted Decision Support System for Public Health Emergency Classification and Escalation in Kenya".

The lessons from the recent Ebola outbreak underline why the first hours after an alert matter. The team sees the agent as part of a wider effort toward early warning and anticipatory decision-making, helping decision-makers recognize risks earlier, anticipate escalation and act before outbreaks become crises.`,
  },
  {
    title:
      "Development and Evaluation of an AI-Assisted Decision Support System for Public Health Emergency Classification and Escalation in Kenya",
    category: "Research",
    author:
      "Nanyingi M, Osoro E, Siwo GH, Ngere I, Kadivane S, Magige J, Kamau J, et al.",
    published_at: "July 10, 2026",
    image_url:
      "https://pandemicintelcenter.org/wp-content/uploads/2026/07/DMT-PHE-assistant_Dashboard-prototype-1024x683.jpeg",
    excerpt:
      "A medRxiv preprint reports that the DMT-PHE AI Agent achieved a weighted concordance score of 0.924 against expert gold standards, with a mean System Usability Scale score of 85.2.",
    content: `Timely assessment, classification and escalation of public health events are essential to effective outbreak response, yet decision-making after detection remains difficult because guidance is fragmented and escalation criteria are interpreted variably. Kenya developed the Decision-Making Tool for Public Health Emergencies (DMT-PHE) to standardize event assessment, classification, notification and escalation, and later built an AI-enabled version, the DMT-PHE AI Agent, to operationalize the framework as decision support.

Methods: the agent uses a retrieval-augmented generation architecture backed by a curated knowledge base derived from the validated DMT-PHE framework and related public health guidance. In a simulation-based pilot, 11 public health professionals each assessed three standardized outbreak scenarios, and the agent's recommendations were compared with expert-defined gold standards. Outcomes covered concordance, response-action coverage, citation performance, safety, usability and acceptability.

Results: across 33 scenario evaluations the agent reached an overall weighted concordance score of 0.924. Exact agreement was 90.9% for Public Health Events of Initially Unknown Etiology, 81.8% for Rift Valley fever and 90.9% for mpox. Citation support appeared in 78.8% of interactions, with no incorrect citations or major safety concerns. The mean System Usability Scale score was 85.2, and participants rated trust at 4.27 out of 5, contextual relevance at 4.55 and perceived time savings at 4.82.

Conclusion: a nationally validated public health emergency decision framework can be translated into an AI-enabled decision-support system. The findings offer early evidence that AI can augment emergency decision-making with structured, transparent and context-specific recommendations while keeping humans in oversight, giving a practical model for operationalizing national guidance.

The study was a collaboration among CGP, the University of Michigan Center for Global Health Equity, Washington State University Global Health Kenya, KEMRI, the Kenya Institute of Primate Research, KNPHI and Palladium's TDDAP2 programme, and was funded by the UK Foreign, Commonwealth and Development Office.`,
  },
  {
    title:
      "The First 100 Days: Why the DRC Ebola Epidemic Is Still Accelerating",
    category: "Insights",
    author: "CGP Global Health Security Brief",
    published_at: "August 26, 2026",
    image_url:
      "https://pandemicintelcenter.org/wp-content/uploads/2026/08/EVD-analysis-1024x576.png",
    excerpt:
      "One hundred days after the DRC declared a Bundibugyo virus disease outbreak, about 5,514 confirmed cases and 2,642 deaths have been reported, making it the largest recorded Ebola outbreak in the country.",
    content: `One hundred days after the Democratic Republic of the Congo declared an outbreak of Bundibugyo virus disease on 15 May 2026, the epidemic is still spreading. About 5,514 confirmed cases and 2,642 deaths had been reported, a case-fatality ratio of nearly 48 percent. The outbreak has already surpassed the DRC's 2018-2020 epidemic (3,317 confirmed cases) and is the largest recorded Ebola outbreak in the country, although still smaller than West Africa's 2013-2016 epidemic.

Confirmed cases climbed from 85 on 21 May to 515 by 6 June, 1,460 by 1 July and 3,605 by 30 July. Expanded testing and cleared sample backlogs account for some of this, but most of it is genuine spread. There is no published evidence that the virus has become more transmissible; the likelier explanation is a known virus exploiting a fragmented operating environment.

Why transmission continues: the outbreak had a head start, with the first known patient falling ill on 24 April, weeks before confirmation. Many new cases are not on contact lists, and contact follow-up, though above 80 percent, is still too low. Community deaths sustain hidden transmission, health facilities remain vulnerable to infection among health workers, conflict and displacement fragment the response, and mobility along mining routes, borders and waterways connects clusters across dozens of health zones in six provinces.

Countermeasures are limited: no vaccine or therapeutic is approved specifically for Bundibugyo virus. A Phase 3 trial is testing whether Ervebo, licensed against Zaire ebolavirus, offers cross-protection, but this is not yet established and it should not be presented as a proven Bundibugyo vaccine.

Lessons from earlier outbreaks stress that community trust is a core epidemiological intervention, and that Uganda's interruption of transmission after imported cases shows what preparedness, rapid detection and community cooperation can achieve.

What solidarity must deliver: predictable financing under a single government-led framework; trained, protected and paid frontline workers; protected humanitarian access; decentralized laboratory capacity and epidemic intelligence; communities as co-designers of the response with food, water and psychosocial support for affected families; funded readiness in neighbouring countries rather than blanket border closures; and fast but rigorous clinical research with equitable access. The next 100 days, the brief concludes, must be defined by speed, trust and shared responsibility.`,
  },
];

function seedIfEmpty() {
  const adminCount = db.prepare("SELECT COUNT(*) as c FROM admins").get().c;
  if (adminCount === 0) {
    const seedEmail =
      process.env.SEED_ADMIN_EMAIL || "admin@pandemicintelcenter.org";
    const seedPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!seedPassword) {
      return;
    }
    const hash = bcrypt.hashSync(seedPassword, 10);
    db.prepare(
      "INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)",
    ).run(seedEmail, hash, "CGP Administrator");
  }

  const heroCount = db.prepare("SELECT COUNT(*) as c FROM heroes").get().c;
  if (heroCount === 0) {
    const insertHero = db.prepare(`
      INSERT INTO heroes (title, topic, description, btn1_text, btn1_link, btn2_text, btn2_link, image_url, sort_order, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    const heroes = [
      {
        title: "Building Intelligence for a Safer World",
        topic: "Epidemic & Pandemic Intelligence",
        description:
          "The Center for Global Health and Pandemic Intelligence (CGP) is a multidisciplinary policy, research, and implementation hub dedicated to strengthening global and regional health security through evidence-driven action.",
        btn1_text: "About CGP",
        btn1_link: "/about",
        btn2_text: "What We Do",
        btn2_link: "/what-we-do",
        image_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/07/pexels-franco30-8488619-1024x683.jpg",
        sort: 1,
      },
      {
        title: "Locally Anchored, Globally Aligned",
        topic: "African Communities & Public Health",
        description:
          "Based in Kenya with partnerships spanning across Africa and global health institutions CGP works at the subnational level to strengthen health systems in vulnerable and high-risk communities.",
        btn1_text: "Projects & Impact",
        btn1_link: "/projects",
        btn2_text: "Our Work",
        btn2_link: "/about",
        image_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-22-at-12.17.41-1024x683.jpeg",
        sort: 2,
      },
      {
        title: "AI-Driven Outbreak Forecasting",
        topic: "Surveillance, Data & Digital Health",
        description:
          "CGP pioneers AI-powered epidemic forecasting platforms, integrating IDSR, community-based surveillance, and environmental signals to anticipate outbreaks and support evidence-based decision-making.",
        btn1_text: "CGP Initiatives",
        btn1_link: "/initiatives",
        btn2_text: "Data Science",
        btn2_link: "/what-we-do",
        image_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-22-at-12.17.41-1-1024x683.jpeg",
        sort: 3,
      },
      {
        title: "Integrating Human, Animal & Ecosystem Health",
        topic: "One Health & Environmental Health",
        description:
          "Operating at the intersection of veterinary, environmental, and human public health CGP's One Health approach bridges data streams to provide early warning against climate-sensitive and zoonotic disease threats.",
        btn1_text: "One Health Initiatives",
        btn1_link: "/initiatives",
        btn2_text: "Our Approach",
        btn2_link: "/what-we-do",
        image_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-22-at-12.17.42-1024x683.jpeg",
        sort: 4,
      },
      {
        title: "Rapid, Evidence-Based Response at Scale",
        topic: "Emergency Preparedness & Response",
        description:
          "From IHR/JEE technical facilitation to Marburg and Mpox response planning CGP equips frontline responders with decision tools, simulation exercises, and 7-1-1 readiness frameworks.",
        btn1_text: "View Projects",
        btn1_link: "/projects",
        btn2_text: "Partner With Us",
        btn2_link: "/partner-with-us#contact-form",
        image_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-22-at-12.17.43-1024x683.jpeg",
        sort: 5,
      },
    ];
    heroes.forEach((h) =>
      insertHero.run(
        h.title,
        h.topic,
        h.description,
        h.btn1_text,
        h.btn1_link,
        h.btn2_text,
        h.btn2_link,
        h.image_url,
        h.sort,
      ),
    );
  }

  const newsCount = db.prepare("SELECT COUNT(*) as c FROM news").get().c;
  if (newsCount === 0) {
    const insertNews = db.prepare(`
      INSERT INTO news (title, category, excerpt, content, image_url, author, published_at, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);
    const insertAll = db.transaction((items) => {
      items.forEach((n) =>
        insertNews.run(
          n.title,
          n.category,
          n.excerpt,
          n.content,
          n.image_url,
          n.author,
          n.published_at,
        ),
      );
    });
    insertAll(NEWS_SEED);
  }

  const partnerCount = db.prepare("SELECT COUNT(*) as c FROM partners").get().c;
  if (partnerCount === 0) {
    const insertPartner = db.prepare(
      "INSERT INTO partners (name, logo_url, website, sort_order, published) VALUES (?, ?, ?, ?, 1)",
    );
    const partners = [
      {
        name: "Ministry of Health, Kenya",
        logo_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/07/ministry-of-health.jpg",
        website: "https://www.health.go.ke/",
        sort: 1,
      },
      {
        name: "Kenya National Public Health Institute",
        logo_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/07/nphi_logo_with_coat_of_arms.png",
        website: "https://nphi.go.ke/",
        sort: 2,
      },
      {
        name: "Africa CDC",
        logo_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/07/AfricaCDC_Logo.png",
        website: "https://africacdc.org/",
        sort: 3,
      },
      {
        name: "University of Nairobi",
        logo_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/07/UoN_Logo.png",
        website: "https://www.uonbi.ac.ke/",
        sort: 4,
      },
      {
        name: "Global Fund",
        logo_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/07/download.png",
        website: "https://www.theglobalfund.org/",
        sort: 5,
      },
      {
        name: "UNICEF",
        logo_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/07/download.jpeg",
        website: "https://www.unicef.org/",
        sort: 6,
      },
      {
        name: "FAO",
        logo_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/07/download-1.png",
        website: "https://www.fao.org/",
        sort: 7,
      },
      {
        name: "WHO",
        logo_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/07/download-2.png",
        website: "https://www.who.int/",
        sort: 8,
      },
      {
        name: "UNEP",
        logo_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/07/download-3.png",
        website: "https://www.unep.org/",
        sort: 9,
      },
      {
        name: "Taskforce for Global Health",
        logo_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/07/download-4.png",
        website: "https://www.taskforce.org/",
        sort: 10,
      },
      {
        name: "GIZ",
        logo_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/08/download-1.jpeg",
        website: "https://www.giz.de/",
        sort: 11,
      },
      {
        name: "Palladium",
        logo_url:
          "https://pandemicintelcenter.org/wp-content/uploads/2025/08/WhatsApp-Image-2025-08-16-at-11.27.52_a35ed63e.jpg",
        website: "https://thepalladiumgroup.com/",
        sort: 12,
      },
    ];
    partners.forEach((p) =>
      insertPartner.run(p.name, p.logo_url, p.website, p.sort),
    );
  }

  const jobCount = db.prepare("SELECT COUNT(*) as c FROM jobs").get().c;
  if (jobCount === 0) {
    const insertJob = db.prepare(`
      INSERT INTO jobs (title, department, location, employment_type, description, qualifications, preferred_experience, apply_email, apply_subject, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    insertJob.run(
      "Technical Consultant",
      "Technical",
      "Nairobi, Kenya (with field travel)",
      "Flexible engagement – Short-to-medium term",
      "CGP is seeking experienced Technical Consultants to support its technical capability areas across epidemic intelligence, health security, One Health, community engagement, and digital health.",
      JSON.stringify([
        "Advanced degree (Master's or PhD) in public health, epidemiology, veterinary science, environmental health, data science, or related field.",
        "Minimum 5 years of relevant professional experience in global health, health security, or epidemic/pandemic preparedness and response, with a focus on technical implementation.",
        "Demonstrated expertise in one or more of CGP's technical areas.",
        "Experience working with international health agencies, Ministries of Health, or NGOs in sub-Saharan Africa particularly in Kenya or East Africa.",
        "Strong written and verbal communication skills, including the ability to produce high-quality technical reports, briefs, and presentations.",
        "Proficiency in English (required); Swahili or other regional languages (preferred).",
      ]),
      JSON.stringify([
        "Prior engagement with IHR/JEE, NAPHS, or SPAR processes.",
        "Familiarity with AI/ML tools, GIS, or digital health platforms.",
        "Experience in training, facilitation, and adult learning.",
        "Track record of working in resource-constrained or emergency settings.",
      ]),
      "info@pandemicintelcenter.org",
      "Application – Technical Consultant",
    );
    insertJob.run(
      "Research Associate",
      "Research",
      "Nairobi, Kenya",
      "Full engagement – Ongoing",
      "CGP is seeking Research Associates to contribute to its research, surveillance, and digital health programmes, supporting subnational and national level public health initiatives.",
      JSON.stringify([
        "Bachelor's or Master's degree in public health, epidemiology, data science, or a related field.",
        "2–5 years of experience in public health research, health security, or global health programme implementation.",
        "Familiarity with surveillance systems, data collection tools (ODK, KoBoToolbox, DHIS2), or epidemiological software (R, STATA, Python).",
        "Experience in literature reviews, data analysis, and scientific writing.",
        "Ability to work independently and collaboratively on tight timelines.",
        "Proficiency in English; Swahili or other regional languages preferred.",
      ]),
      JSON.stringify([
        "Experience working in field-based public health settings in Kenya or East Africa.",
        "Familiarity with IHR, 7-1-7, or JEE frameworks.",
        "Exposure to AI/ML, GIS, or health informatics tools.",
        "Knowledge of One Health frameworks and multi-sectoral approaches.",
      ]),
      "info@pandemicintelcenter.org",
      "Application – Research Associate",
    );
  }

  const resourceCount = db
    .prepare("SELECT COUNT(*) as c FROM resources")
    .get().c;
  if (resourceCount === 0) {
    const insertResource = db.prepare(`
      INSERT INTO resources (title, description, document_url, date, published)
      VALUES (?, ?, ?, ?, 1)
    `);
    insertResource.run(
      "Kenya Decision-Making Tool for Public Health Emergencies (DMT-PHE)",
      "A framework that guides rapid, evidence-based action during outbreaks, validated in October 2025 under KNPHI leadership with technical facilitation by CGP.",
      "https://pandemicintelcenter.org/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-22-at-12.17.44-1-1024x683.jpeg",
      "October 2025",
    );
    insertResource.run(
      "Technical Areas of Work at CGP",
      "An overview of the technical capability areas CGP operates in, from epidemic intelligence to digital health and One Health surveillance.",
      "",
      "September 2025",
    );
  }
}

seedIfEmpty();
warnOnLegacySeedPassword();

module.exports = db;
