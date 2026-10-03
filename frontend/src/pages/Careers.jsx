import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Seo, { BASE_JSONLD, breadcrumbJsonLd, pageJsonLd } from '../components/Seo';
import useApi from '../hooks/useApi';
import { SkeletonCard } from '../components/Skeleton';
import { API_BASE } from '../context/AuthContext';
import { CONTACT } from '../config/site';
import { PAGE_META } from '../content/navigation';

const META = PAGE_META['/careers'];

export default function Careers() {
    const jobsApi = useApi('/api/jobs', []);
    const [openJobId, setOpenJobId] = useState(null);
    const [applyModal, setApplyModal] = useState(null);
    const applyTriggerRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);

    const jobs = jobsApi.data ?? [];
    const modalRef = useRef(null);

    // Move focus into the dialog when it opens so keyboard and screen reader
    // users are not left behind on the page behind the modal.
    useEffect(() => {
        if (!applyModal) return undefined;
        const node = modalRef.current;
        if (!node) return undefined;
        const focusTarget = node.querySelector('input:not([type="hidden"]), button, [href]');
        focusTarget?.focus();
        return undefined;
    }, [applyModal]);

    const closeApplyModal = () => {
        setApplyModal(null);
        applyTriggerRef.current?.focus();
    };

    const handleBackdropMouseDown = () => closeApplyModal();

    const handleModalKeyDown = (event) => {
        if (event.key === 'Escape') {
            event.stopPropagation();
            closeApplyModal();
            return;
        }
        if (event.key !== 'Tab') return;

        // Keep Tab inside the dialog while it is open.
        const focusables = modalRef.current?.querySelectorAll(
            'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    const jsonLd = useMemo(
        () => [
            ...BASE_JSONLD,
            pageJsonLd({ name: META.title, path: '/careers', description: META.description }),
            breadcrumbJsonLd(META.breadcrumb),
        ],
        []
    );

    const toggleJob = (id) => {
        setOpenJobId(prev => (prev === id ? null : id));
    };

    const openApplyModal = (job, trigger) => {
        applyTriggerRef.current = trigger;
        setApplyModal({
            jobId: job.id,
            jobTitle: job.title,
            name: '',
            email: '',
            phone: '',
            files: { coverLetter: null, cv: null, certificates: [] },
            success: false
        });
    };

    const handleFileChange = (e, fieldName) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            if (files[i].size > 2 * 1024 * 1024) {
                const errorEl = document.getElementById(fieldName + 'Error');
                if (errorEl) {
                    errorEl.textContent = files[i].name + ' exceeds 2MB. Please compress it.';
                    errorEl.classList.add('show');
                }
                return;
            }
        }

        setApplyModal({
            ...applyModal,
            files: {
                ...applyModal.files,
                [fieldName]: files.length === 1 ? files[0] : Array.from(files)
            }
        });
    };

    const showToast = (msg, type = 'info') => {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        const icon = type === 'success' ? 'bi-check-circle-fill' : type === 'error' ? 'bi-exclamation-circle-fill' : 'bi-info-circle-fill';
        toast.innerHTML = '<i className="bi ' + icon + '"></i> ' + msg;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('out');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        if (!applyModal || !applyModal.name || !applyModal.email || !applyModal.phone || !applyModal.jobTitle) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(applyModal.email)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }

        if (applyModal.phone.replace(/\D/g, '').length < 7) {
            showToast('Please enter a valid phone number.', 'error');
            return;
        }

        const files = applyModal.files || {};
        for (const [key, file] of Object.entries(files)) {
            if (file) {
                const fileArr = Array.isArray(file) ? file : [file];
                for (const f of fileArr) {
                    if (f.size > 2 * 1024 * 1024) {
                        const label = key === 'coverLetter' ? 'Cover Letter' : key === 'cv' ? 'CV' : 'A certificate';
                        showToast(label + ' exceeds 2MB. Please compress it.', 'error');
                        return;
                    }
                }
            }
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', applyModal.name);
            formData.append('email', applyModal.email);
            formData.append('phone', applyModal.phone);
            formData.append('jobTitle', applyModal.jobTitle);
            formData.append('jobId', applyModal.jobId || '');

            if (files.coverLetter) formData.append('coverLetter', files.coverLetter);
            if (files.cv) formData.append('cv', files.cv);
            if (files.certificates && Array.isArray(files.certificates)) {
                for (const cert of files.certificates) {
                    formData.append('certificates', cert);
                }
            }

            const res = await fetch(`${API_BASE}/api/job-applications`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Submission failed');
            }

            setApplyModal({ ...applyModal, success: true });
            showToast('Application submitted successfully!', 'success');
        } catch (err) {
            showToast('Error: ' + err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout navId="careers">
            <Seo title={META.title} description={META.description} path="/careers" jsonLd={jsonLd} />

            {/* Apply Modal */}
            {applyModal && !applyModal.success && (
                <div className="modal-backdrop" onMouseDown={handleBackdropMouseDown}>
                    <div
                        className="apply-modal"
                        onMouseDown={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="apply-modal-title"
                        ref={modalRef}
                        onKeyDown={handleModalKeyDown}
                    >
                        <div className="apply-modal-header">
                            <h3 id="apply-modal-title">Apply for {applyModal.jobTitle}</h3>
                            <button
                                type="button"
                                className="apply-modal-close"
                                onClick={closeApplyModal}
                                aria-label="Close application form"
                            >
                                <i className="bi bi-x-lg" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="apply-modal-body">
                            <form onSubmit={handleApplySubmit}>
                                <div className="form-group">
                                    <label htmlFor="apply-name">Full Name <span className="required-star">*</span></label>
                                    <input
                                        id="apply-name"
                                        type="text"
                                        required
                                        value={applyModal.name || ''}
                                        onChange={e => setApplyModal({ ...applyModal, name: e.target.value })}
                                        autoComplete="name"
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="apply-email">Email Address <span className="required-star">*</span></label>
                                    <input
                                        id="apply-email"
                                        type="email"
                                        required
                                        value={applyModal.email || ''}
                                        onChange={e => setApplyModal({ ...applyModal, email: e.target.value })}
                                        autoComplete="email"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="apply-phone">Phone Number <span className="required-star">*</span></label>
                                    <input
                                        id="apply-phone"
                                        type="tel"
                                        required
                                        value={applyModal.phone || ''}
                                        onChange={e => setApplyModal({ ...applyModal, phone: e.target.value })}
                                        autoComplete="tel"
                                        placeholder="+254 700 000 000"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="apply-jobtitle">Job Title <span className="required-star">*</span></label>
                                    <input
                                        id="apply-jobtitle"
                                        type="text"
                                        readOnly
                                        tabIndex={-1}
                                        value={applyModal.jobTitle || ''}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="apply-cover">Upload Cover Letter (PDF/DOC/DOCX) <span className="required-star">*</span></label>
                                    <div className="file-upload-area">
                                        <input
                                            id="apply-cover"
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            aria-describedby="coverLetterError"
                                            onChange={e => handleFileChange(e, 'coverLetter')}
                                            required
                                        />
                                        <div className="file-info">
                                            <i className="bi bi-upload" aria-hidden="true"></i>
                                            <span>{applyModal.files?.coverLetter ? applyModal.files.coverLetter.name : 'Click to select cover letter'}</span>
                                        </div>
                                        <div className="file-error" id="coverLetterError" role="alert"></div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="apply-cv">Upload CV (PDF/DOC/DOCX) <span className="required-star">*</span></label>
                                    <div className="file-upload-area">
                                        <input
                                            id="apply-cv"
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            aria-describedby="cvError"
                                            onChange={e => handleFileChange(e, 'cv')}
                                            required
                                        />
                                        <div className="file-info">
                                            <i className="bi bi-upload" aria-hidden="true"></i>
                                            <span>{applyModal.files?.cv ? applyModal.files.cv.name : 'Click to select CV'}</span>
                                        </div>
                                        <div className="file-error" id="cvError" role="alert"></div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="apply-certs">Upload Certificates &amp; Testimonials (Optional, PDF/images)</label>
                                    <div className="file-upload-area">
                                        <input
                                            id="apply-certs"
                                            type="file"
                                            aria-describedby="certificatesError"
                                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                                            multiple
                                            onChange={e => handleFileChange(e, 'certificates')}
                                        />
                                        <div className="file-info">
                                            <i className="bi bi-upload" aria-hidden="true"></i>
                                            <span>{applyModal.files?.certificates?.length ? applyModal.files.certificates.length + ' files selected' : 'Click to select certificates (optional)'}</span>
                                        </div>
                                        <div className="file-error" id="certificatesError" role="alert"></div>
                                    </div>
                                </div>
                                <button type="submit" className="submit-btn" disabled={submitting}>
                                    {submitting ? (
                                        <><span className="loading-spinner"></span>Compressing &amp; uploading...</>
                                    ) : (
                                        <><i className="bi bi-paper-plane"></i>Submit Application</>
                                    )}
                                </button>
                            </form>
                        </div>
                        <div className="apply-modal-footer">
                            <span>PDF, DOC, DOCX up to 2MB each. Files are compressed before upload.</span>
                        </div>
                    </div>
                </div>
            )}

            {applyModal?.success && (
                <div className="modal-backdrop" onMouseDown={closeApplyModal}>
                    <div
                        className="apply-modal"
                        onMouseDown={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="apply-success-title"
                        ref={modalRef}
                    >
                        <div className="apply-modal-body">
                            <div className="form-success">
                                <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                                <h4 id="apply-success-title">Application submitted successfully</h4>
                                <p>Thank you, {applyModal.name}. We will review your application and get back to you within 2 weeks.</p>
                                <button type="button" className="btn" onClick={closeApplyModal} style={{ marginTop: '16px' }}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <PageHeader
                trail={META.breadcrumb}
                h1="Careers"
                dek="CGP builds an expert network of public health and data professionals committed to transforming epidemic intelligence in Africa and beyond."
            />

                <section>
                    <div className="wrap">
                        <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
                            <span className="section-label" style={{ borderLeft: 'none', paddingLeft: 0, textAlign: 'left' }}>Open Roles</span>
                            <h2 style={{ margin: 0 }}>Current Opportunities</h2>
                        </div>

                        {jobsApi.loading ? (
                            <div className="grid-3" aria-hidden="true">
                                <SkeletonCard image={false} />
                                <SkeletonCard image={false} />
                                <SkeletonCard image={false} />
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="empty-state">
                                <i className="bi bi-briefcase" aria-hidden="true"></i>
                                <h3>There are no open roles right now</h3>
                                <p>
                                    Please check back soon, or send a speculative application to{' '}
                                    <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
                                </p>
                            </div>
                        ) : (
                            <div className="grid-3" style={{ marginBottom: '56px' }}>
                                {jobs.map(j => {
                                    const isOpen = openJobId === j.id;
                                    return (
                                        <article className="job-card" key={j.id}>
                                            <div style={{ marginBottom: '12px' }}>
                                                <span className="job-dept">{j.department || 'General'}</span>
                                                <h3 style={{ marginTop: '6px', marginBottom: '4px' }}>{j.title}</h3>
                                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', color: 'var(--ink-muted)', flexWrap: 'wrap' }}>
                                                    {j.location && <span><i className="bi bi-geo-alt" aria-hidden="true"></i> {j.location}</span>}
                                                    {j.employment_type && <span><i className="bi bi-clock" aria-hidden="true"></i> {j.employment_type}</span>}
                                                </div>
                                            </div>

                                            {isOpen && (
                                                <div className="job-details-expanded" id={`job-details-${j.id}`}>
                                                    {j.description}
                                                    {j.qualifications?.length > 0 && (
                                                        <>
                                                            <h4 style={{ marginTop: '20px', marginBottom: '8px' }}>Qualifications</h4>
                                                            <ul style={{ paddingLeft: '1.2em' }}>
                                                                {j.qualifications.map((q, i) => <li key={i}>{q}</li>)}
                                                            </ul>
                                                        </>
                                                    )}
                                                    {j.preferred_experience?.length > 0 && (
                                                        <>
                                                            <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>Preferred Experience</h4>
                                                            <ul style={{ paddingLeft: '1.2em' }}>
                                                                {j.preferred_experience.map((p, i) => <li key={i}>{p}</li>)}
                                                            </ul>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* Footer actions: View Details (left) · Apply Now (right) */}
                                            <div className="job-card-actions">
                                                <button
                                                    className="btn job-card-view-btn"
                                                    type="button"
                                                    onClick={() => toggleJob(j.id)}
                                                    aria-expanded={isOpen}
                                                    aria-controls={`job-details-${j.id}`}
                                                >
                                                    {isOpen ? 'Hide Details' : 'View Details'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn job-card-apply-btn"
                                                    onClick={(e) => openApplyModal(j, e.currentTarget)}
                                                >
                                                    <i className="bi bi-paper-plane" aria-hidden="true" /> Apply Now
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}

                        <h2 style={{ marginBottom: '24px' }}>Technical Areas of Work</h2>
                        <ul className="tech-area-list" aria-label="Technical areas at CGP">
                            <li>Epidemic &amp; pandemic intelligence</li>
                            <li>IHR 2005, JEE, SPAR, NAPHS</li>
                            <li>7-1-7 outbreak detection &amp; response monitoring</li>
                            <li>IDSR and syndromic surveillance</li>
                            <li>Event-based and community-based surveillance</li>
                            <li>One Health surveillance and integration</li>
                            <li>Zoonotic disease detection and response</li>
                            <li>Climate-sensitive disease early warning</li>
                            <li>Simulation exercises &amp; tabletop exercises</li>
                            <li>AI/ML in epidemic forecasting</li>
                            <li>Digital health tools and dashboards</li>
                            <li>GIS and geospatial health analysis</li>
                            <li>Risk communication &amp; community engagement</li>
                            <li>Pandemic Fund proposal development</li>
                            <li>Public health emergency management</li>
                            <li>Data science &amp; epidemiological analysis</li>
                            <li>Technical writing &amp; scientific communication</li>
                        </ul>
                    </div>
                </section>

                {/* Local styles for job card action row */}
                <style>{`
                    /* Push the actions row to the bottom of the card so it aligns
                       across cards of different content lengths. */
                    .job-card {
                        display: flex;
                        flex-direction: column;
                    }
                    .job-card > .job-card-actions {
                        margin-top: auto;
                    }
                    .job-card-actions {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 12px;
                        padding-top: 20px;
                        margin-top: 20px;
                        border-top: 1px solid var(--border);
                        flex-wrap: wrap;
                    }
                    /* View Details: solid blue background */
                    .job-card .job-card-view-btn {
                        background: var(--brand) !important;
                        border: 2px solid var(--brand) !important;
                        color: #ffffff !important;
                        border-radius: var(--radius) !important;
                        font-weight: 700;
                        font-size: 0.85rem;
                        padding: 10px 18px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        white-space: nowrap;
                        transition: background 0.18s, border-color 0.18s, transform 0.15s;
                    }
                    .job-card .job-card-view-btn:hover {
                        background: var(--brand-dark) !important;
                        border-color: var(--brand-dark) !important;
                        transform: translateY(-1px);
                    }
                    /* Apply Now: solid blue with icon */
                    .job-card .job-card-apply-btn {
                        background: var(--brand) !important;
                        border: 2px solid var(--brand) !important;
                        color: #ffffff !important;
                        border-radius: var(--radius) !important;
                        font-weight: 700;
                        font-size: 0.85rem;
                        padding: 10px 18px;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        white-space: nowrap;
                        transition: background 0.18s, border-color 0.18s, transform 0.15s;
                    }
                    .job-card .job-card-apply-btn:hover {
                        background: var(--brand-dark) !important;
                        border-color: var(--brand-dark) !important;
                        transform: translateY(-1px);
                    }
                    /* On very narrow widths, let the buttons stack nicely */
                    @media (max-width: 420px) {
                        .job-card-actions {
                            flex-direction: column;
                            align-items: stretch;
                        }
                        .job-card-actions .btn {
                            width: 100%;
                        }
                    }
                `}</style>
        </Layout>
    );
}