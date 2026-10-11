import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Seo from '../components/Seo';
import { ShareBar } from '../components/ArticleView';
import SmartLink from '../components/SmartLink';
import useApi from '../hooks/useApi';
import { FALLBACK_ARTICLES, normaliseArticles } from '../content/insights';
import { resolveAssetUrl } from '../context/AuthContext';

function NewsCard({ article }) {
  return <article className="news-story">
    {(article.cover_image || article.image_url) && <div className="news-cover"><img src={resolveAssetUrl(article.cover_image || article.image_url)} alt={article.title} loading="lazy" /></div>}
    <div className="news-story-body">
      <p className="news-meta"><span>{article.category || (article.type === 'research' ? 'Research' : 'News')}</span>{article.author && <span>{article.author}</span>}{article.published_at && <time>{new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time>}</p>
      <h2>{article.title}</h2>{article.excerpt && <p className="news-excerpt">{article.excerpt}</p>}
      <div className="news-card-actions"><SmartLink className="news-more" to={`/news/${article.slug}`}>Read more</SmartLink><ShareBar article={article} /></div>
    </div>
  </article>;
}

export default function Insights() {
  const [params, setParams] = useSearchParams();
  const api = useApi('/api/news', FALLBACK_ARTICLES);
  const type = params.get('type') || 'all';
  const articles = useMemo(() => {
    const values = api.data?.length ? api.data : FALLBACK_ARTICLES;
    return normaliseArticles(values).slice().sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
  }, [api.data]);
  const categories = useMemo(() => ['all', 'news', 'research', ...new Set(articles.map((a) => a.category).filter(Boolean))], [articles]);
  const list = articles.filter((article) => type === 'all' || article.type === type || article.category?.toLowerCase() === type);
  const lead = list[0];
  return <Layout navId="insights">
    <Seo title="News & Research | CGHI" description="Latest news, research, analysis and field reports from CGHI." path="/insights" />
    <section className="news-page" aria-labelledby="news-heading">
      <div className="news-heading"><div className="news-wrap">
        <h1 id="news-heading">News &amp; Research</h1>
        <p>Latest news, analysis and field reports from across global health.</p>
        <nav className="news-tabs" aria-label="News type and categories">
          {categories.map((category, index) => <button key={`${category}-${index}`} type="button" aria-pressed={type === category}
            onClick={() => { setParams(category === 'all' ? {} : { type: category }, { replace: true }); setOpened(null); }}>
            {category === 'all' ? 'All' : category.replace(/\b\w/g, (char) => char.toUpperCase())}
          </button>)}
        </nav>
      </div></div>
      <div className="news-wrap news-feed">
        {list.length === 0 ? <p>No articles are available in this category yet.</p> : <>
          {lead && (list.length === 1 ? <div className="news-lead"><div className="news-lead-card">
            <div className="news-lead-cover">{(lead.cover_image || lead.image_url) && <img src={resolveAssetUrl(lead.cover_image || lead.image_url)} alt={lead.title} loading="lazy" />}</div>
            <div className="news-lead-info"><NewsCard article={lead} /></div>
          </div></div> : <div className="news-lead">
            <div className="news-lead-card">
              <div className="news-lead-cover">{(lead.cover_image || lead.image_url) && <img src={resolveAssetUrl(lead.cover_image || lead.image_url)} alt={lead.title} loading="lazy" />}</div>
              <div className="news-lead-info"><NewsCard article={lead} /></div>
            </div>
          </div>)}
          {list.length > 1 && <div className="news-grid">
            {list.slice(1).map((article) => <div className="news-card" key={article.id}><NewsCard article={article} /></div>)}
          </div>}
        </>}
      </div>
    </section>
  </Layout>;
}
