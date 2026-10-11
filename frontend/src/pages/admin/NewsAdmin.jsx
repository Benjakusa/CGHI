import React, { useEffect, useState } from 'react';
import DashboardLayout from './Dashboard';
import { API_BASE, getToken, resolveAssetUrl } from '../../context/AuthContext';
import ArticleView from '../../components/ArticleView';

const blank = () => ({ type: 'news', title: '', category: '', author: '', excerpt: '', cover_image: '', cover_caption: '', published: 0, blocks: [] });
const styles = { input: { width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 2 }, field: { display: 'grid', gap: 6, marginBottom: 14 } };

export default function NewsAdmin() {
  const [items, setItems] = useState([]);
  const [article, setArticle] = useState(null);
  const [preview, setPreview] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const headers = () => ({ Authorization: `Bearer ${getToken()}` });
  const load = async () => {
    const response = await fetch(`${API_BASE}/api/news/admin`, { headers: headers() });
    if (response.ok) setItems(await response.json());
  };
  useEffect(() => { load(); }, []);
  const update = (key, value) => setArticle((current) => ({ ...current, [key]: value }));
  const upload = async (file, apply) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Choose a JPG, PNG or WebP image up to 5 MB.'); return;
    }
    setUploading(true); setError('');
    try {
      const data = new FormData(); data.append('images', file);
      const response = await fetch(`${API_BASE}/api/news/admin/upload`, { method: 'POST', headers: headers(), body: data });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Upload failed.');
      apply(result.urls[0]);
    } catch (exception) { setError(exception.message); }
    finally { setUploading(false); }
  };
  const openEdit = async (item) => {
    if (!item) { setArticle(blank()); setPreview(false); return; }
    const response = await fetch(`${API_BASE}/api/news/admin/${item.id}`, { headers: headers() });
    if (response.ok) { const data = await response.json(); setArticle({ ...data, blocks: (data.blocks || []).map((b) => ({ ...b, type: b.block_type })) }); setPreview(false); }
  };
  const validate = () => {
    const issues = [];
    if (!article.title.trim()) issues.push('Add a title.');
    if (!article.excerpt.trim()) issues.push('Add an excerpt.');
    if (!article.cover_image) issues.push('Add a cover image.');
    if (!article.blocks.some((block) => block.type !== 'image' && block.text?.trim())) issues.push('Add at least one text block.');
    setError(issues.join(' ')); return issues.length === 0;
  };
  const save = async (publish = false) => {
    if (publish && !validate()) return;
    const payload = { ...article, published_at: article.published_at || null, status: publish ? 'published' : (article.published ? 'published' : 'draft') };
    const url = `${API_BASE}/api/news/admin${article.id ? `/${article.id}` : ''}`;
    const response = await fetch(url, { method: article.id ? 'PUT' : 'POST', headers: { ...headers(), 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) { setError(result.error || 'Could not save article.'); return; }
    setArticle({ ...result, blocks: (result.blocks || []).map((b) => ({ ...b, type: b.block_type })) });
    await load();
    if (publish) setPreview(true);
    else setArticle(null);
  };
  const move = (index, delta) => {
    const blocks = [...article.blocks]; const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]]; update('blocks', blocks);
  };
  const filtered = items.filter((item) => (filterType === 'all' || item.type === filterType) && (filterStatus === 'all' || (item.published ? 'published' : 'draft') === filterStatus));

  return <DashboardLayout title="Manage News & Research">
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
      <div><select value={filterType} onChange={(event) => setFilterType(event.target.value)}><option value="all">All types</option><option value="news">News</option><option value="research">Research</option></select>{' '}
        <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}><option value="all">All statuses</option><option value="draft">Draft</option><option value="published">Published</option></select></div>
      <button className="btn-primary" onClick={() => openEdit(null)}>Add Article</button>
    </div>
    <div style={{ overflowX: 'auto', background: 'var(--surface)', border: '1px solid var(--border)' }}><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
      <thead><tr>{['Type', 'Title', 'Status', 'Date', 'Actions'].map((label) => <th key={label} style={{ padding: 12 }}>{label}</th>)}</tr></thead>
      <tbody>{filtered.map((item) => <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
        <td style={{ padding: 12 }}>{item.type}</td><td style={{ padding: 12 }}>{item.title}</td><td style={{ padding: 12 }}>{item.published ? 'Published' : 'Draft'}</td><td style={{ padding: 12 }}>{item.published_at || item.created_at}</td>
        <td style={{ padding: 12, whiteSpace: 'nowrap' }}><button className="news-icon-button" aria-label={`Edit ${item.title}`} title="Edit" onClick={() => openEdit(item)}><i className="bi bi-pencil-square" aria-hidden="true" /></button>{' '}
          <button className="news-icon-button" aria-label={item.published ? `Unpublish ${item.title}` : `Publish ${item.title}`} title={item.published ? 'Unpublish' : 'Publish'} onClick={async () => { await fetch(`${API_BASE}/api/news/admin/${item.id}/publish`, { method: 'PATCH', headers: { ...headers(), 'Content-Type': 'application/json' }, body: JSON.stringify({ status: item.published ? 'draft' : 'published' }) }); load(); }}><i className={`bi ${item.published ? 'bi-eye' : 'bi-send'}`} aria-hidden="true" /></button>{' '}
          <button className="news-icon-button" aria-label={`Delete ${item.title}`} title="Delete" onClick={async () => { if (window.confirm('Delete this article?')) { await fetch(`${API_BASE}/api/news/admin/${item.id}`, { method: 'DELETE', headers: headers() }); load(); } }}><i className="bi bi-trash3" aria-hidden="true" /></button></td>
      </tr>)}</tbody>
    </table></div>

    {article && <div className="news-editor-overlay"><section className="news-editor" role="dialog" aria-modal="true" aria-labelledby="editor-title">
      {preview ? <><div className="news-preview-banner">Preview — not published</div><button onClick={() => setPreview(false)}>Back to editing</button>
        <ArticleView article={{ ...article, slug: article.slug || 'preview' }} onCopy={setError} />
        <button className="btn-primary" onClick={() => save(true)}>Publish</button></> : <>
        <h2 id="editor-title">{article.id ? 'Edit article' : 'New article'}</h2>
        {error && <p role="alert" className="news-form-error">{error}</p>}
        <div style={styles.field}><label>Type</label><select value={article.type} onChange={(e) => update('type', e.target.value)}><option value="news">News</option><option value="research">Research</option></select></div>
        <div style={styles.field}><label>Title *</label><input style={styles.input} value={article.title} onChange={(e) => update('title', e.target.value)} /></div>
        <div style={styles.field}><label>Category</label><input style={styles.input} value={article.category || ''} onChange={(e) => update('category', e.target.value)} /></div>
        <div style={styles.field}><label>Author</label><input style={styles.input} value={article.author || ''} onChange={(e) => update('author', e.target.value)} /></div>
        <div style={styles.field}><label>Excerpt *</label><textarea style={styles.input} rows="3" value={article.excerpt} onChange={(e) => update('excerpt', e.target.value)} /></div>
        <div style={styles.field}><label>Cover photo *</label><label className="news-upload-button"><i className="bi bi-upload" aria-hidden="true" /> <span>{uploading ? 'Uploading…' : 'Choose cover image'}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => upload(e.target.files[0], (url) => update('cover_image', url))} /></label>{article.cover_image && <img className="news-editor-thumb" src={resolveAssetUrl(article.cover_image)} alt="Cover preview" />}<input style={styles.input} placeholder="Cover caption (optional)" value={article.cover_caption || ''} onChange={(e) => update('cover_caption', e.target.value)} /></div>
        <h3>Content</h3>
        {article.blocks.map((block, index) => <fieldset className="news-block-editor" key={block.id || index}><legend>{block.type === 'image' ? 'Image block' : 'Text block'}</legend>
          {block.type === 'image' ? <><label className="news-upload-button"><i className="bi bi-upload" aria-hidden="true" /><span>Choose image</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => upload(e.target.files[0], (url) => update('blocks', article.blocks.map((item, i) => i === index ? { ...item, image_url: url } : item)))} /></label>{block.image_url && <img className="news-editor-thumb" src={resolveAssetUrl(block.image_url)} alt={block.alt_text || ''} />}<input style={styles.input} placeholder="Caption" value={block.caption || ''} onChange={(e) => update('blocks', article.blocks.map((item, i) => i === index ? { ...item, caption: e.target.value } : item))} /><input style={styles.input} placeholder="Alt text" value={block.alt_text || ''} onChange={(e) => update('blocks', article.blocks.map((item, i) => i === index ? { ...item, alt_text: e.target.value } : item))} /></> : <textarea style={styles.input} rows="5" placeholder="Write paragraphs separated by a blank line" value={block.text || ''} onChange={(e) => update('blocks', article.blocks.map((item, i) => i === index ? { ...item, text: e.target.value } : item))} />}
          <div className="news-block-actions"><button className="news-icon-button" type="button" aria-label="Move block up" title="Move up" onClick={() => move(index, -1)}><i className="bi bi-chevron-up" aria-hidden="true" /></button><button className="news-icon-button" type="button" aria-label="Move block down" title="Move down" onClick={() => move(index, 1)}><i className="bi bi-chevron-down" aria-hidden="true" /></button><button className="news-icon-button" type="button" aria-label="Delete content block" title="Delete" onClick={() => { if (window.confirm('Delete this content block?')) update('blocks', article.blocks.filter((_, i) => i !== index)); }}><i className="bi bi-trash3" aria-hidden="true" /></button></div>
        </fieldset>)}
        <div className="news-block-add"><button type="button" aria-label="Add text block" title="Add text" onClick={() => update('blocks', [...article.blocks, { type: 'text', text: '' }])}><i className="bi bi-plus-circle" aria-hidden="true" /> Add text</button><button type="button" aria-label="Add image block" title="Add image" onClick={() => update('blocks', [...article.blocks, { type: 'image', image_url: '', caption: '', alt_text: '' }])}><i className="bi bi-image" aria-hidden="true" /> Add image</button></div>
        <div className="news-editor-footer"><button onClick={() => setArticle(null)}>Cancel</button><button disabled={uploading} onClick={() => save(false)}>Save draft</button><button onClick={() => setPreview(true)}>Preview</button><button className="btn-primary" onClick={() => save(true)}>Publish</button>{article.published && <button onClick={async () => { await fetch(`${API_BASE}/api/news/admin/${article.id}/publish`, { method: 'PATCH', headers: { ...headers(), 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'draft' }) }); setArticle(null); load(); }}>Unpublish</button>}</div>
      </>}
    </section></div>}
  </DashboardLayout>;
}
