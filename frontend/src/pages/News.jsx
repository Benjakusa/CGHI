import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE, resolveAssetUrl } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function News() {
  const [news, setNews] = useState([]);
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get('article');
  const activeArticle = articleId
    ? news.find(n => String(n.id) === String(articleId))
    : null;

  useEffect(() => {
    fetch(`${API_BASE}/api/news`)
      .then(r => r.json())
      .then(data => setNews(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  return (
    <>
      <Navbar activePage="news" />

      <main>
        <div className="page-header">
          <div className="wrap">
            <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span>News & Insights
            </nav>
            <h1>{activeArticle ? activeArticle.title : 'News & Insights'}</h1>
            <p className="dek">
              {activeArticle
                ? `${activeArticle.published_at || ''}${activeArticle.published_at ? ' · ' : ''}${activeArticle.category || 'News'}`
                : "Updates from CGP's field work and technical partnerships."}
            </p>
          </div>
        </div>

        {activeArticle ? (
          <section>
            <div className="wrap">
              <p style={{marginBottom: '24px'}}>
                <a className="text-link" href="/news">
                  <i className="bi bi-arrow-left"></i> Back to all news
                </a>
              </p>

              {activeArticle.image_url && (
                <figure style={{marginBottom: '32px'}}>
                  <img
                    className="article-card-img"
                    src={resolveAssetUrl(activeArticle.image_url)}
                    alt={activeArticle.title}
                    loading="lazy"
                    style={{width: '100%', borderRadius: 'var(--radius)'}}
                  />
                </figure>
              )}

              <p style={{fontSize: '1.15rem', fontWeight: 500, marginBottom: '24px', maxWidth: '70ch'}}>
                {activeArticle.excerpt}
              </p>

              <div style={{maxWidth: '70ch', whiteSpace: 'pre-line', fontSize: '1.02rem', lineHeight: 1.7, color: 'var(--ink-soft)'}}>
                {activeArticle.content || ''}
              </div>

              {activeArticle.author && (
                <p style={{marginTop: '32px', fontFamily: 'var(--mono)', fontSize: '0.82rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                  {activeArticle.author}
                </p>
              )}
            </div>
          </section>
        ) : (
          <section>
            <div className="wrap">
              {news.length > 0 ? (
                <div className="grid-3">
                  {news.map(n => (
                    <article className="article-card" key={n.id}>
                      {n.image_url && (
                        <img
                          className="article-card-img"
                          src={resolveAssetUrl(n.image_url)}
                          alt={n.title}
                          loading="lazy"
                        />
                      )}
                      <div className="article-card-body">
                        <div className="article-meta">{n.published_at}{n.category ? ` · ${n.category}` : ''}</div>
                        <h3>{n.title}</h3>
                        <p>{n.excerpt}</p>
                        <a
                          className="text-link"
                          href={`/news?article=${n.id}`}
                          style={{display: 'block', marginTop: '16px'}}
                        >
                          Read More <i className="bi bi-arrow-right"></i>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p>No news articles have been published yet. Please check back soon.</p>
              )}
            </div>
          </section>
        )}

        <div className="cta-strip">
          <div className="wrap">
            <div className="cta-strip-inner">
              <div>
                <h2>See CGP's Project Record</h2>
                <p>Learn more about the projects behind the DMT-PHE and other CGP initiatives.</p>
              </div>
              <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', flexShrink: '0'}}>
                <a className="btn" href="/projects">Projects & Impact</a>
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