/**
 * About / "Who We Are".
 *
 * Structured to the audit spec: Who We Are → Mission → Vision → Approach →
 * Expertise → Leadership → Partners, each as a named <section> with a single
 * <h2> so the heading hierarchy is h1 → h2 → h3 with no skips.
 */

import React, { useMemo } from 'react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Seo, {
  BASE_JSONLD,
  breadcrumbJsonLd,
  itemListJsonLd,
  pageJsonLd,
} from '../components/Seo';
import SmartLink from '../components/SmartLink';
import SmartImage from '../components/SmartImage';
import { CtaStrip, PartnerGrid, SectionHeader } from '../components/cards';
import { AsyncSection } from '../components/Skeleton';
import useApi from '../hooks/useApi';
import { BRAND } from '../config/site';
import { PAGE_META } from '../content/navigation';
import { CAPABILITIES } from '../content/capabilities';
import { EXPERTISE_AREAS } from '../content/leadership';
import { FALLBACK_PARTNERS, HOMEPAGE_PARTNER_COUNT } from '../content/partners';

const META = PAGE_META['/about'];

const VISION =
  'A world safeguarded from epidemics through integrated intelligence and rapid action.';

const MISSION =
  'To harness data, science, and multisectoral partnerships to strengthen surveillance systems, accelerate early warning, and empower frontline responders.';

const VALUE_PILLARS = [
  {
    id: 'multidisciplinary',
    icon: 'bi-people-fill',
    title: 'Multidisciplinary Expertise',
    body: 'A team with deep experience in epidemiology, data science, emergency management, veterinary public health, and health systems — providing integrated solutions across all dimensions of global health security.',
  },
  {
    id: 'locally-anchored',
    icon: 'bi-geo-alt-fill',
    title: 'Locally Anchored, Globally Aligned',
    body: 'Based in Kenya with partnerships across Africa and global health institutions — CGP understands the local context while applying global standards, frameworks, and best practices.',
  },
  {
    id: 'evidence-driven',
    icon: 'bi-lightbulb-fill',
    title: 'Evidence-Driven Innovation',
    body: 'Bridging research and practice to drive contextually relevant and scalable solutions — ensuring that policy, tools, and training are grounded in evidence and practical field experience.',
  },
  {
    id: 'partnerships',
    icon: 'bi-link-45deg',
    title: 'Strategic Partnerships',
    body: 'A proven collaborator with ministries of health, universities, national public health institutes, multilateral agencies, global financing mechanisms, implementing partners and non-state actors.',
  },
];

const APPROACH = [
  {
    id: 'assess',
    icon: 'bi-clipboard-data',
    title: 'Assess',
    body: 'Baseline the capacities, data flows and gaps that determine whether a threat is detected early and acted on coherently — through IHR core-capacity assessment, SPAR, JEE, and risk mapping.',
  },
  {
    id: 'integrate',
    icon: 'bi-diagram-3-fill',
    title: 'Integrate',
    body: 'Join human, animal, environmental and community data into a single operational picture, using One Health framing and interoperable surveillance systems.',
  },
  {
    id: 'build',
    icon: 'bi-tools',
    title: 'Build',
    body: 'Develop the tools, guidelines and plans responders need — decision-support frameworks, GIS risk models, dashboards and emergency response plans.',
  },
  {
    id: 'enable',
    icon: 'bi-mortarboard-fill',
    title: 'Enable',
    body: 'Train and equip frontline health workers, community structures and decision-makers so the intelligence reaches the people who can act on it.',
  },
  {
    id: 'measure',
    icon: 'bi-graph-up',
    title: 'Measure',
    body: 'Track performance against the WHO-endorsed 7-1-7 targets and publish results so improvements are visible, comparable and scalable.',
  },
];

export default function About() {
  const partners = useApi('/api/partners', FALLBACK_PARTNERS);
  const selected = (partners.data?.length ? partners.data : FALLBACK_PARTNERS).slice(
    0,
    HOMEPAGE_PARTNER_COUNT
  );

  const jsonLd = useMemo(
    () => [
      ...BASE_JSONLD,
      pageJsonLd({ name: META.title, path: '/about', description: META.description }),
      breadcrumbJsonLd(META.breadcrumb),
      itemListJsonLd('Areas of expertise', EXPERTISE_AREAS.map((e) => ({ name: e.label, to: '/what-we-do' }))),
    ],
    []
  );

  return (
    <Layout navId="about">
      <Seo title={META.title} description={META.description} path="/about" jsonLd={jsonLd} />

      <PageHeader
        trail={META.breadcrumb}
        eyebrow="Who We Are"
        h1="About CGP"
        dek={`${BRAND.abbr} is a multidisciplinary policy, research and implementation hub dedicated to strengthening global and regional health security.`}
      />

      {/* ---------------- Who We Are ---------------- */}
      <section aria-labelledby="who-we-are">
        <div className="wrap">
          <div className="grid-2 grid-2--center">
            <div>
              <span className="section-label">Who We Are</span>
              <h2 id="who-we-are">A multidisciplinary hub for global health security</h2>
              <p className="lead">
                The <SmartLink to="/">Center for Global Health &amp; Pandemic Intelligence (CGP)</SmartLink>{' '}
                is a multidisciplinary policy, research, and implementation hub dedicated to
                strengthening global and regional health security.
              </p>
              <p>
                CGP operates at the intersection of epidemic and pandemic intelligence, One Health,
                and community-centred preparedness, providing strategic solutions to prevent, detect,
                and respond to public health threats — especially in vulnerable and high-risk
                settings across the world.
              </p>
              <p>
                We leverage science, data, and multisectoral partnerships to inform decision-making
                and enhance the resilience of health systems in alignment with national, regional
                and Global Health Security frameworks.
              </p>
            </div>

            <figure className="frame-figure">
              <SmartImage
                className="frame-figure-img"
                src="https://pandemicintelcenter.org/wp-content/uploads/2025/07/paper-style-earth-globe-with-hands-scaled.jpg"
                alt="Illustration of hands holding a globe, representing global health collaboration"
                width="1024"
                height="683"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* ---------------- Mission & Vision ---------------- */}
      <section className="section-dark" aria-labelledby="mission-vision">
        <div className="wrap">
          <h2 id="mission-vision" className="sr-only">
            Our mission and vision
          </h2>
          <div className="grid-2 grid-2--flush">
            <div className="vm-card">
              <span className="vm-icon" aria-hidden="true">
                <i className="bi bi-bullseye" />
              </span>
              <h3>Mission</h3>
              <p>{MISSION}</p>
            </div>
            <div className="vm-card">
              <span className="vm-icon" aria-hidden="true">
                <i className="bi bi-eye" />
              </span>
              <h3>Vision</h3>
              <p>{VISION}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Approach ---------------- */}
      <section aria-labelledby="approach-heading">
        <div className="wrap">
          <SectionHeader
            id="approach-heading"
            eyebrow="Approach"
            title="How CGP works"
            lede="A five-step cycle that turns evidence into operational capability — repeated at subnational, national and regional level."
          />
          <ol className="approach-grid">
            {APPROACH.map((step, index) => (
              <li key={step.id} className="approach-card">
                <span className="approach-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="approach-icon" aria-hidden="true">
                  <i className={`bi ${step.icon}`} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- Expertise ---------------- */}
      <section className="section-surface" aria-labelledby="expertise-heading">
        <div className="wrap">
          <SectionHeader
            id="expertise-heading"
            eyebrow="Expertise"
            title="What Makes CGP Different"
            lede="Our value proposition, and the technical disciplines behind it."
          />

          <div className="pillar-grid">
            {VALUE_PILLARS.map((pillar) => (
              <article key={pillar.id} className="value-card">
                <span className="value-card-icon" aria-hidden="true">
                  <i className={`bi ${pillar.icon}`} />
                </span>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </article>
            ))}
          </div>

          <h3 className="subheading">Areas of work</h3>
          <div className="grid-auto">
            {CAPABILITIES.map((capability) => (
              <article key={capability.id} className="icon-card icon-card--compact">
                <div className="card-icon" aria-hidden="true">
                  <i className={`bi ${capability.icon}`} />
                </div>
                <h4>
                  <SmartLink to={`/what-we-do#${capability.id}`}>{capability.title}</SmartLink>
                </h4>
              </article>
            ))}
          </div>

          <h3 className="subheading">Disciplines</h3>
          <ul className="chip-list chip-list--static">
            {EXPERTISE_AREAS.map((area) => (
              <li key={area.id}>{area.label}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Leadership ---------------- */}
      <section aria-labelledby="leadership-heading">
        <div className="wrap">
          <div className="split-panel">
            <div>
              <span className="section-label">Leadership</span>
              <h2 id="leadership-heading">Leadership &amp; team</h2>
              <p>
                CGP is led by a multidisciplinary team spanning epidemiology, data science, One
                Health, health systems and community engagement.
              </p>
              <div className="button-row">
                <SmartLink className="btn" to="/leadership">
                  Meet Our Team <i className="bi bi-arrow-right" aria-hidden="true" />
                </SmartLink>
                <SmartLink className="btn btn-outline" to="/careers">
                  Careers at CGP
                </SmartLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Partners ---------------- */}
      <section className="section-surface" aria-labelledby="about-partners-heading">
        <div className="wrap">
          <SectionHeader
            id="about-partners-heading"
            align="center"
            eyebrow="Our Partners & Collaborators"
            title="We do not work alone"
            action={{ label: 'See all partners', to: '/partners' }}
          />
          <AsyncSection
            loading={partners.loading}
            label="Loading partners"
            skeleton={<div className="partner-grid partner-grid--md" aria-hidden="true" />}
          >
            <PartnerGrid partners={selected} />
          </AsyncSection>
        </div>
      </section>

      <CtaStrip
        title="Work with CGP"
        body="Explore how we can collaborate to strengthen health security and pandemic intelligence in your region."
        actions={[
          { label: 'Partner With Us', to: '/contact#contact-form', variant: 'white' },
          { label: 'Contact Our Team', to: '/contact', variant: 'white' },
        ]}
      />
    </Layout>
  );
}
