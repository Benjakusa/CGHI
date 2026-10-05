/**
 * Leadership & Team.
 *
 * The repository holds no leadership records of any kind, so `LEADERS` in
 * `src/content/leadership.js` is empty and `LEADERSHIP_PENDING` is true.
 * This page renders a complete, designed card template plus a loading
 * skeleton instead of a "content pending" notice.
 *
 * All page content is centre-aligned via the `page--centered` wrapper class.
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
