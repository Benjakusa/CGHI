/**
 * Insight article — /insights/:slug
 *
 * Every article now has its own indexable URL, replacing the old
 * `/news?article=<id>` query-string link that search engines could not index.
 * `/news?article=<id>` still works and redirects here (see App.jsx).
 */

import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Seo, {
  BASE_JSONLD,
  articleJsonLd,
  breadcrumbJsonLd,
  pageJsonLd,
} from '../components/Seo';
import SmartLink from '../components/SmartLink';
import SmartImage from '../components/SmartImage';
import { CtaStrip, InsightCard, SectionHeader } from '../components/cards';
import { EmptyState, SkeletonCard } from '../components/Skeleton';
import useApi from '../hooks/useApi';
import { resolveAssetUrl } from '../context/AuthContext';
import { BRAND, DEFAULT_OG_IMAGE } from '../config/site';
import { PAGE_META } from '../content/navigation';
import {
  FALLBACK_ARTICLES,
  articleSlug,
  categoryLabel,
  formatDate,
  isoDate,
  normaliseCategory,
} from '../content/insights';

const META = PAGE_META['/insights'];

function ArticleBody({ article, all }) {
  const related = useMemo(
    () =>
      all
        .filter((a) => a.id !== article.id)
        .sort((a) => (a.category === article.category ? -1 : 1))
        .slice(0, 3),
    [all, article.id, article.category]
  );

  const displayDate = formatDate(article.published_at);
  const image = article.image_url;

  return (
    <Layout navId="insights">
      <Seo
        title={`${article.title} | ${BRAND.name}`}
        description={article.excerpt}
        path={`/insights/${article.slug}`}
        type="article"
        image={image ? resolveAssetUrl(image) : DEFAULT_OG_IMAGE}
        imageAlt={article.title}
        publishedTime={article.isoPublished || undefined}
          modifiedTime={article.isoModified || undefined}
        author={article.author || BRAND.name}
        jsonLd={[
          ...BASE_JSONLD,
          pageJsonLd({
            name: article.title,
            path: `/insights/${article.slug}`,
            description: article.excerpt,
          }),
          breadcrumbJsonLd([
            ...META.breadcrumb,
            { label: article.title, to: `/insights/${article.slug}` },
          ]),
          articleJsonLd({ ...article, path: `/insights/${article.slug}` }),
        ]}
      />

      <article>
        <header className="page-header">
          <div className="wrap">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol className="breadcrumb-list">
                <li className="breadcrumb-item">
                  <SmartLink to="/">Home</SmartLink>
                  <span className="breadcrumb-sep" aria-hidden="true">/</span>
                </li>
                <li className="breadcrumb-item">
                  <SmartLink to="/insights">Insights &amp; Research</SmartLink>
                  <span className="breadcrumb-sep" aria-hidden="true">/</span>
                </li>
                <li className="breadcrumb-item">
                  <span aria-current="page">{article.title}</span>
                </li>
              </ol>
            </nav>

            <p className="article-meta">
              <span className="pill">{categoryLabel(article.category)}</span>
              {displayDate && (
                <time dateTime={article.isoPublished || undefined}>{displayDate}</time>
              )}
            </p>

            <h1>{article.title}</h1>
            <p className="dek">{article.excerpt}</p>

            {article.author && (
              <p className="article-byline">
                <i className="bi bi-person" aria-hidden="true" /> {article.author}
              </p>
            )}
          </div>
        </header>

        <section>
          <div className="wrap wrap--prose">
            {image && (
              <figure className="article-hero">
                <SmartImage
                  className="article-hero-img"
                  src={resolveAssetUrl(image)}
                  alt={article.title}
                  width="1024"
                  height="576"
                  priority
                />
              </figure>
            )}

            <div className="prose">
              {(article.content || article.excerpt || '')
                .split(/\n{2,}/)
                .map((block, i) => (
                  <p key={i}>{block}</p>
                ))}
            </div>

            <p className="article-back">
              <SmartLink className="text-link" to="/insights">
                <i className="bi bi-arrow-left" aria-hidden="true" /> Back to all insights
              </SmartLink>
            </p>
          </div>
        </section>

        {related.length > 0 && (
          <section className="section-surface" aria-labelledby="related-insights">
            <div className="wrap">
              <SectionHeader
                id="related-insights"
                eyebrow="Keep reading"
                title="Related insights"
                action={{ label: 'All insights', to: '/insights' }}
              />
              <div className="grid-3">
                {related.map((a) => (
                  <InsightCard key={a.id} article={a} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>

      <CtaStrip
        title="See CGP's project record"
        body="Learn more about the projects behind the DMT-PHE and other CGP initiatives."
        actions={[
          { label: 'Explore Our Projects', to: '/projects', variant: 'white' },
          { label: 'Partner With Us', to: '/contact#contact-form', variant: 'white' },
        ]}
      />
    </Layout>
  );
}

export default function InsightDetail() {
  const { slug } = useParams();
  const news = useApi('/api/news', FALLBACK_ARTICLES);

  const all = useMemo(() => {
    const list = news.data?.length ? news.data : FALLBACK_ARTICLES;
    return list.map((a) => ({
      ...a,
      slug: articleSlug(a),
      category: normaliseCategory(a.category),
      isoPublished: isoDate(a.published_at),
    }));
  }, [news.data]);

  const article = all.find((a) => a.slug === slug);

  if (news.loading) {
    return (
      <Layout navId="insights">
        <div className="wrap" style={{ paddingTop: '80px', paddingBottom: '80px' }} aria-busy="true">
          <span className="sr-only">Loading article…</span>
          <SkeletonCard lines={6} />
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout navId="insights">
        <div className="wrap" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <Seo
            title={`Article not found | ${BRAND.name}`}
            description="The article you were looking for could not be found."
            path={`/insights/${slug}`}
            noIndex
          />
          <EmptyState
            icon="bi-file-earmark-x"
            title="We couldn't find that article"
            action={{ label: 'Browse all insights', to: '/insights' }}
          >
            The link may be out of date, or the article may have been moved.
          </EmptyState>
        </div>
      </Layout>
    );
  }

  return <ArticleBody article={article} all={all} />;
}
