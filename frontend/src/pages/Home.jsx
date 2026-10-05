/**
 * Homepage.
 *
 * Structure follows the audit's IA and its explicit content requirements:
 *
 *   1. Hero         — headline, value proposition, "Explore Our Work" +
 *                     "Partner With Us" CTAs
 *   2. Welcome       — what CGP is, with a link into the story
 *   3. What We Do    — the five capability cards
 *   4. CGP at a Glance — published impact figures only (never left blank)
 *   5. Projects      — outcome-led cards, not activity lists
 *   6. Initiatives   — the six active programmes
 *   7. Insights      — latest research and news
 *   8. Partners      — selected key partners + link to the full list
 *   9. CTA           — Partner With Us
 *
 * All copy is drawn from `src/content/*`; the only live data is the hero,
 * partner and article sets served by the API, each of which falls back to
 * bundled content so the page is never empty.
 */

import React, { useCallback, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import Seo, {
  BASE_JSONLD,
  itemListJsonLd,
  pageJsonLd,
} from '../components/Seo';
import SmartLink from '../components/SmartLink';
import SmartImage from '../components/SmartImage';
import VideoEmbed from '../components/VideoEmbed';
import {
  CapabilityCard,
  CtaStrip,
  InsightCard,
  InitiativeCard,
  PartnerMarquee,
  ProjectCard,
  SectionHeader,
} from '../components/cards';
import { AsyncSection, SkeletonCard } from '../components/Skeleton';
import useApi from '../hooks/useApi';
import useCountUp from '../hooks/useCountUp';
import { resolveAssetUrl } from '../context/AuthContext';
import { BRAND, DEK, SITE_DESCRIPTION } from '../config/site';
import { PAGE_META } from '../content/navigation';
import { CAPABILITIES } from '../content/capabilities';
import { FEATURED_PROJECTS } from '../content/projects';
import { INITIATIVES } from '../content/initiatives';
import { GLANCE } from '../content/impact';
import { FALLBACK_ARTICLES } from '../content/insights';
import { FALLBACK_PARTNERS, HOMEPAGE_PARTNER_COUNT } from '../content/partners';

/** Used when the heroes endpoint returns nothing. */
const DEFAULT_HERO = {
  id: 'default',
  title: 'Building Intelligence for a Safer World',
  topic: 'Epidemic & Pandemic Intelligence',
  description:
    'CGP combines epidemic intelligence, One Health and community engagement with data science to help countries prevent, detect and respond to health threats earlier.',
  btn1_text: 'Explore Our Work',
  btn1_link: '/projects',
  btn2_text: 'Partner With Us',
  btn2_link: '/partner-with-us#contact-form',
  image_url: null,
};

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function HeroSlide({ slide, isActive, priority }) {
  return (
    <div
      className={`hero-slide${isActive ? ' active' : ''}`}
      role="group"
      aria-roledescription="slide"
      aria-label={slide.topic}
      hidden={!isActive}
    >
      {slide.image_url && (
        <SmartImage
          className="hero-slide-img"
          src={resolveAssetUrl(slide.image_url)}
          alt=""
          width="1920"
          height="1080"
          priority={priority}
        />
      )}
      <div className="hero-slide-overlay" aria-hidden="true" />

      <div className="wrap">
        <div className="hero-slide-panel">
          <span className="hero-slide-eyebrow">{slide.topic}</span>
          <h1>{slide.title}</h1>
          <p>{slide.description}</p>
          <div className="hero-ctas">
            <SmartLink className="btn btn-white" to={slide.btn1_link || '/projects'}>
              {slide.btn1_text || 'Explore Our Work'}
            </SmartLink>
            <SmartLink className="btn btn-outline-light" to={slide.btn2_link || '/partner-with-us#contact-form'}>
              {slide.btn2_text || 'Partner With Us'}
            </SmartLink>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroCarousel({ slides, loading }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const slidesToRender = slides.length > 0 ? slides : [DEFAULT_HERO];

  // Never index past the end if the slide set shrinks.
  const index = Math.min(current, slidesToRender.length - 1);

  React.useEffect(() => {
    if (paused || slidesToRender.length <= 1) return undefined;
    // Respect reduced-motion: do not auto-rotate at all.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(
      () => setCurrent((c) => (c + 1) % slidesToRender.length),
      7000
    );
    return () => window.clearInterval(timer);
  }, [paused, slidesToRender.length]);

  if (loading) {
    return (
      <section className="hero-carousel hero-carousel--loading" aria-busy="true">
        <span className="sr-only">Loading featured content…</span>
      </section>
    );
  }

  return (
    <section
      className="hero-carousel"
      aria-label="Featured"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slidesToRender.map((slide, i) => (
        <HeroSlide
          key={slide.id}
          slide={slide}
          isActive={i === index}
          priority={i === 0}
        />
      ))}

      {slidesToRender.length > 1 && (
        <div className="carousel-dots">
          {slidesToRender.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              className="carousel-dot"
              aria-label={`Show slide ${i + 1} of ${slidesToRender.length}: ${slide.title}`}
              aria-current={i === index}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CGP at a Glance                                                      */
/* ------------------------------------------------------------------ */

function GlanceFigure({ figure }) {
  const [ref, counted] = useCountUp(figure.value);

  let display;
  if (figure.display && !/^\d+$/.test(String(figure.display))) {
    // Prefixed/suffixed values (e.g. "30%") are shown verbatim so no
    // figure is ever re-derived from an animated integer.
    display = figure.display;
  } else {
    display = String(counted);
  }

  return (
    <div className="stat-cell" ref={ref}>
      <span className="stat-num">{display}</span>
      <span className="stat-lbl">{figure.label}</span>
    </div>
  );
}

/**
 * Every figure on the homepage carries a published value — items still awaiting
 * an official source are filtered out rather than rendered as a blank stat.
 *
 * The "$145M Pandemic Fund financing" card was removed from CGP at a Glance at
 * the stakeholder's request and no replacement figure was approved, so it is
 * excluded here (it remains in the data file for the What We Do headline set).
 */
const PUBLISHED_GLANCE = GLANCE.filter(
  (figure) => figure.value != null && figure.id !== 'financing'
);

function GlanceGrid() {
  return (
    <div className="stats-single-card">
      <div className="stats-single-card-grid">
        {PUBLISHED_GLANCE.map((figure) => (
          <GlanceFigure key={figure.id} figure={figure} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const heroes = useApi('/api/heroes', []);
  const partners = useApi('/api/partners', FALLBACK_PARTNERS);
  const news = useApi('/api/news', FALLBACK_ARTICLES);

  const latestNews = useMemo(() => {
    const list = news.data && news.data.length > 0 ? news.data : FALLBACK_ARTICLES;
    return list.slice(0, 3);
  }, [news.data]);

  const selectedPartners = useMemo(() => {
    const list = partners.data && partners.data.length > 0 ? partners.data : FALLBACK_PARTNERS;
    return list.slice(0, HOMEPAGE_PARTNER_COUNT);
  }, [partners.data]);

  const jsonLd = useMemo(
    () => [
      ...BASE_JSONLD,
      pageJsonLd({ name: PAGE_META['/'].title, path: '/', description: SITE_DESCRIPTION }),
      itemListJsonLd('What We Do', CAPABILITIES.map((c) => ({ name: c.title, to: '/what-we-do' }))),
      itemListJsonLd(
        'Featured projects',
        FEATURED_PROJECTS.map((p) => ({ name: p.title, to: `/projects/${p.slug}` }))
      ),
    ],
    []
  );

  const reloadPartners = useCallback(() => partners.retry(), [partners]);
  const reloadNews = useCallback(() => news.retry(), [news]);

  return (
    <Layout navId="home">
      <Seo
        title={PAGE_META['/'].title}
        description={SITE_DESCRIPTION}
        path="/"
        imageAlt={`${BRAND.abbr} — ${BRAND.tagline}`}
        jsonLd={jsonLd}
      />

      <HeroCarousel slides={heroes.data} loading={heroes.loading} />

      {/* ---------------- Welcome ---------------- */}
      <section>
        <div className="wrap">
          <div className="grid-2 grid-2--center">
            <div>
              <span className="section-label">Welcome to CGP</span>
              <h2>{BRAND.tagline}</h2>
              <p className="lead">{DEK.home}</p>
              <p>
                CGP operates at the intersection of epidemic and pandemic intelligence, One Health,
                and community-centred preparedness — providing strategic solutions to prevent,
                detect and respond to public health threats, especially in vulnerable and high-risk
                settings.
              </p>
              <div className="button-row">
                <SmartLink className="btn" to="/about">
                  Meet Our Team <i className="bi bi-arrow-right" aria-hidden="true" />
                </SmartLink>
                <SmartLink className="btn btn-outline" to="/what-we-do">
                  What We Do
                </SmartLink>
              </div>
            </div>

            <VideoEmbed
              videoId="SxFaJhnb4Qw"
              title="Decision Making Tool for Public Health Emergencies (DMT-PHE) in Kenya"
              caption="Kenya’s Decision-Making Tool for Public Health Emergencies (DMT-PHE), validated October 2025."
            />
          </div>
        </div>
      </section>

      {/* ---------------- What We Do ---------------- */}
      <section className="section-surface" aria-labelledby="what-we-do-heading">
        <div className="wrap">
          <SectionHeader
            id="what-we-do-heading"
            align="center"
            eyebrow="What We Do"
            title="Five interconnected areas of expertise"
            lede="CGP works across five areas of global health expertise to strengthen surveillance, preparedness and response."
          />
          <div className="grid-auto">
            {CAPABILITIES.map((capability) => (
              <CapabilityCard key={capability.id} capability={capability} />
            ))}
          </div>
          <p className="section-trailing-link">
            <SmartLink className="text-link" to="/what-we-do">
              Explore all technical capabilities <i className="bi bi-arrow-right" aria-hidden="true" />
            </SmartLink>
          </p>
        </div>
      </section>



      {/* ---------------- CGP at a Glance ---------------- */}
      <section className="section-glance" aria-labelledby="glance-heading">
        <div className="wrap">
          <SectionHeader
            id="glance-heading"
            align="center"
            eyebrow="CGP at a Glance"
            title="Our impact in numbers"
            lede="Figures below are taken from CGP’s published project record."
          />
          <GlanceGrid />
        </div>
      </section>

      {/* ---------------- Projects ---------------- */}
      <section aria-labelledby="projects-heading">
        <div className="wrap">
          <SectionHeader
            id="projects-heading"
            eyebrow="Selected Work"
            title="Flagship projects & impact"
            action={{ label: 'Explore Our Projects', to: '/projects' }}
          />
          <div className="grid-auto">
            {FEATURED_PROJECTS.slice(0, 3).map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Initiatives ---------------- */}
      <section className="section-surface-alt" aria-labelledby="initiatives-heading">
        <div className="wrap">
          <SectionHeader
            id="initiatives-heading"
            eyebrow="Active Programmes"
            title="CGP Initiatives"
            action={{ label: 'All initiatives', to: '/initiatives' }}
          />
          <div className="grid-auto">
            {INITIATIVES.slice(0, 3).map((initiative) => (
              <InitiativeCard key={initiative.id} initiative={initiative} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Partners ---------------- */}
      <section className="section-surface" aria-labelledby="partners-heading">
        <div className="wrap">
          <SectionHeader
            id="partners-heading"
            align="center"
            eyebrow="Our Partners & Collaborators"
            title="Working with institutions across global health security"
            action={{ label: 'See all partners', to: '/partners' }}
          />
          <AsyncSection
            loading={partners.loading}
            label="Loading partners"
            skeleton={
              <div className="partner-marquee" aria-hidden="true">
                <div className="partner-marquee-viewport">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div className="partner-marquee-card" key={i}>
                      <span className="skeleton" style={{ width: '70%', height: '2.4rem' }} />
                    </div>
                  ))}
                </div>
              </div>
            }
            onRetry={reloadPartners}
          >
            <PartnerMarquee partners={selectedPartners} />
          </AsyncSection>
          <p className="section-trailing-link">
            <SmartLink className="text-link" to="/partners">
              Meet our partners and collaborators{' '}
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </SmartLink>
          </p>
        </div>
      </section>

      {/* ---------------- Insights ---------------- */}
      <section aria-labelledby="insights-heading">
        <div className="wrap">
          <SectionHeader
            id="insights-heading"
            eyebrow="Updates"
            title="Latest Media Insights and Research"
            action={{ label: 'Read the Research', to: '/insights' }}
          />
          <AsyncSection
            loading={news.loading}
            skeleton={
              <div className="grid-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            }
            onRetry={reloadNews}
          >
            <div className="grid-3">
              {latestNews.map((article) => (
                <InsightCard key={article.id} article={article} />
              ))}
            </div>
          </AsyncSection>
        </div>
      </section>

      <CtaStrip
        title="Ready to build resilience together?"
        body="Explore our projects, join our expert network, or get in touch to discuss partnership opportunities."
        actions={[
          { label: 'Explore Our Work', to: '/projects', variant: 'white' },
          { label: 'Partner With Us', to: '/partner-with-us#contact-form', variant: 'white' },
        ]}
      />
    </Layout>
  );
}
