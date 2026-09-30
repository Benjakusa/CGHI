import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Projects() {
  useEffect(() => {
    if (window.initSiteLogic) window.initSiteLogic();
  }, []);

  return (
    <>
      <Navbar activePage="projects" />

      <main>
        <div className="page-header">
          <div className="wrap">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a><span>/</span>Projects &amp; Impact
            </nav>
            <h1>Projects &amp; Impact</h1>
            <p className="dek">
              Pandemic Fund leadership. 7-1-7 readiness. AI surveillance. Digital One Health pilots. Simulation readiness.
            </p>
            <ul className="kicker-list">
              <li>Pandemic Fund Leadership</li>
              <li>7-1-7 Readiness Program</li>
              <li>AI Surveillance</li>
              <li>Digital One Health Pilots</li>
              <li>Simulation Readiness</li>
            </ul>
          </div>
        </div>

        {/* ============================================================
            STATISTICS — single card containing all four stats
            ============================================================ */}
        <section className="section-dark" style={{ padding: '48px 0' }}>
          <div className="wrap">
            <div
              className="stats-single-card"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '0 60px 0 60px',
                overflow: 'hidden',
              }}
            >
              <div
                className="stats-single-card-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 0,
                }}
              >
                <div className="stat-cell">
                  <span className="stat-num">$145M</span>
                  <span className="stat-lbl">Pandemic Fund financing coordinated (2023–2025)</span>
                </div>
                <div className="stat-cell">
                  <span className="stat-num">30%</span>
                  <span className="stat-lbl">Reduction in detection-to-response time, 4 counties</span>
                </div>
                <div className="stat-cell">
                  <span className="stat-num">10</span>
                  <span className="stat-lbl">Counties piloting the DMT-PHE decision tool</span>
                </div>
                <div className="stat-cell">
                  <span className="stat-num">7</span>
                  <span className="stat-lbl">Major project areas across Kenya &amp; the region</span>
                </div>
              </div>
            </div>
          </div>

          {/* Local responsive + cell styling for the single stats card */}
          <style>{`
            .stats-single-card .stat-cell {
              padding: 32px 24px;
              text-align: center;
              border-right: 1px solid rgba(255, 255, 255, 0.12);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .stats-single-card .stat-cell:last-child {
              border-right: none;
            }
            .stats-single-card .stat-num {
              font-size: clamp(2rem, 4vw, 3rem);
              font-weight: 800;
              color: #01abed;
              display: block;
              line-height: 1;
              margin-bottom: 12px;
            }
            .stats-single-card .stat-lbl {
              font-size: 0.88rem;
              color: rgba(255, 255, 255, 0.72);
              line-height: 1.45;
            }
            @media (max-width: 900px) {
              .stats-single-card-grid {
                grid-template-columns: 1fr 1fr !important;
              }
              .stats-single-card .stat-cell:nth-child(2) {
                border-right: none;
              }
              .stats-single-card .stat-cell:nth-child(1),
              .stats-single-card .stat-cell:nth-child(2) {
                border-bottom: 1px solid rgba(255, 255, 255, 0.12);
              }
            }
            @media (max-width: 560px) {
              .stats-single-card-grid {
                grid-template-columns: 1fr !important;
              }
              .stats-single-card .stat-cell {
                border-right: none !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.12);
              }
              .stats-single-card .stat-cell:last-child {
                border-bottom: none;
              }
            }
          `}</style>
        </section>

        <section>
          <div className="wrap">
            <span className="section-label">Project Record</span>
            <h2 style={{ marginBottom: '40px' }}>Flagship Projects</h2>

            <div className="grid-auto projects-grid">
              <div className="project-card">
                <span className="project-card-tag">Pandemic Fund — 2023–2025</span>
                <h3>Pandemic Preparedness</h3>
                <p>
                  Coordinated development of National, Multi-country and Regional proposals to the Pandemic Fund
                  (2023–2025). Requested funding: <strong>$145 million</strong>.
                </p>
              </div>

              <div className="project-card">
                <span className="project-card-tag">7-1-7 Readiness — Kenya</span>
                <h3>7-1-7 Readiness Initiative</h3>
                <p>
                  Facilitated the Intra-Action Review (IAR) of the Cholera outbreak in Migori and the Intra-Action Review
                  of Kenya's Mpox outbreak (2024) using 7-1-7 targets. Reduced detection-to-response time by{' '}
                  <strong>30% in 4 counties</strong> in Kenya.
                </p>
              </div>

              <div className="project-card">
                <span className="project-card-tag">Emergency Guidelines — Kenya 2024</span>
                <h3>Emergency Guidelines</h3>
                <p>
                  Supported development of the Marburg Preparedness and 72-Hour Response Plans, and the Mpox Response Plans
                  for Kenya (2024).
                </p>
              </div>

              <div className="project-card">
                <span className="project-card-tag">Workforce Capacity — FELTP — ISAVET</span>
                <h3>Workforce Capacity Readiness</h3>
                <p>
                  Review of Kenya's Public Health Emergency Management (PHEM) curriculum. Capacity building and knowledge
                  exchange through FELTP and ISAVET programmes.
                </p>
              </div>

              <div className="project-card">
                <span className="project-card-tag">IHR 2005 — JEE 2024 — SPAR — NAPHS</span>
                <h3>International Health Regulations MEF (IHR 2005)</h3>
                <ul>
                  <li>
                    Supporting the Ministry of Health and KNPHI in conducting the Joint External Evaluation (JEE 2024) and
                    the States Parties Self-Assessment Annual Report (SPAR).
                  </li>
                  <li>Development of the National Action Plan for Health Security (NAPHS 2.0 — 2025).</li>
                  <li>
                    Simulation exercises: Rift Valley fever, Ebola, and COHESION — a One Health cross-border simulation
                    with Kenya, Somalia, and Ethiopia.
                  </li>
                </ul>
              </div>

              <div className="project-card">
                <span className="project-card-tag">Precision Public Health — KNPHI — 2025</span>
                <h3>Precision Public Health</h3>
                <p>
                  Supporting KNPHI on a Standardized Decision-Making Tool for Public Health Emergencies in Kenya (DMT-PHE,
                  2025). Validated in October 2025 under KNPHI leadership with support from Palladium's TDDAP2 and technical
                  facilitation by CGP. Now being piloted in <strong>10 high-risk counties</strong> before national rollout.
                </p>
                <a className="text-link" href="/news" style={{ display: 'block', marginTop: '12px', fontSize: '0.88rem' }}>
                  Read the news article <i className="bi bi-arrow-right"></i>
                </a>
              </div>

              <div className="project-card">
                <span className="project-card-tag">Event-Based Surveillance — CBS — IDSR</span>
                <h3>Event-Based Surveillance (EBS)</h3>
                <p>
                  Training health workers and communities, integrating Community-Based Surveillance (CBS), deploying
                  digital tools for real-time alerts, and enhancing multisectoral collaboration through alignment with IDSR
                  and 7-1-7 targets.
                </p>
              </div>
            </div>
          </div>

          {/* Force a full border all around every card on this page */}
          <style>{`
            /* Full border on every project card */
            .projects-grid .project-card {
              border: 1px solid var(--border) !important;
              border-top: 1px solid var(--border) !important;
              border-left: 1px solid var(--border) !important;
              border-right: 1px solid var(--border) !important;
              border-bottom: 1px solid var(--border) !important;
              border-radius: 0 60px 0 60px !important;
            }
            .projects-grid .project-card:hover {
              border-color: var(--sky) !important;
            }
          `}</style>
        </section>

        {/* ============================================================
            CTA STRIP — "See CGP in Action"
            Buttons: white outline by default, solid black on hover.
            ============================================================ */}
        <div className="cta-strip">
          <div className="wrap">
            <div className="cta-strip-inner">
              <div>
                <h2>See CGP in Action</h2>
                <p>Explore the subnational initiatives that put these projects into practice.</p>
              </div>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', flexShrink: '0' }}>
                <a className="btn-outline-black-hover" href="/initiatives">CGP Initiatives</a>
                <a className="btn-outline-black-hover" href="/contact">Partner With Us</a>
              </div>
            </div>
          </div>
        </div>

        {/* Local CSS for the CTA buttons — scoped to .cta-strip only */}
        <style>{`
          .cta-strip .btn-outline-black-hover {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 13px 26px;
            border: 2px solid #ffffff;
            background: transparent;
            color: #ffffff;
            font-family: var(--sans);
            font-weight: 700;
            font-size: 0.88rem;
            letter-spacing: 0.02em;
            text-decoration: none;
            border-radius: var(--radius);
            cursor: pointer;
            white-space: nowrap;
            transition: background 0.18s ease, color 0.18s ease,
                        border-color 0.18s ease, transform 0.15s ease;
          }
          .cta-strip .btn-outline-black-hover:hover {
            background: #000000;
            border-color: #000000;
            color: #ffffff;
            opacity: 1;
            transform: translateY(-2px);
          }
        `}</style>
      </main>

      <Footer />
    </>
  );
}