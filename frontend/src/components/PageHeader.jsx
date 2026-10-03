/**
 * PageHeader — the standard top-of-page block: breadcrumb trail, H1 and dek.
 *
 * Centralising it means every page gets an identical, correctly ordered heading
 * hierarchy (h1 once, then h2 per section) instead of the nine divergent
 * copies the site had before.
 */

import React from 'react';
import SmartLink from './SmartLink';
import { breadcrumbJsonLd } from './Seo';

export function Breadcrumb({ trail }) {
  if (!trail || trail.length === 0) return null;

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={crumb.to || crumb.label} className="breadcrumb-item">
              {isLast ? (
                <span aria-current="page">{crumb.label}</span>
              ) : (
                <>
                  <SmartLink to={crumb.to}>{crumb.label}</SmartLink>
                  <span className="breadcrumb-sep" aria-hidden="true">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function PageHeader({ eyebrow, h1, dek, trail, kickers, children }) {
  return (
    <div className="page-header">
      <div className="wrap">
        <Breadcrumb trail={trail} />
        {eyebrow && <span className="section-label">{eyebrow}</span>}
        <h1>{h1}</h1>
        {dek && <p className="dek">{dek}</p>}
        {kickers && (
          <ul className="kicker-list">
            {kickers.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        )}
        {children}
      </div>
    </div>
  );
}

export { breadcrumbJsonLd };
