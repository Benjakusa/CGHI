import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import { API_BASE, resolveAssetUrl } from '../context/AuthContext';

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [openJobId, setOpenJobId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/jobs`)
      .then(r => r.json())
      .then(data => setJobs(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const toggleJob = (id) => {
    setOpenJobId(prev => (prev === id ? null : id));
  };

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
                <a href="/projects">Projects & Impact</a>
                <a href="/initiatives">CGP Initiatives</a>
                <a href="/resources">Resources</a>
              </div>
            </div>
            <a href="/news">News & Insights</a>
            <a href="/admin/login" className="nav-search-btn" aria-label="Staff login"><i className="bi bi-person-circle"></i> Staff</a>
          </nav>
        </div>
      </header>

      <main>
        <div className="page-header">
          <div className="wrap">
            <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span>Careers</nav>
            <h1>Careers</h1>
            <p className="dek">CGP builds an expert network of public health and data professionals committed to transforming
              epidemic intelligence in Africa and beyond.</p>
          </div>
        </div>

        <section>
          <div className="wrap">
            <div className="section-header" style={{textAlign: 'left', marginBottom: '32px'}}>
              <span className="section-label" style={{borderLeft: 'none', paddingLeft: 0, textAlign: 'left'}}>Open Roles</span>
              <h2 style={{margin: 0}}>Current Opportunities</h2>
            </div>

            {jobs.length === 0 ? (
              <p style={{color: 'var(--ink-muted)'}}>
                There are no open roles at this time. Please check back soon, or send a speculative
                application to <a href="mailto:info@pandemicintelcenter.org">info@pandemicintelcenter.org</a>.
              </p>
            ) : (
              <div className="grid-3" style={{marginBottom: '56px'}}>
                {jobs.map(j => {
                  const isOpen = openJobId === j.id;
                  return (
                    <article className="job-card" key={j.id}>
                      <div className="job-card-head">
                        {j.department && (
                          <span className="job-card-dept">{j.department}</span>
                        )}
                        <h3>{j.title}</h3>
                        <div className="job-card-meta">
                          {j.location && (
                            <span><i className="bi bi-geo-alt"></i> {j.location}</span>
                          )}
                          {j.employment_type && (
                            <span><i className="bi bi-clock"></i> {j.employment_type}</span>
                          )}
                        </div>
                      </div>

                      {j.description && (
                        <p className="job-card-summary">
                          {j.description.length > 180
                            ? j.description.slice(0, 180).trimEnd() + '…'
                            : j.description}
                        </p>
                      )}

                      <button
                        type="button"
                        className="job-card-toggle"
                        aria-expanded={isOpen}
                        aria-controls={`job-details-${j.id}`}
                        onClick={() => toggleJob(j.id)}
                      >
                        {isOpen ? 'Hide Details' : 'View More Details'}
                        <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                      </button>

                      {isOpen && (
                        <div className="job-card-details" id={`job-details-${j.id}`}>
                          {j.description && (
                            <div>
                              <h4>Description</h4>
                              <p>{j.description}</p>
                            </div>
                          )}

                          {Array.isArray(j.qualifications) && j.qualifications.length > 0 && (
                            <div>
                              <h4>Qualifications</h4>
                              <ul>
                                {j.qualifications.map((q, i) => (
                                  <li key={i}>{q}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {Array.isArray(j.preferred_experience) && j.preferred_experience.length > 0 && (
                            <div>
                              <h4>Preferred Experience</h4>
                              <ul>
                                {j.preferred_experience.map((p, i) => (
                                  <li key={i}>{p}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {j.closing_date && (
                            <div>
                              <h4>Closing Date</h4>
                              <p>{j.closing_date}</p>
                            </div>
                          )}

                          {j.document_url && (
                            <div>
                              <h4>Job Document</h4>
                              <a
                                className="text-link"
                                href={resolveAssetUrl(j.document_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Document <i className="bi bi-box-arrow-up-right"></i>
                              </a>
                            </div>
                          )}

                          <a
                            className="btn-primary job-card-apply"
                            href={`mailto:${j.apply_email || 'info@pandemicintelcenter.org'}${j.apply_subject ? `?subject=${encodeURIComponent(j.apply_subject)}` : ''}`}
                          >
                            Apply for this role <i className="bi bi-arrow-right"></i>
                          </a>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            <h2 style={{marginBottom: '24px'}}>Technical Areas of Work</h2>
            <ul className="tech-area-list" aria-label="Technical areas at CGP">
              <li>Epidemic & pandemic intelligence</li>
              <li>IHR 2005, JEE, SPAR, NAPHS</li>
              <li>7-1-7 outbreak detection & response monitoring</li>
              <li>IDSR and syndromic surveillance</li>
              <li>Event-based and community-based surveillance</li>
              <li>One Health surveillance and integration</li>
              <li>Zoonotic disease detection and response</li>
              <li>Climate-sensitive disease early warning</li>
              <li>Simulation exercises & tabletop exercises</li>
              <li>AI/ML in epidemic forecasting</li>
              <li>Digital health tools and dashboards</li>
              <li>GIS and geospatial health analysis</li>
              <li>Risk communication & community engagement</li>
              <li>Pandemic Fund proposal development</li>
              <li>Public health emergency management</li>
              <li>Data science & epidemiological analysis</li>
              <li>Technical writing & scientific communication</li>
            </ul>
          </div>
        </section>

        <section className="section-surface">
          <div className="wrap">
            <div className="apply-card">
              <h2>How to Apply</h2>
              <p>Submit your application materials via email. We review applications on a rolling basis and will reach out
                if there is a match with our current needs. Qualified applicants from underrepresented groups are especially
                encouraged to apply.</p>

              <div className="apply-docs">
                <div className="apply-doc">
                  <h4><i className="bi bi-file-earmark-person"></i> CV / Résumé</h4>
                  <p>Current curriculum vitae highlighting relevant experience and expertise.</p>
                </div>
                <div className="apply-doc">
                  <h4><i className="bi bi-file-earmark-text"></i> Cover Letter</h4>
                  <p>A brief letter (max 1 page) describing your interest and relevant qualifications.</p>
                </div>
                <div className="apply-doc">
                  <h4><i className="bi bi-file-earmark-arrow-up"></i> Work Sample</h4>
                  <p>One relevant writing sample, data analysis, or technical report.</p>
                </div>
              </div>

              <p style={{color: 'rgba(255,255,255,0.72)', marginBottom: '18px'}}>Send your application to:</p>
              <a href="mailto:info@pandemicintelcenter.org" className="btn-primary"
                style={{width: 'fit-content'}}>info@pandemicintelcenter.org</a>
              <p style={{marginTop: '16px', fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)'}}>Use the subject line:
                <em>Application Technical Consultant</em> or <em>Application Research Associate</em>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />

    </>
  );
}