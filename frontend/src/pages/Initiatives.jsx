import React, { useEffect } from 'react';

export default function Initiatives() {
  useEffect(() => {
    if (window.initSiteLogic) window.initSiteLogic();
  }, []);

  return (
    <>
      <header className="site-header">
    <div className="wrap">
      <a className="brand" href="/" aria-label="CGP Home">
        <img className="brand-logo" src="Assets/logo.png" alt="Center for Global Health &amp; Pandemic Intelligence" />
      </a>
      <button className="nav-toggle" aria-label="Toggle menu"><span></span><span></span><span></span></button>
      <nav className="primary-nav" aria-label="Primary">
        <a href="/">Home</a>
        <div className="dropdown">
          <button className="dropbtn">Who We Are <span aria-hidden="true"><i className="bi bi-chevron-down"></i></span></button>
          <div className="dropdown-content">
            <a href="/about">About Us</a>
            <a href="/careers">Careers</a>
            <a href="/contact">Contact</a>
            <a href="/privacy">Privacy Policy</a>
          </div>
        </div>
        <div className="dropdown">
          <button className="dropbtn">What We Do <span aria-hidden="true"><i className="bi bi-chevron-down"></i></span></button>
          <div className="dropdown-content">
            <a href="/what-we-do">Overview</a>
            <a href="/projects">Projects &amp; Impact</a>
            <a href="/initiatives">CGP Initiatives</a>
            <a href="/resources">Resources</a>
          </div>
        </div>
        <a href="/news">News &amp; Insights</a>
        <a href="/admin/login" className="nav-search-btn" aria-label="Staff login"><i className="bi bi-person-circle"></i> Staff</a>
      </nav>
    </div>
  </header>

  <main>

    <div className="page-header">
      <div className="wrap">
        <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span>CGP Initiatives</nav>
        <h1>CGP Initiatives</h1>
        <p className="dek">Six subnational and community-level programmes through which CGP puts its epidemic-intelligence
          approach into practice.</p>
      </div>
    </div>

    <section className="tight">
      <div className="wrap">

        <details className="accordion-item" open>
          <summary>
            <h3>Early Warning &amp; Intelligence Node (EWIN)</h3>
            <span className="accordion-tag">Flagship</span>
            <span className="accordion-plus" aria-hidden="true">+</span>
          </summary>
          <div className="accordion-body">
            <p>The EWIN initiative is CGP's flagship model for subnational epidemic intelligence   integrating
              AI-powered forecasting, 7-1-7 response monitoring, and community-based early warning. Anchored in the One
              Health approach, EWIN pilots will demonstrate how predictive analytics, trust-building communication, and
              digital surveillance tools can accelerate detection and save lives in vulnerable counties.</p>
          </div>
        </details>

        <details className="accordion-item">
          <summary>
            <h3>7-1-7 Performance Improvement Pilot</h3>
            <span className="accordion-tag">5 Counties</span>
            <span className="accordion-plus" aria-hidden="true">+</span>
          </summary>
          <div className="accordion-body">
            <div className="seven-one-seven" aria-label="7-1-7 framework targets">
              <div className="sos-cell"><span className="n">7</span><span className="d">days to detect a signal</span></div>
              <div className="sos-cell"><span className="n">1</span><span className="d">day to notify</span></div>
              <div className="sos-cell"><span className="n">7</span><span className="d">days to respond</span></div>
            </div>
            <h4>Background and Rationale</h4>
            <p>The WHO-endorsed 7-1-7 framework aims to strengthen outbreak detection and response by ensuring signals
              are detected within 7 days, notified within 1 day, and responded to within 7 days. Many countries struggle
              to meet these timelines due to systemic gaps in data flow, workforce capacity, and coordination. We
              propose a pilot implementation of the 7-1-7 model in five counties in Kenya, using CGP's digital tools and
              quality improvement (QI) methods to track and enhance performance.</p>
            <h4>Key Activities</h4>
            <p>Monthly QI cycles involving health, veterinary, and emergency response units. After Action Review (AAR)
              and dissemination of findings at the national Technical Working Group (TWG).</p>
            <h4>Expected Outcomes</h4>
            <p>Reduced time from detection to response for priority diseases. Improved multisectoral coordination at
              county level. A functional 7-1-7 dashboard generating real-time metrics. National uptake of the pilot
              methodology for scale-up.</p>
          </div>
        </details>

        <details className="accordion-item">
          <summary>
            <h3>AI-Powered Epidemic Forecasting</h3>
            <span className="accordion-tag">AI &amp; ML</span>
            <span className="accordion-plus" aria-hidden="true">+</span>
          </summary>
          <div className="accordion-body">
            <h4>Background and Rationale</h4>
            <p>Sub-Saharan Africa faces increasing risks of emerging and re-emerging infectious diseases. Traditional
              surveillance systems, while improving, are still largely reactive and struggle to integrate multisectoral,
              community-level, and environmental data. The rise of AI and machine learning (ML) offers an opportunity to
              transform disease forecasting and response planning at the subnational level. CGP seeks to pilot an
              AI-powered epidemic forecasting platform that leverages IDSR, CBS, and climatic or environmental signals
              to anticipate outbreaks, generate risk alerts, and support decision-making by frontline health teams in
              Kenya.</p>
            <h4>Objectives</h4>
            <p>Build and pilot a machine learning-based early warning model using multi-source surveillance data.
              Integrate forecasts into a real-time visualization dashboard accessible to county and national actors.
              Train health officers, data managers, and decision-makers to interpret model outputs for preparedness
              planning. Generate evidence on the feasibility, acceptability, and scalability of AI-driven forecasting
              tools in Kenya.</p>
            <h4>Key Activities</h4>
            <p>AI model development and back-testing for two disease categories (e.g. cholera, mpox, kala-azar, dengue).
              Dashboard design and user-interface testing. Capacity-building workshops with the Ministry of Health and
              surveillance stakeholders. Dissemination of results through policy briefs and national technical forums.
            </p>
            <h4>Expected Outcomes</h4>
            <p>A functional prototype of an AI-based epidemic forecasting tool. Improved lead time for outbreak alerts
              by 7 14 days. Increased local capacity to generate, interpret, and act on forecasts. High-level
              stakeholder buy-in for potential national scale-up.</p>
          </div>
        </details>

        <details className="accordion-item">
          <summary>
            <h3>Community-Led Risk Communication in Marginalized Areas</h3>
            <span className="accordion-tag">Community</span>
            <span className="accordion-plus" aria-hidden="true">+</span>
          </summary>
          <div className="accordion-body">
            <h4>Background and Rationale</h4>
            <p>Communities in remote and underserved regions   including pastoralist, informal, and border areas   face
              systemic challenges in accessing timely, credible, and actionable health information. Structural barriers,
              cultural mistrust, and inadequate integration into formal health systems hamper early detection, signal
              reporting, and public trust during emergencies. This concept proposes a community-driven risk
              communication model that leverages trusted local structures and digital innovations to strengthen early
              warning, rumor tracking, and community trust.</p>
            <h4>Objectives</h4>
            <p>Enhance public trust and communication pathways in at-risk marginalized communities. Establish real-time
              rumor-tracking and feedback loops to support early detection. Build local capacity of Community Health
              Volunteers (CHVs), youth leaders, and influencers as trusted communicators. Integrate grassroots reporting
              with county surveillance and RCCE platforms.</p>
            <h4>Key Activities</h4>
            <p>Development of culturally contextualized IEC tools and mobile messaging formats. Establishment of
              WhatsApp- and SMS-based rumor-tracking channels. Linkage with county disease surveillance and health
              promotion units.</p>
            <h4>Expected Outcomes</h4>
            <p>Improved early detection through grassroots signal and rumor alerts. Increased uptake of public health
              guidance in high-risk communities. Institutionalization of community feedback within RCCE systems.</p>
          </div>
        </details>

        <details className="accordion-item">
          <summary>
            <h3>Climate-Sensitive Disease Surveillance &amp; Early Warning Systems</h3>
            <span className="accordion-tag">Climate &amp; Health</span>
            <span className="accordion-plus" aria-hidden="true">+</span>
          </summary>
          <div className="accordion-body">
            <h4>Background and Rationale</h4>
            <p>Climate variability and extreme weather events are increasingly influencing the emergence and
              transmission of infectious diseases in East Africa. Floods, droughts, and changing vector habitats are
              contributing to recurrent outbreaks of cholera, Rift Valley fever, and other climate-sensitive diseases.
              CGP proposes a pilot to integrate meteorological, environmental, and health data to build early warning
              and response systems for climate-sensitive outbreaks.</p>
            <h4>Objectives</h4>
            <p>Identify and prioritize climate-sensitive diseases and risk indicators. Establish integrated data-sharing
              protocols between climate and health sectors. Develop GIS-based risk models and early-warning dashboards.
            </p>
            <h4>Key Activities</h4>
            <p>Desk review and stakeholder consultations on climate-disease linkages. Data integration from the Kenya
              Meteorological Department, NDMA, and MoH systems. Development and piloting of GIS tools for disease-risk
              prediction. Capacity building for surveillance officers and county disaster committees. Dissemination of
              pilot results through workshops and policy briefs.</p>
            <h4>Expected Outcomes</h4>
            <p>Improved predictive capacity for disease outbreaks linked to climate variability. A functioning
              climate-sensitive surveillance system in two pilot counties. Strengthened cross-sectoral coordination and
              risk-informed planning. Scalable evidence for national and regional early-warning strategies.</p>
          </div>
        </details>

        <details className="accordion-item">
          <summary>
            <h3>One Health Surveillance in Urban Informal Settlements</h3>
            <span className="accordion-tag">One Health   Urban</span>
            <span className="accordion-plus" aria-hidden="true">+</span>
          </summary>
          <div className="accordion-body">
            <h4>Background and Rationale</h4>
            <p>Urban informal settlements in sub-Saharan Africa are home to millions living in conditions that
              exacerbate disease transmission: high population density, poor sanitation, and close proximity between
              humans, animals, and waste. CGP proposes a One Health surveillance model specifically tailored to urban
              informal settlements, integrating community-level reporting, animal health indicators, and environmental
              risk factors.</p>
            <h4>Objectives</h4>
            <p>Establish sentinel One Health surveillance sites in two high-risk informal settlements. Enhance
              event-based and syndromic surveillance by training human and animal health informants. Improve
              multisectoral data sharing and coordinated response at county level.</p>
            <h4>Key Activities</h4>
            <p>Deployment of mobile surveillance tools and reporting apps. Routine joint data-review meetings involving
              human, animal, and environmental health actors. Documentation and dissemination of lessons learned.</p>
            <h4>Expected Outcomes</h4>
            <p>Improved early detection and response to outbreaks in informal urban settlements. Strengthened
              multisectoral collaboration using a One Health approach. A tested and documented One Health surveillance
              model for replication.</p>
          </div>
        </details>

      </div>
    </section>

    <div className="cta-strip">
      <div className="wrap">
        <div className="cta-strip-inner">
          <div>
            <h2>Learn More About CGP's Projects</h2>
            <p>See the full project record behind these initiatives.</p>
          </div>
          <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', flexShrink: '0'}}>
            <a className="btn" href="/projects">Projects &amp; Impact</a>
            <a className="btn" href="/contact">Partner With Us</a>
          </div>
        </div>
      </div>
    </div>

  </main>

  <footer className="site-footer">
    <div className="wrap">
      <div className="footer-grid">
        <div className="footer-brand">
          <p className="footer-tagline">&ldquo;Building Intelligence for a Safer World&rdquo;</p>
          <p className="footer-mission">To harness data, science, and multisectoral partnerships to strengthen surveillance
            systems, accelerate early warning, and empower frontline responders.</p>
        </div>
        <div>
          <h4>Navigate</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/what-we-do">What We Do</a></li>
            <li><a href="/projects">Projects &amp; Impact</a></li>
            <li><a href="/initiatives">CGP Initiatives</a></li>
            <li><a href="/resources">Resources</a></li>
            <li><a href="/news">News &amp; Insights</a></li>
          </ul>
        </div>
        <div>
          <h4>Involved</h4>
          <ul>
            <li><a href="/contact">Partner With Us</a></li>
            <li><a href="/careers">Careers</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>Westlands, Nairobi, Kenya</li>
            
            <li><a href="mailto:info@pandemicintelcenter.org">info@pandemicintelcenter.org</a></li>
            <li>08:00 16:00, Mon Fri</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; 2025 The Center for Global Health and Pandemic Intelligence. All rights reserved.</span>
        <span>Westlands, Nairobi, Kenya</span>
      </div>
    </div>
  </footer>

    </>
  );
}
