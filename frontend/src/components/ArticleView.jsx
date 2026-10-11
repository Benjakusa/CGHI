import React from 'react';
import { resolveAssetUrl } from '../context/AuthContext';
import { SITE_URL } from '../config/site';
import { formatDate } from '../content/insights';

function paragraphs(text) {
  return String(text || '').split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
}

export function readTime(blocks = []) {
  const words = blocks.filter((block) => block.block_type !== 'image' && block.type !== 'image')
    .map((block) => block.text || '').join(' ').trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

export function ShareBar({ article, onCopy }) {
  const url = `${SITE_URL}/news/${article.slug || 'preview'}`;
  const encodedUrl = encodeURIComponent(url);
  const title = encodeURIComponent(article.title || 'CGHI article');
  const links = [
    ['X', 'bi-twitter-x', `https://twitter.com/intent/tweet?text=${title}&url=${encodedUrl}`],
    ['Facebook', 'bi-facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`],
    ['LinkedIn', 'bi-linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`],
    ['WhatsApp', 'whatsapp', `https://wa.me/?text=${title}%20${encodedUrl}`],
  ];
  async function copy() {
    if (navigator.share && window.matchMedia('(max-width: 700px)').matches) {
      try { await navigator.share({ title: article.title, url }); } catch { /* user dismissed */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      onCopy?.('Link copied');
    } catch {
      onCopy?.(url);
    }
  }
  return <div className="article-share" aria-label="Share article">
    <span>Share</span>
    {links.map(([label, icon, href]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${label}`} title={label}>{icon === 'whatsapp' ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 2 17.7L.5 23.5l6-1.6A11.8 11.8 0 0 0 20.5 3.5ZM12 21a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.5.9.9-3.4-.2-.4A9.8 9.8 0 1 1 12 21Zm5.4-7.3c-.3-.2-1.7-.9-2-.9s-.5-.2-.7.2-.8.9-1 1.1-.4.2-.7.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.7l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.6s-.7-1.7-1-2.3c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.7 1.2 3.1 1.4 3.3a12 12 0 0 0 4.6 4.1c.6.3 1.1.5 1.5.6.6.2 1.2.2 1.7.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4s-.2-.2-.5-.3Z" /></svg> : <i className={`bi ${icon}`} aria-hidden="true" />}</a>)}
    <button type="button" onClick={copy} aria-label="Copy article link" title="Copy link"><i className="bi bi-link-45deg" aria-hidden="true" /></button>
  </div>;
}

export default function ArticleView({ article, expanded = true, onCopy }) {
  const blocks = article.blocks || [];
  const cover = article.cover_image || article.image_url;
  return <article className={`news-story${expanded ? ' is-open' : ''}`}>
    {cover && !article.hideCover && <figure className="news-cover">
      <img src={resolveAssetUrl(cover)} alt={article.title || ''} loading="lazy" />
      {article.cover_caption && <figcaption>{article.cover_caption}</figcaption>}
    </figure>}
    <div className="news-story-body">
      <p className="news-meta"><span>{article.category || (article.type === 'research' ? 'Research' : 'News')}</span>
        {article.author && <span>{article.author}</span>}
        {article.published_at && <time>{formatDate(article.published_at)}</time>}
        <span>{readTime(blocks)}</span></p>
      <h2>{article.title}</h2>
      {article.excerpt && <p className="news-excerpt">{article.excerpt}</p>}
      {expanded && <div className="news-blocks">
        {blocks.map((block, index) => block.block_type === 'image' || block.type === 'image'
          ? <figure className="news-block-image" key={block.id || index}>
            {block.image_url && <img src={resolveAssetUrl(block.image_url)} alt={block.alt_text || ''} loading="lazy" />}
            {block.caption && <figcaption>{block.caption}</figcaption>}
          </figure>
          : paragraphs(block.text).map((paragraph, paragraphIndex) => <p key={`${block.id || index}-${paragraphIndex}`}>{paragraph}</p>))}
      </div>}
      <ShareBar article={article} onCopy={onCopy} />
    </div>
  </article>;
}
