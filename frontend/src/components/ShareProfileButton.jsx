import React, { useState } from 'react';

export default function ShareProfileButton({ name, url, compact = false }) {
  const [status, setStatus] = useState('');
  const share = async () => {
    const profileUrl = new URL(url, window.location.origin).href;
    try {
      if (navigator.share) await navigator.share({ title: `${name} | CGHI`, url: profileUrl });
      else {
        await navigator.clipboard.writeText(profileUrl);
        setStatus('Profile link copied');
        window.setTimeout(() => setStatus(''), 2500);
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setStatus('Could not share profile');
    }
  };

  return <span className={`team-share-control${compact ? ' is-compact' : ''}`}>
    <button className="team-profile-share" type="button" onClick={share} aria-label={`Share ${name}'s profile`} title="Share profile">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <path d="m8.7 10.6 6.6-4.2M8.7 13.4l6.6 4.2" />
      </svg>
    </button>
    <span className="team-profile-share-status" role="status" aria-live="polite">{status}</span>
  </span>;
}
