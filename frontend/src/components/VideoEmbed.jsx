/**
 * Click-to-load video embed ("facade").
 *
 * Why this exists: dropping a `<iframe src="youtube.com/embed/…">` straight
 * into the page costs roughly 870KB of third-party JavaScript and CSS before
 * a visitor has pressed play, plus the Roboto webfont the player pulls in for
 * its own controls. On the homepage that embed sat above the fold, so it was
 * the largest single contributor to both transfer weight and total blocking
 * time. `loading="lazy"` does not help: an iframe in view is never lazy.
 *
 * A facade inverts the cost. Nothing third-party is requested until the
 * visitor asks for the video. The `<iframe>` is mounted on click, and the
 * YouTube URL carries `autoplay=1` so pressing play actually starts the video
 * rather than making the visitor press play twice.
 *
 * Accessibility notes:
 *  - The placeholder is a real `<button>`, so it is reachable by keyboard and
 *    announced as a control. It is not a click handler on a `<div>`.
 *  - The button carries the video's title, so the accessible name describes
 *    what will happen rather than reading "Play".
 *  - The reserved box uses `aspect-ratio`, so nothing shifts when the iframe
 *    replaces it (CLS stays 0).
 *  - Nothing is announced on swap: the iframe has `title`, and moving focus
 *    into a third-party player on click is disorienting.
 */

import React, { useId, useState } from 'react';

export default function VideoEmbed({
  /** YouTube video id, e.g. 'SxFaJhnb4Qw'. */
  videoId,
  title,
  caption,
  className = '',
}) {
  const [activated, setActivated] = useState(false);
  const headingId = useId();

  if (!videoId) return null;

  const src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;

  if (activated) {
    return (
      <figure className={`frame-figure frame-figure--video ${className}`.trim()}>
        <div className="frame-figure-media">
          <iframe
            src={src}
            title={title}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
    );
  }

  return (
    <figure className={`frame-figure frame-figure--video ${className}`.trim()}>
      <div className="frame-figure-media">
        <button
          type="button"
          className="video-facade"
          onClick={() => setActivated(true)}
          aria-describedby={headingId}
        >
          <span className="video-facade-play" aria-hidden="true">
            <i className="bi bi-play-fill" />
          </span>
          <span className="video-facade-label" id={headingId}>
            <span className="video-facade-eyebrow">Watch the film</span>
            <span className="video-facade-title">{title}</span>
          </span>
          <span className="sr-only">
            — loads the video from YouTube, about 870KB
          </span>
        </button>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}