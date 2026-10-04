

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BRAND, CONTACT, SOCIAL } from '../config/site';
import { PRIMARY_NAV, HEADER_CTA } from '../content/navigation';

/** Nav item ids that light up a parent dropdown. */
const PARENT_OF = {};
PRIMARY_NAV.forEach((item) => {
  if (item.children) item.children.forEach((c) => { PARENT_OF[c.id] = item.id; });
});

/**
 * Grace period before a hover-opened dropdown closes. The panel sits flush
 * against its trigger (see `.dropdown-content { top: 100% }`), so the pointer
 * never crosses dead space — the timer is a safety net for the panel border
 * and for slow cursors, guaranteeing the menu stays open long enough to move
 * into it and click an item.
 */
const DROPDOWN_CLOSE_DELAY = 260;

function useHoverCapable() {
  const [capable, setCapable] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCapable(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return capable;
}

function NavDropdown({ item, isActive, open, onToggle, onClose, onKeyDown, hoverCapable, panelId, buttonId }) {
  const leaveTimer = useRef(null);

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  // Never leave a pending close behind on unmount.
  useEffect(() => clearLeaveTimer, [clearLeaveTimer]);

  const handleEnter = () => {
    clearLeaveTimer();
    onToggle(item.id, true);
  };

  const handleLeave = () => {
    clearLeaveTimer();
    leaveTimer.current = window.setTimeout(() => {
      leaveTimer.current = null;
      onToggle(item.id, false);
    }, DROPDOWN_CLOSE_DELAY);
  };

  return (
    <div
      className={[
        'dropdown',
        open ? 'open' : '',
        isActive ? 'has-active' : '',
      ].filter(Boolean).join(' ')}
      data-menu-id={item.id}
      onMouseEnter={hoverCapable ? handleEnter : undefined}
      onMouseLeave={hoverCapable ? handleLeave : undefined}
      onBlur={(event) => {
        // Keyboard: when focus leaves the trigger and its panel entirely the
        // menu closes; moving between them keeps it open.
        if (!event.currentTarget.contains(event.relatedTarget)) {
          clearLeaveTimer();
          onToggle(item.id, false);
        }
      }}
    >
      <button
        type="button"
        className="dropbtn"
        id={buttonId}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onToggle(item.id, hoverCapable ? true : undefined)}
        onKeyDown={onKeyDown}
      >
        {item.label}{' '}
        <span aria-hidden="true">
          <i className={`bi bi-chevron-down${open ? ' is-open' : ''}`} />
        </span>
      </button>

      <div className="dropdown-content" id={panelId} aria-labelledby={buttonId}>
        <ul className="dropdown-list">
          {item.children.map((child) => (
            <li key={child.id}>
              <NavLink to={child.to} onClick={onClose} onKeyDown={onKeyDown}>
                {child.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Navbar({ activePage }) {
  const { isAuthenticated, admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const headerRef = useRef(null);
  const toggleRef = useRef(null);
  const hoverCapable = useHoverCapable();
  const menuId = useId();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const update = () => {
      if (mq.matches) {
        setOpenMenu(null);
        setProfileOpen(false);
      }
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen && !openMenu && !profileOpen) return undefined;
    function onKeyDown(event) {
      if (event.key !== 'Escape') return;
      if (openMenu || profileOpen) {
        setOpenMenu(null);
        setProfileOpen(false);
        if (headerRef.current) {
          const trigger = headerRef.current.querySelector('[data-escape-target="true"]');
          if (trigger) trigger.focus();
        }
      } else if (mobileOpen) {
        setMobileOpen(false);
        if (toggleRef.current) toggleRef.current.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, openMenu, profileOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    function onPointerDown(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [mobileOpen]);

  const handleToggle = useCallback((id, forced) => {
    setOpenMenu((prev) => {
      const next = forced === undefined ? (prev === id ? null : id) : forced ? id : null;
      return next;
    });
  }, []);

  const closeAll = useCallback(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setProfileOpen(false);
  }, []);


  const onMenuKeyDown = useCallback((event) => {
    const { key } = event;
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape'].includes(key)) return;
    const container = event.currentTarget.closest('.dropdown');
    const panel = container?.querySelector('.dropdown-content');
    if (!panel) return;
    const links = Array.from(panel.querySelectorAll('a, button'));
    if (links.length === 0) return;

    if (key === 'Escape') {
      event.preventDefault();
      setOpenMenu(null);
      const trigger = container.querySelector('.dropbtn');
      if (trigger) trigger.focus();
      return;
    }

    event.preventDefault();
    const focusStep = () => {
      const current = links.indexOf(document.activeElement);
      let next;
      if (key === 'ArrowDown') next = current < 0 ? 0 : (current + 1) % links.length;
      else if (key === 'ArrowUp') next = current <= 0 ? links.length - 1 : current - 1;
      else if (key === 'Home') next = 0;
      else next = links.length - 1;
      links[next].focus();
    };

    // Arrow keys on a closed trigger open the menu first, then move focus in
    // once the panel has rendered and become visible.
    const menuId = container.dataset.menuId;
    if (menuId && !container.classList.contains('open')) {
      setOpenMenu(menuId);
      window.setTimeout(focusStep, 0);
    } else {
      focusStep();
    }
  }, []);

  function handleLogout() {
    logout();
    closeAll();
  }

  function isItemActive(item) {
    if (item.id === activePage) return true;
    if (item.children) {
      const childActive = item.children.some((c) => c.id === activePage);
      const sectionActive = item.children.some(
        (c) => location.pathname.startsWith(c.to) && c.to !== '/'
      );
      return childActive || sectionActive;
    }
    return location.pathname === item.to;
  }

  return (
    <header className="site-header" ref={headerRef}>
      <div className="utility-bar">
        <div className="wrap utility-bar-inner">
          <ul className="utility-bar-info">
            <li>
              <a href={`mailto:${CONTACT.email}`}>
                <i className="bi bi-envelope" aria-hidden="true" /> {CONTACT.email}
              </a>
            </li>
            <li>
              <i className="bi bi-geo-alt" aria-hidden="true" /> {CONTACT.address.formatted}
            </li>
          </ul>
          <ul className="utility-bar-social" aria-label={`${BRAND.abbr} on social media`}>
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${BRAND.abbr} on ${s.label}`}>
                  <i className={`bi ${s.icon}`} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="wrap site-header-main">
        <NavLink className="brand" to="/" aria-label={`${BRAND.abbr} home`} onClick={closeAll}>
          <img
            className="brand-logo"
            src={BRAND.logo}
            alt={BRAND.logoAlt}
            width="220"
            height="72"
            fetchPriority="high"
            decoding="async"
          />
        </NavLink>

        <button
          type="button"
          ref={toggleRef}
          className="nav-toggle"
          aria-label={mobileOpen ? 'Close main menu' : 'Open main menu'}
          aria-expanded={mobileOpen}
          aria-controls="primary-menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span className="nav-toggle-box" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <nav
          className={`primary-nav${mobileOpen ? ' is-open' : ''}`}
          id="primary-menu"
          aria-label="Primary"
          data-open={mobileOpen ? 'true' : 'false'}
        >
          <ul className="primary-nav-list">
            {PRIMARY_NAV.map((item) =>
              item.children ? (
                <li key={item.id} className="primary-nav-item">
                  <NavDropdown
                    item={item}
                    isActive={isItemActive(item)}
                    open={openMenu === item.id}
                    onToggle={handleToggle}
                    onClose={closeAll}
                    onKeyDown={onMenuKeyDown}
                    hoverCapable={hoverCapable}
                    panelId={`${menuId}-${item.id}`}
                    buttonId={`${menuId}-${item.id}-btn`}
                  />
                </li>
              ) : (
                <li key={item.id} className="primary-nav-item">
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    aria-current={isItemActive(item) ? 'page' : undefined}
                    onClick={closeAll}
                  >
                    {item.label}
                  </NavLink>
                </li>
              )
            )}

            <li className="primary-nav-item nav-cta-item">
              <NavLink className="nav-cta" to={HEADER_CTA.to} onClick={closeAll}>
                {HEADER_CTA.label}
              </NavLink>
            </li>

            <li className="primary-nav-item nav-profile-item">
              <button
                type="button"
                className="nav-profile-btn"
                data-escape-target="true"
                aria-label={isAuthenticated ? `Signed in as ${admin?.name || 'administrator'}. Open account menu` : 'Sign In'}
                aria-haspopup="true"
                aria-expanded={profileOpen}
                onClick={() =>
                  isAuthenticated
                    ? setProfileOpen((o) => !o)
                    : navigate('/admin/login')
                }
              >
                <i
                  className={`bi ${
                    isAuthenticated ? 'bi-person-fill-check' : 'bi-box-arrow-in-right'
                  }`}
                  aria-hidden="true"
                />
                <span className="nav-profile-label">
                  {isAuthenticated ? admin?.name?.split(' ')[0] || 'Admin' : 'Sign In'}
                </span>
              </button>

              {isAuthenticated && profileOpen && (
                <div className="profile-menu" role="group" aria-label="Account">
                  <NavLink to="/admin" onClick={closeAll}>
                    <i className="bi bi-speedometer2" aria-hidden="true" /> Dashboard
                  </NavLink>
                  <button type="button" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right" aria-hidden="true" /> Sign Out
                  </button>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
