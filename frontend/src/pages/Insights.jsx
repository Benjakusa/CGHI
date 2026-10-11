import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Seo from '../components/Seo';
import ArticleView from '../components/ArticleView';
import useApi from '../hooks/useApi';
import { FALLBACK_ARTICLES, normaliseArticles } from '../content/insights';
import { resolveAssetUrl } from '../context/AuthContext';

export default function Insights() {
  const [params, setParams] = useSearchParams();
  const api = useApi('/api/news', FALLBACK_ARTICLES);
  const [opened, setOpened] = useState(null);
  const [toast, setToast] = useState('');
  const type = params.get('type') || 'all';
  const articles = useMemo(() => {
    const values = api.data?.length ? api.data : FALLBACK_ARTICLES;
    return normaliseArticles(values).slice().sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
  }, [api.data]);
  const categories = useMemo(() => ['all', 'news', 'research', ...new Set(articles.map((a) => a.category).filter(Boolean))], [articles]);
  const list = articles.filter((article) => type === 'all' || article.type === type || article.category?.toLowerCase() === type);
  const toggle = (slug) => {
    setOpened((current) => current === slug ? null : slug);
    if (opened !== slug) window.history.replaceState(null, '', `/news/${slug}`);
    else window.history.replaceState(null, '', '/insights');
  };
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2000); };
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
            <div className="news-lead-cover">{(lead.cover_image || lead.image_url) && <img src={resolveAssetUrl(lead.cover_image || lead.image_url)} alt={lead.title} />}</div>
            <div className="news-lead-info"><ArticleView article={{ ...lead, hideCover: true }} expanded={opened === lead.slug} onCopy={notify} /><button className="news-more" type="button" aria-expanded={opened === lead.slug} onClick={() => toggle(lead.slug)}>{opened === lead.slug ? 'Show less' : 'Read more'}</button></div>
          </div></div> : <div className="news-lead">
            <div className="news-lead-card">
              <div className="news-lead-cover">{(lead.cover_image || lead.image_url) && <img src={resolveAssetUrl(lead.cover_image || lead.image_url)} alt={lead.title} />}</div>
              <div className="news-lead-info">
                <ArticleView article={{ ...lead, hideCover: true }} expanded={opened === lead.slug} onCopy={notify} />
                <button className="news-more" type="button" aria-expanded={opened === lead.slug} onClick={() => toggle(lead.slug)}>{opened === lead.slug ? 'Show less' : 'Read more'}</button>
              </div>
            </div>
          </div>)}
          {list.length > 1 && <div className="news-grid">
            {list.slice(1).map((article) => <div className={`news-card${opened === article.slug ? ' is-expanded' : ''}`} key={article.id}>
              <ArticleView article={article} expanded={opened === article.slug} onCopy={notify} />
              <button className="news-more" type="button" aria-expanded={opened === article.slug} onClick={() => toggle(article.slug)}>{opened === article.slug ? 'Show less' : 'Read more'}</button>
            </div>)}
          </div>}
        </>}
      </div>
      {toast && <div className="news-toast" role="status">{toast}</div>}
    </section>
  </Layout>;
}
