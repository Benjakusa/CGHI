import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const WHO_PAGES = ['about', 'careers', 'contact', 'privacy'];
const WHAT_PAGES = ['what-we-do', 'projects', 'initiatives', 'resources'];

export default function Navbar({ activePage }) {
    const { isAuthenticated, admin, logout } = useAuth();
    const navigate = useNavigate();

    const [profileOpen, setProfileOpen] = useState(false);
    const [navOpen, setNavOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null); // 'who' | 'what' | null

    const dropRef = useRef(null);
    const navRef = useRef(null);
    const hoverCapable = useRef(false);

    // Detect hover capability once (desktop vs touch)
    useEffect(() => {
        hoverCapable.current =
            typeof window !== 'undefined' &&
            window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    }, []);

    const whoActive = WHO_PAGES.includes(activePage);
    const whatActive = WHAT_PAGES.includes(activePage);

    // Outside click closes profile + any open dropdown
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
        document.addEventListener('touchstart', handle);
        return () => {
            document.removeEventListener('mousedown', handle);
            document.removeEventListener('touchstart', handle);
        };
    }, []);

    // Lock body scroll when mobile nav is open
    useEffect(() => {
        document.body.classList.toggle('nav-open', navOpen);
        return () => document.body.classList.remove('nav-open');
    }, [navOpen]);

    // Close everything on route change
    useEffect(() => {
        setNavOpen(false);
        setOpenDropdown(null);
        setProfileOpen(false);
    }, [activePage]);

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

    // Click toggle (works on mobile + desktop)
    function toggleDropdown(name) {
        setOpenDropdown(prev => (prev === name ? null : name));
    }

    // Hover handlers — no-op on touch devices
    function handleMouseEnter(name) {
        if (!hoverCapable.current) return;
        setOpenDropdown(name);
    }
    function handleMouseLeave(name) {
        if (!hoverCapable.current) return;
        setOpenDropdown(prev => (prev === name ? null : prev));
    }

    const dropdownClass = (name, isActive) =>
        [
            'dropdown',
            openDropdown === name ? 'open' : '',
            isActive ? 'has-active' : '',
        ]
            .filter(Boolean)
            .join(' ');

    return (
        <header className="site-header">
            <div className="wrap">
                <Link className="brand" to="/" aria-label="CGP Home" onClick={closeNav}>
                    <img
                        className="brand-logo"
                        src="/Assets/logo.png"
                        alt="Center for Global Health & Pandemic Intelligence"
                    />
                </Link>

                <button
                    type="button"
                    className="nav-toggle"
                    aria-label="Toggle menu"
                    aria-expanded={navOpen}
                    onClick={() => setNavOpen(o => !o)}
                >
                    <span />
                    <span />
                    <span />
                </button>

                <nav className="primary-nav" aria-label="Primary" ref={navRef}>
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => (isActive ? 'active' : '')}
                        onClick={closeNav}
                    >
                        Home
                    </NavLink>

                    {/* ---------- Who We Are ---------- */}
                    <div
                        className={dropdownClass('who', whoActive)}
                        onMouseEnter={() => handleMouseEnter('who')}
                        onMouseLeave={() => handleMouseLeave('who')}
                    >
                        <button
                            type="button"
                            className="dropbtn"
                            aria-haspopup="true"
                            aria-expanded={openDropdown === 'who'}
                            onClick={() => toggleDropdown('who')}
                        >
                            Who We Are{' '}
                            <span aria-hidden="true">
                                <i className="bi bi-chevron-down" />
                            </span>
                        </button>
                        <div className="dropdown-content">
                            <NavLink to="/about" onClick={closeNav}>About Us</NavLink>
                            <NavLink to="/careers" onClick={closeNav}>Careers</NavLink>
                            <NavLink to="/contact" onClick={closeNav}>Contact</NavLink>
                            <NavLink to="/privacy" onClick={closeNav}>Privacy Policy</NavLink>
                        </div>
                    </div>

                    {/* ---------- What We Do ---------- */}
                    <div
                        className={dropdownClass('what', whatActive)}
                        onMouseEnter={() => handleMouseEnter('what')}
                        onMouseLeave={() => handleMouseLeave('what')}
                    >
                        <button
                            type="button"
                            className="dropbtn"
                            aria-haspopup="true"
                            aria-expanded={openDropdown === 'what'}
                            onClick={() => toggleDropdown('what')}
                        >
                            What We Do{' '}
                            <span aria-hidden="true">
                                <i className="bi bi-chevron-down" />
                            </span>
                        </button>
                        <div className="dropdown-content">
                            <NavLink to="/what-we-do" onClick={closeNav}>Overview</NavLink>
                            <NavLink to="/projects" onClick={closeNav}>Projects &amp; Impact</NavLink>
                            <NavLink to="/initiatives" onClick={closeNav}>CGP Initiatives</NavLink>
                            <NavLink to="/resources" onClick={closeNav}>Resources</NavLink>
                        </div>
                    </div>

                    <NavLink
                        to="/news"
                        className={({ isActive }) => (isActive ? 'active' : '')}
                        onClick={closeNav}
                    >
                        News &amp; Insights
                    </NavLink>

                    {/* ---------- Profile / Staff ---------- */}
                    <div className="nav-profile-wrap" ref={dropRef}>
                        <button
                            className="nav-search-btn"
                            type="button"
                            aria-label={isAuthenticated ? 'Admin menu' : 'Staff login'}
                            onClick={() =>
                                isAuthenticated
                                    ? setProfileOpen(o => !o)
                                    : navigate('/admin/login')
                            }
                        >
                            <i
                                className={`bi ${
                                    isAuthenticated
                                        ? 'bi-person-fill-check'
                                        : 'bi-person-circle'
                                }`}
                            />
                            {isAuthenticated
                                ? admin?.name?.split(' ')[0] || 'Admin'
                                : 'Staff'}
                        </button>

                        {isAuthenticated && profileOpen && (
                            <div className="profile-menu">
                                <Link to="/admin" onClick={closeNav}>
                                    <i className="bi bi-speedometer2" />
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} type="button">
                                    <i className="bi bi-box-arrow-right" />
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