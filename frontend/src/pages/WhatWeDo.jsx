import React, { useEffect } from 'react';
import Footer from '../components/Footer';

export default function WhatWeDo() {
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
            <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span>What We Do</nav>
            <h1>What We Do</h1>
            <p className="dek">Strengthen global health security and IHR compliance. Integrate One Health data streams for early
              warning. Build AI-driven outbreak forecasting platforms. Equip frontline responders through real-time tools
              and training.</p>
          </div>
        </div>

        <section>
          <div className="wrap">
            <div className="grid-4" style={{gap: '0', border: '1px solid var(--border)', marginBottom: '56px'}}>
              <div style={{padding: '28px 24px', borderRight: '1px solid var(--border)'}}>
                <div style={{fontSize: '2rem', fontWeight: '800', color: 'var(--sky-dark)', marginBottom: '8px'}}>5</div>
                <div style={{fontSize: '0.88rem', color: 'var(--ink-muted)'}}>Technical capability areas</div>
              </div>
              <div style={{padding: '28px 24px', borderRight: '1px solid var(--border)'}}>
                <div style={{fontSize: '2rem', fontWeight: '800', color: 'var(--sky-dark)', marginBottom: '8px'}}>$145M</div>
                <div style={{fontSize: '0.88rem', color: 'var(--ink-muted)'}}>Pandemic Fund financing coordinated</div>
              </div>
              <div style={{padding: '28px 24px', borderRight: '1px solid var(--border)'}}>
                <div style={{fontSize: '2rem', fontWeight: '800', color: 'var(--sky-dark)', marginBottom: '8px'}}>7-1-7</div>
                <div style={{fontSize: '0.88rem', color: 'var(--ink-muted)'}}>WHO readiness targets applied</div>
              </div>
              <div style={{padding: '28px 24px'}}>
                <div style={{fontSize: '2rem', fontWeight: '800', color: 'var(--sky-dark)', marginBottom: '8px'}}>6</div>
                <div style={{fontSize: '0.88rem', color: 'var(--ink-muted)'}}>Active subnational initiatives</div>
              </div>
            </div>

            <span className="section-label">5 Areas</span>
            <h2 style={{marginBottom: '32px'}}>Technical Capabilities</h2>

            <div role="list">
              <details className="accordion-item" open>
                <summary>
                  <h3>Epidemic and Pandemic Intelligence</h3>
                  <span className="accordion-tag">EPI</span>
                  <span className="accordion-plus" aria-hidden="true">+</span>
                </summary>
                <div className="accordion-body" role="listitem">
                  <p>CGP builds and applies epidemic intelligence systems that integrate AI-powered forecasting, 7-1-7
                    response monitoring, and multi-source surveillance data   including IDSR, community-based surveillance
                    (CBS), and environmental signals   to accelerate detection and response to disease threats. Our epidemic
                    intelligence work supports subnational, national and regional decision-makers with timely, actionable
                    information.</p>
                  <p style={{marginTop: '12px'}}>Key activities include outbreak risk assessment, risk modeling, early warning
                    system design, and scenario planning for priority diseases across Kenya and the broader East Africa
                    region.</p>
                  <p style={{marginTop: '12px'}}><a className="text-link" href="/initiatives">See the EWIN initiative
                      <i className="bi bi-arrow-right"></i></a></p>
                </div>
              </details>

              <details className="accordion-item">
                <summary>
                  <h3>Public Health Emergency Preparedness &amp; Response</h3>
                  <span className="accordion-tag">PHEPR</span>
                  <span className="accordion-plus" aria-hidden="true">+</span>
                </summary>
                <div className="accordion-body" role="listitem">
                  <p>CGP provides technical leadership for public health emergency preparedness and response systems at
                    national and county level. This includes IHR 2005 compliance support, JEE and SPAR facilitation, NAPHS
                    development, and Intra-Action Reviews (IARs) and After Action Reviews (AARs) for priority outbreak
                    responses.</p>
                  <p style={{marginTop: '12px'}}>CGP has supported the development of the Marburg Preparedness and 72-Hour
                    Response Plans, and the Mpox Response Plans for Kenya (2024). CGP also designs and facilitates
                    simulation exercises   including Rift Valley fever, Ebola, and COHESION, a One Health cross-border
                    simulation with Kenya, Somalia, and Ethiopia.</p>
                  <p style={{marginTop: '12px'}}><a className="text-link" href="/projects">See emergency preparedness projects
                      <i className="bi bi-arrow-right"></i></a></p>
                </div>
              </details>

              <details className="accordion-item">
                <summary>
                  <h3>One Health &amp; Climate-Sensitive Disease Control</h3>
                  <span className="accordion-tag">OCD</span>
                  <span className="accordion-plus" aria-hidden="true">+</span>
                </summary>
                <div className="accordion-body" role="listitem">
                  <p>CGP operates at the intersection of human, animal, and environmental health   applying a One Health
                    framework to disease surveillance, early warning, and response. This approach is especially important in
                    East Africa, where zoonotic diseases, climate variability, and informal human-animal contact contribute
                    to recurring outbreaks.</p>
                  <p style={{marginTop: '12px'}}>CGP's climate-sensitive disease work integrates meteorological, environmental,
                    and health data to build GIS-based risk models and early warning dashboards. CGP's One Health work
                    extends into urban informal settlements, where high population density, poor sanitation, and
                    human-animal proximity create unique surveillance challenges.</p>
                  <p style={{marginTop: '12px'}}><a className="text-link" href="/initiatives">See climate and One Health
                      initiatives <i className="bi bi-arrow-right"></i></a></p>
                </div>
              </details>

              <details className="accordion-item">
                <summary>
                  <h3>Community Engagement and Resilience Building</h3>
                  <span className="accordion-tag">CER</span>
                  <span className="accordion-plus" aria-hidden="true">+</span>
                </summary>
                <div className="accordion-body" role="listitem">
                  <p>CGP builds community-centered preparedness and risk communication systems that leverage trusted local
                    structures   including Community Health Volunteers (CHVs), youth leaders, and community influencers   to
                    strengthen early warning and response in marginalized areas.</p>
                  <p style={{marginTop: '12px'}}>Activities include developing culturally contextualized IEC tools,
                    establishing WhatsApp- and SMS-based rumor-tracking channels, and integrating grassroots reporting with
                    county surveillance and RCCE platforms. CGP also provides capacity building through training of
                    community health workers on CBS, EBS, and community-led preparedness approaches.</p>
                  <p style={{marginTop: '12px'}}><a className="text-link" href="/initiatives">See community risk communication
                      initiative <i className="bi bi-arrow-right"></i></a></p>
                </div>
              </details>

              <details className="accordion-item">
                <summary>
                  <h3>Data Science &amp; Digital Health Innovation</h3>
                  <span className="accordion-tag">DSH</span>
                  <span className="accordion-plus" aria-hidden="true">+</span>
                </summary>
                <div className="accordion-body" role="listitem">
                  <p>CGP leverages AI, machine learning, geospatial intelligence, and digital health tools to transform
                    disease surveillance and outbreak response. Our data science work includes building machine
                    learning-based early warning models, real-time visualization dashboards, decision-support tools, and
                    mobile-enabled alert systems accessible to county and national actors.</p>
                  <p style={{marginTop: '12px'}}>CGP's precision public health work supports KNPHI on the Standardized
                    Decision-Making Tool for Public Health Emergencies (DMT-PHE)   a first-of-its-kind framework now
                    validated and piloted across 10 high-risk counties in Kenya. AI/ML models are being developed and
                    back-tested for priority diseases including cholera, mpox, kala-azar, and dengue.</p>
                  <p style={{marginTop: '12px'}}><a className="text-link" href="/initiatives">See AI epidemic forecasting
                      initiative <i className="bi bi-arrow-right"></i></a></p>
                </div>
              </details>
            </div>
          </div>
        </section>

        <div className="cta-strip">
          <div className="wrap">
            <div className="cta-strip-inner">
              <div>
                <h2>Explore CGP's Projects &amp; Initiatives</h2>
                <p>See CGP's capabilities in action through our project record and subnational programmes.</p>
              </div>
              <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', flexShrink: '0'}}>
                <a className="btn" href="/projects">Projects &amp; Impact</a>
                <a className="btn" href="/initiatives">CGP Initiatives</a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

    </>
  );
}