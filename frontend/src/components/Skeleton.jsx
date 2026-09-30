/**
 * Skeleton loaders and a generic empty state.
 *
 * Every data-backed section (hero, partners, insights, projects, resources)
 * renders a skeleton while its request is in flight. The shapes mirror the
 * real card layout so nothing reflows when the data lands, and the containers
 * are marked `aria-busy` with a polite live region so assistive technology is
 * told the page is still loading.
 */

import React from 'react';
import SmartLink from './SmartLink';

export function Skeleton({ width, height = '1em', radius = 6, className = '' }) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ lines = 3, image = true, className = '' }) {
  return (
    <div className={`skeleton-card ${className}`.trim()} aria-hidden="true">
      {image && <Skeleton width="100%" height="0" className="skeleton-img" />}
      <div className="skeleton-body">
        <Skeleton width="35%" height="0.7em" />
        <Skeleton width="85%" height="1.4em" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} width={`${90 - i * 12}%`} height="0.85em" />
        ))}
      </div>
    </div>
  );
}

/**
 * Wrap async content: announces loading, shows a skeleton, and exposes a
 * retry affordance when the request failed.
 */
export function AsyncSection({
  loading,
  error,
  children,
  skeleton,
  label = 'Loading content',
  onRetry,
}) {
  if (loading) {
    return (
      <div className="async-section" aria-busy="true" aria-live="polite">
        <span className="sr-only">{label}…</span>
        {skeleton}
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state" role="status">
        <i className="bi bi-exclamation-triangle" aria-hidden="true" />
        <p>{error}</p>
        {onRetry && (
          <button type="button" className="btn" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  }

  return children;
}

export function EmptyState({ icon = 'bi-journal-x', title, children, action }) {
  return (
    <div className="empty-state" role="status">
      <i className={`bi ${icon}`} aria-hidden="true" />
      {title && <h3>{title}</h3>}
      {children && <p>{children}</p>}
      {action && (
        <SmartLink className="btn" to={action.to}>
          {action.label}
        </SmartLink>
      )}
    </div>
  );
}
