import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Seo, { BASE_JSONLD, breadcrumbJsonLd, pageJsonLd } from '../components/Seo';
import SmartLink from '../components/SmartLink';
import useApi from '../hooks/useApi';
import { resolveAssetUrl } from '../context/AuthContext';
import { BRAND } from '../config/site';
import ShareProfileButton from '../components/ShareProfileButton';

const META = {
  title: `Careers | ${BRAND.abbr}`,
  description: `Open roles at ${BRAND.name}.`,
  breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Careers', to: '/careers' }],
};

export default function CareerDetail() {
  const { id } = useParams();
  const jobApi = useApi(`/api/jobs/${id}`, null);
  const allJobsApi = useApi('/api/jobs', []);
  const job = jobApi.data;
  const canonicalPath = `/careers/${id}`;

  const title = job ? `${job.title} | ${BRAND.abbr} Careers` : META.title;
  const description = job
    ? `${job.title}${job.department ? ` — ${job.department}` : ''} at ${BRAND.name}.`
    : META.description;
  const image = job?.document_url && !/\.pdf$/i.test(job.document_url)
    ? resolveAssetUrl(job.document_url)
    : undefined;

  const otherJobs = useMemo(() => {
    const list = Array.isArray(allJobsApi.data) ? allJobsApi.data : [];
    return list.filter((j) => String(j.id) !== String(id)).slice(0, 3);
  }, [allJobsApi.data, id]);

  const jsonLd = [
    ...BASE_JSONLD,
    pageJsonLd({ name: title, path: canonicalPath, description }),
    breadcrumbJsonLd([...META.breadcrumb, { label: job?.title || 'Advert', to: canonicalPath }]),
  ];

  return (
    <Layout navId="careers">
      {job && (
        <Seo
          title={title}
          description={description}
          path={canonicalPath}
          image={image}
          imageAlt={job.title}
          jsonLd={jsonLd}
        />
      )}

      <header className="page-header">
        <div className="wrap">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
              <li className="breadcrumb-item"><SmartLink to="/">Home</SmartLink><span className="breadcrumb-sep" aria-hidden="true">/</span></li>
              <li className="breadcrumb-item"><SmartLink to="/careers">Careers</SmartLink><span className="breadcrumb-sep" aria-hidden="true">/</span></li>
              <li className="breadcrumb-item"><span aria-current="page">{job?.title || 'Advert'}</span></li>
            </ol>
          </nav>
          <p className="section-label">Open role</p>
        </div>
      </header>

      <section className="section-surface" aria-live="polite">
        <div className="wrap" style={{ maxWidth: '900px' }}>
          {job ? (
            <>
              <article className="career-detail-card" data-prerender-ready="true">
                <div className="career-detail-head">
                  <div style={{ minWidth: 0 }}>
                    <h1 style={{ marginBottom: '8px' }}>{job.title}</h1>
                    <p className="team-profile-role" style={{ marginBottom: 0 }}>
                      {job.department || 'General'}
                      {job.employment_type ? ` · ${job.employment_type}` : ''}
                      {job.closing_date ? ` · Closes ${job.closing_date}` : ''}
                    </p>
                  </div>
                  <div className="career-detail-head-actions">
                    <ShareProfileButton name={job.title} url={canonicalPath} imageUrl={image} />
                  </div>
                </div>

                {job.document_url && (
                  <div className="career-detail-media">
                    {/\.pdf$/i.test(job.document_url) ? (
                      <a href={resolveAssetUrl(job.document_url)} target="_blank" rel="noopener noreferrer" className="text-link">
                        <i className="bi bi-file-pdf" aria-hidden="true" /> View advert document (PDF)
                      </a>
                    ) : (
                      <img src={resolveAssetUrl(job.document_url)} alt={`Advert for ${job.title}`} />
                    )}
                  </div>
                )}

                {Array.isArray(job.roles) && job.roles.length > 0 && (
                  <div className="career-detail-roles">
                    <h2>Roles in this advert</h2>
                    {job.roles.map((r) => (
                      <div key={r.id} className="career-role-block">
                        <h3>{r.title}{r.location ? ` — ${r.location}` : ''}</h3>
                        {r.description && <p style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>{r.description}</p>}
                        {r.qualifications?.length > 0 && (
                          <>
                            <strong>Qualifications</strong>
                            <ul>{r.qualifications.map((q, i) => <li key={i}>{q}</li>)}</ul>
                          </>
                        )}
                        {r.preferred_experience?.length > 0 && (
                          <>
                            <strong>Preferred experience</strong>
                            <ul>{r.preferred_experience.map((p, i) => <li key={i}>{p}</li>)}</ul>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {job.instructions && (
                  <div className="career-detail-instructions">
                    <strong>Instructions to applicants</strong>
                    <div style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>{job.instructions}</div>
                  </div>
                )}

                <div className="career-detail-actions">
                  <SmartLink className="btn btn-primary career-apply-btn" to={`/careers?apply=${job.id}`}>
                    <i className="bi bi-send" aria-hidden="true" /> Apply Now
                  </SmartLink>
                  <SmartLink className="btn" to="/careers">Back to all roles</SmartLink>
                </div>
              </article>

              {otherJobs.length > 0 && (
                <div className="career-more">
                  <h2>More open roles</h2>
                  <div className="career-more-grid">
                    {otherJobs.map((j) => (
                      <SmartLink key={j.id} className="career-more-card" to={`/careers/${j.id}`}>
                        <span className="career-more-dept">{j.department || 'General'}</span>
                        <strong>{j.title}</strong>
                        <span className="career-more-meta">
                          {j.employment_type || 'Full-time'}
                          {j.closing_date ? ` · Closes ${j.closing_date}` : ''}
                        </span>
                        <span className="career-more-link">View role →</span>
                      </SmartLink>
                    ))}
                  </div>
                  <p style={{ marginTop: '20px' }}>
                    <SmartLink className="text-link" to="/careers">See all open roles →</SmartLink>
                  </p>
                </div>
              )}
            </>
          ) : jobApi.loading ? (
            <p>Loading advert…</p>
          ) : (
            <div className="empty-state">
              <h1>Advert unavailable</h1>
              <p>This role may have closed or the link is incorrect.</p>
              <SmartLink className="text-link" to="/careers">Back to Careers</SmartLink>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
