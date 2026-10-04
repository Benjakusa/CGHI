/**
 * What We Do.
 *
 * Renders the same five capability definitions the homepage uses, in full,
 * as a list of addressable sections. Each capability links to the projects and
 * initiatives that demonstrate it, so the page is a hub rather than a wall of
 * prose — that was the audit's "text-heavy sections" finding.
 */

import React, { useMemo } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Seo, {
  BASE_JSONLD,
  breadcrumbJsonLd,
  itemListJsonLd,
  pageJsonLd,
} from "../components/Seo";
import SmartLink from "../components/SmartLink";
import {
  CtaStrip,
  InitiativeChips,
  ProjectChips,
  SectionHeader,
} from "../components/cards";
import { GLANCE } from "../content/impact";
import { PAGE_META } from "../content/navigation";
import { CAPABILITIES } from "../content/capabilities";

const META = PAGE_META["/what-we-do"];

/** Headline counters. Only verified figures are shown. */
const HEADLINE = GLANCE.filter((f) =>
  ["capabilities", "financing", "response-time", "initiatives"].includes(f.id),
);

export default function WhatWeDo() {
  const jsonLd = useMemo(
    () => [
      ...BASE_JSONLD,
      pageJsonLd({
        name: META.title,
        path: "/what-we-do",
        description: META.description,
      }),
      breadcrumbJsonLd(META.breadcrumb),
      itemListJsonLd(
        "Areas of expertise",
        CAPABILITIES.map((c) => ({ name: c.title, to: "/what-we-do" })),
      ),
    ],
    [],
  );

  return (
    <Layout navId="what-we-do">
      <Seo
        title={META.title}
        description={META.description}
        path="/what-we-do"
        jsonLd={jsonLd}
      />

      <PageHeader
        trail={META.breadcrumb}
        h1="What We Do"
        dek="CGP strengthens global health security and IHR compliance, integrates One Health data streams for early warning, builds AI-driven outbreak forecasting, and equips frontline responders with real-time tools and training."
        kickers={CAPABILITIES.map((c) => c.short)}
      />

      {/* ---------------- Headline figures ---------------- */}
      <section
        className="section-tight section-surface"
        aria-label="CGP at a glance"
      >
        <div className="wrap">
          <div className="stat-strip">
            {HEADLINE.map((figure) => (
              <div className="stat-strip-cell" key={figure.id}>
                <span className="stat-strip-num">{figure.display}</span>
                <span className="stat-strip-lbl">{figure.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Five capabilities — graphical card flow ---------------- */}
      <section
        className="wwd-capabilities"
        aria-labelledby="capabilities-heading"
      >
        <div className="wwd-capabilities-inner">
          <header className="wwd-capabilities-head">
            <span className="wwd-eyebrow">Five Areas</span>
            <h2 id="capabilities-heading" className="wwd-title">
              Technical capabilities
            </h2>
            <p className="wwd-lede">
              Five interconnected areas of expertise, each linked to the
              projects and initiatives that put it into practice.
            </p>
          </header>

          <div className="wwd-flow">
            {CAPABILITIES.map((capability, index) => (
              <React.Fragment key={capability.id}>
                <article
                  id={capability.id}
                  className="wwd-card"
                  aria-labelledby={`${capability.id}-title`}
                >
                  <div className="wwd-card-grid">
                    <div className="wwd-card-visual">
                      <div className="wwd-card-icon-wrap">
                        <i
                          className={`bi ${capability.icon}`}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="wwd-card-step" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="wwd-card-tag">{capability.tag}</span>
                    </div>

                    <div className="wwd-card-content">
                      <h3
                        id={`${capability.id}-title`}
                        className="wwd-card-title"
                      >
                        {capability.title}
                      </h3>
                      <p className="wwd-card-summary">{capability.summary}</p>
                      {capability.body.map((paragraph) => (
                        <p
                          key={paragraph.slice(0, 40)}
                          className="wwd-card-body"
                        >
                          {paragraph}
                        </p>
                      ))}

                      {capability.cta && (
                        <div className="wwd-card-cta">
                          <SmartLink
                            className="wwd-inline-link"
                            to={capability.cta.to}
                          >
                            {capability.cta.label}
                            <i
                              className="bi bi-arrow-right"
                              aria-hidden="true"
                            />
                          </SmartLink>
                        </div>
                      )}

                      <div className="wwd-card-refs">
                        <ProjectChips ids={capability.relatedProjects} />
                        <InitiativeChips ids={capability.relatedInitiatives} />
                      </div>
                    </div>
                  </div>
                </article>

                {index < CAPABILITIES.length - 1 && (
                  <div className="wwd-arrow" aria-hidden="true">
                    <span className="wwd-arrow-line" />
                    <span className="wwd-arrow-head">
                      <i className="bi bi-chevron-down" />
                      <i className="bi bi-chevron-down wwd-arrow-head-2" />
                    </span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Approach summary ---------------- */}
      <section
        className="section-surface-alt"
        aria-labelledby="related-heading"
      >
        <div className="wrap">
          <SectionHeader
            id="related-heading"
            align="center"
            eyebrow="See it in practice"
            title="Explore CGP’s work"
            lede="Capabilities only matter when they change outcomes. See where each one is applied."
          />
          <div className="grid-auto">
            <article className="icon-card">
              <div className="card-icon" aria-hidden="true">
                <i className="bi bi-kanban-fill" />
              </div>
              <h3>Projects &amp; Impact</h3>
              <p>
                Outcome-led summaries of CGP’s project record across Kenya and
                the region.
              </p>
              <SmartLink className="text-link card-link" to="/projects">
                Explore Our Projects{" "}
                <i className="bi bi-arrow-right" aria-hidden="true" />
              </SmartLink>
            </article>
            <article className="icon-card">
              <div className="card-icon" aria-hidden="true">
                <i className="bi bi-broadcast-pin" />
              </div>
              <h3>CGP Initiatives</h3>
              <p>
                Six active programmes putting epidemic intelligence into
                practice subnationally.
              </p>
              <SmartLink className="text-link card-link" to="/initiatives">
                View initiatives{" "}
                <i className="bi bi-arrow-right" aria-hidden="true" />
              </SmartLink>
            </article>
            <article className="icon-card">
              <div className="card-icon" aria-hidden="true">
                <i className="bi bi-journal-richtext" />
              </div>
              <h3>Media Insights and Research</h3>
              <p>
                Research, policy and field updates from the CGP team and its
                partners.
              </p>
              <SmartLink className="text-link card-link" to="/insights">
                Read the Research{" "}
                <i className="bi bi-arrow-right" aria-hidden="true" />
              </SmartLink>
            </article>
          </div>
        </div>
      </section>

      <CtaStrip
        title="Explore CGP's projects & initiatives"
        body="See CGP's capabilities in action through our project record and subnational programmes."
        actions={[
          { label: "Explore Our Projects", to: "/projects", variant: "white" },
          { label: "CGP Initiatives", to: "/initiatives", variant: "white" },
        ]}
      />

      <style>{`
        /* ============================================================
           FIVE AREAS — graphical, centred, sky-blue / black / white only
           ============================================================ */
        .wwd-capabilities {
          position: relative;
          padding: 5.5rem 1.25rem 6rem;
          background: #ffffff;
          overflow: hidden;
          color: #000000;
        }
        .wwd-capabilities::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(135, 206, 235, 0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(135, 206, 235, 0.18) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(circle at 50% 30%, #000 0%, transparent 78%);
          -webkit-mask-image: radial-gradient(circle at 50% 30%, #000 0%, transparent 78%);
          pointer-events: none;
        }
        .wwd-capabilities-inner {
          position: relative;
          max-width: 1080px;
          margin: 0 auto;
        }

        /* ---------- Header (centred) ---------- */
        /* Typography here comes from the shared --fs-* scale so this page
           matches every other route. It previously ran its own fluid scale
           inside this <style> block (a clamp() title, 3.6rem step numerals,
           1.35rem card titles), which is what made What We Do read as a
           different, louder site from the rest. */
        .wwd-capabilities-head {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 3.5rem;
        }
        .wwd-eyebrow {
          display: inline-block;
          font-size: var(--fs-caption);
          font-weight: var(--fw-semibold);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #000000;
          padding: 0.35rem 0.9rem;
          border: 1px solid #000000;
          border-radius: 999px;
          background: skyblue;
          margin-bottom: 1rem;
        }
        .wwd-title {
          font-size: var(--fs-h2);
          font-weight: var(--fw-semibold);
          line-height: 1.25;
          margin: 0 0 0.85rem;
          color: #000000;
        }
        .wwd-lede {
          font-size: var(--fs-lead);
          line-height: 1.6;
          color: #000000;
          margin: 0;
        }

        /* ---------- Flow / connectors ---------- */
        .wwd-flow {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        .wwd-arrow {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 72px;
          position: relative;
          z-index: 1;
        }
        .wwd-arrow-line {
          width: 3px;
          flex: 1;
          background: #000000;
          border-radius: 2px;
        }
        .wwd-arrow-head {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #000000;
          font-size: 1.1rem;
          line-height: 0.4;
        }
        .wwd-arrow-head .bi {
          animation: wwd-bounce 1.8s ease-in-out infinite;
        }
        .wwd-arrow-head-2 {
          margin-top: -0.55rem;
          opacity: 0.55;
          animation-delay: 0.25s !important;
        }
        @keyframes wwd-bounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50%      { transform: translateY(4px); opacity: 0.6; }
        }

        /* ---------- Cards (white with sky-blue accents) ---------- */
        .wwd-card {
          width: 100%;
          border-radius: 20px;
          padding: 2rem 2rem 2rem;
          background: #ffffff;
          border: 1px solid #000000;
          border-left: 5px solid skyblue;
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.06),
            0 18px 40px -24px rgba(0, 0, 0, 0.4);
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .wwd-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.08),
            0 28px 56px -24px rgba(0, 0, 0, 0.5);
        }

        .wwd-card-grid {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 2rem;
          align-items: start;
        }

        /* ---------- Visual column ---------- */
        .wwd-card-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.9rem;
          position: relative;
        }
        .wwd-card-icon-wrap {
          width: 92px;
          height: 92px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: skyblue;
          color: #000000;
          font-size: 2.35rem;
          border: 2px solid #000000;
          box-shadow: 0 12px 24px -12px rgba(0, 0, 0, 0.5);
        }
        .wwd-card-step {
          /* Was 3.6rem/800 — by far the largest text on the site. Now a stat
             numeral like every other figure in the system. */
          font-size: var(--fs-stat);
          font-weight: var(--fw-bold);
          line-height: 1;
          color: skyblue;
          letter-spacing: -0.02em;
          margin-top: -0.25rem;
        }
        .wwd-card-tag {
          display: inline-block;
          font-size: var(--fs-caption);
          font-weight: var(--fw-semibold);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.3rem 0.75rem;
          border-radius: 999px;
          background: #ffffff;
          color: #000000;
          border: 1px solid #000000;
          text-align: center;
        }

        /* ---------- Content column ---------- */
        .wwd-card-content {
          min-width: 0;
        }
        .wwd-card-title {
          font-size: var(--fs-h3);
          line-height: 1.3;
          margin: 0 0 0.65rem;
          color: #000000;
        }
        .wwd-card-summary {
          font-size: var(--fs-body);
          line-height: 1.6;
          color: #000000;
          margin: 0 0 0.85rem;
        }
        .wwd-card-body {
          font-size: var(--fs-small);
          line-height: 1.6;
          color: #000000;
          margin: 0 0 0.75rem;
        }
        .wwd-card-cta {
          margin: 0.5rem 0 1rem;
        }
        .wwd-inline-link {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-weight: var(--fw-semibold);
          font-size: var(--fs-small);
          color: #000000;
          text-decoration: none;
          border-bottom: 2px solid skyblue;
          transition: gap 0.25s ease, background 0.25s ease;
          padding-bottom: 2px;
        }
        .wwd-inline-link:hover {
          gap: 0.7rem;
          background: skyblue;
        }
        .wwd-card-refs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          padding-top: 1rem;
          border-top: 1px dashed #000000;
        }

        /* ---------- Responsive ---------- */
        @media (max-width: 720px) {
          .wwd-capabilities {
            padding: 3.5rem 1rem 4rem;
          }
          .wwd-card {
            padding: 1.5rem 1.25rem;
          }
          .wwd-card-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
          .wwd-card-visual {
            flex-direction: row;
            justify-content: flex-start;
            gap: 1rem;
          }
          .wwd-card-step {
            /* Same stat token as the desktop rule; the breakpoint only changes
               the margin, so the numeral cannot shrink away from the scale. */
            font-size: var(--fs-stat);
            margin-top: 0;
          }
          .wwd-arrow {
            height: 52px;
          }
        }
      `}</style>
    </Layout>
  );
}
