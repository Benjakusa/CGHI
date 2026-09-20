import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  useEffect(() => {
    if (window.initSiteLogic) window.initSiteLogic();
  }, []);

  return (
    <>
      <Navbar activePage="about" />

      <main>
        <div className="page-header">
          <div className="wrap">
            <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span>About Us</nav>
            <h1>About Us</h1>
            <p className="dek">The Center for Global Health and Pandemic Intelligence (CGP)</p>
          </div>
        </div>

        <section>
          <div className="wrap">
            <div className="grid-2" style={{ alignItems: 'center', gap: '64px' }}>
              <div>
                <span className="section-label">Who We Are</span>
                <h2 style={{ marginBottom: '20px' }}>A Multidisciplinary Hub for Global Health Security</h2>
                <p style={{ marginBottom: '14px' }}>
                  The <a href="/">Center for Global Health and Pandemic Intelligence (CGP)</a> is a multidisciplinary policy,
                  research, and implementation hub dedicated to strengthening global and regional health security. CGP operates
                  at the intersection of Epidemic and Pandemic Intelligence, One Health, and community-centered preparedness,
                  providing strategic solutions to prevent, detect, and respond to public health threats — especially in
                  vulnerable and high-risk settings across the world.
                </p>
                <p>
                  We leverage science, data, and multisectoral partnerships to inform decision-making and enhance the
                  resilience of health systems in alignment with national, regional and Global Health Security frameworks.
                </p>
              </div>
              <figure style={{ border: '4px solid var(--sky)', overflow: 'hidden', margin: 0, borderRadius: '0 60px 0 60px' }}>
                <img
                  src="https://pandemicintelcenter.org/wp-content/uploads/2025/07/paper-style-earth-globe-with-hands-scaled.jpg"
                  alt="Paper-style illustration of hands holding a globe"
                  loading="lazy"
                  style={{ width: '100%', display: 'block' }}
                />
              </figure>
            </div>
          </div>
        </section>

        <section className="section-dark" style={{ padding: '64px 0' }}>
          <div className="wrap">
            <div className="grid-2" style={{ gap: '0' }}>
              <div className="vm-card" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                <h2>Vision</h2>
                <p>A world safeguarded from epidemics through integrated intelligence and rapid action.</p>
              </div>
              <div className="vm-card" style={{ paddingLeft: '52px' }}>
                <h2>Mission</h2>
                <p>
                  To harness data, science, and multisectoral partnerships to strengthen surveillance systems, accelerate
                  early warning, and empower frontline responders.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-surface">
          <div className="wrap">
            <div className="section-header" style={{ marginBottom: '40px' }}>
              <span className="section-label">What Makes CGP Different</span>
              <h2>Our Value Proposition</h2>
            </div>
            <div className="pillar-grid">
              <div className="value-card">
                <h3>Multidisciplinary Expertise</h3>
                <p>
                  A team with deep experience in epidemiology, data science, emergency management, veterinary public
                  health, and health systems — providing integrated solutions across all dimensions of global health
                  security.
                </p>
              </div>
              <div className="value-card">
                <h3>Locally Anchored, Globally Aligned</h3>
                <p>
                  Based in Kenya with partnerships across Africa and global health institutions — CGP understands the local
                  context while applying global standards, frameworks, and best practices.
                </p>
              </div>
              <div className="value-card">
                <h3>Evidence-Driven Innovation</h3>
                <p>
                  Bridging research and practice to drive contextually relevant and scalable solutions — ensuring that
                  policy, tools, and training are grounded in evidence and practical field experience.
                </p>
              </div>
              <div className="value-card">
                <h3>Strategic Partnerships</h3>
                <p>
                  A proven collaborator with Ministries of Health, Universities, NPHIs, IOM, Palladium, KRCS, Africa CDC,
                  AU-IBAR, WHO, FAO, UNICEF, MSF, Global Fund, UNEP, GIZ, USAID, Taskforce for Global Health, and non-state
                  actors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            CTA STRIP — "Work With CGP"
            Buttons use .btn-outline-black-hover: white outline by default,
            solid black background + white text on hover.
            ============================================================ */}
        <div className="cta-strip">
          <div className="wrap">
            <div className="cta-strip-inner">
              <div>
                <h2>Work With CGP</h2>
                <p>
                  Explore how we can collaborate to strengthen health security and pandemic intelligence in your region.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', flexShrink: '0' }}>
                <a className="btn-outline-black-hover" href="/contact">Get In Touch</a>
                <a className="btn-outline-black-hover" href="/careers">Careers</a>
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