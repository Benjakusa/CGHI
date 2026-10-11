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
    ['X', `https://twitter.com/intent/tweet?text=${title}&url=${encodedUrl}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`],
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`],
    ['WhatsApp', `https://wa.me/?text=${title}%20${encodedUrl}`],
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
    {links.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>)}
    <button type="button" onClick={copy}>Copy link</button>
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
