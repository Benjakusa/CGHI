import React, { useEffect, useState } from 'react';
import { API_BASE } from '../context/AuthContext';

function displayDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function NewsComments({ slug }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`${API_BASE}/api/news/slug/${encodeURIComponent(slug)}/comments`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load comments.');
        if (active) setComments(Array.isArray(data) ? data : []);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Could not load comments.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [slug]);

  async function submitComment(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/news/slug/${encodeURIComponent(slug)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, comment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not post your comment.');
      setComments((current) => [...current, data]);
      setName('');
      setComment('');
    } catch (submitError) {
      setError(submitError.message || 'Could not post your comment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="news-comments" aria-labelledby="news-comments-heading">
      <h2 id="news-comments-heading">Comments</h2>
      {loading ? <p>Loading comments…</p> : comments.length === 0 ? <p>No comments yet. Start the conversation.</p> : (
        <ol className="news-comment-list">
          {comments.map((item) => (
            <li className="news-comment" key={item.id}>
              <div className="news-comment-meta">
                <strong>{item.name}</strong>
                <time dateTime={item.created_at}>{displayDate(item.created_at)}</time>
              </div>
              <p>{item.comment}</p>
            </li>
          ))}
        </ol>
      )}
      <form className="news-comment-form" onSubmit={submitComment}>
        <h3>Leave a comment</h3>
        <label htmlFor="news-comment-name">Name</label>
        <input id="news-comment-name" name="name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required />
        <label htmlFor="news-comment-text">Comment</label>
        <textarea id="news-comment-text" name="comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} rows={5} required />
        {error && <p className="news-comment-error" role="alert">{error}</p>}
        <button className="news-more" type="submit" disabled={submitting}>
          {submitting ? 'Posting…' : 'Post comment'}
        </button>
      </form>
    </section>
  );
}
