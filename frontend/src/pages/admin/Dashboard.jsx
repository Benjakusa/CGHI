import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getToken, API_BASE } from '../../context/AuthContext';

const NAVBAR_HEIGHT = 71;

export default function DashboardLayout({ children, title }) {
    const location = useLocation();
    const path = location.pathname;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        setSidebarOpen(false);
    }, [path]);

    const links = [
        { to: '/admin', icon: 'bi-speedometer2', label: 'Overview' },
        { to: '/admin/heroes', icon: 'bi-images', label: 'Homepage Heroes' },
        { to: '/admin/news', icon: 'bi-newspaper', label: 'News & Insights' },
        { to: '/admin/partners', icon: 'bi-building', label: 'Partners' },
        { to: '/admin/careers', icon: 'bi-briefcase', label: 'Careers' },
        { to: '/admin/resources', icon: 'bi-file-earmark-text', label: 'Resources' },
        { to: '/admin/job-applications', icon: 'bi-inbox', label: 'Job Applications' },
        { to: '/admin/enquiries', icon: 'bi-envelope-paper', label: 'Enquiries' }
    ];

    return (
        <>
            <Navbar />
            <div className="admin-shell">
                <button
                    type="button"
                    className="mobile-sidebar-toggle"
                    aria-label="Toggle dashboard menu"
                    aria-expanded={sidebarOpen}
                    onClick={() => setSidebarOpen(o => !o)}
                >
                    <i className={sidebarOpen ? 'bi bi-x-lg' : 'bi bi-list'}></i>
                </button>

                <div className="admin-shell-inner">
                    <aside className={`admin-sidebar${sidebarOpen ? ' is-open' : ''}`}>
                        <div className="admin-sidebar-label">
                            <span>CMS Dashboard</span>
                        </div>
                        <nav className="admin-sidebar-nav">
                            {links.map(link => {
                                const active = path === link.to;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={active ? 'active' : ''}
                                    >
                                        <i className={`bi ${link.icon}`}></i>
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    <main className="admin-main">
                        <div className="admin-main-inner">
                            {title && <h1 className="admin-title">{title}</h1>}
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            <Footer />

            <style>{`
                .admin-shell {
                    display: flex;
                    flex-direction: column;
                    min-height: calc(100vh - ${NAVBAR_HEIGHT}px);
                }
                .admin-shell-inner {
                    display: flex;
                    flex: 1;
                    align-items: stretch;
                }
                .mobile-sidebar-toggle {
                    display: none;
                }
                .admin-sidebar {
                    width: 260px;
                    flex-shrink: 0;
                    background: #ffffff;
                    border-right: 1px solid var(--border);
                    padding: 32px 0;
                }
                .admin-sidebar-label {
                    padding: 0 24px 32px;
                }
                .admin-sidebar-label span {
                    font-size: var(--fs-caption);
                    font-weight: var(--fw-semibold);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--ink-muted);
                }
                .admin-sidebar-nav {
                    display: flex;
                    flex-direction: column;
                }
                .admin-sidebar-nav a {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 24px;
                    color: var(--ink);
                    background: transparent;
                    border-right: 3px solid transparent;
                    text-decoration: none;
                    font-weight: var(--fw-regular);
                    font-size: var(--fs-body);
                    transition: background 0.15s, color 0.15s;
                }
                .admin-sidebar-nav a:hover {
                    background: rgba(0, 0, 0, 0.06);
                    color: var(--sky-dark);
                    opacity: 1;
                }
                .admin-sidebar-nav a.active {
                    color: var(--sky-dark);
                    background: rgba(0, 0, 0, 0.08);
                    border-right-color: var(--sky);
                    font-weight: var(--fw-semibold);
                }
                .admin-main {
                    flex: 1;
                    min-width: 0;
                    padding: 40px;
                    background: var(--surface);
                }
                .admin-main-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .admin-title {
                    margin-bottom: 24px;
                    font-size: var(--fs-h1);
                    font-weight: var(--fw-bold);
                }

                .dash-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px;
                }
                .dash-card {
                    display: flex;
                    flex-direction: column;
                    background: #ffffff;
                    border-radius: 8px;
                    padding: 24px;
                    border: 1px solid var(--border);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }
                .dash-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-bottom: 16px;
                }
                .dash-card-header h3 {
                    margin: 0;
                    font-size: var(--fs-h3);
                    font-weight: var(--fw-semibold);
                }
                .dash-badge {
                    color: #ffffff;
                    padding: 4px 12px;
                    border-radius: 100px;
                    font-size: var(--fs-small);
                    font-weight: var(--fw-semibold);
                    white-space: nowrap;
                }
                .dash-card-stats {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .dash-stat {
                    flex: 1;
                    background: #ffffff;
                    padding: 16px;
                    border-radius: 6px;
                    text-align: center;
                }
                .dash-stat-num {
                    font-size: var(--fs-stat);
                    font-weight: var(--fw-bold);
                    color: var(--ink);
                    margin-bottom: 4px;
                }
                .dash-stat-lbl {
                    font-size: var(--fs-caption);
                    font-weight: var(--fw-semibold);
                    color: var(--ink-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .dash-manage-btn {
                    display: block;
                    margin-top: auto;
                    width: 100%;
                    text-align: center;
                    background: var(--brand);
                    color: var(--white);
                    border: 2px solid var(--brand);
                    border-radius: var(--radius);
                    padding: 12px 16px;
                    font-weight: var(--fw-bold);
                    font-size: var(--fs-small);
                    letter-spacing: 0.02em;
                    text-decoration: none;
                    white-space: normal;
                    transition: background 0.18s, border-color 0.18s;
                }
                .dash-manage-btn:hover {
                    background: var(--brand-dark);
                    border-color: var(--brand-dark);
                    color: var(--white);
                    opacity: 1;
                }

                @media (max-width: 768px) {
                    .mobile-sidebar-toggle {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: fixed;
                        top: ${NAVBAR_HEIGHT + 10}px;
                        left: 12px;
                        z-index: 999;
                        width: 44px;
                        height: 44px;
                        background: var(--brand);
                        color: #ffffff;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: var(--fs-h3);
                        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    }
                    .admin-shell-inner {
                        flex-direction: column;
                    }
                    .admin-sidebar {
                        position: fixed;
                        top: ${NAVBAR_HEIGHT}px;
                        left: 0;
                        width: 100%;
                        height: calc(100vh - ${NAVBAR_HEIGHT}px);
                        border-right: none;
                        border-bottom: 1px solid var(--border);
                        padding: 20px 0;
                        overflow-y: auto;
                        z-index: 998;
                        transform: translateX(-100%);
                        transition: transform 0.25s ease;
                        box-shadow: 4px 0 16px rgba(0,0,0,0.08);
                    }
                    .admin-sidebar.is-open {
                        transform: translateX(0);
                    }
                    .admin-sidebar-label {
                        padding: 0 20px 16px;
                    }
                    .admin-sidebar-nav a {
                        padding: 14px 20px;
                        border-right: none;
                        border-left: 3px solid transparent;
                        font-size: var(--fs-body);
                    }
                    .admin-sidebar-nav a.active {
                        border-right-color: transparent;
                        border-left-color: var(--sky);
                    }
                    .admin-main {
                        padding: 72px 16px 24px;
                    }
                    .admin-title {
                        font-size: var(--fs-h1);
                    }
                    .dash-card {
                        padding: 16px;
                    }
                    .dash-card-stats {
                        flex-direction: column;
                    }
                    .dash-stat {
                        padding: 12px;
                    }
                }
            `}</style>
        </>
    );
}

export function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            setError('Not authenticated');
            setLoading(false);
            return;
        }

        fetch(`${API_BASE}/api/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
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
                if (!r.ok) throw new Error('Failed to fetch stats');
                return r.json();
            })
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading stats:', err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <DashboardLayout title="Overview">
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading statistics...</div>
            </DashboardLayout>
        );
    }

    if (error || !stats) {
        return (
            <DashboardLayout title="Overview">
                <div style={{ textAlign: 'center', padding: '40px', color: '#000000' }}>
                    <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: 'var(--fs-stat)' }}></i>
                    <p style={{ marginTop: '16px' }}>Error loading dashboard: {error || 'No data available'}</p>
                </div>
            </DashboardLayout>
        );
    }

    const cards = [
        { title: 'Homepage Heroes', data: stats.heroes, link: '/admin/heroes', color: '#01abed' },
        { title: 'News & Insights', data: stats.news, link: '/admin/news', color: '#000000' },
        { title: 'Partners', data: stats.partners, link: '/admin/partners', color: '#000000' },
        { title: 'Careers / Jobs', data: stats.jobs, link: '/admin/careers', color: '#000000' },
        { title: 'Resources', data: stats.resources, link: '/admin/resources', color: '#000000' }
    ];

    return (
        <DashboardLayout title="Overview">
            <div className="dash-grid">
                {cards.map(card => (
                    <div key={card.title} className="dash-card">
                        <div className="dash-card-header">
                            <h3>{card.title}</h3>
                            <span className="dash-badge" style={{ background: card.color }}>
                                {card.data?.total || 0} Total
                            </span>
                        </div>

                        <div className="dash-card-stats">
                            <div className="dash-stat">
                                <div className="dash-stat-num">{card.data?.published || 0}</div>
                                <div className="dash-stat-lbl">Published</div>
                            </div>
                            <div className="dash-stat">
                                <div className="dash-stat-num">{card.data?.unpublished || 0}</div>
                                <div className="dash-stat-lbl">Drafts</div>
                            </div>
                        </div>

                        <Link to={card.link} className="dash-manage-btn">
                            Manage {card.title}
                        </Link>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}