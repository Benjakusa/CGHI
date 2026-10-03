/**
 * Shared card and section primitives.
 *
 * Projects, insights, initiatives, capabilities and partners all rendered
 * bespoke markup duplicated across four or five pages. These components make
 * each of those a single, consistently structured instance, which is what the
 * audit asked for ("consistent card/detail templates").
 */

import React from 'react';
import SmartLink from './SmartLink';
import SmartImage from './SmartImage';
import { CAPABILITY_BY_ID } from '../content/capabilities';
import { INITIATIVE_BY_ID } from '../content/initiatives';
import { PROJECTS_BY_SLUG } from '../content/projects';
import { categoryLabel, formatDate } from '../content/insights';
import { resolveAssetUrl } from '../context/AuthContext';

/* ------------------------------------------------------------------ */
/* Section scaffolding                                                 */
/* ------------------------------------------------------------------ */

export function SectionHeader({ eyebrow, title, lede, align = 'left', action, id }) {
  return (
    <div className={`section-header section-header--${align}`}>
      <div className="section-header-text">
        {eyebrow && <span className="section-label">{eyebrow}</span>}
        <h2 id={id}>{title}</h2>
        {lede && <p className="section-lede">{lede}</p>}
      </div>
      {action && (
        <SmartLink className="text-link section-header-action" to={action.to}>
          {action.label} <i className="bi bi-arrow-right" aria-hidden="true" />
        </SmartLink>
      )}
    </div>
  );
}

export function CtaStrip({ title, body, actions }) {
  if (!title && !actions?.length) return null;
  return (
    <div className="cta-strip">
      <div className="wrap">
        <div className="cta-strip-inner">
          <div>
            {title && <h2>{title}</h2>}
            {body && <p>{body}</p>}
          </div>
          {actions?.length > 0 && (
            <div className="cta-strip-actions">
              {actions.map((action) => (
                <SmartLink
                  key={action.to + action.label}
                  className={action.variant ? `btn-${action.variant}` : 'btn-white'}
                  to={action.to}
                >
                  {action.label}
                </SmartLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Renders a clearly labelled placeholder for a template field that has no
 * approved content yet. Visible on purpose: the audit requires missing content
 * to be obvious rather than invented.
 */
export function PendingField({ label, note }) {
  return (
    <div className="pending-field">
      <span className="pending-field-label">
        <i className="bi bi-pencil-square" aria-hidden="true" />
        {label} — content pending
      </span>
      {note && <p className="pending-field-note">{note}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Capability cards — the five "What We Do" areas                      */
/* ------------------------------------------------------------------ */

export function CapabilityCard({ capability, variant = 'icon' }) {
  return (
    <article className="icon-card" id={capability.id}>
      <div className="card-icon" aria-hidden="true">
        <i className={`bi ${capability.icon}`} />
      </div>
      <h3>
        <SmartLink to="/what-we-do">{capability.title}</SmartLink>
      </h3>
      <p>{capability.summary}</p>
      {variant === 'icon' && (
        <SmartLink className="text-link card-link" to={capability.cta?.to || '/what-we-do'}>
          Learn more <i className="bi bi-arrow-right" aria-hidden="true" />
        </SmartLink>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Project cards                                                       */
/* ------------------------------------------------------------------ */

export function ProjectCard({ project }) {
  const metric = project.metrics?.[0];

  return (
    <article className="project-card">
      <div className="project-card-meta">
        <span className="project-card-tag">{project.tag}</span>
        {project.year && <span className="project-card-year">{project.year}</span>}
      </div>
      <h3>
        <SmartLink to={`/projects/${project.slug}`}>{project.title}</SmartLink>
      </h3>
      <p className="project-card-summary">{project.summary}</p>

      <dl className="project-card-facts">
        <div>
          <dt>Location</dt>
          <dd>{project.location}</dd>
        </div>
        <div>
          <dt>Theme</dt>
          <dd>{project.theme}</dd>
        </div>
      </dl>

      {project.results && (
        <p className="project-card-impact">
          <strong>Impact:</strong> {project.results}
        </p>
      )}
      {metric && !project.results && (
        <p className="project-card-impact">
          <strong>{metric.label}:</strong> {metric.value}
        </p>
      )}

      <SmartLink className="text-link card-link" to={`/projects/${project.slug}`}>
        Learn more <i className="bi bi-arrow-right" aria-hidden="true" />
      </SmartLink>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Initiative cards                                                    */
/* ------------------------------------------------------------------ */

export function InitiativeCard({ initiative }) {
  return (
    <article className="initiative-card" id={initiative.id}>
      <div className="initiative-card-head">
        <span className="initiative-icon" aria-hidden="true">
          <i className={`bi ${initiative.icon}`} />
        </span>
        <div>
          <span className="initiative-label">{initiative.label}</span>
          <h3>
            <SmartLink to="/initiatives">{initiative.title}</SmartLink>
          </h3>
        </div>
      </div>
      <p>{initiative.summary}</p>
      {initiative.location && (
        <p className="initiative-location">
          <i className="bi bi-geo-alt" aria-hidden="true" /> {initiative.location}
        </p>
      )}
      <SmartLink className="text-link card-link" to={`/initiatives#${initiative.id}`}>
        Learn more <i className="bi bi-arrow-right" aria-hidden="true" />
      </SmartLink>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Insight cards                                                       */
/* ------------------------------------------------------------------ */

export function InsightCard({ article }) {
  const to = `/insights/${article.slug}`;
  const date = formatDate(article.published_at);
  const image = article.image_url;

  return (
    <article className="article-card">
      {image ? (
        <SmartLink className="article-card-media" to={to} tabIndex={-1} aria-hidden="true">
          <SmartImage
            className="article-card-img"
            src={resolveAssetUrl(image)}
            alt=""
            width="640"
            height="360"
          />
        </SmartLink>
      ) : (
        <div className="article-card-media article-card-media--empty" aria-hidden="true">
          <i className="bi bi-journal-text" />
        </div>
      )}

      <div className="article-card-body">
        <p className="article-meta">
          <span className="pill">{categoryLabel(article.category)}</span>
          {date && (
            <time dateTime={article.isoPublished || undefined}>{date}</time>
          )}
        </p>
        <h3>
          <SmartLink to={to}>{article.title}</SmartLink>
        </h3>
        <p>{article.excerpt}</p>
        <SmartLink className="text-link card-link" to={to}>
          Read more <i className="bi bi-arrow-right" aria-hidden="true" />
        </SmartLink>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Partners                                                            */
/* ------------------------------------------------------------------ */

/**
 * Partner logo wall. Every tile reserves the same box so a mix of wide and
 * square logos still renders as a tidy grid, and a partner without a website
 * renders as non-interactive text rather than a dead link.
 */
export function PartnerGrid({ partners, size = 'md' }) {
  return (
    <ul className={`partner-grid partner-grid--${size}`}>
      {partners.map((partner) => {
        const logo = partner.logo_url ? resolveAssetUrl(partner.logo_url) : null;
        const name = partner.name;
        const inner = (
          <>
            <span className="partner-card-logo">
              {logo ? (
                <SmartImage src={logo} alt="" width="200" height="80" />
              ) : (
                <span className="partner-initials" aria-hidden="true">
                  {name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')}
                </span>
              )}
            </span>
            <span className="partner-card-name">{name}</span>
          </>
        );

        return (
          <li key={partner.id ?? partner.name} className="partner-tile">
            {partner.website ? (
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                title={name}
              >
                {inner}
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              <span className="partner-tile-static">{inner}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Cross-reference helpers                                             */
/* ------------------------------------------------------------------ */

export function CapabilityChips({ ids }) {
  if (!ids || ids.length === 0) return null;
  return (
    <ul className="chip-list" aria-label="Related areas of work">
      {ids.map((id) => {
        const capability = CAPABILITY_BY_ID[id];
        if (!capability) return null;
        return (
          <li key={id}>
            <SmartLink to={`/what-we-do#${id}`}>{capability.title}</SmartLink>
          </li>
        );
      })}
    </ul>
  );
}

export function InitiativeChips({ ids }) {
  if (!ids || ids.length === 0) return null;
  return (
    <ul className="chip-list" aria-label="Related initiatives">
      {ids.map((id) => {
        const initiative = INITIATIVE_BY_ID[id];
        if (!initiative) return null;
        return (
          <li key={id}>
            <SmartLink to={`/initiatives#${id}`}>{initiative.title}</SmartLink>
          </li>
        );
      })}
    </ul>
  );
}

export function ProjectChips({ ids }) {
  if (!ids || ids.length === 0) return null;
  return (
    <ul className="chip-list" aria-label="Related projects">
      {ids.map((id) => {
        const project = PROJECTS_BY_SLUG[id];
        if (!project) return null;
        return (
          <li key={id}>
            <SmartLink to={`/projects/${project.slug}`}>{project.title}</SmartLink>
          </li>
        );
      })}
    </ul>
  );
}
