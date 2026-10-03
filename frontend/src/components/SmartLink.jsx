/**
 * SmartLink — internal routes go through the router (no full page reload,
 * keeps focus and scroll behaviour under the app's control); external and
 * file URLs render as plain anchors with safe `rel` attributes.
 *
 * This is what replaced the ~20 hard-coded `<a href="/…">` tags that were
 * forcing a full document reload on every internal navigation.
 *
 * Decision table:
 *   https://… / http://…  -> anchor, new tab
 *   mailto: / tel:         -> anchor, same tab
 *   /path#hash             -> router <Link>   (hash is preserved by react-router)
 *   #anchor                -> anchor          (no navigation to do)
 *   /file.pdf              -> anchor          (a real document, not a SPA route)
 *   anything else          -> router <Link>
 */

import React from 'react';
import { Link } from 'react-router-dom';

const EXTERNAL = /^(https?:)?\/\//i;
const PROTOCOL = /^(mailto:|tel:|sms:)/i;
/** A site-relative path that is a document rather than an app route. */
const DOCUMENT_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|csv|xlsx?)($|\?)/i;

/** Routes that are served as static files rather than by the router. */
const STATIC_PATHS = [/^\/downloads\//, /^\/assets\//i, /^\/og\//];

function isDocumentPath(path) {
  return DOCUMENT_EXT.test(path) || STATIC_PATHS.some((re) => re.test(path));
}

export default function SmartLink({
  to,
  href,
  children,
  className,
  onClick,
  ...rest
}) {
  const target = to ?? href ?? '/';

  if (EXTERNAL.test(target)) {
    return (
      <a
        href={target}
        className={className}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }

  if (PROTOCOL.test(target)) {
    return (
      <a href={target} className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  // In-page anchor: nothing to route, a plain anchor is correct and fast.
  if (target.startsWith('#')) {
    return (
      <a href={target} className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  // Documents and static assets must bypass the router so the browser
  // handles the download/navigation rather than the SPA catching it.
  if (isDocumentPath(target.split('#')[0].split('?')[0])) {
    return (
      <a href={target} className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link to={target} className={className} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
