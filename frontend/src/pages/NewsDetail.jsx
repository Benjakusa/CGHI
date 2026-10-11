import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Seo from '../components/Seo';
import ArticleView from '../components/ArticleView';
import { API_BASE } from '../context/AuthContext';
import SmartLink from '../components/SmartLink';
import { FALLBACK_ARTICLES, normaliseArticles } from '../content/insights';

export default function NewsDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    async function loadArticle() {
      try {
        const response = await fetch(`${API_BASE}/api/news/slug/${encodeURIComponent(slug)}`);
        if (response.ok) {
          const data = await response.json();
          if (active) setArticle(data);
          return;
        }
        const listResponse = await fetch(`${API_BASE}/api/news`);
        if (listResponse.ok) {
          const articles = normaliseArticles(await listResponse.json());
          const match = articles.find((item) => item.slug === slug);
          if (match) { if (active) setArticle(match); return; }
        }
        const fallback = normaliseArticles(FALLBACK_ARTICLES).find((item) => item.slug === slug);
        if (fallback) { if (active) setArticle(fallback); return; }
        if (active) setError(true);
      } catch {
        const fallback = normaliseArticles(FALLBACK_ARTICLES).find((item) => item.slug === slug);
        if (active && fallback) setArticle(fallback);
        else if (active) setError(true);
      }
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
        <SmartLink className="news-back" to="/insights">← All news and research</SmartLink></>
        : <p>{error ? 'This article could not be found.' : 'Loading article…'}</p>}
    </main>
  </Layout>;
}
