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

  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
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

function warnOnLegacySeedPassword() {
  const LEGACY = "Admin@CGHI2025!";
  let admins;
  try {
    admins = db.prepare("SELECT id, email, password_hash FROM admins").all();
  } catch (err) {
    return;
  }
  for (const admin of admins) {
    if (bcrypt.compareSync(LEGACY, admin.password_hash)) {
      console.warn(
        `[seed] WARNING: admin ${admin.email} still uses the legacy seed password. Rotate immediately.`,
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Versioned seed helpers                                             */
/* ------------------------------------------------------------------ */

function getMeta(key) {
  const row = db.prepare("SELECT value FROM meta WHERE key = ?").get(key);
  return row ? row.value : null;
}

function setMeta(key, value) {
  db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)").run(
    key,
    String(value),
  );
}

const SEED_VERSION_ADMINS = "1";
const SEED_VERSION_HEROES = "1";
const SEED_VERSION_NEWS = "3"; // bumped: added cover images for all articles
const SEED_VERSION_PARTNERS = "1";
const SEED_VERSION_JOBS = "1";
const SEED_VERSION_RESOURCES = "1";

/* ------------------------------------------------------------------ */
/*  Admins                                                             */
/* ------------------------------------------------------------------ */

function seedAdminsIfNeeded() {
  if (getMeta("seed_version_admins") === SEED_VERSION_ADMINS) return;

  const count = db.prepare("SELECT COUNT(*) as c FROM admins").get().c;
  if (count === 0) {
    const seedEmail =
      process.env.SEED_ADMIN_EMAIL || "admin@pandemicintelcenter.org";
    const seedPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!seedPassword) {
      console.warn("[seed] SEED_ADMIN_PASSWORD not set — skipping admin seed.");
    } else {
      const hash = bcrypt.hashSync(seedPassword, 10);
      db.prepare(
        "INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)",
      ).run(seedEmail, hash, "CGP Administrator");
      console.log("[seed] Admin user created:", seedEmail);
    }
  }

  setMeta("seed_version_admins", SEED_VERSION_ADMINS);
}

/* ------------------------------------------------------------------ */
/*  Heroes                                                             */
/* ------------------------------------------------------------------ */

function seedHeroesIfNeeded() {
  if (getMeta("seed_version_heroes") === SEED_VERSION_HEROES) return;

  const count = db.prepare("SELECT COUNT(*) as c FROM heroes").get().c;
  if (count === 0) {
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
    console.log("[seed] Heroes seeded:", heroes.length);
  }

  setMeta("seed_version_heroes", SEED_VERSION_HEROES);
}

/* ------------------------------------------------------------------ */
/*  News                                                               */
/* ------------------------------------------------------------------ */

function seedNewsIfNeeded() {
  const current = getMeta("seed_version_news");
  if (current === SEED_VERSION_NEWS) {
    console.log(
      "[seed] News already at version",
      SEED_VERSION_NEWS,
      "— skipping.",
    );
    return;
  }

  console.log(
    `[seed] Seeding news (version ${current || "none"} -> ${SEED_VERSION_NEWS})`,
  );

  db.prepare("DELETE FROM news").run();
  try {
    db.prepare("DELETE FROM sqlite_sequence WHERE name='news'").run();
  } catch (_) {
    /* first run */
  }

  const insertNews = db.prepare(`
    INSERT INTO news (title, category, excerpt, content, image_url, author, published_at, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const articles = [
    /* -------- 1. medRxiv Preprint: AI-Assisted Decision Support System -------- */
    {
      title:
        "Development and Evaluation of an Artificial Intelligence–Assisted Decision Support System for Public Health Emergency Classification and Escalation in Kenya",
      category: "Research",
      excerpt:
        "A new preprint manuscript describes the development and evaluation of the DMT-PHE AI Agent, an artificial intelligence–assisted decision support system designed to operationalize Kenya's nationally validated Decision-Making Tool for Public Health Emergencies. The pilot evaluation demonstrated high concordance with expert assessments, strong usability, and no major safety concerns.",
      content: `Background

Timely assessment, classification, and escalation of public health events are essential for effective outbreak response, yet decision-making after event detection remains challenging because of fragmented guidance and variable interpretation of escalation criteria. To strengthen public health emergency management, Kenya developed the Decision-Making Tool for Public Health Emergencies (DMT-PHE), a framework for event assessment, classification, notification, and escalation. An artificial intelligence (AI)-enabled version, the DMT-PHE AI Agent, was subsequently developed to operationalize the framework through decision support. This study describes the development of the DMT-PHE AI Agent and evaluates its performance, usability, safety, and user acceptability.

Methods

The DMT-PHE AI Agent was developed using a retrieval-augmented generation (RAG) architecture supported by a curated knowledge base derived from the validated DMT-PHE framework and related public health guidance. The AI Agent employs a retrieval-augmented generation architecture that combines the reasoning capabilities of a large language model (Anthropic Claude Sonnet 4.5) with a curated, domain-specific knowledge base. Rather than relying solely on information embedded within the foundation model, the retrieval component identifies relevant content from authoritative reference documents before generating responses. This approach enables recommendations to be grounded in validated public health guidance, reduces dependence on parametric model knowledge, and improves the transparency and contextual relevance of generated outputs.

The knowledge base comprised a version-controlled collection of reference materials derived from the validated DMT-PHE framework together with supporting national and international guidance. These resources included the International Health Regulations (2005), Kenya public health emergency management policies, Public Health Emergency Operations Centre (PHEOC) procedures, disease-specific technical guidance, One Health frameworks, and the DMT-PHE Trigger Cards that provide standardized operational guidance for priority public health hazards.

When a user submitted an event description, the AI Agent interpreted the information, retrieved the most relevant guidance documents, and synthesized the retrieved evidence to generate structured recommendations. Outputs included event classification, escalation level, notification pathways, priority response actions, coordination mechanisms, and supporting references where available. Recommendations were generated using a hierarchical decision logic that prioritized the DMT-PHE framework, followed by nationally approved public health emergency management guidance, International Health Regulations (2005) requirements, and One Health guidance where applicable.

Where multiple knowledge sources addressed the same decision point, recommendations were resolved using a predefined hierarchy in which the validated DMT-PHE framework served as the primary authority. National public health emergency management policies were given precedence over international guidance where operational procedures differed, while the International Health Regulations (2005) and One Health guidance provided complementary decision support for notification, multisectoral coordination, and risk assessment. This approach ensured consistency with Kenya's public health emergency management architecture while maintaining alignment with international best practices.

The DMT-PHE AI Agent was intentionally designed as a human-in-the-loop decision-support system rather than an autonomous decision-maker.

A simulation-based pilot evaluation was conducted among 11 public health professionals who independently assessed three standardized outbreak scenarios. Participants were purposively recruited from the Kenya National Public Health Institute (KNPHI) and selected county surveillance teams to ensure representation of professionals routinely involved in public health emergency preparedness and response. Eligible participants included epidemiologists, disease surveillance officers, public health emergency management personnel, and other technical staff with responsibilities related to event detection, risk assessment, outbreak investigation, or emergency coordination.

Three standardized outbreak scenarios were developed to evaluate the performance of the DMT-PHE AI Agent across distinct public health emergency contexts. Scenario selection was informed by the hazard categories and included Public Health Events of Initially Unknown Etiology (PHEIUE), Rift Valley fever, and Mpox.

AI-generated recommendations were compared with expert-defined gold standards. Outcomes included concordance, response-action coverage, citation performance, safety, usability, and user acceptability.

Results

Thirty-three scenario evaluations were completed. The AI Agent achieved an overall weighted concordance score of 0.924, with exact agreement of 90.9% for Public Health Events of Initially Unknown Etiology, 81.8% for Rift Valley fever, and 90.9% for Mpox. Citation support was provided in 78.8% of interactions, with no incorrect citations or major safety concerns identified. The mean System Usability Scale score was 85.2, while participants reported high trust (4.27/5), contextual relevance (4.55/5), and perceived time savings (4.82/5).

Conclusions

The DMT-PHE AI Agent demonstrated that a nationally validated public health emergency decision framework can be successfully translated into an AI-enabled decision-support system. These findings provide early evidence that AI can augment public health emergency decision-making by delivering structured, transparent, and context-specific recommendations while maintaining human oversight, offering a practical model for operationalizing national public health guidance.`,
      image_url:
        "https://www.medrxiv.org/sites/default/files/images/medrxiv_logo_homepage7-5-small-test-up.png",
      author:
        "Mark Nanyingi, Eric Osoro, Geoffrey H. Siwo, Isaac Ngere, Samuel Kadivane, James Magige, Joseph Kamau, Shreya Jain, Bryan O. Nyawanda, Joseph Njoroge, Ian Njeru, Kadondi Kasera, Victoria Kanana, Kamene Kimenye",
      published_at: "July 2026",
    },

    /* -------- 2. Advancing Epidemic Intelligence in Kenya -------- */
    {
      title:
        "Kenya Launches NAPHS II and KNPHI Strategic Plan to Strengthen Epidemic Intelligence and Digital Public Health Systems",
      category: "News",
      excerpt:
        "Kenya has launched the KNPHI Strategic Plan 2026–2030 and NAPHS II 2026–2030, establishing a comprehensive blueprint for transitioning toward integrated, data-driven, and intelligence-led public health systems. The launch signals a decisive shift from fragmented and reactive approaches toward institutionalized epidemic intelligence, underpinned by digital transformation, interoperability, and advanced analytics.",
      content: `Kenya has reached a critical milestone in strengthening its national health security architecture with the launch of the Kenya National Public Health Institute (KNPHI) Strategic Plan 2026–2030 and the National Action Plan for Health Security (NAPHS II) 2026–2030. These frameworks establish a comprehensive blueprint for transitioning toward integrated, data-driven, and intelligence-led public health systems. The launch signals a decisive shift from fragmented and reactive approaches toward institutionalized epidemic intelligence, underpinned by digital transformation, interoperability, and advanced analytics. In supporting this transition, the Centre for Global Health (CGH) provided key technical contributions to the KNPHI Strategic Plan and NAPHS II, aligning with international frameworks for epidemic intelligence and health security. These contributions ensured that both frameworks are grounded in globally aligned, evidence-based approaches while remaining responsive to Kenya's national context and operational priorities.

Speaking at the historic event, Cabinet Secretary for Health, Hon. Aden Duale, noted that "The launch of these strategic frameworks marks a significant step in strengthening Kenya's capacity to prevent, detect, and respond to public health threats. By investing in integrated systems and digital innovation, we are building a resilient health security architecture that safeguards our population and contributes to global health security."

Operationalizing Strategy Through Integrated Frameworks

To translate strategic ambition into execution, KNPHI has introduced a suite of operational frameworks that define how epidemic intelligence will function in practice. These include the Decision-Making Tool for Public Health Emergencies (DMT-PHE), the Digital e-Public Health Surveillance Strategy, the Monitoring, Evaluation and Learning (MEL) Framework, the Kenya Animal Health Integrated Disease Surveillance and Response system (AH-IDSR), the Infodemic Management Operational Manual, Pre-Approved Risk Communication Templates, and Fact Sheets for 28 Priority Diseases. Together, these instruments establish a coherent operational architecture, aligning detection, analysis, communication, and response across institutions and levels of the health system while strengthening coordination and improving response timelines.

Embedding AI and Advanced Analytics into Public Health Operations

With foundational systems in place, Kenya is embedding artificial intelligence (AI) and advanced analytics into routine public health operations moving epidemic intelligence from concept to capability. The Centre for Global Health and Pandemic Intelligence (CGP) and Palladium's TDDAP2 have played a catalytic role in supporting both the design and operationalization of the Decision-Making Tool for Public Health Emergencies (DMT-PHE). Building on the strengthened digital and surveillance foundations, KNPHI is advancing the integration of artificial intelligence (AI) and advanced analytics into routine public health operations.

Through CGP's convened consortium, a DMT-PHE AI assistant as a prototype has been developed by the University of Michigan – Center for Global Health Equity (CGHE), which brings specialized expertise in artificial intelligence, applied analytics and epidemic intelligence. In parallel, locally-led evaluations of the DMT-PHE as an AI-enabled clinical decision support tool (CDST) have been undertaken in collaboration with the One Health Center at Kenya Institute of Primate Research (KIPRE), the Washington State University (WSU) Global Health-Kenya and University of Toronto, Dalla Lana School of Public Health, generating critical evidence to inform scale-up. These preliminary evaluations are promising, demonstrating high concordance with national escalation protocols, excellent usability and strong user trust in applying recommendations during public health emergencies, with no identified critical safety concerns. The AI integration enables faster detection, improved situational awareness, and more precise response shifting the system toward predictive and anticipatory public health action.

Investment Case: Scalable, Interoperable, and Intelligence-Driven Systems

Kenya's approach offers a compelling model for donor investment, anchored in:

- Systems-level transformation, moving beyond siloed interventions
- Interoperable digital infrastructure, ensuring long-term scalability and sustainability
- AI-enabled efficiency gains, reducing detection and response lag
- Institutional strengthening of KNPHI as a national and regional hub

This integrated model aligns with global priorities on pandemic preparedness, digital transformation, and data-driven governance, while offering a replicable framework for other countries.

Partnerships Supporting the Agenda

The development and launch of these strategic frameworks were made possible through strong collaboration between the Government of Kenya and its partners. In particular, the Tackling Deadly Diseases in Africa Programme 2 (TDDAP2) funded by the Foreign, Commonwealth & Development Office (FCDO), played a critical role in supporting the development of the NAPHS II and associated frameworks, as well as strengthening systems for data-driven public health decision-making.

Speaking at the event, Dr. Kadondi Kasera highlighted the programme's contribution, noting that: "TDDAP2 has delivered targeted technical assistance across four critical pillars—planning and financing, workforce, data and surveillance, and emergency preparedness and response—contributing to Kenya's strengthened health security architecture."`,
      image_url:
        "https://pandemicintelcenter.org/wp-content/uploads/2026/03/IMG-20260327-WA0049.jpg",
      author: "Dr. Mark Nanyingi",
      published_at: "March 2026",
    },

    /* -------- 3. The First 100 Days: DRC Ebola Epidemic -------- */
    {
      title:
        "The First 100 Days: Why the DRC Ebola Epidemic is Still Accelerating",
      category: "Analysis",
      excerpt:
        "One hundred days after the DRC declared an outbreak of Bundibugyo virus disease, the epidemic is still spreading, with approximately 5,515 confirmed cases and 2,642 deaths reported, representing a case-fatality ratio of nearly 48%. The outbreak has already exceeded the DRC's 2018–2020 outbreak in confirmed cases.",
      content: `One hundred days after the Democratic Republic of the Congo declared an outbreak of Bundibugyo virus disease on 15 May 2026, the epidemic is still spreading. It is expanding geographically, overwhelming parts of the health system and exposing persistent weaknesses in the world's ability to contain outbreaks in fragile and conflict-affected settings.

By the end of the first 100 days, approximately 5,515 confirmed cases and 2,642 deaths had been reported, representing a case-fatality ratio of nearly 48%. The epidemic has already exceeded the DRC's 2018–2020 outbreak, which recorded 3,317 confirmed cases over almost two years.

The progression has been extraordinary. Confirmed cases increased from 85 on 21 May to 515 by 6 June, 1,460 by 1 July, 3,605 by 30 July and more than 5,500 by the end of the first 100 days.

There is currently no published evidence that the virus has acquired substantially greater intrinsic transmissibility. The more scientifically plausible explanation is that a virus with known transmission characteristics is exploiting an exceptionally permissive and fragmented social-operational environment.

The outbreak had a substantial head start: The first known patient developed symptoms on 24 April, several weeks before the outbreak was confirmed. Delayed recognition allowed the virus to spread through households, health facilities and communities before an Ebola-specific response was fully activated.

According to the World Health Organization, an average of nearly 90 confirmed cases were recorded daily during the first three months, a rate higher than the 2018–2020 outbreak in the DRC. The outbreak now affects six provinces, with Ituri remaining the epicentre, accounting for around 85 per cent of cases and 79 per cent of deaths.

The epidemic is unfolding amid a wider humanitarian crisis, where communities face malnutrition and lack access to safe drinking water. "People are hungry; they need access to food; they need water," underscored Dr. Marie Roseline Belizaire, WHO Regional Director for Emergency Response in Africa. "Humanitarian aid must also be provided alongside the Ebola response."

Insecurity, displacement, attacks on health facilities and difficulties in accessing care continue to hamper the response. Deaths occurring outside Ebola treatment centres accounted for around 60 per cent of the 260 weekly deaths recorded over the last six weeks. This figure highlights the ongoing difficulties in detecting cases early, referring patients swiftly to healthcare facilities and ensuring they have access to treatment.

Despite these challenges, the response has grown considerably in scale and capacity. The testing network has expanded from a single site to 19 laboratories now capable of analysing more than 3,000 samples daily. Treatment capacity has jumped from fewer than 10 beds to over 1,300. Community engagement activities have reached more than 2.5 million people, and contact tracing has climbed from nine per cent in the first week of the outbreak to 84 per cent as of 18 August.

Dr. Javid Abdelmoneim, international president of MSF, emphasized the need for community-centered approaches: "This outbreak continues to spread at a rate that the response cannot keep up with. Treatment centres remain essential to save lives, but this response requires much more than additional beds. It requires better screening, safe isolation of sick people and their contacts, and support for health professionals. It is essential that the response be developed with communities and not without their participation."

The current outbreak trajectory underscores the urgent need to continue to scale up evidence-based Ebola control measures, such as rapid case and contact identification, expansion of diagnostic capacity, improvement of infection prevention and control in health care settings, adoption of safe and dignified burials, strengthening of cross-border surveillance and coordination, and community engagement.`,
      image_url:
        "https://pandemicintelcenter.org/wp-content/uploads/2026/08/EVD-analysis.png",
      author: "CGP Analysis",
      published_at: "August 2026",
    },

    /* -------- 4. From Detection to Decision: AI in Kenya -------- */
    {
      title:
        "From Detection to Decision: How Kenya is Transforming Public Health Emergency Response with Artificial Intelligence",
      category: "News",
      excerpt:
        "The DMT-PHE AI Agent translates the nationally validated decision framework into an interactive AI-enabled system capable of assisting public health professionals in interpreting outbreak information, applying escalation logic, and recommending response pathways. The pilot evaluation demonstrated a high degree of agreement between expert assessments and AI-generated recommendations.",
      content: `The framework underwent extensive stakeholder consultations, technical reviews, simulation exercises, and national validation workshops involving epidemiologists, emergency preparedness specialists, laboratory experts, risk communication practitioners, and public health managers from across Kenya. Through these processes, the DMT-PHE was refined and tested using realistic scenarios reflecting some of the country's most significant public health threats, including viral haemorrhagic fevers, zoonotic outbreaks, cholera outbreaks, chemical incidents, and public health events of unknown etiology.

What distinguishes the DMT-PHE is its ability to translate complex technical guidance into a practical decision-making pathway that can be used by public health professionals operating at national and subnational levels. Rather than relying solely on individual interpretation, the framework provides clear criteria for assessing risks, escalating events, activating response mechanisms, and coordinating actions across multiple sectors.

"Preparedness is not only about detecting threats—it is about ensuring institutions can act quickly and confidently when they emerge. The DMT-PHE helps transform information into coordinated action across the health system," said Dr. Kadondi Kasera (Palladium).

As the framework matured, the development team began exploring how digital technology could further enhance its utility. Recognizing the potential of artificial intelligence to support public health decision-making, Dr. Geoffrey H. Siwo, AI Lead at the University of Michigan CGHE, spearheaded the development of the DMT-PHE AI Agent. The platform was designed to translate the nationally validated DMT-PHE framework into an interactive AI-enabled system capable of assisting public health professionals in interpreting outbreak information, applying escalation logic, and recommending response pathways.

The evaluation demonstrated a high degree of agreement between expert assessments and AI-generated recommendations, providing encouraging evidence that the system could reliably support public health emergency assessment, escalation, and response across a range of outbreak scenarios.

A health worker in a Kenyan border county notices something unusual: several patients, all bleeding in ways that don't fit anything routine. Word travels the way it usually does at first — a phone call, a WhatsApp message, a conversation between neighbors before it becomes a report. Two days pass before anything is written down. A third day passes before anyone decides whether the national government needs to know. By the time a response team arrives, the same symptoms have turned up in the next county over.

Nobody missed the warning signs. The problem was speed: the space between noticing and knowing what to do about it. In an outbreak, that space is where things go wrong.

Kenya's national public health institute has spent the past several years trying to close it, with an unusual set of partners: a UK-funded programme aimed at strengthening disease response across Africa, a center focused on pandemic intelligence, and artificial intelligence researchers at the University of Michigan. What they built together is not, on its face, a piece of software. It's a decision-making framework: a structured way of asking what an event is, how serious it is, and who needs to know. Only once that framework had been tested, reviewed, and validated by Kenyan epidemiologists and emergency responders did anyone consider handing part of it to a machine.

"Public health guidance existed, but decision-makers lacked a practical tool to consistently translate surveillance information into timely action," says Mark Nanyingi, PhD, the epidemiologist who led its technical development. The framework took shape through national workshops, simulations, and stress-tests against Kenya's hardest scenarios: Ebola-like hemorrhagic fevers, cholera, chemical spills, outbreaks with no clear cause at all.

The team didn't bring in AI until that groundwork was solid. Geoffrey Siwo, PhD, who leads AI work at Michigan's Center for Global Health Equity, and his data science team built an AI Agent trained not to make judgment calls, but to apply the same logic a trained epidemiologist would, instantly, every time.

Before anyone trusted it with anything real, they tested it: side-by-side comparisons between the AI's recommendations and those of human experts, across scenario after scenario. The test results were close enough that the team is now confident the system can hold up under pressure, a conclusion detailed in a preprint the group published on the work.

The recent Ebola outbreak in East Africa was a reminder of the stakes. Early signals never arrive whole. They show up as fragments — a rumor, a strange symptom, a handful of cases that might be nothing — and someone has to decide, fast, what they add up to. That is the exact moment the framework and its AI Agent are built for: not replacing the epidemiologist in the room, but giving them a faster, steadier way to think through what they're seeing.

"The real innovation is not artificial intelligence itself," Nanyingi reflects. "It is the combination of public health expertise, operational experience, and technology working together to help decision-makers act faster and more confidently when lives are at stake."

That, more than the technology, is the part worth paying attention to. AI is arriving in global health faster than most institutions can evaluate it, often built far from the places it's meant to serve. This project took the slower route: years of Kenyan-led framework-building before a line of AI code was written, and a rigorous evaluation before anyone called it ready. It's a quieter story than "AI predicts the next pandemic", but it may be the more honest version of what responsible AI in public health actually looks like: not a shortcut, but a tool built patiently, by the people who'll be the ones relying on it when the next warning sign appears.`,
      image_url:
        "https://pandemicintelcenter.org/wp-content/uploads/2026/07/DMT-Discussion.png",
      author: "CGP Communications",
      published_at: "July 2026",
    },

    /* -------- 5. U.S. Advancing Global Health Initiative -------- */
    {
      title:
        'What the U.S. "Advancing Global Health" Initiative Means for Africa\'s Health Security and Sovereignty',
      category: "Analysis",
      excerpt:
        "The U.S. Department of State has launched a major global funding initiative titled Advancing Global Health, establishing a flexible financing framework designed to support global health security priorities over the coming years. The initiative arrives at a pivotal moment as African countries accelerate efforts to modernize national health security systems.",
      content: `The U.S. Department of State, through its Bureau of Global Health Security and Diplomacy (GHSD), has launched a major global funding initiative titled Advancing Global Health. Structured as an Annual Program Statement (APS) with rolling Addenda, the initiative establishes a flexible financing framework designed to support global health security priorities over the coming years. With award sizes ranging from USD 500,000 to USD 250 million, the program represents one of the most substantial diplomatic financing mechanisms currently available for strengthening pandemic preparedness, surveillance systems, and outbreak response capacity worldwide.

For African countries, the initiative arrives at a pivotal moment. Following the COVID-19 pandemic and successive outbreaks of Ebola, cholera, and Mpox, governments across the continent are accelerating efforts to modernize national health security systems and address structural vulnerabilities exposed by recent crises.

The initiative also intersects with the continental vision of Africa Health Security and Sovereignty (AHSS) championed by the Africa CDC. If strategically aligned with national preparedness priorities, the initiative could accelerate investments in surveillance modernization, outbreak intelligence systems, laboratory capacity, and emergency response infrastructure.

A New Diplomatic Financing Architecture for Global Health

The Advancing Global Health APS represents a shift from traditional project-based global health assistance toward a framework financing architecture. Instead of issuing isolated funding calls tied to narrowly defined project scopes, the APS establishes a multi-year umbrella mechanism through which targeted funding opportunities known as Addenda can be released in response to evolving global health priorities. This model offers several strategic advantages:

- It enables more adaptive financing, allowing investments to respond quickly to emerging disease threats and preparedness gaps.
- It strengthens the link between global health investments and diplomatic engagement, as U.S. embassies play a central role in identifying country-specific priorities in collaboration with national governments.

This approach reflects a broader evolution in global health diplomacy, where pandemic preparedness is increasingly viewed not only as a development priority but also as a strategic international security concern.

"The emergence of flexible financing mechanisms such as the Advancing Global Health initiative signals a shift in global health diplomacy—from reactive outbreak funding toward strategic investment in preparedness systems. For Africa, the critical task is ensuring these resources strengthen integrated epidemic intelligence architectures capable of translating surveillance data into rapid public health action."
— Dr. Mark Nanyingi, Center for Global Health and Pandemic Intelligence (CGP)

The Rapid Outbreak Response (ROR) Alignment with 7-1-7

One of the most significant components of the initiative is the Rapid Outbreak Response (ROR) funding window. The ROR mechanism focuses on strengthening countries' ability to detect outbreaks early and contain them rapidly, preventing localized health events from escalating into large-scale epidemics or pandemics. These priorities align closely with emerging operational benchmarks for outbreak detection and response, including the 7-1-7 target framework, which calls for detecting outbreaks within seven days, notifying public health authorities within one day, and initiating an effective response within seven days.

Financing mechanisms such as the GHSD APS could play a critical role in enabling countries to operationalize these targets by strengthening surveillance systems, laboratory networks, and rapid response coordination mechanisms. Priority investment areas include:

- Integrated disease surveillance systems
- Laboratory diagnostics and genomic sequencing
- Field epidemiology and outbreak investigation capacity
- Emergency operations centers and incident management
- Coordination systems for rapid response teams

These priorities align closely with preparedness frameworks led by the World Health Organization under the International Health Regulations (2005). In this sense, the APS may function as a country-led implementation accelerator for IHR core capacities, enabling governments to operationalize priority gaps identified through national preparedness assessments while aligning investments with domestically defined health security strategies.

Alignment with Africa's Health Security and Sovereignty Agenda

The initiative also intersects with Africa's evolving continental health security architecture. The Africa Centres for Disease Control and Prevention has articulated a strategic framework known as Africa Health Security and Sovereignty (AHSS), which aims to strengthen the continent's capacity to prevent, detect, and respond to public health threats while reducing reliance on external systems.

The AHSS agenda emphasizes several core priorities:

- Strengthening surveillance and epidemic intelligence systems
- Expanding public health workforce capacity
- Increasing regional manufacturing of medical countermeasures
- Strengthening emergency preparedness and response infrastructure

The GHSD APS could complement these priorities by supporting country-level preparedness investments that feed into regional surveillance and response networks coordinated by Africa CDC. If aligned effectively, this financing mechanism could reinforce the broader AHSS objective of building a more autonomous and resilient African health security ecosystem capable of managing emerging threats with greater independence and coordination.

However, the initiative has also drawn scrutiny from African governments and civil society organizations concerned about data sovereignty, intellectual property, and the broader geopolitical implications of U.S.-led global health financing. Several African countries, including Zimbabwe, Ghana, and Zambia, have rejected or stalled bilateral health agreements due to concerns over data-sharing requirements and the linking of health assistance to mineral access. These developments underscore the importance of ensuring that financing mechanisms respect national sovereignty and are aligned with domestically defined health security priorities.`,
      image_url:
        "https://pandemicintelcenter.org/wp-content/uploads/2026/03/Africa_health-security.jpeg",
      author: "Dr. Mark Nanyingi",
      published_at: "March 2026",
    },

    /* -------- 6. Kenya Advances PH Emergency Response Systems (DMT-PHE Curriculum Validation) -------- */
    {
      title:
        "Kenya Advances Public Health Emergency Response Systems through Validation of a Risk-Based Decision-Making Tool",
      category: "News",
      excerpt:
        "The National Validation Workshop for the DMT-PHE training curriculum marks a significant advancement in Kenya's public health emergency governance and reinforces the country's compliance with the International Health Regulations. The curriculum validation marked the institutionalization phase of DMT-PHE transitioning from framework validation to applied national rollout readiness.",
      content: `From Ad Hoc Response to Structured Activation: Operationalizing a Standardized Escalation Framework to Improve Speed, Clarity, and Accountability in Emergency Response

The Center for Global Health and Pandemic Intelligence (CGP) in collaboration with the Kenya National Public Health Institute (KNPHI), with support from Tackling Deadly Diseases Programme (TDDAP2) provided technical leadership in the National Validation Workshop for the Decision-Making Tool for Public Health Emergencies (DMT-PHE) training curriculum. This milestone represents a significant advancement in Kenya's public health emergency governance and reinforces the country's compliance with the International Health Regulations (IHR 2005).

From Framework Validation to Institutionalized Risk-based Activation

The curriculum validation marked the institutionalization phase of DMT-PHE transitioning from framework validation (October 2025) to applied national rollout readiness. Table Top Simulations (TTX) across five high-risk scenarios—Public Health Event of Unknown Etiology (PHEIUE), Rift Valley Fever (RVF), Ebola, Chemical Spill, and Cholera—tested classification logic, escalation thresholds, and IMS activation under time pressure. The exercises were aligned to Kenya's PHEM framework, ERF IMS framework, IDSR workflows, Event-Based Surveillance systems, 7-1-7 timeliness benchmarks, and the risk-assessment decision instrument under Annex 2 of the IHR (2005).

Embedding IHR Annex 2 into Decision Logic

Annex 2 of the IHR (2005) requires States Parties to notify WHO of events that may constitute a Public Health Emergency of International Concern (PHEIC) based on structured risk assessment.

Through simulations, participants applied:

- "Serious" and "Unusual" criteria
- Automatic notifiable condition logic (e.g., VHF/Ebola)
- Cross-border notification triggers
- Threshold-based escalation for epidemic-prone diseases
- Conditional notification for non-infectious hazards

Escalation was tested under uncertainty, reinforcing that timely notification is a preventive risk-management decision not a post-confirmation action.

Operationalizing One Health in Real Time

The validation embedded One Health into the decision-making logic. It operationalized multisectoral escalation in real-time simulation, ensuring that animal health signals, environmental hazards, and human health alerts were integrated into unified escalation pathways. Scenarios reflected Kenya's real epidemiological landscape, including livestock mobility corridors, environmental basin connectivity, and cross-border exposure dynamics.

Validation Results

Evaluation findings confirmed strong endorsement:

- 45 national and county reviewers participated
- Average workshop rating: 4.56 / 5
- 96% confirmed readiness for piloting and rollout (with minor refinements)
- Strong agreement on alignment with PHEM, IMS, IDSR, One Health, and IHR (2005) Annex 2 criteria

The validation confirmed that DMT-PHE strengthens existing surveillance systems while reducing decision latency during escalation.

"The simulations clarified escalation thresholds and strengthened our confidence in applying Annex 2 risk assessment under uncertainty. The integration with IDSR, IMS structures, PHEM, and ADaM platform makes the tool practical for county-level implementation."
— James Mbugua, County Disease Surveillance Coordinator, Lamu County

Envisioned DMT Implementation Pathway (2026-2028)

Pillar 1 – Technical Refinement: focuses on consolidating validation feedback into a standardized Version 2.0 of the tool. This includes clarifying trigger thresholds and escalation timelines, harmonizing terminology with IDSR, EBS, and Incident Management System (IMS) standards, and updating facilitator guides and activation templates. The result is a nationally standardized DMT-PHE package.

Pillar 2 – County Piloting: tests operational feasibility in selected counties through structured 5-day pilots. Simulation exercises benchmark performance against 7-1-7 targets, assess multisectoral escalation (One Health), and generate county-level integration action plans. Lessons inform national scale-up.

Pillar 3 – Systems Integration: embeds DMT-PHE within routine surveillance and emergency workflows. Triggers are mapped to IDSR notification categories, integrated into PHEOC activation SOPs, aligned with IMS functional pillars, and linked to EBS verification processes. This establishes DMT-PHE as the official activation gateway.

Pillar 4 – Digitization & AI Support: advances digital trigger matrices within DHIS2/IDSR platforms, introduces automated severity scoring and escalation prompts, enables real-time dashboards for decision latency monitoring, and applies AI-supported anomaly detection. This transforms the tool into a dynamic decision-support system.

Pillar 5 – NAPHS II & 7-1-7 Alignment: strengthens measurable compliance with IHR core capacities. The framework aligns indicators to SPAR/JEE benchmarks, institutionalizes 7-1-7 performance monitoring, reinforces One Health coordination metrics, and ensures integration with the broader public health emergency management architecture.`,
      image_url:
        "https://pandemicintelcenter.org/wp-content/uploads/2026/02/DSC_1942-scaled.jpg",
      author: "CGP Communications",
      published_at: "February 2026",
    },

    /* -------- 7. Kenya's SPAR 2025 -------- */
    {
      title:
        "Kenya's States Parties Self-Assessment Annual Reporting (SPAR 2025) Signals a Strategic Shift in Health Security Preparedness",
      category: "News",
      excerpt:
        "The Kenya National Public Health Institute convened a three-day national stakeholders' consultative workshop to undertake Kenya's 2025 States Parties Self-Assessment Annual Reporting (SPAR), a core obligation under the International Health Regulations. The assessment brought together over 50 multidisciplinary experts to reflect on national preparedness performance and identify priority areas for action.",
      content: `"The SPAR 2025 process provided Kenya with a critical opportunity to reflect honestly on our preparedness strengths and system gaps. By linking assessment findings directly to NAPHS II implementation, we are strengthening national readiness through evidence-based prioritization and coordinated action across sectors."
— Dr. Kanana Kimonye, Ag. Director, Emergency Preparedness and Response (EPR), Kenya National Public Health Institute (KNPHI)

Aligning SPAR with NAPHS II Implementation to Strengthen Sustainable National Preparedness Systems

The Kenya National Public Health Institute (KNPHI) convened a three-day national stakeholders' consultative workshop to undertake Kenya's 2025 States Parties Self-Assessment Annual Reporting (SPAR), a core obligation under the International Health Regulations (IHR, 2005). The assessment brought together over 50 multidisciplinary experts from multisectoral institutions spanning government, academia, One Health actors, and emergency response partners to reflect on national preparedness performance and identify priority areas for action.

Kenya's SPAR 2025 process marked an important transition from routine reporting toward strategic reflection on national preparedness performance. Rather than serving solely as an annual compliance exercise, the process enabled stakeholders to interpret assessment findings as decision-shaping insights for strengthening the country's evolving health security architecture. Technical facilitation by the Center for Global Health and Pandemic Intelligence (CGP), Tackling Deadly Diseases Programme (TDDAP2) and WHO supported alignment between SPAR outcomes and the recently validated National Action Plan for Health Security II (NAPHS II), reinforcing a deliberate continuum between assessment, policy design, and implementation planning.

Performance Trajectory of SPAR: Insights from 2024 to 2025

A comparative review of Kenya's SPAR 2024 and SPAR 2025 assessments suggested several evolving trends across IHR core capacities. Improvements appeared most evident in governance coordination, infection prevention and control, and the institutionalization of simulation exercises and after-action learning reflecting sustained national preparedness reforms and alignment with NAPHS II planning processes.

However, the assessment also highlighted areas where scores appeared to have plateaued or declined. Financing mechanisms, laboratory system integration into routine monitoring frameworks, and cross-sectoral data harmonization remained persistent system constraints. Some changes also reflected stricter application of SPAR performance levels, where higher scores required fully institutionalized systems rather than partial implementation.

"Health security is not strengthened by assessments alone. It is strengthened when assessments shape decisions. SPAR 2025 served as a bridge between international reporting obligations and domestic system transformation."
— Dr. Mark Nanyingi, Global Health Security, Center for Global Health and Pandemic Intelligence

Overall, the comparison signaled a transition from rapid capacity expansion toward consolidation where progress depended increasingly on sustainable financing, workforce institutionalization, and integrated One Health governance.

Nexus of NAPHS II and SPAR 2025

CGP and KNPHI underscored the SPAR as a strategic self-assessment tool that directly informed implementation and prioritization of Kenya's National Action Plan for Health Security (NAPHS). The SPAR enabled the country to systematically identify strengths, gaps, and priority actions across IHR core capacities, guiding evidence-based investments and coordinated action to strengthen national preparedness, resilience, and response to public health emergencies.

Through its technical facilitation and analytical synthesis, CGP supported the alignment of SPAR findings with national planning processes, helping translate assessment outcomes into strategic insights that informed Kenya's broader preparedness agenda. As countries increasingly seek to bridge global reporting frameworks with domestically driven implementation, integrated approaches linking assessment, policy design, and investment planning are becoming central to advancing sustainable health security systems.

The SPAR is WHO's standardized mandatory annual self-assessment tool through which countries evaluated their capacities to prevent, detect, and respond to public health threats. It forms a critical component of the IHR Monitoring and Evaluation Framework (IHR MEF), alongside Joint External Evaluations (JEE), simulation exercises (SIMEXs), and after-action reviews (AARs).

System Signals Emerging from SPAR 2025

While SPAR indicators provide a quantitative snapshot of performance, deeper analysis of the assessment process points to underlying system dynamics influencing preparedness outcomes. The following signals reflect evolving governance maturity, financing realities, workforce stability, and multisectoral integration.

Governance Maturation: Kenya's preparedness architecture showed signs of transitioning from project-based coordination toward more institutionalized national leadership structures aligned with NAPHS II (2026-2030).

Financing Fragility: Technical progress continued, but uneven financing mechanisms remained a critical bottleneck for advancing to higher performance levels.

Workforce Institutionalization: Sustained performance improvements increasingly depended on stable and well-trained public health workforce systems.

One Health Integration Trajectory: Cross-sectoral engagement strengthened, although climate-sensitive surveillance and environmental health indicators required further integration.`,
      image_url:
        "https://pandemicintelcenter.org/wp-content/uploads/2026/02/1770730172808.jpeg",
      author: "Dr. Mark Nanyingi",
      published_at: "February 2026",
    },

    /* -------- 8. Strengthening Kenya's Health Security through NAPHS II -------- */
    {
      title:
        "Strengthening Kenya's Health Security through Validation of the National Action Plan for Health Security (NAPHS II)",
      category: "News",
      excerpt:
        "The validation convened over 70 multidisciplinary stakeholders to rigorously assess the technical soundness, strategic coherence, and implementability of NAPHS II, Kenya's five-year roadmap for strengthening prevention, detection, and response to public health threats in alignment with the International Health Regulations.",
      content: `"The validation of NAPHS II marks a critical shift from planning to execution. By grounding the Plan in evidence, One Health principles, and national ownership, Kenya is positioning itself to translate investments into sustained health security impact. TDDAP2 is proud to support this process as it strengthens the systems that matter most before, during, and after health emergencies."
— Dr. Kadondi Kasera, TDDAP2 Team Lead

The Center for Global Health and Pandemic Intelligence (CGP), through its Division of Global Health Security, provided technical leadership and facilitation for the National Action Plan for Health Security II (NAPHS II) Validation Workshop.

The validation convened over 70 multidisciplinary stakeholders from national and county governments, technical agencies, academia, and development partners to rigorously assess the technical soundness, strategic coherence, and implementability of NAPHS II—Kenya's five-year roadmap for strengthening prevention, detection, and response to public health threats in alignment with the International Health Regulations (IHR 2005).

A One Health–Anchored, Evidence-Driven Plan

NAPHS II is anchored in a One Health framework that integrates human, animal, and environmental health, and explicitly addresses climate-related health risks across all 19 Joint External Evaluation (JEE) technical areas. The Plan builds on the achievements and lessons learned from NAPHS I (2019–2023), while systematically addressing gaps identified through:

- Joint External Evaluation (JEE), 2024
- State Party Self-Assessment Annual Report (SPAR), 2024
- Performance of Veterinary Services (PVS), 2022
- National Bridging Workshop (NBW), 2021
- After Action Reviews (AARs) and Intra-Action Reviews (IARs)

These inputs were synthesised in line with the IHR (2005) Monitoring and Evaluation Framework, ensuring that NAPHS II is both evidence-based and implementation-ready.

Vision and Strategic Direction

NAPHS II articulates a clear national vision: to build a resilient, coordinated, and One Health–driven health security system that protects lives, livelihoods, and national stability from epidemic-prone, zoonotic, climate-sensitive, and other emerging threats. This vision is operationalised through six overarching strategic objectives:

1. Strengthen emergency preparedness and risk reduction
2. Enhance surveillance and early warning systems
3. Strengthen emergency management, One Health coordination, and response
4. Strengthen community communication and engagement
5. Promote research, innovation, and evidence-based decision-making
6. Reinforce governance, leadership, and sustainable financing

How was the Validation Conducted

The validation followed a structured, functional group–based methodology designed by CGP that is aligned with the IHR (2005) Monitoring and Evaluation Framework, combining thematic review, application of a standardised validation matrix, and cross-sectoral synthesis. The draft NAPHS II was reviewed through five functional groups, each assigned a defined scope and clustered JEE technical areas:

- Governance and Financing (P1, P2, P3): Legal and policy frameworks, coordination mechanisms, and sustainable financing.
- Surveillance, Laboratory Systems, and Workforce (D1, D2, P7, R5, POE): Detection and verification capacity, laboratory systems, biosafety, risk communication, and points of entry.
- One Health, AMR, Food Safety, and IPC (P4, P5, P6, R4): Integration of AMR, zoonotic disease control, food safety, and infection prevention and control systems.
- Response to Health Emergencies (R1, R2, R3, P8): Emergency management, surge capacity, health service delivery, and immunisation readiness.
- Chemical, Biological, Radiological, and Nuclear (CBRN) Emergencies (CE, RE): Preparedness and response to non-biological public health hazards.

Each group applied a validation matrix to identify gaps, overlaps, feasibility concerns, and priority bottlenecks, classifying inputs as AGREED, NOTED, OR DEFERRED. Outputs were consolidated in plenary and reviewed during a post-validation convention of the NAPHS II Secretariat, ensuring coherence, national ownership, and clarity on next steps.

From Validation to National Ownership

Through a post-validation convention of the NAPHS II Secretariat, consolidated inputs from all functional groups were reviewed, ratified, and translated into agreed revisions, noted implementation actions, and clearly defined escalation points ensuring national ownership, technical credibility, and policy readiness of the final Plan.

Positioning NAPHS II for Implementation and Financing

The validation confirmed that NAPHS II provides a credible platform for resource mobilisation, aligned with ongoing and prospective bilateral and multilateral investments. In particular, the Plan positions Kenya to operationalise the US–Kenya health cooperation agreement and other partnerships that support national health security priorities.`,
      image_url:
        "https://pandemicintelcenter.org/wp-content/uploads/2026/02/DSC_9880-scaled.jpg",
      author: "Dr. Mark Nanyingi",
      published_at: "February 2026",
    },

    /* -------- 9. Strengthening Africa's Pandemic Preparedness (HARMONIZE and SCOPE) -------- */
    {
      title:
        "Strengthening Africa's Pandemic Preparedness: A Harmonised One Health Response",
      category: "News",
      excerpt:
        "CGP-supported HARMONIZE and SCOPE initiatives unlock USD 80M in coordinated investment for Africa's health security through the Pandemic Fund's Third Call proposals. The initiatives represent a landmark coordinated investment in Africa's pandemic prevention, preparedness and response capacity.",
      content: `The Center for Global Health and Pandemic Intelligence (CGP)–supported HARMONIZE and SCOPE initiatives unlock USD 80M in coordinated investment for Africa's health security. The CGP proudly welcomes the Pandemic Fund's announcement of two landmark initiatives approved under the Pandemic Fund Third Call proposals that CGP supported technically, strategically, and methodologically.

The AU-IBAR led "Strengthening One Health Capacities for Enhanced Pandemic Preparedness and Response in the Lake Chad Basin" (SCOPE) and Africa CDC led "Harmonizing Continental Networks and Systems for Pandemic Prevention Preparedness and Response in Africa" (HARMONIZE) initiatives represent a USD 80 million coordinated investment in Africa's pandemic prevention, preparedness and response (PPR) capacity intentionally designed to avoid duplication and maximize synergy through an aligned, harmonised, and mutually reinforcing approach.

"Africa's resilience against pandemics depends on integrated, multisectoral, equity-centred, and interoperable systems across human, animal and environmental health."
— Dr. Nanyingi Mark, who led the CGP's technical support to both AU-IBAR and Africa CDC

The SCOPE initiative, led by the African Union Interafrican Bureau for Animal Resources (AU-IBAR), focuses on strengthening One Health capacities in the Lake Chad Basin—a region characterized by complex cross-border dynamics, climate vulnerability, and significant zoonotic disease risks. The project will enhance surveillance systems, laboratory networks, and community-based early warning systems across the basin's member states.

The HARMONIZE initiative, led by Africa CDC, aims to harmonize continental networks and systems for pandemic prevention, preparedness and response. The project will strengthen coordination mechanisms, standardize operational procedures, and enhance interoperability across Africa's health security architecture, building on existing regional and national capacities.

Together, these initiatives represent a significant step toward operationalizing the Africa Health Security and Sovereignty (AHSS) agenda, which seeks to strengthen the continent's capacity to prevent, detect, and respond to public health threats while reducing reliance on external systems.

CGP's technical contributions to both initiatives included:

- Strategic and technical guidance on One Health integration
- Methodological support for surveillance system strengthening
- Alignment with IHR (2005) core capacities and the 7-1-7 framework
- Facilitation of multisectoral coordination mechanisms
- Support for monitoring, evaluation, and learning frameworks

The approval of these initiatives marks a milestone in Africa's collective efforts to build resilient, integrated health security systems capable of managing emerging threats with greater independence and coordination.`,
      image_url:
        "https://pandemicintelcenter.org/wp-content/uploads/2025/11/20201010-REDDISSE-01-780x439-2-1.jpg",
      author: "CGP Communications",
      published_at: "November 2025",
    },

    /* -------- 10. Leveraging One Health to Strengthen Pandemic Preparedness in Kenya -------- */
    {
      title:
        "Leveraging One Health to Strengthen Pandemic Preparedness in Kenya",
      category: "News",
      excerpt:
        "At the inaugural Kenya One Health Conference, CGP's Technical Director delivered the opening keynote address on leveraging One Health to strengthen pandemic preparedness in Kenya. He traced Kenya's journey from responding to zoonotic outbreaks to building integrated systems for pandemic prevention, preparedness, and resilience.",
      content: `At the inaugural Kenya One Health Conference (KOH 2025) jointly organized by the Kenya Medical Association (KMA) and Kenya Veterinary Association (KVA) under the global theme "By Protecting One, We Help Protect All", CGP's Technical Director for Global Health Security, Dr. Mark Nanyingi, delivered the opening keynote address on "Leveraging One Health to Strengthen Pandemic Preparedness in Kenya."

Speaking before over 200 distinguished delegates drawn from human medicine, veterinary medicine, public health, environmental health, research, and academia, Dr. Nanyingi traced Kenya's journey from responding to zoonotic outbreaks to building integrated systems for pandemic prevention, preparedness, and resilience.

"Pandemic preparedness begins long before the next outbreak—it begins with how we choose to collaborate today."

Pandemic Horizons, Pathways for Infectious Diseases Emergence and Re-emergence?

He outlined the global and national landscape of emerging and re-emerging infectious diseases, noting that "over 80 percent of all emerging pathogens are zoonotic in origin," using recurrent outbreaks such as Rift Valley Fever, Brucellosis, Anthrax, Rabies, Marburg, and Mpox that continue to test the resilience of Kenya's surveillance and response mechanisms. Global maps of epidemic hotspots indicate that Kenya sits at a convergence zone for vector-borne and spillover risks due to climate variability, land-use change, and human–animal interface.

"Zoonotic threats are not random events—they are predictable outcomes of how humans interact with animals and ecosystems. Preparedness therefore requires integrated thinking, not isolated action."

Operationalization and Institutionalization of One Health

Kenya has systematically embedded One Health in national and subnational systems over the past three decades. Key milestones included:

- Institutional coordination through the Zoonotic Disease Unit (ZDU) and establishment of County One Health Units (COHUs) linking human, animal, and environmental health actors.
- Development of disease-specific contingency plans and national strategies for Rabies (2014), Anthrax (2021), Brucellosis (2021), and Antimicrobial Resistance (2023).
- Integration of Joint Risk Assessments (JRA), risk communication, and multisectoral coordination into the IHR–PVS National Roadmap and MCM Action Plans.

"What began as an intersectoral concept has now matured into a governance framework. The challenge is no longer 'why One Health' but 'how effectively we institutionalize and sustain it'."

Decision Intelligence and the 7-1-7 Paradigm

The introduction of Kenya's Decision-Making Tool for Public Health Emergencies (DMT-PHE)—an innovation developed by CGP in collaboration with the Kenya National Public Health Institute (KNPHI) and Ministry of Health—is a game-changer. The tool standardizes escalation, coordination, and support from community to county to national level, ensuring that event detection, notification, and response meet the 7-1-7 target (detect within 7 days, notify within 1 day, respond within 7 days). Using case studies of Rift Valley Fever (Wajir, Marsabit 2024) and Mpox (2024), he illustrated "One Health in Action" where One Health mechanisms were jointly applied to guide rapid, evidence-based decisions and the potential to use DMT-PHE in future outbreaks.

"The DMT-PHE is Kenya's decision intelligence backbone—transforming alerts into action, and coordination into accountability."

The DMT-PHE aligns with WHO's Emergency Response Framework, IHR Annex 2, and Africa CDC's 7-1-7 performance metrics, positioning Kenya as a continental model for operational readiness.

Integrating Systems: From Data to Action

The importance of data integration and digital transformation in pandemic preparedness cannot be overemphasised. Kenya has made strides in linking the Integrated Disease Surveillance and Response (IDSR) platform, Event-Based Surveillance (EBS), Kenya Animal Biosurveillance System (KABS), and Public Health Emergency Management (PHEM) functions. A digitized DMT-PHE will provide real-time dashboards for early warning, cross-sector data sharing, and decision analytics connecting surveillance to action at both county and national levels.

"We must move from spreadsheets to situation rooms — where data flows seamlessly across human, animal, and environmental health systems."

Investing in Health Emergency Workforce

Kenya's One Health workforce development ecosystem aims to be transformative in response to outbreaks. Some of the multidisciplinary initiatives include:

- Field Epidemiology and Laboratory Training Program (FELTP) – builds the front line of evidence-based action, turning surveillance data into decisions that save lives
- In-Service Applied Veterinary Epidemiology Training (ISAVET) and AFROHUN (Africa One Health University Network) – next generation of animal and human health professionals through joint learning and field experience, building a culture of collaboration from the classroom to the community
- AVOHC SURGE – embodies Africa's collective readiness, a trained corps of responders ready to deploy during outbreaks`,
      image_url:
        "https://pandemicintelcenter.org/wp-content/uploads/2025/11/PF-scaled.jpeg",
      author: "Dr. Mark Nanyingi",
      published_at: "November 2025",
    },

    /* -------- 11. Kenya Advances One Health and Pandemic Preparedness (RVF/Brucellosis) -------- */
    {
      title:
        "Kenya Advances One Health and Pandemic Preparedness with Launch of Rift Valley Fever Contingency Plan and Human Brucellosis Testing Guidelines",
      category: "News",
      excerpt:
        "Kenya has launched two strategic public health frameworks: the National Contingency Plan for Rift Valley Fever (2025) and the Human Brucellosis Testing Guidelines. These frameworks represent a major advance in Kenya's One Health and pandemic preparedness agenda, providing standardized procedures and clear decision-support tools for tackling zoonotic threats.",
      content: `"Standardizing surveillance and diagnostics for priority zoonoses is a critical step toward faster detection, earlier response, and reduced outbreak impact, and the emergence of epidemics and pandemics."
— Dr. Mark Nanyingi, (CGP)

Kenya has taken a significant step forward in strengthening its national systems for early detection and coordinated response to zoonotic diseases with the official launch of two strategic public health frameworks: the National Contingency Plan for Rift Valley Fever (2025) and the Human Brucellosis Testing Guidelines. The launch event, convened by the Zoonotic Disease Unit (ZDU) under the joint leadership of the Ministry of Health, the Ministry of Agriculture & Livestock Development, and the Ministry of Environment, Climate Change & Forestry, Kenya National Public Health Institute (KNPHI) brought together national agencies, 19 county representatives, laboratory networks, research institutions—Kenya Medical Research Institute, International Livestock Research Institute—and international partners including the Center for Global Health and Pandemic Intelligence (CGP), Washington State University (WSU), Amref Health Africa-Kenya, University of Liverpool, University of Nairobi.

These national frameworks represent a major advance in Kenya's One Health and pandemic preparedness agenda, providing national and county-level actors with standardized procedures, clear decision-support tools, and a shared operational language for tackling zoonotic threats with epidemic and socio-economic impact.

Why These Frameworks Matter Now?

Rift Valley Fever (RVF) and human brucellosis continue to pose persistent threats in Kenya, both epidemiologically and economically. RVF has caused multiple outbreaks since the 1930s, leading to loss of human life, mass livestock mortality, trade disruptions, and long-term livelihood impacts. Brucellosis, while less visible, remains one of the most underdiagnosed and underreported zoonoses in the region linked to chronic illness, reduced workforce productivity, and mismanaged antibiotic use.

Kenya's vulnerability to zoonotic spillover is amplified by several factors:
- Expanding livestock–human interfaces
- Climate-driven flooding cycles affecting mosquito vector dynamics
- Informal livestock trading networks and cross-border movement
- Gaps in standard diagnostic capacity and data sharing
- Uneven outbreak readiness across counties
- Reliance on reactive rather than anticipatory response systems

The launch of the two frameworks signals a shift toward proactive, risk-based, multisectoral preparedness—a core principle of the One Health approach, the International Health Regulations (IHR 2005), and the Africa CDC Regional Strategy for Health Security (2023–2027).

Inside the National Contingency Plan for Rift Valley Fever (2025)

The RVF Contingency Plan is a full-scale operational document designed to guide preparedness, detection, response, and recovery across human, animal, and environmental sectors. Its six key objectives include:

1. Providing multisectoral coordination structures for RVF prevention, detection, and response
2. Serving as a national and county-level reference tool for outbreak management
3. Mapping and communicating risk factors and high-threat geographic hotspots
4. Outlining actions for each phase of the outbreak cycle—from inter-epidemic period to recovery
5. Supporting resource mobilization for preparedness and response
6. Mitigating socio-economic and livelihood impacts on affected communities

The plan also lays out priority components including:
- Early warning systems leveraging weather and vector surveillance
- Diagnostic capacity-building and laboratory networking
- Standard triage and infection prevention protocols
- Vector control strategies
- Risk communication and community engagement pathways
- Incident command and emergency operations structures

Human Brucellosis Testing Guidelines – Strengthening Diagnostic Precision

The newly launched Human Brucellosis Testing Guidelines address long-standing gaps in diagnostic accuracy, case management, and national reporting. The guidelines:

1. Standardize laboratory testing algorithms and case definitions for all levels of the health system
2. Define specimen handling, biosafety, and transport requirements
3. Provide interpretation criteria for serology, culture, and PCR testing
4. Establish data reporting and notification pathways within IDSR
5. Harmonize human diagnostic systems with existing animal health surveillance structures

The guidelines are expected to reduce diagnostic delays and misclassification—common barriers that have masked the true burden of brucellosis in Kenya and the region.

CGP's Role in Advancing Evidence-Based Preparedness

The Center for Global Health and Pandemic Intelligence (CGP) provided technical assistance during the development of both documents, contributing expertise in:

- Outbreak analytics and disease modelling
- Harmonization of human–animal surveillance systems
- Evidence reviews on diagnostic performance and feasibility
- Integration of One Health governance into public health emergency management
- County-level readiness assessments and policy translation

CGP's contribution builds on more than a decade of technical work in zoonotic disease preparedness in Kenya, including support to RVF hotspot mapping and early warning systems.`,
      image_url:
        "https://pandemicintelcenter.org/wp-content/uploads/2025/11/9.jpeg",
      author: "CGP Communications",
      published_at: "November 2025",
    },

    /* -------- 12. Kenya Validates Groundbreaking DMT-PHE -------- */
    {
      title:
        "Kenya Validates Groundbreaking Decision-Making Tool for Public Health Emergencies (DMT-PHE)",
      category: "News",
      excerpt:
        "Kenya has taken a major step toward institutionalizing rapid, evidence-based outbreak response with the successful validation of the Decision-Making Tool for Public Health Emergencies (DMT-PHE) – the country's first standardized framework for guiding escalation, coordination, and decision-making during public health crises.",
      content: `A new era of evidence-based, decentralized, and One Health–aligned emergency decision-making is taking shape under KNPHI leadership with technical support from CGP and Palladium's TDDAP2 programme.

Kenya has taken a major step toward institutionalizing rapid, evidence-based outbreak response with the successful validation of the Decision-Making Tool for Public Health Emergencies (DMT-PHE) – the country's first standardized framework for guiding escalation, coordination, and decision-making during public health crises.

The National Validation Workshop, held from 16–17 October 2025 at Sarova Panafric Hotel in Nairobi, was convened by the Kenya National Public Health Institute (KNPHI) with support from Palladium's Tackling Deadly Diseases in Africa Programme 2 (TDDAP2) and technical facilitation from the Center for Global Health and Pandemic Intelligence (CGP). Over 40 participants drawn from government agencies, research institutions, and international partners including Ministry of Health (MOH), MOH-Disaster Risk Management, Directorate of Veterinary Services, WHO, Africa CDC, FAO, Amref Health Africa, US CDC, IGAD, AFENET, Washington State University (Global Health), TaskForce for Global Health (SONAR) and Kenya RedCross Society (KRCS), Kenya Medical Research Institute (KEMRI), KEMRI-Wellcome Trust, Pandemic Action Network (PAN) and RAMAT collaborated to test the DMT-PHE through five real-world table top simulation exercises (SIMEX) ranging from Ebola Virus Disease, Cholera outbreaks, Rift Valley fever, chemical spills and Public Health Emergencies of Initially Unknown Etiology (PHEIUE).

"This tool bridges the long-standing gap between surveillance data and timely decision-making," said Dr. Samuel Kadivane, who coordinated the workshop on behalf of the KNPHI Director General Dr. Maureen Kamene. "It empowers county health leaders to act decisively, with clear escalation thresholds, structured coordination, and predictable response pathways."

During the simulations, participants validated escalation triggers and workflows aligned with the 7-1-7 performance model—detecting outbreaks within seven days, notifying within one day, and initiating response within seven days. The results demonstrated that DMT-PHE can dramatically reduce response delays and promote multi-sectoral action across the human, animal, and environmental health sectors.

Dr. Kadondi Kasera, Country Lead for TDDAP2, emphasized the tool's strategic integration: "Embedding DMT-PHE within the KNPHI's MEAL framework, IHR implementation roadmap, and costing tools will accelerate Kenya's transition to a data-driven, performance-based emergency management system."

The validated tool will now proceed to pilot testing in ten high-risk counties, representing diverse epidemiological and cross-border contexts. These pilots will help refine Standard Operating Procedures (SOPs), integrate DMT-PHE with IDSR and DHIS2, and establish a baseline for monitoring county performance against 7-1-7 benchmarks.

Dr. Mark Nanyingi, Technical Director at CGP and the workshop's lead facilitator, noted: "The DMT-PHE represents a new frontier in Kenya's pandemic preparedness architecture — a clear, practical mechanism for deciding who acts, when, and how, during complex health emergencies."

The validation workshop concluded with a unified call to digitize the DMT-PHE, embed its triggers in national dashboards, and align its rollout with the National Action Plan for Health Security (NAPHS 2.0) and the broader Public Health Emergency Management (PHEM) framework. With Kenya leading the way, the DMT-PHE is poised to become a regional reference model for structured, One Health–based decision-making—a blueprint for turning data into decisive action when every hour counts.

About the DMT-PHE

The Decision-Making Tool for Public Health Emergencies (DMT-PHE) is a structured, evidence-based framework developed by the Kenya National Public Health Institute (KNPHI) with technical support from CGP and Palladium's TDDAP2.

It provides:

- A tiered escalation pathway for classifying emergencies and triggering action at subnational and national levels.
- Decision thresholds for 20 epidemic-prone diseases and public health events, including zoonoses, chemical incidents, and foodborne outbreaks.
- Defined roles and responsibilities for key actors across One Health sectors—human, animal, and environmental.
- Linkage to the 7-1-7 performance model, ensuring early detection (7 days), notification (1 day), and effective response (7 days).
- Integration with IDSR, IHR (2005), and NAPHS frameworks for seamless data-driven decision-making.
- Accountability, coordination, and speed of action—transforming Kenya's emergency management from reactive to predictive and structured.`,
      image_url:
        "https://pandemicintelcenter.org/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-22-at-12.17.44.jpeg",
      author: "CGP Communications",
      published_at: "October 2025",
    },

    /* -------- 13. Operationalizing 7-1-7 -------- */
    {
      title:
        "Operationalizing 7-1-7: Kenya's Shift from Metrics and Timelines to Decision Intelligence",
      category: "Analysis",
      excerpt:
        "The Kenya National Public Health Institute, supported by AFENET and with technical guidance from CGP, convened a national workshop to operationalize 7-1-7. The emphasis was not on introducing the framework, but on interrogating its application. A key innovation within this process was the pilot integration of AI-assisted decision support within the DMT-PHE.",
      content: `Designing Systems That Deliver Speed in Outbreak Response

The Kenya National Public Health Institute (KNPHI), supported by the African Field Epidemiology Network (AFENET) and with technical guidance from the Center for Global Health and Pandemic Intelligence (CGP), convened a national workshop to operationalize 7-1-7. The emphasis was not on introducing the framework, but on interrogating its application. Through simulation exercises, early action reviews, and hands-on engagement with national dashboards, participants explored how decisions are made in real time and where delays emerge. A key innovation within this process was the pilot integration of AI-assisted decision support within the Decision-Making Tool for Public Health Emergencies (DMT-PHE), marking a shift toward embedding intelligence directly into operational workflows.

Why 7-1-7

While the framework defines what should happen and when, it does not fully address how those timelines are operationalized within complex, decentralized health systems. Increasingly, evidence suggests that the limiting factor is not the absence of surveillance but the absence of structured decision-making systems that translate signals into timely action.

The 7-1-7 framework has rapidly become a cornerstone of global health security, setting clear expectations for how quickly outbreaks should be detected, notified, and responded to. At its core, 7-1-7 defines three critical timelines: detection of a public health event within 7 days of emergence, notification to relevant authorities within 1 day, and initiation of an effective response within 7 days. These benchmarks have strengthened accountability, sharpened performance measurement, and provided a common language for timeliness across countries. By translating complex outbreak response processes into measurable intervals, 7-1-7 enables systems to assess not just whether they respond—but how fast they do so. Yet an important question persists across many settings:

How do we consistently achieve these timelines in real-world conditions?

Where Timeliness Breaks Down

Across multiple country contexts, a consistent pattern is emerging. Surveillance systems are improving. Signals are detected earlier. Data flows are expanding across routine reporting, event-based surveillance, and community intelligence. However, delays persist—not at the point of detection, but in the transition from signal to action. Uncertainty in risk classification, hesitation in escalation, and fragmentation in coordination create what can be described as decision latency. These delays are often subtle, but cumulatively they undermine the ability to meet 7-1-7 targets.

"The challenge is no longer seeing the signal, it is deciding what to do, when, and how. Operationalizing 7-1-7 requires more than the timelines; it requires systems that translate signals into coordinated action."
— Dr. Nanyingi

The Missing Layer: Decision Intelligence

At the center of Kenya's approach is the recognition that outbreak response is fundamentally a decision process. The DMT-PHE provides a structured decision layer that connects detection to response. It systematically converts signals into risk classifications, links those classifications to escalation thresholds, and maps them to predefined response actions. In doing so, it replaces variability with consistency and ambiguity with clarity.

Without such systems, response decisions are often shaped by individual experience, institutional memory, or situational judgment. While these elements remain important, they introduce variability and delay. With structured decision pathways, the system itself guides action—ensuring that similar signals trigger similar responses, regardless of location or personnel. Surveillance detects events. Decision systems determine response speed.

Speed and Structure: A Complementary System

Understanding the relationship between 7-1-7 and decision systems is critical. 7-1-7 defines the speed of the system. It establishes the outer limits within which action must occur. DMT-PHE defines the structure of the system. It determines how decisions are made within that timeframe. Together, they form a complete operational model: Speed without structure leads to inconsistency. Structure without speed leads to delayed response.

The Role of Artificial Intelligence

The integration of AI into this framework introduces a new dimension of capability. By supporting rapid triage, pattern recognition, and consistency in classification, AI enhances the system's ability to process signals at scale while reducing cognitive burden on frontline responders. Rather than replacing human judgment, AI acts as an augmenting layer, strengthening the reliability and speed of decision-making in high-pressure environments. This is particularly relevant in decentralized systems, where variability in experience and capacity can affect response consistency.

"Timeliness is not achieved by urgency—it is achieved by design."

A One Health Imperative

Outbreaks are increasingly shaped by complex interactions across human, animal, and environmental systems. Signals often emerge simultaneously across these domains, requiring integrated interpretation and coordinated response. Kenya's operationalization of 7-1-7 reflects a One Health approach that recognizes the interconnectedness of these systems and builds decision pathways that span sectors.

The workshop demonstrated that operationalizing 7-1-7 is not merely a technical exercise but a governance transformation. It requires institutionalizing decision intelligence, building workforce capacity, and embedding AI-assisted tools within routine workflows. Kenya's approach offers a model for other countries seeking to translate global health security frameworks into operational reality.`,
      image_url:
        "https://pandemicintelcenter.org/wp-content/uploads/2026/04/DSC_6169-scaled.jpg",
      author: "Dr. Mark Nanyingi",
      published_at: "April 2026",
    },
  ];

  for (const a of articles) {
    insertNews.run(
      a.title,
      a.category,
      a.excerpt,
      a.content,
      a.image_url,
      a.author,
      a.published_at,
    );
  }

  console.log("[seed] News seeded:", articles.length, "articles.");
  setMeta("seed_version_news", SEED_VERSION_NEWS);
}

/* ------------------------------------------------------------------ */
/*  Partners                                                           */
/* ------------------------------------------------------------------ */

function seedPartnersIfNeeded() {
  if (getMeta("seed_version_partners") === SEED_VERSION_PARTNERS) return;

  const count = db.prepare("SELECT COUNT(*) as c FROM partners").get().c;
  if (count === 0) {
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
    console.log("[seed] Partners seeded:", partners.length);
  }

  setMeta("seed_version_partners", SEED_VERSION_PARTNERS);
}

/* ------------------------------------------------------------------ */
/*  Jobs                                                               */
/* ------------------------------------------------------------------ */

function seedJobsIfNeeded() {
  if (getMeta("seed_version_jobs") === SEED_VERSION_JOBS) return;

  const count = db.prepare("SELECT COUNT(*) as c FROM jobs").get().c;
  if (count === 0) {
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
    console.log("[seed] Jobs seeded: 2");
  }

  setMeta("seed_version_jobs", SEED_VERSION_JOBS);
}

/* ------------------------------------------------------------------ */
/*  Resources                                                          */
/* ------------------------------------------------------------------ */

function seedResourcesIfNeeded() {
  if (getMeta("seed_version_resources") === SEED_VERSION_RESOURCES) return;

  const count = db.prepare("SELECT COUNT(*) as c FROM resources").get().c;
  if (count === 0) {
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
    console.log("[seed] Resources seeded: 2");
  }

  setMeta("seed_version_resources", SEED_VERSION_RESOURCES);
}

/* ------------------------------------------------------------------ */
/*  Run all seeders                                                    */
/* ------------------------------------------------------------------ */

function runAllSeeders() {
  try {
    seedAdminsIfNeeded();
    seedHeroesIfNeeded();
    seedNewsIfNeeded();
    seedPartnersIfNeeded();
    seedJobsIfNeeded();
    seedResourcesIfNeeded();
  } catch (err) {
    console.error("[seed] Seeding error:", err);
  }
}

runAllSeeders();
warnOnLegacySeedPassword();

module.exports = db;
