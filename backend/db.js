const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'cghi.db');
const db = new Database(DB_PATH);

// Enable WAL mode for performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── SCHEMA ──────────────────────────────────────────────────────────────
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
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// ── SEED (only if tables are empty) ─────────────────────────────────────
function seedIfEmpty() {
    // Admin
    const adminCount = db.prepare('SELECT COUNT(*) as c FROM admins').get().c;
    if (adminCount === 0) {
        const hash = bcrypt.hashSync('Admin@CGHI2025!', 10);
        db.prepare("INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)").run(
            'admin@pandemicintelcenter.org', hash, 'CGP Administrator'
        );
        console.log('[DB] Admin user seeded: admin@pandemicintelcenter.org / Admin@CGHI2025!');
    }

    // Heroes
    const heroCount = db.prepare('SELECT COUNT(*) as c FROM heroes').get().c;
    if (heroCount === 0) {
        const insertHero = db.prepare(`
      INSERT INTO heroes (title, topic, description, btn1_text, btn1_link, btn2_text, btn2_link, image_url, sort_order, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
        const heroes = [
            {
                title: 'Building Intelligence for a Safer World',
                topic: 'Epidemic & Pandemic Intelligence',
                description: 'The Center for Global Health and Pandemic Intelligence (CGP) is a multidisciplinary policy, research, and implementation hub dedicated to strengthening global and regional health security through evidence-driven action.',
                btn1_text: 'About CGP', btn1_link: '/about',
                btn2_text: 'What We Do', btn2_link: '/what-we-do',
                image_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/07/pexels-franco30-8488619-1024x683.jpg',
                sort: 1
            },
            {
                title: 'Locally Anchored, Globally Aligned',
                topic: 'African Communities & Public Health',
                description: 'Based in Kenya with partnerships spanning across Africa and global health institutions CGP works at the subnational level to strengthen health systems in vulnerable and high-risk communities.',
                btn1_text: 'Projects & Impact', btn1_link: '/projects',
                btn2_text: 'Our Work', btn2_link: '/about',
                image_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-22-at-12.17.41-1024x683.jpeg',
                sort: 2
            },
            {
                title: 'AI-Driven Outbreak Forecasting',
                topic: 'Surveillance, Data & Digital Health',
                description: 'CGP pioneers AI-powered epidemic forecasting platforms, integrating IDSR, community-based surveillance, and environmental signals to anticipate outbreaks and support evidence-based decision-making.',
                btn1_text: 'CGP Initiatives', btn1_link: '/initiatives',
                btn2_text: 'Data Science', btn2_link: '/what-we-do',
                image_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-22-at-12.17.41-1-1024x683.jpeg',
                sort: 3
            },
            {
                title: 'Integrating Human, Animal & Ecosystem Health',
                topic: 'One Health & Environmental Health',
                description: "Operating at the intersection of veterinary, environmental, and human public health CGP's One Health approach bridges data streams to provide early warning against climate-sensitive and zoonotic disease threats.",
                btn1_text: 'One Health Initiatives', btn1_link: '/initiatives',
                btn2_text: 'Our Approach', btn2_link: '/what-we-do',
                image_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-22-at-12.17.42-1024x683.jpeg',
                sort: 4
            },
            {
                title: 'Rapid, Evidence-Based Response at Scale',
                topic: 'Emergency Preparedness & Response',
                description: 'From IHR/JEE technical facilitation to Marburg and Mpox response planning CGP equips frontline responders with decision tools, simulation exercises, and 7-1-7 readiness frameworks.',
                btn1_text: 'View Projects', btn1_link: '/projects',
                btn2_text: 'Partner With Us', btn2_link: '/contact',
                image_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-22-at-12.17.43-1024x683.jpeg',
                sort: 5
            }
        ];
        heroes.forEach(h => insertHero.run(h.title, h.topic, h.description, h.btn1_text, h.btn1_link, h.btn2_text, h.btn2_link, h.image_url, h.sort));
        console.log('[DB] 5 heroes seeded.');
    }

    // News
    const newsCount = db.prepare('SELECT COUNT(*) as c FROM news').get().c;
    if (newsCount === 0) {
        db.prepare(`
      INSERT INTO news (title, category, excerpt, content, image_url, author, published_at, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
            'Kenya Validates Groundbreaking Decision-Making Tool for Public Health Emergencies (DMT-PHE)',
            'News',
            'Kenya has unveiled the Decision-Making Tool for Public Health Emergencies (DMT-PHE), a first-of-its-kind framework validated under KNPHI leadership, with support from Palladium\'s TDDAP2 and technical facilitation by CGP. The tool will be piloted in ten high-risk counties before national rollout.',
            `Kenya has unveiled the Decision-Making Tool for Public Health Emergencies (DMT-PHE), a first-of-its-kind framework that guides rapid, evidence-based action during outbreaks and other crises. Validated in October 2025 under the leadership of the Kenya National Public Health Institute (KNPHI), with support from Palladium's TDDAP2 and technical facilitation by the Center for Global Health and Pandemic Intelligence (CGP), the DMT-PHE strengthens One Health coordination and aligns with the 7-1-7 model for faster detection, notification, and response. The tool will now be piloted in ten high-risk counties before national rollout.`,
            'https://pandemicintelcenter.org/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-22-at-12.17.44-1-1024x683.jpeg',
            'CGP Communications',
            'October 2025'
        );
        console.log('[DB] 1 news article seeded.');
    }

    // Partners
    const partnerCount = db.prepare('SELECT COUNT(*) as c FROM partners').get().c;
    if (partnerCount === 0) {
        const insertPartner = db.prepare('INSERT INTO partners (name, logo_url, website, sort_order, published) VALUES (?, ?, ?, ?, 1)');
        const partners = [
            { name: 'Ministry of Health, Kenya', logo_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/07/ministry-of-health.jpg', website: '', sort: 1 },
            { name: 'Kenya National Public Health Institute', logo_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/07/nphi_logo_with_coat_of_arms.png', website: '', sort: 2 },
            { name: 'Africa CDC', logo_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/07/AfricaCDC_Logo.png', website: '', sort: 3 },
            { name: 'University of Nairobi', logo_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/07/UoN_Logo.png', website: '', sort: 4 },
            { name: 'Global Fund', logo_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/07/download.png', website: '', sort: 5 },
            { name: 'UNICEF', logo_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/07/download.jpeg', website: '', sort: 6 },
            { name: 'FAO', logo_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/07/download-1.png', website: '', sort: 7 },
            { name: 'WHO', logo_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/07/download-2.png', website: '', sort: 8 },
            { name: 'UNEP', logo_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/07/download-3.png', website: '', sort: 9 },
            { name: 'Taskforce for Global Health', logo_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/07/download-4.png', website: '', sort: 10 },
            { name: 'GIZ', logo_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/08/download-1.jpeg', website: '', sort: 11 },
            { name: 'Palladium', logo_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/08/WhatsApp-Image-2025-08-16-at-11.27.52_a35ed63e.jpg', website: '', sort: 12 }
        ];
        partners.forEach(p => insertPartner.run(p.name, p.logo_url, p.website, p.sort));
        console.log('[DB] 12 partners seeded.');
    }

    // Jobs
    const jobCount = db.prepare('SELECT COUNT(*) as c FROM jobs').get().c;
    if (jobCount === 0) {
        const insertJob = db.prepare(`
      INSERT INTO jobs (title, department, location, employment_type, description, qualifications, preferred_experience, apply_email, apply_subject, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
        insertJob.run(
            'Technical Consultant',
            'Technical',
            'Nairobi, Kenya (with field travel)',
            'Flexible engagement – Short-to-medium term',
            'CGP is seeking experienced Technical Consultants to support its technical capability areas across epidemic intelligence, health security, One Health, community engagement, and digital health.',
            JSON.stringify([
                "Advanced degree (Master's or PhD) in public health, epidemiology, veterinary science, environmental health, data science, or related field.",
                'Minimum 5 years of relevant professional experience in global health, health security, or epidemic/pandemic preparedness and response, with a focus on technical implementation.',
                "Demonstrated expertise in one or more of CGP's technical areas.",
                'Experience working with international health agencies, Ministries of Health, or NGOs in sub-Saharan Africa particularly in Kenya or East Africa.',
                'Strong written and verbal communication skills, including the ability to produce high-quality technical reports, briefs, and presentations.',
                'Proficiency in English (required); Swahili or other regional languages (preferred).'
            ]),
            JSON.stringify([
                'Prior engagement with IHR/JEE, NAPHS, or SPAR processes.',
                'Familiarity with AI/ML tools, GIS, or digital health platforms.',
                'Experience in training, facilitation, and adult learning.',
                'Track record of working in resource-constrained or emergency settings.'
            ]),
            'info@pandemicintelcenter.org',
            'Application – Technical Consultant',
        );
        insertJob.run(
            'Research Associate',
            'Research',
            'Nairobi, Kenya',
            'Full engagement – Ongoing',
            'CGP is seeking Research Associates to contribute to its research, surveillance, and digital health programmes, supporting subnational and national level public health initiatives.',
            JSON.stringify([
                "Bachelor's or Master's degree in public health, epidemiology, data science, or a related field.",
                '2–5 years of experience in public health research, health security, or global health programme implementation.',
                'Familiarity with surveillance systems, data collection tools (ODK, KoBoToolbox, DHIS2), or epidemiological software (R, STATA, Python).',
                'Experience in literature reviews, data analysis, and scientific writing.',
                'Ability to work independently and collaboratively on tight timelines.',
                'Proficiency in English; Swahili or other regional languages preferred.'
            ]),
            JSON.stringify([
                'Experience working in field-based public health settings in Kenya or East Africa.',
                'Familiarity with IHR, 7-1-7, or JEE frameworks.',
                'Exposure to AI/ML, GIS, or health informatics tools.',
                'Knowledge of One Health frameworks and multi-sectoral approaches.'
            ]),
            'info@pandemicintelcenter.org',
            'Application – Research Associate',
        );
        console.log('[DB] 2 jobs seeded.');
    }
}

seedIfEmpty();

module.exports = db;
