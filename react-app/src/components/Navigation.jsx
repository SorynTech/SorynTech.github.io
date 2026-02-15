import React from 'react';
import { NavSkeleton } from './Skeletons';

const NAV_ITEMS = [
  { id: 'socials', label: 'Socials' },
  { id: 'bots', label: 'Discord Bots' },
  { id: 'projects', label: 'Projects' },
  { id: 'art', label: 'Art Gallery' },
  { id: 'commissions', label: '🎨 Commissions' },
  { id: 'privacy', label: '🐀 The Rat\'s Privacy Policy' },
];

export default function Navigation({ activeSection, onSectionChange, user, onLoginClick, isLoaded }) {
  if (!isLoaded) return <NavSkeleton />;

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="rat-icon">🐀</span> SORYNTECH
        </div>
        <ul className="nav-menu">
          {NAV_ITEMS.map(({ id, label }) => (
            <li key={id}>
              <a
                href="#"
                className={`nav-link${activeSection === id ? ' active' : ''}`}
                data-section={id}
                onClick={(e) => {
                  e.preventDefault();
                  onSectionChange(id);
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="user-badge" onClick={onLoginClick}>
          <span className="badge-icon">{user.isLoggedIn ? '🐀' : '🔒'}</span>
          <span className="badge-text">{user.isLoggedIn ? user.username : 'Login'}</span>
        </div>
      </div>
    </nav>
  );
}
