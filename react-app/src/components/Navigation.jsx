import React, { useState, useEffect, useCallback } from 'react';
import { NavSkeleton } from './Skeletons';

const NAV_ITEMS = [
  { id: 'socials', label: 'Socials' },
  { id: 'bots', label: 'Discord Bots' },
  { id: 'projects', label: 'Projects' },
  { id: 'art', label: 'Art Gallery' },
  { id: 'commissions', label: '🎨 Commissions' },
  { id: 'privacy', label: '🔒 Privacy Policy' },
  { id: 'external-den', label: '🐀 External Den (Discord Server)' },
];

export default function Navigation({ activeSection, onSectionChange, user, onLoginClick, isLoaded }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  if (!isLoaded) return <NavSkeleton />;

  return (
    <>
      <nav className="nav">
        <div className="nav-container">
          <button
            className={`hamburger-btn${menuOpen ? ' active' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>

          <div className="nav-brand">
            <span className="rat-icon">🐀</span> SORYNTECH
          </div>

          <div className="user-badge" onClick={onLoginClick}>
            <span className="badge-icon">{user.isLoggedIn ? '🐀' : '🔒'}</span>
            <span className="badge-text">{user.isLoggedIn ? user.username : 'Login'}</span>
          </div>
        </div>
      </nav>

      <div className={`nav-drawer-overlay${menuOpen ? ' active' : ''}`} onClick={closeMenu} />

      <div className={`nav-drawer${menuOpen ? ' open' : ''}`}>
        <div className="nav-drawer-header">
          <span className="rat-icon">🐀</span>
          <span className="nav-drawer-title">Menu</span>
        </div>
        <ul className="nav-drawer-menu">
          {NAV_ITEMS.map(({ id, label }) => (
            <li key={id}>
              <a
                href="#"
                className={`nav-drawer-link${activeSection === id ? ' active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSectionChange(id);
                  closeMenu();
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
