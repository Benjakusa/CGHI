import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ activePage }) {
    const { isAuthenticated, admin, logout } = useAuth();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const [navOpen, setNavOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null); // 'who' | 'what' | null
    const dropRef = useRef(null);
    const navRef = useRef(null);

    // Pages that live inside each dropdown, so the matching group and item can
    // be highlighted with `.active` on every route.
    const whoPages = ['about', 'careers', 'contact', 'privacy'];
    const whatPages = ['what-we-do', 'projects', 'initiatives', 'resources'];
    const whoActive = whoPages.includes(activePage);
    const whatActive = whatPages.includes(activePage);

    // Close profile dropdown + nav dropdowns on outside click
    useEffect(() => {
        function handle(e) {
            if (dropRef.current && !dropRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
            if (navRef.current && !navRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        }
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    // Toggle body.nav-open so the mobile CSS engages
    useEffect(() => {
        if (navOpen) document.body.classList.add('nav-open');
        else document.body.classList.remove('nav-open');
        return () => document.body.classList.remove('nav-open');
    }, [navOpen]);

    function handleLogout() {
        logout();
        setProfileOpen(false);
        setNavOpen(false);
        setOpenDropdown(null);
        navigate('/');
    }

    function closeNav() {
        setNavOpen(false);
        setOpenDropdown(null);
    }

    function toggleDropdown(name) {
        setOpenDropdown(prev => (prev === name ? null : name));
    }

    // Hover handlers: open immediately on enter, close on leave (only if this
    // dropdown is the one currently open, to avoid race conditions when the
    // pointer moves quickly between the two menus).
    function openOnHover(name) {
        setOpenDropdown(name);
    }

    function closeOnLeave(name) {
        setOpenDropdown(prev => (prev === name ? null : prev));
    }

    return (
        <header className="site-header">
            <div className="wrap">
                <a className="brand" href="/" aria-label="CGP Home" onClick={closeNav}>
                    <img
                        className="brand-logo"
                        src="/Assets/logo.png"
                        alt="Center for Global Health & Pandemic Intelligence"
                    />
                </a>

                <button
                    type="button"
                    className="nav-toggle"
                    aria-label="Toggle menu"
                    aria-expanded={navOpen}
                    onClick={() => setNavOpen(o => !o)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <nav className="primary-nav" aria-label="Primary" ref={navRef}>
                    <a
                        href="/"
                        className={activePage === 'home' ? 'active' : ''}
                        onClick={closeNav}
                    >
                        Home
                    </a>

                    {/* ---------- Who We Are ---------- */}
                    <div
                        className={`dropdown${openDropdown === 'who' ? ' open' : ''}${whoActive ? ' active' : ''}`}
                        onMouseEnter={() => openOnHover('who')}
                        onMouseLeave={() => closeOnLeave('who')}
                    >
                        <button
                            type="button"
                            className="dropbtn"
                            aria-haspopup="true"
                            aria-expanded={openDropdown === 'who'}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown('who');
                            }}
                        >
                            Who We Are{' '}
                            <span aria-hidden="true">
                                <i className="bi bi-chevron-down"></i>
                            </span>
                        </button>
                        <div className={`dropdown-content${openDropdown === 'who' ? ' open' : ''}`}>
                            <a href="/about" className={activePage === 'about' ? 'active' : ''} onClick={closeNav}>About Us</a>
                            <a href="/careers" className={activePage === 'careers' ? 'active' : ''} onClick={closeNav}>Careers</a>
                            <a href="/contact" className={activePage === 'contact' ? 'active' : ''} onClick={closeNav}>Contact</a>
                            <a href="/privacy" className={activePage === 'privacy' ? 'active' : ''} onClick={closeNav}>Privacy Policy</a>
                        </div>
                    </div>

                    {/* ---------- What We Do ---------- */}
                    <div
                        className={`dropdown${openDropdown === 'what' ? ' open' : ''}${whatActive ? ' active' : ''}`}
                        onMouseEnter={() => openOnHover('what')}
                        onMouseLeave={() => closeOnLeave('what')}
                    >
                        <button
                            type="button"
                            className="dropbtn"
                            aria-haspopup="true"
                            aria-expanded={openDropdown === 'what'}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown('what');
                            }}
                        >
                            What We Do{' '}
                            <span aria-hidden="true">
                                <i className="bi bi-chevron-down"></i>
                            </span>
                        </button>
                        <div className={`dropdown-content${openDropdown === 'what' ? ' open' : ''}`}>
                            <a href="/what-we-do" className={activePage === 'what-we-do' ? 'active' : ''} onClick={closeNav}>Overview</a>
                            <a href="/projects" className={activePage === 'projects' ? 'active' : ''} onClick={closeNav}>Projects &amp; Impact</a>
                            <a href="/initiatives" className={activePage === 'initiatives' ? 'active' : ''} onClick={closeNav}>CGP Initiatives</a>
                            <a href="/resources" className={activePage === 'resources' ? 'active' : ''} onClick={closeNav}>Resources</a>
                        </div>
                    </div>

                    <a
                        href="/news"
                        className={activePage === 'news' ? 'active' : ''}
                        onClick={closeNav}
                    >
                        News &amp; Insights
                    </a>

                    {/* ---------- Profile / Staff ---------- */}
                    <div
                        className="nav-profile-wrap"
                        ref={dropRef}
                        style={{
                            position: 'relative',
                            display: 'inline-flex',
                            alignItems: 'center',
                        }}
                    >
                        <button
                            className="nav-search-btn"
                            type="button"
                            aria-label={isAuthenticated ? 'Admin menu' : 'Staff login'}
                            onClick={() =>
                                isAuthenticated
                                    ? setProfileOpen(o => !o)
                                    : navigate('/admin/login')
                            }
                            style={{ gap: '6px' }}
                        >
                            <i
                                className={`bi ${
                                    isAuthenticated ? 'bi-person-fill-check' : 'bi-person-circle'
                                }`}
                            ></i>
                            {isAuthenticated ? admin?.name?.split(' ')[0] || 'Admin' : 'Staff'}
                        </button>

                        {isAuthenticated && profileOpen && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 8px)',
                                    right: 0,
                                    background: '#fff',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px',
                                    minWidth: '180px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    zIndex: 9999,
                                    overflow: 'hidden',
                                }}
                            >
                                <a
                                    href="/admin"
                                    onClick={closeNav}
                                    style={{
                                        display: 'block',
                                        padding: '12px 16px',
                                        borderBottom: '1px solid var(--border)',
                                        color: 'var(--ink)',
                                        textDecoration: 'none',
                                        fontSize: '0.92rem',
                                    }}
                                >
                                    <i
                                        className="bi bi-speedometer2"
                                        style={{ marginRight: '8px' }}
                                    ></i>
                                    Dashboard
                                </a>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '12px 16px',
                                        textAlign: 'left',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#c0392b',
                                        fontSize: '0.92rem',
                                    }}
                                >
                                    <i
                                        className="bi bi-box-arrow-right"
                                        style={{ marginRight: '8px' }}
                                    ></i>
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}