import React, { useEffect } from 'react';
import Footer from '../components/Footer';

export default function Projects() {
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
            <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span>Projects &amp; Impact
            </nav>
            <h1>Projects &amp; Impact</h1>
            <p className="dek">Pandemic Fund leadership. 7-1-7 readiness. AI surveillance. Digital One Health pilots. Simulation
              readiness.</p>
            <ul className="kicker-list">
              <li>Pandemic Fund Leadership</li>
              <li>7-1-7 Readiness Program</li>
              <li>AI Surveillance</li>
              <li>Digital One Health Pilots</li>
              <li>Simulation Readiness</li>
            </ul>
          </div>
        </div>

        <section className="section-dark" style={{padding: '48px 0'}}>
          <div className="wrap">
            <div className="grid-4" style={{gap: '0', border: '1px solid rgba(255,255,255,0.1)'}}>
              <div className="stat-card" style={{borderRight: '1px solid rgba(255,255,255,0.1)', borderRadius: '0'}}>
                <span className="stat-num">$145M</span>
                <span className="stat-lbl">Pandemic Fund financing coordinated (2023 2025)</span>
              </div>
              <div className="stat-card" style={{borderRight: '1px solid rgba(255,255,255,0.1)', borderRadius: '0'}}>
                <span className="stat-num">30%</span>
                <span className="stat-lbl">Reduction in detection-to-response time, 4 counties</span>
              </div>
              <div className="stat-card" style={{borderRight: '1px solid rgba(255,255,255,0.1)', borderRadius: '0'}}>
                <span className="stat-num">10</span>
                <span className="stat-lbl">Counties piloting the DMT-PHE decision tool</span>
              </div>
              <div className="stat-card" style={{borderRadius: '0'}}>
                <span className="stat-num">7</span>
                <span className="stat-lbl">Major project areas across Kenya &amp; the region</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <span className="section-label">Project Record</span>
            <h2 style={{marginBottom: '40px'}}>Flagship Projects</h2>

            <div className="grid-auto">
              <div className="project-card">
                <span className="project-card-tag">Pandemic Fund   2023 2025</span>
                <h3>Pandemic Preparedness</h3>
                <p>Coordinated development of National, Multi-country and Regional proposals to the Pandemic Fund
                  (2023 2025). Requested funding: <strong>$145 million</strong>.</p>
              </div>

              <div className="project-card">
                <span className="project-card-tag">7-1-7 Readiness   Kenya</span>
                <h3>7-1-7 Readiness Initiative</h3>
                <p>Facilitated the Intra-Action Review (IAR) of the Cholera outbreak in Migori and the Intra-Action Review
                  of Kenya's Mpox outbreak (2024) using 7-1-7 targets. Reduced detection-to-response time by <strong>30% in
                    4 counties</strong> in Kenya.</p>
              </div>

              <div className="project-card">
                <span className="project-card-tag">Emergency Guidelines   Kenya 2024</span>
                <h3>Emergency Guidelines</h3>
                <p>Supported development of the Marburg Preparedness and 72-Hour Response Plans, and the Mpox Response Plans
                  for Kenya (2024).</p>
              </div>

              <div className="project-card">
                <span className="project-card-tag">Workforce Capacity   FELTP   ISAVET</span>
                <h3>Workforce Capacity Readiness</h3>
                <p>Review of Kenya's Public Health Emergency Management (PHEM) curriculum. Capacity building and knowledge
                  exchange through FELTP and ISAVET programmes.</p>
              </div>

              <div className="project-card">
                <span className="project-card-tag">IHR 2005   JEE 2024   SPAR   NAPHS</span>
                <h3>International Health Regulations MEF (IHR 2005)</h3>
                <ul>
                  <li>Supporting the Ministry of Health and KNPHI in conducting the Joint External Evaluation (JEE 2024) and
                    the States Parties Self-Assessment Annual Report (SPAR).</li>
                  <li>Development of the National Action Plan for Health Security (NAPHS 2.0   2025).</li>
                  <li>Simulation exercises: Rift Valley fever, Ebola, and COHESION   a One Health cross-border simulation
                    with Kenya, Somalia, and Ethiopia.</li>
                </ul>
              </div>

              <div className="project-card">
                <span className="project-card-tag">Precision Public Health   KNPHI   2025</span>
                <h3>Precision Public Health</h3>
                <p>Supporting KNPHI on a Standardized Decision-Making Tool for Public Health Emergencies in Kenya (DMT-PHE,
                  2025). Validated in October 2025 under KNPHI leadership with support from Palladium's TDDAP2 and technical
                  facilitation by CGP. Now being piloted in <strong>10 high-risk counties</strong> before national rollout.
                </p>
                <a className="text-link" href="/news" style={{display: 'block', marginTop: '12px', fontSize: '0.88rem'}}>Read the news
                  article <i className="bi bi-arrow-right"></i></a>
              </div>

              <div className="project-card">
                <span className="project-card-tag">Event-Based Surveillance   CBS   IDSR</span>
                <h3>Event-Based Surveillance (EBS)</h3>
                <p>Training health workers and communities, integrating Community-Based Surveillance (CBS), deploying
                  digital tools for real-time alerts, and enhancing multisectoral collaboration through alignment with IDSR
                  and 7-1-7 targets.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="cta-strip">
          <div className="wrap">
            <div className="cta-strip-inner">
              <div>
                <h2>See CGP in Action</h2>
                <p>Explore the subnational initiatives that put these projects into practice.</p>
              </div>
              <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', flexShrink: '0'}}>
                <a className="btn" href="/initiatives">CGP Initiatives</a>
                <a className="btn" href="/contact">Partner With Us</a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

    </>
  );
}