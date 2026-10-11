import React, { useEffect, useState } from 'react';
import DashboardLayout from './Dashboard';
import { API_BASE, getToken, resolveAssetUrl } from '../../context/AuthContext';

const emptyMember = () => ({ name: '', role: '', biography: '', image_url: '', email: '', phone: '', social_links: [], published: 0, sort_order: 0 });

export default function TeamAdmin() {
  const [items, setItems] = useState([]);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });
  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/team/admin`, { headers: authHeaders() });
      if (!response.ok) throw new Error('Could not load team profiles.');
      const rows = await response.json();
      setItems(rows);
      setMessage('');
    } catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch(`${API_BASE}/api/team/admin`, { headers: authHeaders() });
        if (!response.ok) throw new Error('Could not load team profiles.');
        const rows = await response.json();
        if (active) setItems(rows);
      } catch (error) {
        if (active) setMessage(error.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);
  const set = (key, value) => setMember((current) => ({ ...current, [key]: value }));
  const upload = async (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage('Choose a JPG, PNG or WebP image up to 5 MB.'); return;
    }
    setUploading(true); setMessage('');
    try {
      const body = new FormData(); body.append('image', file);
      const response = await fetch(`${API_BASE}/api/upload`, { method: 'POST', headers: authHeaders(), body });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Image upload failed.');
      set('image_url', result.url);
    } catch (error) { setMessage(error.message); }
    finally { setUploading(false); }
  };
  const save = async (event) => {
    event.preventDefault(); setMessage('');
    const url = `${API_BASE}/api/team/admin${member.id ? `/${member.id}` : ''}`;
    try {
      const response = await fetch(url, { method: member.id ? 'PUT' : 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(member) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not save team member.');
      setMember(null); await load(); setMessage('Team member saved.');
    } catch (error) { setMessage(error.message); }
  };
  const inputStyle = { width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 3 };

  return <DashboardLayout title="Manage Team">
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}><button className="btn-primary" onClick={() => { setMessage(''); setMember(emptyMember()); }}>Add Team Member</button></div>
    {message && <p role="status">{message}</p>}
    {loading ? <p>Loading team profiles…</p> : <div style={{ overflowX: 'auto', background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}><thead><tr>{['Name', 'Role', 'Visibility', 'Actions'].map((label) => <th key={label} style={{ padding: 12 }}>{label}</th>)}</tr></thead>
        <tbody>{items.map((item) => <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}><td style={{ padding: 12 }}>{item.name}</td><td style={{ padding: 12 }}>{item.role}</td><td style={{ padding: 12 }}>{item.published ? 'Published' : 'Draft'}</td><td style={{ padding: 12 }}><button type="button" aria-label={`Edit team member: ${item.name}`} title="Edit team member" onClick={() => { setMessage(''); setMember({ ...item, social_links: item.social_links || [] }); }}><i className="bi bi-pencil-square" aria-hidden="true" /> Edit</button>{' '}<button type="button" onClick={async () => { if (window.confirm(`Delete ${item.name}?`)) { const response = await fetch(`${API_BASE}/api/team/admin/${item.id}`, { method: 'DELETE', headers: authHeaders() }); if (response.ok) { await load(); setMessage('Team member deleted.'); } else setMessage('Could not delete team member.'); } }}>Delete</button></td></tr>)}</tbody>
      </table>{items.length === 0 && <p style={{ padding: 16 }}>No team members yet. Add a profile to publish it on the Leadership &amp; Team page.</p>}
    </div>}

    {member && <div className="team-editor-overlay"><form className="team-editor" onSubmit={save}>
      <h2>{member.id ? 'Edit team member' : 'Add team member'}</h2>
      <label>Name *<input required style={inputStyle} value={member.name} onChange={(e) => set('name', e.target.value)} /></label>
      <label>Role or designation *<input required style={inputStyle} value={member.role} onChange={(e) => set('role', e.target.value)} /></label>
      <label>Biography<textarea style={inputStyle} rows="5" value={member.biography || ''} onChange={(e) => set('biography', e.target.value)} /></label>
      <label>Profile image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => upload(e.target.files[0])} /></label>
      {uploading && <p aria-live="polite">Uploading image…</p>}{member.image_url && <img className="team-editor-image" src={resolveAssetUrl(member.image_url)} alt="Profile preview" />}
      <label>Email<input type="email" style={inputStyle} value={member.email || ''} onChange={(e) => set('email', e.target.value)} /></label>
      <label>Phone<input type="tel" style={inputStyle} value={member.phone || ''} onChange={(e) => set('phone', e.target.value)} /></label>
      <fieldset><legend>Social links</legend>{(member.social_links || []).map((link, index) => <div className="team-social-row" key={index}>
        <input aria-label="Social network" style={inputStyle} placeholder="LinkedIn" value={link.label} onChange={(e) => set('social_links', member.social_links.map((item, i) => i === index ? { ...item, label: e.target.value } : item))} />
        <input aria-label="Social profile URL" type="url" style={inputStyle} placeholder="https://…" value={link.url} onChange={(e) => set('social_links', member.social_links.map((item, i) => i === index ? { ...item, url: e.target.value } : item))} />
        <button type="button" onClick={() => set('social_links', member.social_links.filter((_, i) => i !== index))}>Remove</button>
      </div>)}<button type="button" onClick={() => set('social_links', [...(member.social_links || []), { label: '', url: '' }])}>Add social link</button></fieldset>
      <label>Display order<input type="number" style={inputStyle} value={member.sort_order || 0} onChange={(e) => set('sort_order', e.target.value)} /></label>
      <label className="team-publish"><input type="checkbox" checked={!!member.published} onChange={(e) => set('published', e.target.checked ? 1 : 0)} /> Published</label>
      <div className="team-editor-actions"><button type="button" onClick={() => setMember(null)}>Cancel</button><button className="btn-primary" disabled={uploading} type="submit">Save profile</button></div>
    </form></div>}
  </DashboardLayout>;
}
