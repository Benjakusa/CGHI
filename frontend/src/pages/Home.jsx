import React, { useEffect, useState } from 'react';
import { API_BASE, resolveAssetUrl } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  const [heroes, setHeroes] = useState([]);
  const [partners, setPartners] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/heroes`).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/api/partners`).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/api/news`).then(r => r.json()).catch(() => [])
    ])
    .then(([heroData, partnerData, newsData]) => {
      setHeroes(Array.isArray(heroData) ? heroData : []);
      setPartners(Array.isArray(partnerData) ? partnerData : []);
      setNews(Array.isArray(newsData) ? newsData : []);
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (heroes.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroes.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroes.length) % heroes.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroes.length);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div>Loading...</div>
        </div>
      </>
    );
  }

  const defaultHero = {
    id: 'default',
    title: 'Building Intelligence for a Safer World',
    topic: 'Epidemic & Pandemic Intelligence',
    description: 'The Center for Global Health and Pandemic Intelligence (CGP) is a multidisciplinary policy, research, and implementation hub dedicated to strengthening global and regional health security through evidence-driven action.',
    btn1_text: 'About CGP',
    btn1_link: '/about',
    btn2_text: 'What We Do',
    btn2_link: '/what-we-do',
    image_url: 'https://pandemicintelcenter.org/wp-content/uploads/2025/07/pexels-franco30-8488619-1024x683.jpg'
  };

  const displayHeroes = heroes.length > 0 ? heroes : [defaultHero];
  const latestNews = news.slice(0, 3);

  return (
    <React.Fragment>
      <Navbar />

      <main>
        <section className="hero-carousel" aria-label="Featured content carousel" role="region">
          {displayHeroes.map((h, index) => (
            <div
              key={h.id}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={h.topic}
              style={{ display: index === currentSlide ? 'block' : 'none' }}
            >
              <img
                className="hero-slide-img"
                src={resolveAssetUrl(h.image_url)}
                alt={h.title}
                loading="lazy"
              />
              <div className="hero-slide-panel">
                <span className="hero-slide-eyebrow">{h.topic}</span>
                <h1>{h.title}</h1>
                <p>{h.description}</p>
                <div className="hero-ctas">
                  <a className="btn-primary" href={h.btn1_link || '/about'}>{h.btn1_text || 'About CGP'}</a>
                  <a className="btn-outline" href={h.btn2_link || '/what-we-do'}>{h.btn2_text || 'What We Do'}</a>
                </div>
              </div>
            </div>
          ))}

          {displayHeroes.length > 1 && (
            <div className="carousel-controls" role="group" aria-label="Carousel controls">
              <span className="carousel-prev" aria-label="Previous slide" onClick={prevSlide} style={{ cursor: 'pointer' }}>&#8592;</span>
              <span className="carousel-next" aria-label="Next slide" onClick={nextSlide} style={{ cursor: 'pointer' }}>&#8594;</span>
            </div>
          )}

          {displayHeroes.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '10px',
              zIndex: 10
            }}>
              {displayHeroes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: 'none',
                    background: index === currentSlide ? '#01abed' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    transition: 'background 0.3s',
                    padding: 0
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="section-dark">
          <div className="wrap">
            <div className="grid-4" style={{gap: '0', border: '1px solid rgba(255,255,255,0.1)'}}>
              <div className="stat-card" style={{borderRight: '1px solid rgba(255,255,255,0.1)', borderRadius: '0'}}>
                <span className="stat-num" data-count="145" data-suffix="M">$145M</span>
                <span className="stat-lbl">Requested Pandemic Fund financing coordinated for Kenya, 2023 2025</span>
              </div>
              <div className="stat-card" style={{borderRight: '1px solid rgba(255,255,255,0.1)', borderRadius: '0'}}>
                <span className="stat-num" data-count="30" data-suffix="%">30%</span>
                <span className="stat-lbl">Reduction in detection-to-response time across 4 Kenyan counties</span>
              </div>
              <div className="stat-card" style={{borderRight: '1px solid rgba(255,255,255,0.1)', borderRadius: '0'}}>
                <span className="stat-num" style={{fontSize: '2.2rem'}}>7-1-7</span>
                <span className="stat-lbl">WHO-endorsed readiness targets applied in Migori &amp; national Mpox reviews</span>
              </div>
              <div className="stat-card" style={{borderRadius: '0'}}>
                <span className="stat-num" data-count="10" data-suffix="">10</span>
                <span className="stat-lbl">High-risk counties piloting the DMT-PHE decision tool</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="grid-2" style={{alignItems: 'center', gap: '64px'}}>
              <div>
                <span className="section-label">Welcome to CGP</span>
                <h2 style={{marginBottom: '20px'}}>Building Intelligence for a Safer World</h2>
                <p style={{fontSize: '1.05rem', marginBottom: '16px'}}>The Center for Global Health and Pandemic Intelligence (CGP) is a multidisciplinary policy,
                  research, and implementation hub dedicated to strengthening global and regional health security. CGP operates at the intersection of Epidemic and Pandemic Intelligence,
                  One Health, and community-centered preparedness,
                  providing strategic solutions to prevent, detect, and respond to public health threats especially in vulnerable and high-risk settings across the World.</p>
                <a className="btn" href="/about">Read More About CGP <i className="bi bi-arrow-right"></i></a>
              </div>
              <figure style={{border: '4px solid var(--sky)', overflow: 'hidden', margin: 0}}>
                <div style={{position: 'relative', width: '100%', aspectRatio: '16 / 9'}}>
                  <iframe
                    src="https://www.youtube.com/embed/SxFaJhnb4Qw"
                    title="Decision Making Tool for Public Health Emergencies (DMT-PHE) in Kenya"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      display: 'block'
                    }}
                  />
                </div>
              </figure>
            </div>
          </div>
        </section>

        <section className="section-surface">
          <div className="wrap">
            <div className="section-header text-center">
              <span className="section-label"
                style={{display: 'inline-block', margin: '0 auto 14px', borderLeft: 'none', paddingLeft: '0'}}>Technical
                Capabilities</span>
              <h2>What We Do</h2>
              <p style={{margin: '0 auto'}}>CGP operates across five interconnected areas of global health expertise to
                strengthen surveillance, preparedness and response.</p>
            </div>
            <div className="grid-auto">
              <div className="icon-card">
                <div className="card-icon" aria-hidden="true"><i className="bi bi-bar-chart-fill"></i></div>
                <h3>Epidemic &amp; Pandemic Intelligence</h3>
                <p>Integrating AI-powered forecasting, 7-1-7 response monitoring, and multi-source surveillance data to
                  accelerate outbreak detection and response.</p>
              </div>
              <div className="icon-card">
                <div className="card-icon" aria-hidden="true"><i className="bi bi-tools"></i></div>
                <h3>Public Health Emergency Preparedness &amp; Response</h3>
                <p>IHR/JEE facilitation, simulation exercises, NAPHS development, and emergency guideline creation for
                  Marburg, Mpox and other priority hazards.</p>
              </div>
              <div className="icon-card">
                <div className="card-icon" aria-hidden="true"><i className="bi bi-tree-fill"></i></div>
                <h3>One Health &amp; Climate-Sensitive Disease Control</h3>
                <p>Bridging human, animal, and environmental health data streams to build early warning and response systems
                  for zoonotic and climate-sensitive diseases.</p>
              </div>
              <div className="icon-card">
                <div className="card-icon" aria-hidden="true"><i className="bi bi-people-fill"></i></div>
                <h3>Community Engagement &amp; Resilience Building</h3>
                <p>Community-led risk communication, rumour tracking, CBS/EBS training, and trust-building approaches in
                  marginalized and high-risk areas.</p>
              </div>
              <div className="icon-card">
                <div className="card-icon" aria-hidden="true"><i className="bi bi-laptop"></i></div>
                <h3>Data Science &amp; Digital Health Innovation</h3>
                <p>AI/ML model development, geospatial intelligence, real-time dashboards, digital surveillance tools, and
                  decision-support platforms for frontline responders.</p>
              </div>
            </div>
            <p style={{marginTop: '36px'}}><a className="text-link" href="/what-we-do">Explore all technical capabilities
                <i className="bi bi-arrow-right"></i></a></p>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="section-header"
              style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '18px', marginBottom: '40px'}}>
              <div>
                <span className="section-label">Selected Work</span>
                <h2 style={{margin: '0'}}>Flagship Projects &amp; Impact</h2>
              </div>
              <a className="text-link" href="/projects" style={{whiteSpace: 'nowrap'}}>All projects <i
                  className="bi bi-arrow-right"></i></a>
            </div>
            <div className="grid-3">
              <div className="project-card">
                <span className="project-card-tag">Pandemic Fund 2023 2025</span>
                <h3>Pandemic Preparedness</h3>
                <p>Coordinated development of National, Multi-country and Regional proposals to the Pandemic Fund. Requested
                  funding: <strong>$145 million</strong>.</p>
              </div>
              <div className="project-card">
                <span className="project-card-tag">7-1-7 Readiness Kenya</span>
                <h3>7-1-7 Readiness Initiative</h3>
                <p>Facilitated the Intra-Action Review of Kenya's Cholera outbreak in Migori and Mpox outbreak (2024)
                  reducing detection-to-response time by <strong>30%</strong> across 4 counties.</p>
              </div>
              <div className="project-card">
                <span className="project-card-tag">Emergency Guidelines Kenya 2024</span>
                <h3>Emergency Guidelines</h3>
                <p>Supported development of the Marburg Preparedness and 72-Hour Response Plans, and the Mpox Response Plans
                  for Kenya (2024).</p>
              </div>
              <div className="project-card">
                <span className="project-card-tag">IHR JEE 2024</span>
                <h3>International Health Regulations MEF</h3>
                <p>Supporting Kenya's Joint External Evaluation (JEE 2024), SPAR, NAPHS 2.0, and simulation exercises
                  including COHESION a One Health cross-border simulation with Kenya, Somalia and Ethiopia.</p>
              </div>
              <div className="project-card">
                <span className="project-card-tag">Precision Public Health 2025</span>
                <h3>Precision Public Health</h3>
                <p>Supporting KNPHI on a Standardized Decision-Making Tool for Public Health Emergencies in Kenya (DMT-PHE)
                  now piloted in <strong>10 high-risk counties</strong>.</p>
              </div>
              <div className="project-card">
                <span className="project-card-tag">Event-Based Surveillance</span>
                <h3>Event-Based Surveillance (EBS)</h3>
                <p>Training health workers and communities, integrating Community-Based Surveillance (CBS), deploying
                  digital tools for real-time alerts aligned with IDSR and 7-1-7 targets.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-surface-alt">
          <div className="wrap">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px'}}>
              <div>
                <span className="section-label">Five Active Programmes</span>
                <h2 style={{margin: '0'}}>CGP Initiatives</h2>
              </div>
              <a className="text-link" href="/initiatives" style={{whiteSpace: 'nowrap'}}>All initiatives <i
                  className="bi bi-arrow-right"></i></a>
            </div>
            <div className="grid-auto">
              <div className="initiative-card">
                <span className="initiative-label">EWIN Flagship</span>
                <h3>Early Warning &amp; Intelligence Node</h3>
                <p style={{fontSize: '0.93rem', marginTop: '8px', color: 'var(--ink-muted)'}}>CGP's flagship model for subnational
                  epidemic intelligence integrating AI-powered forecasting, 7-1-7 response monitoring, and community-based
                  early warning in the One Health approach.</p>
                <a className="text-link" href="/initiatives"
                  style={{display: 'block', marginTop: '14px', fontSize: '0.88rem'}}>Explore initiative <i
                    className="bi bi-arrow-right"></i></a>
              </div>
              <div className="initiative-card">
                <span className="initiative-label">Performance Improvement</span>
                <h3>7-1-7 Performance Improvement Pilot</h3>
                <p style={{fontSize: '0.93rem', marginTop: '8px', color: 'var(--ink-muted)'}}>Pilot implementation of the WHO-endorsed
                  7-1-7 model in five counties in Kenya using digital tools and quality improvement (QI) methods to track
                  and enhance outbreak response timelines.</p>
                <a className="text-link" href="/initiatives"
                  style={{display: 'block', marginTop: '14px', fontSize: '0.88rem'}}>Explore initiative <i
                    className="bi bi-arrow-right"></i></a>
              </div>
              <div className="initiative-card">
                <span className="initiative-label">AI &amp; Machine Learning</span>
                <h3>AI-Powered Epidemic Forecasting</h3>
                <p style={{fontSize: '0.93rem', marginTop: '8px', color: 'var(--ink-muted)'}}>Pilot an AI-powered epidemic forecasting
                  platform using IDSR, CBS, and climatic signals to anticipate outbreaks and generate risk alerts
                  targeting 7 14 day improved lead time.</p>
                <a className="text-link" href="/initiatives"
                  style={{display: 'block', marginTop: '14px', fontSize: '0.88rem'}}>Explore initiative <i
                    className="bi bi-arrow-right"></i></a>
              </div>
              <div className="initiative-card">
                <span className="initiative-label">Community Risk Comm.</span>
                <h3>Community-Led Risk Communication</h3>
                <p style={{fontSize: '0.93rem', marginTop: '8px', color: 'var(--ink-muted)'}}>A community-driven risk communication
                  model for marginalized areas leveraging trusted local structures, WhatsApp/SMS rumour-tracking, and CHV
                  networks to strengthen early warning.</p>
                <a className="text-link" href="/initiatives"
                  style={{display: 'block', marginTop: '14px', fontSize: '0.88rem'}}>Explore initiative <i
                    className="bi bi-arrow-right"></i></a>
              </div>
              <div className="initiative-card">
                <span className="initiative-label">Climate &amp; Health</span>
                <h3>Climate-Sensitive Disease Surveillance</h3>
                <p style={{fontSize: '0.93rem', marginTop: '8px', color: 'var(--ink-muted)'}}>Integrating meteorological,
                  environmental, and health data to build GIS-based early warning and response systems for climate-sensitive
                  outbreaks including cholera and Rift Valley fever.</p>
                <a className="text-link" href="/initiatives"
                  style={{display: 'block', marginTop: '14px', fontSize: '0.88rem'}}>Explore initiative <i
                    className="bi bi-arrow-right"></i></a>
              </div>
              <div className="initiative-card">
                <span className="initiative-label">One Health Urban</span>
                <h3>One Health Surveillance in Informal Settlements</h3>
                <p style={{fontSize: '0.93rem', marginTop: '8px', color: 'var(--ink-muted)'}}>A One Health surveillance model for
                  urban informal settlements integrating community reporting, animal health indicators, and environmental
                  risk factors for improved early detection.</p>
                <a className="text-link" href="/initiatives"
                  style={{display: 'block', marginTop: '14px', fontSize: '0.88rem'}}>Explore initiative <i
                    className="bi bi-arrow-right"></i></a>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div
              style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '18px', marginBottom: '40px'}}>
              <div>
                <span className="section-label">Updates</span>
                <h2 style={{margin: '0'}}>Latest News & Insights</h2>
              </div>
              <a className="text-link" href="/news" style={{whiteSpace: 'nowrap'}}>All news <i
                  className="bi bi-arrow-right"></i></a>
            </div>

            {latestNews.length > 0 ? (
              <div className="grid-3">
                {latestNews.map(n => (
                  <article className="article-card" key={n.id}>
                    <img
                      className="article-card-img"
                      src={resolveAssetUrl(n.image_url)}
                      alt={n.title}
                      loading="lazy"
                    />
                    <div className="article-card-body">
                      <div className="article-meta">{n.published_at}</div>
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
              <div className="grid-3">
                <article className="article-card">
                  <img
                    className="article-card-img"
                    src="https://pandemicintelcenter.org/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-22-at-12.17.44-1-1024x683.jpeg"
                    alt="DMT-PHE validation workshop participants, October 2025"
                    loading="lazy"
                  />
                  <div className="article-card-body">
                    <div className="article-meta">October 2025 Kenya</div>
                    <h3>Kenya Validates Groundbreaking Decision-Making Tool for Public Health Emergencies (DMT-PHE)</h3>
                    <p>Kenya has unveiled the Decision-Making Tool for Public Health Emergencies (DMT-PHE), a first-of-its-kind
                      framework validated under KNPHI leadership, with support from Palladium's TDDAP2 and technical
                      facilitation by CGP. The tool will be piloted in ten high-risk counties before national rollout.</p>
                    <a
                      className="text-link"
                      href="/news"
                      style={{display: 'block', marginTop: '16px'}}
                    >
                      Read More <i className="bi bi-arrow-right"></i>
                    </a>
                  </div>
                </article>
              </div>
            )}
          </div>
        </section>

        <section className="section-surface">
          <div className="wrap">
            <div className="section-header text-center" style={{marginBottom: '32px'}}>
              <span className="section-label" style={{display: 'inline-block', borderLeft: 'none', paddingLeft: '0'}}>Collaborators</span>
              <h2>Strategic Partnerships</h2>
            </div>
            <div className="partners-carousel">
              <div className="partners-carousel-track">
                {[...partners, ...partners].map((p, i) => (
                  <div className="partner-card" key={p.id + '_' + i}>
                    <img src={resolveAssetUrl(p.logo_url)} alt={p.name} loading="lazy" />
                    <h4>{p.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="cta-strip">
          <div className="wrap">
            <div className="cta-strip-inner">
              <div>
                <h2>Ready to Build Resilience Together?</h2>
                <p style={{marginBottom: '0'}}>Explore our projects, join our expert network, or get in touch to discuss
                  partnership opportunities.</p>
              </div>
              <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', flexShrink: '0'}}>
                <a className="btn" href="/projects">View Projects</a>
                <a className="btn" href="/careers">Careers</a>
                <a className="btn" href="/contact">Contact</a>
              </div>
            </div>
          </div>
        </div>

      </main>

      <Footer />

    </React.Fragment>
  );
}