import React, { useEffect } from 'react';
import Footer from '../components/Footer';

export default function About() {
  useEffect(() => {
    if (window.initSiteLogic) window.initSiteLogic();
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <a className="brand" href="/" aria-label="CGP Home">
            <img className="brand-logo" src="Assets/logo.png" alt="Center for Global Health & Pandemic Intelligence" />
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
            <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span>About Us</nav>
            <h1>About Us</h1>
            <p className="dek">The Center for Global Health and Pandemic Intelligence (CGP)</p>
          </div>
        </div>

        <section>
          <div className="wrap">
            <div className="grid-2" style={{alignItems: 'center', gap: '64px'}}>
              <div>
                <span className="section-label">Who We Are</span>
                <h2 style={{marginBottom: '20px'}}>A Multidisciplinary Hub for Global Health Security</h2>
                <p style={{marginBottom: '14px'}}>The <a href="/">Center for Global Health and Pandemic Intelligence
                    (CGP)</a> is a multidisciplinary policy, research, and implementation hub dedicated to strengthening
                  global and regional health security. CGP operates at the intersection of Epidemic and Pandemic
                  Intelligence, One Health, and community-centered preparedness, providing strategic solutions to prevent,
                  detect, and respond to public health threats   especially in vulnerable and high-risk settings across the
                  world.</p>
                <p>We leverage science, data, and multisectoral partnerships to inform decision-making and enhance the
                  resilience of health systems in alignment with national, regional and Global Health Security frameworks.
                </p>
              </div>
              <figure style={{border: '4px solid var(--sky)', overflow: 'hidden'}}>
                <img
                  src="https://pandemicintelcenter.org/wp-content/uploads/2025/07/paper-style-earth-globe-with-hands-scaled.jpg"
                  alt="Paper-style illustration of hands holding a globe" loading="lazy" style={{width: '100%', display: 'block'}} />
              </figure>
            </div>
          </div>
        </section>

        <section className="section-dark" style={{padding: '64px 0'}}>
          <div className="wrap">
            <div className="grid-2" style={{gap: '0'}}>
              <div className="vm-card" style={{borderRight: '1px solid rgba(255,255,255,0.1)'}}>
                <h2>Vision</h2>
                <p>A world safeguarded from epidemics through integrated intelligence and rapid action.</p>
              </div>
              <div className="vm-card" style={{paddingLeft: '52px'}}>
                <h2>Mission</h2>
                <p>To harness data, science, and multisectoral partnerships to strengthen surveillance systems, accelerate
                  early warning, and empower frontline responders.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-surface">
          <div className="wrap">
            <div className="section-header" style={{marginBottom: '40px'}}>
              <span className="section-label">What Makes CGP Different</span>
              <h2>Our Value Proposition</h2>
            </div>
            <div className="pillar-grid">
              <div className="value-card">
                <h3>Multidisciplinary Expertise</h3>
                <p>A team with deep experience in epidemiology, data science, emergency management, veterinary public
                  health, and health systems   providing integrated solutions across all dimensions of global health
                  security.</p>
              </div>
              <div className="value-card">
                <h3>Locally Anchored, Globally Aligned</h3>
                <p>Based in Kenya with partnerships across Africa and global health institutions   CGP understands the local
                  context while applying global standards, frameworks, and best practices.</p>
              </div>
              <div className="value-card">
                <h3>Evidence-Driven Innovation</h3>
                <p>Bridging research and practice to drive contextually relevant and scalable solutions   ensuring that
                  policy, tools, and training are grounded in evidence and practical field experience.</p>
              </div>
              <div className="value-card">
                <h3>Strategic Partnerships</h3>
                <p>A proven collaborator with Ministries of Health, Universities, NPHIs, IOM, Palladium, KRCS, Africa CDC,
                  AU-IBAR, WHO, FAO, UNICEF, MSF, Global Fund, UNEP, GIZ, USAID, Taskforce for Global Health, and non-state
                  actors.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="cta-strip">
          <div className="wrap">
            <div className="cta-strip-inner">
              <div>
                <h2>Work With CGP</h2>
                <p>Explore how we can collaborate to strengthen health security and pandemic intelligence in your region.
                </p>
              </div>
              <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', flexShrink: '0'}}>
                <a className="btn" href="/contact">Get In Touch</a>
                <a className="btn" href="/careers">Careers</a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

    </>
  );
}