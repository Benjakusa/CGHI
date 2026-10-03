/**
 * Enquiries inbox — /admin/enquiries
 *
 * The public contact form stores messages through POST /api/contact; this page
 * is the staff-facing counterpart: list, filter, triage (status), read and
 * delete. It uses the same endpoints the API exposes (GET /api/contact,
 * GET /api/contact/stats, PUT /api/contact/:id, DELETE /api/contact/:id) with
 * the admin Bearer token, and follows the layout conventions of the other
 * admin pages.
 */

import React, { useCallback, useEffect, useState } from 'react';
import DashboardLayout from './Dashboard';
import { getToken, API_BASE } from '../../context/AuthContext';

const STATUSES = [
    { value: 'new', label: 'New', color: '#01abed' },
    { value: 'in_progress', label: 'In progress', color: '#000000' },
    { value: 'closed', label: 'Closed', color: '#000000' },
    { value: 'spam', label: 'Spam', color: '#000000' },
];

const FILTERS = [{ value: 'all', label: 'All' }, ...STATUSES];

const TOPIC_LABELS = {
    general: 'General',
    partnership: 'Partnership',
    research: 'Technical / research',
    funding: 'Funding',
    training: 'Training',
    media: 'Media / press',
    jobs: 'Careers',
    other: 'Other',
};

function statusMeta(value) {
    return STATUSES.find((s) => s.value === value) || { label: value, color: 'rgba(0, 0, 0, 0.6)' };
}

export default function ContactAdmin() {
    const [items, setItems] = useState([]);
    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openRow, setOpenRow] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);

    const authHeaders = { Authorization: `Bearer ${getToken()}` };

    const loadStats = useCallback(() => {
        fetch(`${API_BASE}/api/contact/stats`, { headers: { Authorization: `Bearer ${getToken()}` } })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => data && setStats(data))
            .catch(() => {});
    }, []);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        const query = filter === 'all' ? '' : `?status=${filter}`;
        fetch(`${API_BASE}/api/contact${query}`, { headers: { Authorization: `Bearer ${getToken()}` } })
            .then((r) => {
                if (!r.ok) throw new Error('Could not load enquiries.');
                return r.json();
            })
            .then((data) => {
                setItems(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [filter]);

    useEffect(() => {
        load();
        loadStats();
    }, [load, loadStats]);

    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }, [toast]);

    async function updateStatus(id, status) {
        setBusyId(id);
        try {
            const res = await fetch(`${API_BASE}/api/contact/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error('Update failed');
            setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
            loadStats();
            setToast({ type: 'success', msg: `Enquiry #${id} marked as ${statusMeta(status).label}.` });
        } catch (err) {
            setToast({ type: 'error', msg: 'Could not update the enquiry: ' + err.message });
        } finally {
            setBusyId(null);
        }
    }

    async function deleteEnquiry(id) {
        setDeleting(true);
        try {
            const res = await fetch(`${API_BASE}/api/contact/${id}`, {
                method: 'DELETE',
                headers: authHeaders,
            });
            if (!res.ok) throw new Error('Delete failed');
            setItems((prev) => prev.filter((item) => item.id !== id));
            loadStats();
            setDeleteConfirm(null);
            setToast({ type: 'success', msg: 'Enquiry deleted.' });
        } catch (err) {
            setToast({ type: 'error', msg: 'Could not delete the enquiry: ' + err.message });
        } finally {
            setDeleting(false);
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
        } catch { return dateStr; }
    }

    function countFor(value) {
        if (!stats) return null;
        if (value === 'all') return stats.total;
        if (value === 'new') return stats.new;
        if (value === 'in_progress') return stats.inProgress;
        if (value === 'closed') return stats.closed;
        return null;
    }

    if (loading && items.length === 0) {
        return (
            <DashboardLayout title="Enquiries">
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading enquiries...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Enquiries">
            {toast && (
                <div className={`toast ${toast.type}`}>
                    <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                    {toast.msg}
                </div>
            )}

            {deleteConfirm && (
                <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
                    <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <h4>Delete Enquiry</h4>
                        <p>
                            Permanently delete the enquiry from <strong>{deleteConfirm.name}</strong>
                            {deleteConfirm.subject ? ` about “${deleteConfirm.subject}”` : ''}? This
                            cannot be undone.
                        </p>
                        <div className="confirm-actions">
                            <button className="confirm-btn-cancel" onClick={() => setDeleteConfirm(null)}>
                                Cancel
                            </button>
                            <button
                                className="confirm-btn-danger"
                                onClick={() => deleteEnquiry(deleteConfirm.id)}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {FILTERS.map((f) => {
                    const active = filter === f.value;
                    const count = countFor(f.value);
                    return (
                        <button
                            key={f.value}
                            type="button"
                            onClick={() => setFilter(f.value)}
                            aria-pressed={active}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '999px',
                                border: `1px solid ${active ? 'var(--sky-dark)' : 'var(--border)'}`,
                                background: active ? 'var(--sky-dark)' : '#ffffff',
                                color: active ? '#ffffff' : 'var(--ink)',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                            }}
                        >
                            {f.label}
                            {count != null ? ` (${count})` : ''}
                        </button>
                    );
                })}
            </div>

            {error && (
                <div className="toast error" role="alert">
                    <i className="bi bi-exclamation-circle-fill"></i>
                    {error}{' '}
                    <button
                        type="button"
                        onClick={load}
                        style={{ marginLeft: '8px', textDecoration: 'underline', background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}
                    >
                        Try again
                    </button>
                </div>
            )}

            {!error && items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-muted)' }}>
                    <i className="bi bi-envelope-open" style={{ fontSize: '3rem', marginBottom: '16px', display: 'block' }}></i>
                    <h4>No Enquiries{filter === 'all' ? ' Yet' : ' In This View'}</h4>
                    <p style={{ margin: '8px 0 0' }}>
                        Messages sent through the contact form will appear here.
                    </p>
                </div>
            )}

            {!error && items.length > 0 && (
                <div className="careers-table-wrapper">
                    <table className="applications-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Received</th>
                                <th>From</th>
                                <th>Topic</th>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => {
                                const meta = statusMeta(item.status);
                                const isOpen = openRow === item.id;
                                return (
                                    <React.Fragment key={item.id}>
                                        <tr>
                                            <td style={{ color: 'var(--ink-muted)', fontFamily: 'var(--mono)', fontSize: '0.82rem' }}>#{item.id}</td>
                                            <td style={{ color: 'var(--ink-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{formatDate(item.created_at)}</td>
                                            <td>
                                                <strong>{item.name}</strong>
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    <a href={`mailto:${item.email}`} style={{ color: 'var(--sky)', textDecoration: 'none' }}>{item.email}</a>
                                                </div>
                                                {item.organisation && (
                                                    <div style={{ color: 'var(--ink-muted)', fontSize: '0.82rem' }}>{item.organisation}</div>
                                                )}
                                            </td>
                                            <td>{TOPIC_LABELS[item.topic] || item.topic}</td>
                                            <td>{item.subject || <span style={{ color: 'var(--ink-muted)' }}>—</span>}</td>
                                            <td>
                                                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', background: meta.color, marginBottom: '6px' }}>
                                                    {meta.label}
                                                </span>
                                                <select
                                                    value={item.status}
                                                    disabled={busyId === item.id}
                                                    aria-label={`Change status for enquiry ${item.id}`}
                                                    onChange={(e) => updateStatus(item.id, e.target.value)}
                                                    style={{ display: 'block', padding: '6px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem' }}
                                                >
                                                    {STATUSES.map((s) => (
                                                        <option key={s.value} value={s.value}>{s.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="doc-link"
                                                    onClick={() => setOpenRow(isOpen ? null : item.id)}
                                                    aria-expanded={isOpen}
                                                    style={{ marginBottom: '6px' }}
                                                >
                                                    <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i> {isOpen ? 'Hide' : 'Read'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="delete-btn"
                                                    onClick={() => setDeleteConfirm(item)}
                                                    title="Delete enquiry"
                                                >
                                                    <i className="bi bi-trash3"></i> Delete
                                                </button>
                                            </td>
                                        </tr>
                                        {isOpen && (
                                            <tr>
                                                <td colSpan={7} style={{ background: 'var(--surface)', padding: '18px' }}>
                                                    <p style={{ margin: '0 0 10px', fontWeight: 700 }}>Message</p>
                                                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{item.message}</p>
                                                    {item.phone && (
                                                        <p style={{ margin: '12px 0 0', color: 'var(--ink-muted)', fontSize: '0.88rem' }}>
                                                            Phone: {item.phone}
                                                        </p>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
}

