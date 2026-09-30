import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_BASE, resolveAssetUrl } from '../context/AuthContext';

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/resources`)
      .then(r => r.json())
      .then(data => {
        setResources(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading resources:', err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar activePage="resources" />

      <main>
        <div className="page-header">
          <div className="wrap">
            <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span>Resources</nav>
            <h1>Resources</h1>
            <p className="dek">Reports, tools, guidelines, and publications from CGP's research and implementation work.</p>
          </div>
        </div>

        <section>
          <div className="wrap">
            {loading ? (
              <p style={{ color: 'var(--ink-muted)', textAlign: 'center' }}>Loading resources...</p>
            ) : resources.length === 0 ? (
              <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--sky)' }} aria-hidden="true">
                  <i className="bi bi-journal-richtext"></i>
                </div>
                <h2 style={{ marginBottom: '14px' }}>Resources Coming Soon</h2>
                <p style={{ margin: '0 auto 24px' }}>
                  The CGP Resources Library is being developed and will feature policy briefs, technical guidelines,
                  epidemic intelligence tools, and research outputs. Check back soon.
                </p>
                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a className="btn" href="/projects">Projects and Impact</a>
                  <a className="btn" href="/news">News and Insights</a>
                </div>
              </div>
            ) : (
              <div className="grid-3">
                {resources.map(r => {
                  const isPdf = r.document_url && /\.pdf($|\?)/i.test(r.document_url);
                  return (
                    <article className="resource-card" key={r.id}>
                      <div className="resource-card-icon" aria-hidden="true">
                        <i className={isPdf ? 'bi bi-file-earmark-pdf' : 'bi bi-file-earmark-text'}></i>
                      </div>
                      <div className="resource-card-body">
                        {r.date && <div className="resource-card-meta">{r.date}</div>}
                        <h3>{r.title}</h3>
                        {r.description && <p>{r.description}</p>}
                        {r.document_url ? (
                          <a
                            className="resource-card-link"
                            href={resolveAssetUrl(r.document_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Document <i className="bi bi-box-arrow-up-right"></i>
                          </a>
                        ) : (
                          <span className="resource-card-link resource-card-link-disabled">
                            Document not available
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

    </>
  );
}