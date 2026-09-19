import React, { useEffect, useState } from 'react';
import DashboardLayout from './Dashboard';
import { getToken, API_BASE, resolveAssetUrl } from '../../context/AuthContext';

export default function JobApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pdfViewer, setPdfViewer] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => { loadApplications(); }, []);

    function loadApplications() {
        setLoading(true);
        fetch(`${API_BASE}/api/job-applications`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        })
            .then(r => {
                if (r.status === 401) {
                    localStorage.removeItem('cghi_token');
                    localStorage.removeItem('cghi_admin');
                    window.location.href = '/admin/login';
                    return;
                }
                if (!r.ok) throw new Error('Failed to fetch applications');
                return r.json();
            })
            .then(data => { setApplications(data); setLoading(false); })
            .catch(err => {
                console.error('Error loading applications:', err);
                setLoading(false);
                showToast('Error loading applications: ' + err.message, 'error');
            });
    }

    function showToast(msg, type = 'info') {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    }

    function openPdf(url, filename) {
        setPdfViewer({ url: resolveAssetUrl(url), filename: filename || 'Document' });
    }

    function closePdf() {
        setPdfViewer(null);
    }

    async function deleteApplication(id) {
        setDeleting(true);
        try {
            const res = await fetch(`${API_BASE}/api/job-applications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (!res.ok) throw new Error('Delete failed');
            setApplications(prev => prev.filter(a => a.id !== id));
            setDeleteConfirm(null);
            showToast('Application deleted successfully', 'success');
        } catch (err) {
            showToast('Failed to delete: ' + err.message, 'error');
        } finally {
            setDeleting(false);
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch { return dateStr; }
    }

    if (loading) {
        return (
            <DashboardLayout title="Job Applications">
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading applications...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Job Applications">
            {toast && (
                <div className={`toast ${toast.type}`}>
                    <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : toast.type === 'error' ? 'bi-exclamation-circle-fill' : 'bi-info-circle-fill'}`}></i>
                    {toast.msg}
                </div>
            )}

            {pdfViewer && (
                <div className="pdf-viewer-modal" onClick={closePdf}>
                    <div className="pdf-viewer-modal-inner" onClick={e => e.stopPropagation()}>
                        <div className="pdf-viewer-modal-header">
                            <h4>{pdfViewer.filename}</h4>
                            <button className="pdf-viewer-modal-close" onClick={closePdf}><i className="bi bi-x-lg"></i></button>
                        </div>
                        <iframe src={pdfViewer.url} title={pdfViewer.filename} />
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
                    <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                        <h4>Delete Application</h4>
                        <p>Are you sure you want to delete this application from <strong>{deleteConfirm.name}</strong> for <strong>{deleteConfirm.jobTitle}</strong>? This action cannot be undone.</p>
                        <div className="confirm-actions">
                            <button className="confirm-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button
                                className="confirm-btn-danger"
                                onClick={() => deleteApplication(deleteConfirm.id)}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '24px' }}>
                <p style={{ color: 'var(--ink-muted)', margin: 0 }}>
                    All job applications submitted through the careers portal are listed below.
                    Use the document links to view uploaded files. Delete to remove an application.
                </p>
            </div>

            {applications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-muted)' }}>
                    <i className="bi bi-inbox" style={{ fontSize: '3rem', marginBottom: '16px', display: 'block' }}></i>
                    <h4>No Applications Yet</h4>
                    <p style={{ margin: '8px 0 0' }}>Job applications will appear here once candidates start applying.</p>
                </div>
            ) : (
                <div className="careers-table-wrapper">
                    <table className="applications-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Applicant Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Job Title</th>
                                <th>Documents</th>
                                <th>Submitted</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map(app => (
                                <tr key={app.id}>
                                    <td style={{ color: 'var(--ink-muted)', fontFamily: 'var(--mono)', fontSize: '0.82rem' }}>#{app.id}</td>
                                    <td><strong>{app.name}</strong></td>
                                    <td><a href={`mailto:${app.email}`} style={{ color: 'var(--sky)', textDecoration: 'none' }}>{app.email}</a></td>
                                    <td style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>{app.phone}</td>
                                    <td>{app.jobTitle}</td>
                                    <td>
                                        {app.cover_letter_url && (
                                            <a className="doc-link" href={resolveAssetUrl(app.cover_letter_url)} target="_blank" rel="noopener noreferrer"
                                                onClick={e => { e.stopPropagation(); openPdf(app.cover_letter_url, 'Cover Letter - ' + app.name); }}>
                                                <i className="bi bi-file-earmark-pdf"></i> Cover Letter
                                            </a>
                                        )}
                                        {app.cv_url && (
                                            <a className="doc-link" href={resolveAssetUrl(app.cv_url)} target="_blank" rel="noopener noreferrer"
                                                onClick={e => { e.stopPropagation(); openPdf(app.cv_url, 'CV - ' + app.name); }}>
                                                <i className="bi bi-file-earmark-pdf"></i> CV
                                            </a>
                                        )}
                                        {app.certificates_urls && app.certificates_urls.length > 0 && (
                                            <div style={{ marginTop: '4px' }}>
                                                {app.certificates_urls.map((url, i) => (
                                                    <a key={i} className="doc-link" href={resolveAssetUrl(url)} target="_blank" rel="noopener noreferrer"
                                                        onClick={e => { e.stopPropagation(); openPdf(url, 'Certificate ' + (i+1) + ' - ' + app.name); }}>
                                                        <i className="bi bi-file-earmark-pdf"></i> Cert {i+1}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                        {(!app.cover_letter_url && !app.cv_url) && (
                                            <span className="file-badge">No docs</span>
                                        )}
                                    </td>
                                    <td style={{ color: 'var(--ink-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{formatDate(app.created_at)}</td>
                                    <td>
                                        <button className="delete-btn" onClick={() => setDeleteConfirm(app)} title="Delete application">
                                            <i className="bi bi-trash3"></i> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
}
