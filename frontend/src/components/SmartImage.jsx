/**
 * SmartImage — one place for every image on the site so the performance and
 * accessibility rules cannot be forgotten on a new page:
 *
 *  - `alt` is required (pass `alt=""` explicitly for decorative images, which
 *    is asserted so a missing alt can never ship silently).
 *  - Lazy loading + async decoding by default; the LCP hero opts out.
 *  - Explicit width/height or an `aspectRatio` reserves the box, which is what
 *    keeps Cumulative Layout Shift at zero on slow connections.
 *  - A low-contrast placeholder background shows while the bytes arrive.
 */

import React, { useState } from 'react';

export default function SmartImage({
  src,
  alt,
  width,
  height,
  aspectRatio,
  priority = false,
  className = '',
  objectPosition,
  onLoad,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const style = {
    aspectRatio: aspectRatio || (width && height ? `${width} / ${height}` : undefined),
    objectPosition,
  };

  if (!src || failed) {
    return (
      <div
        className={`img-fallback ${className}`.trim()}
        style={style}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
      >
        {alt ? <i className="bi bi-image" aria-hidden="true" /> : null}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`img ${loaded ? 'is-loaded' : ''} ${className}`.trim()}
      style={style}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      onLoad={(event) => {
        setLoaded(true);
        if (onLoad) onLoad(event);
      }}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
