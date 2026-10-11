import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Seo from '../components/Seo';
import ArticleView from '../components/ArticleView';
import NewsComments from '../components/NewsComments';
import { API_BASE, resolveAssetUrl } from '../context/AuthContext';
import SmartLink from '../components/SmartLink';
import { FALLBACK_ARTICLES, normaliseArticles } from '../content/insights';

function RecommendedArticles({ articles }) {
  if (!articles.length) return null;
  return <section className="news-recommendations" aria-labelledby="news-recommendations-heading">
    <h2 id="news-recommendations-heading">You may also like</h2>
    <div className="news-recommendation-grid">
      {articles.map((item) => <article className="news-recommendation-card" key={item.id}>
        {(item.cover_image || item.image_url) && <img src={resolveAssetUrl(item.cover_image || item.image_url)} alt="" loading="lazy" />}
        <div><h3>{item.title}</h3><SmartLink to={`/news/${item.slug}`}>Read article <span aria-hidden="true">→</span></SmartLink></div>
      </article>)}
    </div>
  </section>;
}

export default function NewsDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setArticle(null);
    setSuggestions([]);
    setError(false);
    async function loadArticle() {
      try {
        const response = await fetch(`${API_BASE}/api/news/slug/${encodeURIComponent(slug)}`);
        if (response.ok) {
          const data = await response.json();
          if (active) setArticle(data);
        } else {
          const listResponse = await fetch(`${API_BASE}/api/news`);
          if (listResponse.ok) {
            const articles = normaliseArticles(await listResponse.json());
            const match = articles.find((item) => item.slug === slug);
            if (match && active) setArticle(match);
            else if (!match) {
              const fallback = normaliseArticles(FALLBACK_ARTICLES).find((item) => item.slug === slug);
              if (fallback && active) setArticle(fallback);
              else if (active) setError(true);
            }
          } else if (active) setError(true);
        }
      } catch {
        const fallback = normaliseArticles(FALLBACK_ARTICLES).find((item) => item.slug === slug);
        if (active && fallback) {
          setArticle(fallback);
        }
        else if (active) setError(true);
      }

      try {
        const listResponse = await fetch(`${API_BASE}/api/news`);
        if (listResponse.ok) {
          const allArticles = normaliseArticles(await listResponse.json());
          if (active) setSuggestions(allArticles.filter((item) => item.slug !== slug).slice(0, 3));
        }
      } catch { /* Recommendations are optional; keep the article readable. */ }
    }
    loadArticle();
    return () => { active = false; };
  }, [slug]);
  useEffect(() => {
    if (!article) return;
    requestAnimationFrame(() => document.getElementById('news-article')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }));
  }, [article]);
  return <Layout navId="insights">
    {article && <Seo title={`${article.title} | CGHI`} description={article.excerpt} path={`/news/${article.slug}`} type="article" image={article.cover_image || article.image_url} imageAlt={article.title} author={article.author} />}
    <main id="news-article" className="news-wrap news-permalink">
      {article ? <><ArticleView article={article} expanded />
        <NewsComments key={article.slug} slug={article.slug} />
        <RecommendedArticles articles={suggestions} />
        <SmartLink className="news-back" to="/insights">← All news and research</SmartLink></>
        : <p>{error ? 'This article could not be found.' : 'Loading article…'}</p>}
    </main>
  </Layout>;
}
