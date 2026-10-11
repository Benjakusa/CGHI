import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Seo from '../components/Seo';
import ArticleView from '../components/ArticleView';
import { API_BASE } from '../context/AuthContext';
import SmartLink from '../components/SmartLink';

export default function NewsDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/api/news/slug/${encodeURIComponent(slug)}`).then((response) => {
      if (!response.ok) throw new Error('not found');
      return response.json();
    }).then((data) => { if (active) setArticle(data); }).catch(() => { if (active) setError(true); });
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
