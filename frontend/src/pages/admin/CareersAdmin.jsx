import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from './Dashboard';
import { getToken, API_BASE, resolveAssetUrl } from '../../context/AuthContext';

export default function CareersAdmin() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [current, setCurrent] = useState({});
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => { loadItems(); }, []);

    function loadItems() {
        setLoading(true);
        fetch(`${API_BASE}/api/jobs/admin`, { 
            headers: { 'Authorization': `Bearer ${getToken()}` } 
        })
            .then(r => {
                if (!r.ok) throw new Error('Failed to fetch jobs');
                return r.json();
            })
            .then(data => { 
                setItems(data); 
                setLoading(false); 
            })
            .catch(err => {
                console.error('Error loading jobs:', err);
                setLoading(false);
            });
    }

    // Handle document/PDF upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Accept images and PDFs
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            alert('Please upload an image or PDF file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            setCurrent({ ...current, document_url: data.url });
            alert('File uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    function handleSave(e) {
        e.preventDefault();
        const isEdit = !!current.id;
        const url = isEdit ? `${API_BASE}/api/jobs/admin/${current.id}` : `${API_BASE}/api/jobs/admin`;
        const roles = Array.isArray(current.roles) ? current.roles : [];
        if (roles.length === 0) {
            alert('Please add at least one role.');
            return;
        }
        for (let i = 0; i < roles.length; i++) {
            if (!roles[i].title || !roles[i].title.trim()) {
                alert('Role ' + (i + 1) + ': title is required.');
                return;
            }
        }
        fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${getToken()}` 
            },
            body: JSON.stringify({
                department: current.department || '',
                employment_type: current.employment_type || '',
                apply_email: current.apply_email || '',
                apply_subject: current.apply_subject || '',
                closing_date: current.closing_date || null,
                document_url: current.document_url || '',
                published: current.published ? 1 : 0,
                roles: roles.map((r) => ({
                    title: r.title,
                    location: r.location || '',
                    description: r.description || '',
                    qualifications: Array.isArray(r.qualifications) ? r.qualifications : [],
                    preferred_experience: Array.isArray(r.preferred_experience) ? r.preferred_experience : [],
                })),
            })
        })
        .then(r => {
            if (!r.ok) throw new Error('Save failed');
            return r.json();
        })
        .then(() => {
            setModalOpen(false);
            loadItems();
        })
        .catch(err => console.error('Error saving job:', err));
    }

    function togglePublish(id) {
        fetch(`${API_BASE}/api/jobs/admin/${id}/publish`, {
            method: 'PATCH', 
            headers: { 'Authorization': `Bearer ${getToken()}` }
        })
        .then(() => loadItems())
        .catch(err => console.error('Error toggling publish:', err));
    }

    function handleDelete(id) {
        if (!window.confirm('Delete this job posting?')) return;
        fetch(`${API_BASE}/api/jobs/admin/${id}`, {
            method: 'DELETE', 
            headers: { 'Authorization': `Bearer ${getToken()}` }
        })
        .then(() => loadItems())
        .catch(err => console.error('Error deleting job:', err));
    }

    if (loading) {
        return <DashboardLayout title="Manage Careers">Loading jobs...</DashboardLayout>;
    }

    const isMobile = window.innerWidth <= 768;

    return (
        <DashboardLayout title="Manage Careers">
            <div style={{ 
                display: 'flex', 
                justifyContent: isMobile ? 'stretch' : 'flex-end', 
                marginBottom: '24px',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '12px' : '0'
            }}>
                <button 
                    className="btn-primary" 
                    onClick={() => { setCurrent({ published: 1, roles: [{ title: '', location: '', description: '', qualifications: [], preferred_experience: [] }] }); setModalOpen(true); }}
                    style={{ 
                        width: isMobile ? '100%' : 'auto',
                        padding: '12px',
                        justifyContent: 'center'
                    }}
                >
                    <i className="bi bi-plus-circle" style={{ marginRight: '6px' }}></i> Add Job
                </button>
            </div>

            <div style={{ 
                background: '#ffffff', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch'
            }}>
                <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse', 
                    textAlign: 'left',
                    minWidth: isMobile ? '600px' : 'auto',
                    fontSize: 'var(--fs-body)'
                }}>
                    <thead>
                        <tr style={{ background: 'var(--surface-alt)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: isMobile ? '10px' : '16px' }}>Title</th>
                            <th style={{ padding: isMobile ? '10px' : '16px' }}>Department</th>
                            <th style={{ padding: isMobile ? '10px' : '16px' }}>Location</th>
                            <th style={{ padding: isMobile ? '10px' : '16px' }}>Status</th>
                            <th style={{ padding: isMobile ? '10px' : '16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: isMobile ? '10px' : '16px', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)' }}>{item.title}</td>
                                <td style={{ padding: isMobile ? '10px' : '16px', fontSize: 'var(--fs-small)' }}>{item.department || 'N/A'}</td>
                                <td style={{ padding: isMobile ? '10px' : '16px', fontSize: 'var(--fs-small)' }}>{item.location || 'N/A'}</td>
                                <td style={{ padding: isMobile ? '10px' : '16px' }}>
                                    {item.published ? (
                                        <span style={{ 
                                            background: 'rgba(0, 0, 0, 0.06)', 
                                            color: '#000000', 
                                            padding: '4px 8px', 
                                            borderRadius: '4px', 
                                            fontSize: 'var(--fs-caption)', 
                                            fontWeight: 'var(--fw-semibold)' 
                                        }}>Published</span>
                                    ) : (
                                        <span style={{ 
                                            background: 'rgba(0, 0, 0, 0.06)', 
                                            color: '#000000', 
                                            padding: '4px 8px', 
                                            borderRadius: '4px', 
                                            fontSize: 'var(--fs-caption)', 
                                            fontWeight: 'var(--fw-semibold)' 
                                        }}>Draft</span>
                                    )}
                                </td>
                                <td style={{ padding: isMobile ? '10px' : '16px', textAlign: 'right' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: isMobile ? 'column' : 'row',
                                        gap: '6px', 
                                        justifyContent: 'flex-end',
                                        alignItems: isMobile ? 'stretch' : 'center'
                                    }}>
                                        <button onClick={() => togglePublish(item.id)} style={{ 
                                            background: 'none', 
                                            border: '1px solid var(--border)', 
                                            borderRadius: '4px', 
                                            padding: isMobile ? '6px 10px' : '6px 12px', 
                                            cursor: 'pointer',
                                            fontSize: 'var(--fs-small)',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            <i className={item.published ? 'bi bi-toggle-off' : 'bi bi-toggle-on'} style={{ marginRight: '4px' }}></i>
                                            {item.published ? 'Unpublish' : 'Publish'}
                                        </button>
                                        <button type="button" aria-label={`Edit job: ${item.title}`} title="Edit job" onClick={() => { setCurrent({ ...item, roles: Array.isArray(item.roles) && item.roles.length > 0 ? item.roles.map(r => ({ title: r.title || '', location: r.location || '', description: r.description || '', qualifications: Array.isArray(r.qualifications) ? r.qualifications : [], preferred_experience: Array.isArray(r.preferred_experience) ? r.preferred_experience : [] })) : [{ title: '', location: '', description: '', qualifications: [], preferred_experience: [] }] }); setModalOpen(true); }} style={{ 
                                            background: 'none', 
                                            border: '1px solid var(--border)', 
                                            borderRadius: '4px', 
                                            padding: isMobile ? '6px 10px' : '6px 12px', 
                                            cursor: 'pointer',
                                            fontSize: 'var(--fs-small)'
                                        }}>
                                            <i className="bi bi-pencil-square" style={{ marginRight: '4px' }}></i>
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} style={{ 
                                            background: 'rgba(0, 0, 0, 0.06)', 
                                            color: '#000000', 
                                            border: '1px solid rgba(0, 0, 0, 0.35)', 
                                            borderRadius: '4px', 
                                            padding: isMobile ? '6px 10px' : '6px 12px', 
                                            cursor: 'pointer',
                                            fontSize: 'var(--fs-small)'
                                        }}>
                                            <i className="bi bi-trash" style={{ marginRight: '4px' }}></i>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-muted)' }}>No jobs found. Click "Add Job" to create one.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'rgba(0,0,0,0.5)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 9999,
                    padding: isMobile ? '16px' : '0'
                }}>
                    <div style={{ 
                        background: '#ffffff', 
                        width: '100%', 
                        maxWidth: '700px', 
                        borderRadius: '8px', 
                        padding: isMobile ? '20px' : '32px', 
                        maxHeight: '90vh', 
                        overflowY: 'auto',
                        margin: isMobile ? '16px' : '0'
                    }}>
                        <h2 style={{ marginBottom: '24px', fontSize: 'var(--fs-h1)' }}>{current.id ? 'Edit Job' : 'Add Job'}</h2>
                        <form onSubmit={handleSave}>
                            <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 600 }}>Advert details (shared across all roles)</h3>

                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '16px', marginBottom: '16px' }}>
                                <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)' }}>Department</label>
                                    <input value={current.department || ''} onChange={e => setCurrent({ ...current, department: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: 'var(--fs-body)' }} />
                                </div>
                                <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)' }}>Employment Type</label>
                                    <input value={current.employment_type || ''} onChange={e => setCurrent({ ...current, employment_type: e.target.value })} placeholder="Full-time, Contract, etc." style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: 'var(--fs-body)' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '16px', marginBottom: '16px' }}>
                                <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)' }}>Apply Email</label>
                                    <input value={current.apply_email || ''} onChange={e => setCurrent({ ...current, apply_email: e.target.value })} placeholder="jobs@example.com" style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: 'var(--fs-body)' }} />
                                </div>
                                <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)' }}>Email Subject</label>
                                    <input value={current.apply_subject || ''} onChange={e => setCurrent({ ...current, apply_subject: e.target.value })} placeholder="Application - 2026 Cohort" style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: 'var(--fs-body)' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)' }}>Closing Date (per advert)</label>
                                <input type="date" value={current.closing_date || ''} onChange={e => setCurrent({ ...current, closing_date: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: 'var(--fs-body)' }} />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)' }}>Attach Document (PDF/Image, shared)</label>
                                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '10px' }}>
                                    <input type="file" ref={fileInputRef} accept="image/*,.pdf" onChange={handleFileUpload} style={{ flex: 1, padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: 'var(--fs-small)' }} />
                                    {uploading && <span style={{ color: '#01abed', fontSize: 'var(--fs-small)' }}>Uploading...</span>}
                                </div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: 'var(--fs-small)', color: 'var(--ink-muted)' }}>Or enter document URL directly:</label>
                                <input value={current.document_url || ''} onChange={e => setCurrent({ ...current, document_url: e.target.value })} placeholder="https://example.com/document.pdf" style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: 'var(--fs-body)' }} />
                                {current.document_url && (
                                    <div style={{ marginTop: '10px' }}>
                                        {current.document_url.match(/\.(pdf)$/i) ? (
                                            <a href={resolveAssetUrl(current.document_url)} target="_blank" rel="noopener noreferrer" style={{ color: '#01abed' }}>
                                                <i className="bi bi-file-pdf" style={{ marginRight: '8px' }}></i>
                                                View Document (PDF)
                                            </a>
                                        ) : (
                                            <img src={resolveAssetUrl(current.document_url)} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px' }} />
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)' }}>
                                    <input type="checkbox" checked={!!current.published} onChange={e => setCurrent({ ...current, published: e.target.checked ? 1 : 0 })} style={{ width: '18px', height: '18px' }} />
                                    Published
                                </label>
                            </div>

                            <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 600 }}>Roles (one or more)</h3>

                            {(current.roles || []).map((role, idx) => (
                                <div key={idx} style={{ marginBottom: '16px', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--sky-tint)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <strong style={{ fontSize: 'var(--fs-body)' }}>Role {idx + 1}</strong>
                                        {(current.roles || []).length > 1 && (
                                            <button type="button" onClick={() => {
                                                const next = current.roles.filter((_, i) => i !== idx);
                                                setCurrent({ ...current, roles: next });
                                            }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: 'var(--fs-small)' }}>
                                                <i className="bi bi-x-lg" style={{ marginRight: '4px' }}></i> Remove
                                            </button>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '16px', marginBottom: '12px' }}>
                                        <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)' }}>Job Title *</label>
                                            <input required value={role.title || ''} onChange={e => {
                                                const next = [...current.roles];
                                                next[idx] = { ...next[idx], title: e.target.value };
                                                setCurrent({ ...current, roles: next });
                                            }} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: 'var(--fs-body)' }} />
                                        </div>
                                        <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)' }}>Location</label>
                                            <input value={role.location || ''} onChange={e => {
                                                const next = [...current.roles];
                                                next[idx] = { ...next[idx], location: e.target.value };
                                                setCurrent({ ...current, roles: next });
                                            }} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: 'var(--fs-body)' }} />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)' }}>Job Description</label>
                                        <textarea rows="3" value={role.description || ''} onChange={e => {
                                            const next = [...current.roles];
                                            next[idx] = { ...next[idx], description: e.target.value };
                                            setCurrent({ ...current, roles: next });
                                        }} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'inherit', fontSize: 'var(--fs-body)' }} />
                                    </div>

                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)' }}>Qualifications (comma separated)</label>
                                        <input value={Array.isArray(role.qualifications) ? role.qualifications.join(', ') : ''} onChange={e => {
                                            const next = [...current.roles];
                                            next[idx] = { ...next[idx], qualifications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) };
                                            setCurrent({ ...current, roles: next });
                                        }} placeholder="Qualification 1, Qualification 2, ..." style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: 'var(--fs-body)' }} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)' }}>Preferred Experience (comma separated)</label>
                                        <input value={Array.isArray(role.preferred_experience) ? role.preferred_experience.join(', ') : ''} onChange={e => {
                                            const next = [...current.roles];
                                            next[idx] = { ...next[idx], preferred_experience: e.target.value.split(',').map(s => s.trim()).filter(Boolean) };
                                            setCurrent({ ...current, roles: next });
                                        }} placeholder="Experience 1, Experience 2, ..." style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: 'var(--fs-body)' }} />
                                    </div>
                                </div>
                            ))}

                            <button type="button" onClick={() => setCurrent({ ...current, roles: [...(current.roles || []), { title: '', location: '', description: '', qualifications: [], preferred_experience: [] }] })} style={{ marginBottom: '24px', padding: '10px 16px', border: '1px dashed var(--border)', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontSize: 'var(--fs-body)', width: '100%' }}>
                                <i className="bi bi-plus-circle" style={{ marginRight: '6px' }}></i> Add another role
                            </button>

                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '12px 20px', border: '1px solid var(--border)', background: '#ffffff', borderRadius: '4px', cursor: 'pointer', width: isMobile ? '100%' : 'auto', fontSize: 'var(--fs-body)' }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ width: isMobile ? '100%' : 'auto', padding: '12px 24px', fontSize: 'var(--fs-body)' }}>Save advert</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
