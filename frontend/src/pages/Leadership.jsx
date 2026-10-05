/**
 * Leadership & Team.
 *
 * The repository holds no leadership records of any kind, so `LEADERS` in
 * `src/content/leadership.js` is empty and `LEADERSHIP_PENDING` is true.
 * This page renders a complete, designed card template plus a loading
 * skeleton instead of a "content pending" notice.
 *
 * All page content is centre-aligned via the `page--centered` wrapper class.
 * All required CSS is inlined below so no external stylesheet changes are needed.
 *
 * To go live: populate `LEADERS` (see the shape documented in that file), or
 * add a `leadership` table + admin screen following the pattern used for
 * partners, then flip `LEADERSHIP_PENDING` to false.
 */

import React, { useMemo } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Seo, {
  BASE_JSONLD,
  breadcrumbJsonLd,
  pageJsonLd,
} from "../components/Seo";
import SmartLink from "../components/SmartLink";
import SmartImage from "../components/SmartImage";
import { CtaStrip, SectionHeader } from "../components/cards";
import { BRAND } from "../config/site";
import { PAGE_META } from "../content/navigation";
import {
  EXPERTISE_AREAS,
  LEADERS,
  LEADERSHIP_GROUPS,
  LEADERSHIP_PENDING,
} from "../content/leadership";

const META = PAGE_META["/leadership"];

/* ------------------------------------------------------------------ */
/*  Inlined CSS                                                       */
/* ------------------------------------------------------------------ */

const PAGE_CSS = `
  /* ---------- Centred page layout ---------- */
  .page--centered {
    text-align: center;
  }

  .page--centered h1,
  .page--centered h2,
  .page--centered h3,
  .page--centered h4,
  .page--centered h5,
  .page--centered h6 {
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }

  .page--centered p,
  .page--centered .section-header,
  .page--centered .section-header__lede,
  .page--centered .page-header__dek {
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }

  /* ---------- Chip list ---------- */
  .page--centered .chip-list,
  .chip-list--centered {
    justify-content: center;
    text-align: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0;
    margin: 0.5rem auto;
    list-style: none;
  }

  /* ---------- Leader card body ---------- */
  .page--centered .leader-card-body {
    text-align: center;
    align-items: center;
    display: flex;
    flex-direction: column;
  }

  .page--centered .leader-card-body h3,
  .page--centered .leader-card-body p {
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }

  .page--centered .leader-card-body .chip-list {
    justify-content: center;
  }

  /* ---------- Trailing links ---------- */
  .page--centered .section-trailing-link {
    text-align: center;
  }

  /* ---------- CTA strip ---------- */
  .page--centered .cta-strip {
    text-align: center;
    align-items: center;
  }

  .page--centered .cta-strip__actions {
    justify-content: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  /* ---------- Skeleton card internals ---------- */
  .leader-card--skeleton .leader-card-body {
    text-align: center;
    align-items: center;
    display: flex;
    flex-direction: column;
  }

  .leader-card--skeleton .skeleton-chips {
    justify-content: center;
  }

  /* ---------- Skeleton base styles ---------- */
  .skeleton {
    display: block;
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.06) 25%,
      rgba(0, 0, 0, 0.12) 37%,
      rgba(0, 0, 0, 0.06) 63%
    );
    background-size: 400% 100%;
    animation: skeleton-shimmer 1.4s ease infinite;
    border-radius: 4px;
  }

  .skeleton--line {
    margin: 0 auto 0.5rem;
    border-radius: 4px;
  }

  .skeleton--spaced {
    margin-top: 0.35rem;
  }

  .skeleton--avatar {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
  }

  .skeleton--chip {
    display: inline-block;
    width: 4.5rem;
    height: 1.5rem;
    border-radius: 999px;
    margin: 0.15rem;
  }

  .skeleton-chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.35rem;
    margin: 0.5rem 0;
  }

  @keyframes skeleton-shimmer {
    0%   { background-position: 100% 50%; }
    100% { background-position: 0 50%; }
  }
`;

/* ------------------------------------------------------------------ */
/*  Skeleton primitives                                               */
/* ------------------------------------------------------------------ */

/** A single animated bar, used to fake lines of text. */
function SkeletonLine({ width = "100%", height = "1rem", className = "" }) {
  return (
    <span
      className={`skeleton skeleton--line ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

/** Placeholder card that mirrors the real <LeaderCard> layout. */
function LeaderCardSkeleton() {
  return (
    <article className="leader-card leader-card--skeleton" aria-hidden="true">
      <div className="leader-card-media">
        <div className="skeleton skeleton--avatar" />
      </div>
      <div className="leader-card-body">
        <SkeletonLine width="70%" height="1.25rem" />
        <SkeletonLine
          width="45%"
          height="0.9rem"
          className="skeleton--spaced"
        />
        <div className="skeleton-chips">
          <span className="skeleton skeleton--chip" />
          <span className="skeleton skeleton--chip" />
          <span className="skeleton skeleton--chip" />
        </div>
        <SkeletonLine width="100%" />
        <SkeletonLine width="92%" />
        <SkeletonLine width="60%" />
      </div>
    </article>
  );
}

/** A whole grid of skeleton cards for one leadership group. */
function LeadershipGroupSkeleton({ count = 3 }) {
  return (
    <div className="grid-auto" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <LeaderCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Real leader card (unchanged)                                      */
/* ------------------------------------------------------------------ */

function LeaderCard({ leader }) {
  return (
    <article className="leader-card">
      <div className="leader-card-media">
        <SmartImage
          className="leader-card-photo"
          src={leader.photo}
          alt={`Portrait of ${leader.name}`}
          width="480"
          height="480"
        />
      </div>
      <div className="leader-card-body">
        <h3>{leader.name}</h3>
        <p className="leader-card-position">{leader.position}</p>
        {leader.expertise?.length > 0 && (
          <ul
            className="chip-list chip-list--static"
            aria-label="Areas of expertise"
          >
            {leader.expertise.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        {leader.bio && <p>{leader.bio}</p>}
        {leader.profileUrl && (
          <a
            className="text-link"
            href={leader.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View profile{" "}
            <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
            <span className="sr-only">
              {" "}
              for {leader.name} (opens in a new tab)
            </span>
          </a>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function Leadership() {
  const jsonLd = useMemo(
    () => [
      ...BASE_JSONLD,
      pageJsonLd({
        name: META.title,
        path: "/leadership",
        description: META.description,
      }),
      breadcrumbJsonLd(META.breadcrumb),
    ],
    [],
  );

  const grouped = LEADERSHIP_GROUPS.map((group) => ({
    ...group,
    members: LEADERS.filter((l) => (l.group ?? "executive") === group.id),
  })).filter((group) => group.members.length > 0);

  const isLoading = LEADERSHIP_PENDING || LEADERS.length === 0;

  return (
    <Layout navId="leadership">
      <Seo
        title={META.title}
        description={META.description}
        path="/leadership"
        jsonLd={jsonLd}
      />

      {/* Inlined styles scoped to this page */}
      <style>{PAGE_CSS}</style>

      {/* page--centered applies text-align:center to all descendant text
          and centres flex/grid children where applicable. */}
      <div className="page--centered">
        <PageHeader
          trail={META.breadcrumb}
          eyebrow="Who We Are"
          h1="Leadership & Team"
          dek={`Meet the people behind ${BRAND.abbr}’s work in epidemic intelligence, One Health, preparedness and data science.`}
        />

        {/* ---------- leadership section ---------- */}
        {isLoading ? (
          <section aria-labelledby="leadership-loading-heading">
            <div className="wrap">
              <h2 id="leadership-loading-heading" className="sr-only">
                Loading leadership profiles…
              </h2>

              {LEADERSHIP_GROUPS.map((group) => (
                <div key={group.id} className="leadership-group-skeleton">
                  <SectionHeader
                    id={`skeleton-group-${group.id}`}
                    eyebrow="&nbsp;"
                    title={group.title}
                  />
                  <LeadershipGroupSkeleton
                    count={group.id === "executive" ? 3 : 2}
                  />
                </div>
              ))}

              {LEADERSHIP_GROUPS.length === 0 && (
                <LeadershipGroupSkeleton count={3} />
              )}
            </div>
          </section>
        ) : (
          grouped.map((group) => (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <div className="wrap">
                <SectionHeader
                  id={`group-${group.id}`}
                  eyebrow={`${group.members.length} ${
                    group.members.length === 1 ? "profile" : "profiles"
                  }`}
                  title={group.title}
                />
                <div className="grid-auto">
                  {group.members.map((leader) => (
                    <LeaderCard key={leader.id} leader={leader} />
                  ))}
                </div>
              </div>
            </section>
          ))
        )}

        {/* ---------- expertise section (always real) ---------- */}
        <section
          className="section-surface"
          aria-labelledby="disciplines-heading"
        >
          <div className="wrap">
            <SectionHeader
              id="disciplines-heading"
              eyebrow="Expertise"
              title="Disciplines on our team"
              lede={`${BRAND.abbr} brings together expertise across the following areas.`}
            />
            <ul className="chip-list chip-list--static chip-list--centered">
              {EXPERTISE_AREAS.map((area) => (
                <li key={area.id}>{area.label}</li>
              ))}
            </ul>
            <p className="section-trailing-link">
              <SmartLink className="text-link" to="/careers">
                See current openings{" "}
                <i className="bi bi-arrow-right" aria-hidden="true" />
              </SmartLink>
            </p>
          </div>
        </section>

        <CtaStrip
          title="Want to work with our team?"
          body="We welcome collaborations with researchers, practitioners and institutions."
          actions={[
            {
              label: "Partner With Us",
              to: "/partner-with-us#contact-form",
              variant: "white",
            },
            { label: "Careers", to: "/careers", variant: "white" },
          ]}
        />
      </div>
    </Layout>
  );
}
