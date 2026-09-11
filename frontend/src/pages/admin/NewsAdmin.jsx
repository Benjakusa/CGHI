import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from './Dashboard';
import { getToken, API_BASE, resolveAssetUrl } from '../../context/AuthContext';

export default function NewsAdmin() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [current, setCurrent] = useState({});
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => { loadItems(); }, []);

    function loadItems() {
        setLoading(true);
        fetch(`${API_BASE}/api/news/admin`, { 
            headers: { 'Authorization': `Bearer ${getToken()}` } 
        })
            .then(r => {
                if (r.status === 401) {
                    localStorage.removeItem('cghi_token');
                    localStorage.removeItem('cghi_admin');
                    setAdmin(null);
                    setError('Session expired. Please log in again.');
                    setLoading(false);
                    return;
                }
                if (!r.ok) throw new Error('Failed to fetch news');
                return r.json();
            })
            .then(data => { 
                setItems(data); 
                setLoading(false); 
            })
            .catch(err => {
                console.error('Error loading news:', err);
                setLoading(false);
            });
    }

    // Handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            setCurrent({ ...current, image_url: data.url });
            alert('Image uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleImageUrlChange = (e) => {
        setCurrent({ ...current, image_url: e.target.value });
    };

    function handleSave(e) {
        e.preventDefault();
        const isEdit = !!current.id;
        const url = isEdit ? `${API_BASE}/api/news/admin/${current.id}` : `${API_BASE}/api/news/admin`;
        fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${getToken()}` 
            },
            body: JSON.stringify(current)
        })
        .then(r => {
            if (!r.ok) throw new Error('Save failed');
            return r.json();
        })
        .then(() => {
            setModalOpen(false);
            loadItems();
        })
        .catch(err => console.error('Error saving news:', err));
    }

    function togglePublish(id) {
        fetch(`${API_BASE}/api/news/admin/${id}/publish`, {
            method: 'PATCH', 
            headers: { 'Authorization': `Bearer ${getToken()}` }
        })
        .then(() => loadItems())
        .catch(err => console.error('Error toggling publish:', err));
    }

    function handleDelete(id) {
        if (!window.confirm('Delete this news article?')) return;
        fetch(`${API_BASE}/api/news/admin/${id}`, {
            method: 'DELETE', 
            headers: { 'Authorization': `Bearer ${getToken()}` }
        })
        .then(() => loadItems())
        .catch(err => console.error('Error deleting news:', err));
    }

    if (loading) {
        return <DashboardLayout title="Manage News & Insights">Loading news...</DashboardLayout>;
    }

    const isMobile = window.innerWidth <= 768;

    return (
        <DashboardLayout title="Manage News & Insights">
            <div style={{ 
                display: 'flex', 
                justifyContent: isMobile ? 'stretch' : 'flex-end', 
                marginBottom: '24px',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '12px' : '0'
            }}>
                <button 
                    className="btn-primary" 
                    onClick={() => { setCurrent({ published: 1 }); setModalOpen(true); }}
                    style={{ 
                        width: isMobile ? '100%' : 'auto',
                        padding: '12px',
                        justifyContent: 'center'
                    }}
                >
                    <i className="bi bi-plus-circle" style={{ marginRight: '6px' }}></i> Add Article
                </button>
            </div>

            <div style={{ 
                background: '#fff', 
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
                    fontSize: isMobile ? '0.85rem' : '1rem'
                }}>
                    <thead>
                        <tr style={{ background: 'var(--surface-alt)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: isMobile ? '10px' : '16px' }}>Title</th>
                            <th style={{ padding: isMobile ? '10px' : '16px' }}>Category</th>
                            <th style={{ padding: isMobile ? '10px' : '16px' }}>Date</th>
                            <th style={{ padding: isMobile ? '10px' : '16px' }}>Status</th>
                            <th style={{ padding: isMobile ? '10px' : '16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: isMobile ? '10px' : '16px', fontWeight: 600, fontSize: isMobile ? '0.85rem' : '1rem' }}>{item.title}</td>
                                <td style={{ padding: isMobile ? '10px' : '16px', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>{item.category || 'General'}</td>
                                <td style={{ padding: isMobile ? '10px' : '16px', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>{item.published_at || 'N/A'}</td>
                                <td style={{ padding: isMobile ? '10px' : '16px' }}>
                                    {item.published ? (
                                        <span style={{ 
                                            background: '#e8f8f5', 
                                            color: '#27ae60', 
                                            padding: '4px 8px', 
                                            borderRadius: '4px', 
                                            fontSize: isMobile ? '0.7rem' : '0.8rem', 
                                            fontWeight: 600 
                                        }}>Published</span>
                                    ) : (
                                        <span style={{ 
                                            background: '#fef5e7', 
                                            color: '#f39c12', 
                                            padding: '4px 8px', 
                                            borderRadius: '4px', 
                                            fontSize: isMobile ? '0.7rem' : '0.8rem', 
                                            fontWeight: 600 
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
                                            fontSize: isMobile ? '0.75rem' : '0.85rem',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            <i className={item.published ? 'bi bi-toggle-off' : 'bi bi-toggle-on'} style={{ marginRight: '4px' }}></i>
                                            {item.published ? 'Unpublish' : 'Publish'}
                                        </button>
                                        <button onClick={() => { setCurrent(item); setModalOpen(true); }} style={{ 
                                            background: 'none', 
                                            border: '1px solid var(--border)', 
                                            borderRadius: '4px', 
                                            padding: isMobile ? '6px 10px' : '6px 12px', 
                                            cursor: 'pointer',
                                            fontSize: isMobile ? '0.75rem' : '0.85rem'
                                        }}>
                                            <i className="bi bi-pencil" style={{ marginRight: '4px' }}></i>
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} style={{ 
                                            background: '#fdf3f2', 
                                            color: '#c0392b', 
                                            border: '1px solid #f5b7b1', 
                                            borderRadius: '4px', 
                                            padding: isMobile ? '6px 10px' : '6px 12px', 
                                            cursor: 'pointer',
                                            fontSize: isMobile ? '0.75rem' : '0.85rem'
                                        }}>
                                            <i className="bi bi-trash" style={{ marginRight: '4px' }}></i>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-muted)' }}>No news articles found. Click "Add Article" to create one.</td></tr>
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
                        background: '#fff', 
                        width: '100%', 
                        maxWidth: '700px', 
                        borderRadius: '8px', 
                        padding: isMobile ? '20px' : '32px', 
                        maxHeight: '90vh', 
                        overflowY: 'auto',
                        margin: isMobile ? '16px' : '0'
                    }}>
                        <h2 style={{ marginBottom: '24px', fontSize: isMobile ? '1.3rem' : '1.8rem' }}>{current.id ? 'Edit Article' : 'Add Article'}</h2>
                        <form onSubmit={handleSave}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: isMobile ? '0.9rem' : '1rem' }}>Title *</label>
                                <input required value={current.title || ''} onChange={e => setCurrent({ ...current, title: e.target.value })} style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    border: '1px solid var(--border)', 
                                    borderRadius: '4px',
                                    fontSize: isMobile ? '0.9rem' : '1rem'
                                }} />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: isMobile ? '0.9rem' : '1rem' }}>Category</label>
                                <input value={current.category || ''} onChange={e => setCurrent({ ...current, category: e.target.value })} style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    border: '1px solid var(--border)', 
                                    borderRadius: '4px',
                                    fontSize: isMobile ? '0.9rem' : '1rem'
                                }} />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: isMobile ? '0.9rem' : '1rem' }}>Excerpt (Summary)</label>
                                <textarea rows="2" value={current.excerpt || ''} onChange={e => setCurrent({ ...current, excerpt: e.target.value })} style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    border: '1px solid var(--border)', 
                                    borderRadius: '4px', 
                                    fontFamily: 'inherit',
                                    fontSize: isMobile ? '0.9rem' : '1rem'
                                }} />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: isMobile ? '0.9rem' : '1rem' }}>Full Content</label>
                                <textarea rows="6" value={current.content || ''} onChange={e => setCurrent({ ...current, content: e.target.value })} style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    border: '1px solid var(--border)', 
                                    borderRadius: '4px', 
                                    fontFamily: 'inherit',
                                    fontSize: isMobile ? '0.9rem' : '1rem'
                                }} />
                            </div>

                            {/* Image Upload Section */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: isMobile ? '0.9rem' : '1rem' }}>Image</label>
                                
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: isMobile ? 'column' : 'row',
                                    gap: '10px',
                                    alignItems: isMobile ? 'stretch' : 'center',
                                    marginBottom: '10px'
                                }}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{ 
                                            flex: 1,
                                            padding: isMobile ? '8px' : '8px',
                                            border: '1px solid var(--border)',
                                            borderRadius: '4px',
                                            fontSize: isMobile ? '0.85rem' : '0.9rem'
                                        }}
                                    />
                                    {uploading && <span style={{ color: '#3498db', fontSize: '0.85rem' }}>Uploading...</span>}
                                </div>

                                <div style={{ marginTop: '8px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>Or enter image URL directly:</label>
                                    <input 
                                        value={current.image_url || ''} 
                                        onChange={handleImageUrlChange} 
                                        placeholder="https://example.com/image.jpg" 
                                        style={{ 
                                            width: '100%', 
                                            padding: '10px', 
                                            border: '1px solid var(--border)', 
                                            borderRadius: '4px',
                                            fontSize: isMobile ? '0.9rem' : '1rem'
                                        }} 
                                    />
                                </div>

                                {current.image_url && (
                                    <div style={{ marginTop: '10px' }}>
                                        <img src={resolveAssetUrl(current.image_url)} alt="Preview" style={{ 
                                            maxWidth: '100%', 
                                            maxHeight: '150px', 
                                            objectFit: 'contain',
                                            border: '1px solid var(--border)',
                                            borderRadius: '4px',
                                            padding: '4px'
                                        }} />
                                    </div>
                                )}
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                flexDirection: isMobile ? 'column' : 'row',
                                gap: isMobile ? '12px' : '16px', 
                                marginBottom: '16px' 
                            }}>
                                <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: isMobile ? '0.9rem' : '1rem' }}>Author</label>
                                    <input value={current.author || ''} onChange={e => setCurrent({ ...current, author: e.target.value })} style={{ 
                                        width: '100%', 
                                        padding: '10px', 
                                        border: '1px solid var(--border)', 
                                        borderRadius: '4px',
                                        fontSize: isMobile ? '0.9rem' : '1rem'
                                    }} />
                                </div>
                                <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: isMobile ? '0.9rem' : '1rem' }}>Published Date</label>
                                    <input type="date" value={current.published_at || ''} onChange={e => setCurrent({ ...current, published_at: e.target.value })} style={{ 
                                        width: '100%', 
                                        padding: '10px', 
                                        border: '1px solid var(--border)', 
                                        borderRadius: '4px',
                                        fontSize: isMobile ? '0.9rem' : '1rem'
                                    }} />
                                </div>
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                flexDirection: isMobile ? 'column' : 'row',
                                gap: isMobile ? '12px' : '16px', 
                                marginBottom: '24px' 
                            }}>
                                <div style={{ 
                                    flex: 1, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    paddingTop: isMobile ? '0' : '10px',
                                    width: isMobile ? '100%' : 'auto'
                                }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: isMobile ? '0.9rem' : '1rem' }}>
                                        <input type="checkbox" checked={!!current.published} onChange={e => setCurrent({ ...current, published: e.target.checked ? 1 : 0 })} style={{ width: '18px', height: '18px' }} />
                                        Published
                                    </label>
                                </div>
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                flexDirection: isMobile ? 'column-reverse' : 'row',
                                justifyContent: 'flex-end', 
                                gap: '12px' 
                            }}>
                                <button type="button" onClick={() => setModalOpen(false)} style={{ 
                                    padding: '12px 20px', 
                                    border: '1px solid var(--border)', 
                                    background: '#fff', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    width: isMobile ? '100%' : 'auto',
                                    fontSize: isMobile ? '0.9rem' : '1rem'
                                }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ 
                                    width: isMobile ? '100%' : 'auto',
                                    padding: '12px 24px',
                                    fontSize: isMobile ? '0.9rem' : '1rem'
                                }}>Save Article</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}