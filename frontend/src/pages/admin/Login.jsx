import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            login(data.token, data.admin);
            navigate('/admin');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Navbar />
            <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', backgroundColor: 'var(--surface)' }}>
                <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: 'var(--shadow)', width: '100%', maxWidth: '420px' }}>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '8px', textAlign: 'center' }}>Staff Login</h1>
                    <p style={{ textAlign: 'center', color: 'var(--ink-muted)', marginBottom: '32px' }}>Access the CGP Content Management System</p>

                    {error && (
                        <div style={{ background: '#fdf3f2', color: '#c0392b', padding: '12px', borderRadius: '6px', marginBottom: '24px', fontSize: '0.92rem' }}>
                            <i className="bi bi-exclamation-circle-fill" style={{ marginRight: '8px' }}></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.92rem', fontWeight: 600 }}>Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}
                                placeholder="staff@pandemicintelcenter.org"
                            />
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.92rem', fontWeight: 600 }}>Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}
                                placeholder="••••••••"
                            />
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                            {loading ? (
                                <span><i className="bi bi-hourglass-split" style={{ marginRight: '8px' }}></i>Authenticating...</span>
                            ) : (
                                <span><i className="bi bi-box-arrow-in-right" style={{ marginRight: '8px' }}></i>Sign In</span>
                            )}
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
}
