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

      {/* ---------------- Five capabilities — restyled graphical section ---------------- */}
      <section
        aria-labelledby="capabilities-heading"
        className="capabilities-graphical"
      >
        <div className="wrap">
          <div className="capabilities-intro">
            <SectionHeader
              id="capabilities-heading"
              align="center"
              eyebrow="Five Areas"
              title="Technical capabilities"
              lede="Five interconnected areas of expertise, each linked to the projects and initiatives that put it into practice."
            />
          </div>

          <div className="capability-flow">
            {CAPABILITIES.map((capability, index) => (
              <React.Fragment key={capability.id}>
                <article
                  className="capability-node"
                  id={capability.id}
                  aria-labelledby={`${capability.id}-title`}
                >
                  <div className="capability-node-graphic">
                    <div className="capability-node-icon">
                      <i
                        className={`bi ${capability.icon}`}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="capability-node-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="capability-node-body">
                    <span className="pill">{capability.tag}</span>
                    <h3 id={`${capability.id}-title`}>{capability.title}</h3>
                    <p className="lead">{capability.summary}</p>
                    {capability.body.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                    ))}

                    <div className="capability-node-links">
                      {capability.cta && (
                        <SmartLink className="text-link" to={capability.cta.to}>
                          {capability.cta.label}{" "}
                          <i className="bi bi-arrow-right" aria-hidden="true" />
                        </SmartLink>
                      )}
                    </div>

                    <div className="capability-node-refs">
                      <ProjectChips ids={capability.relatedProjects} />
                      <InitiativeChips ids={capability.relatedInitiatives} />
                    </div>
                  </div>
                </article>

                {index < CAPABILITIES.length - 1 && (
                  <div className="capability-connector" aria-hidden="true">
                    <span className="connector-line" />
                    <i className="bi bi-chevron-double-down connector-arrow" />
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
            <article className="icon-card">
              <div className="card-icon" aria-hidden="true">
                <i className="bi bi-people-fill" />
              </div>
              <h3>Partners</h3>
              <p>
                The ministries, institutes and agencies CGP delivers this work
                with.
              </p>
              <SmartLink className="text-link card-link" to="/partners">
                Meet our partners{" "}
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
    </Layout>
  );
}
