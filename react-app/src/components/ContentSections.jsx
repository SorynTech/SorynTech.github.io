import React from 'react';
import { SectionSkeleton } from './Skeletons';

function LoginPlaceholder({ message }) {
  return (
    <div className="gallery-placeholder" style={{ padding: '3rem', textAlign: 'center' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Login Required</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{message}</p>
      <div className="guest-credentials" style={{ maxWidth: '300px', margin: '1.5rem auto 0' }}>
        <p className="credentials-label">Guest Access:</p>
        <p className="credentials-value">Username: Guest<br />Password: Rat_Guest</p>
      </div>
    </div>
  );
}

export default function BotsSection({ isLoaded, isActive, user }) {
  if (!isLoaded) {
    return (
      <section id="bots" className={`section${isActive ? ' active' : ''}`}>
        <SectionSkeleton cardCount={3} />
      </section>
    );
  }

  return (
    <section id="bots" className={`section${isActive ? ' active' : ''}`}>
      <div className="content-wrapper skeleton-fade-in">
        <h2 className="section-title">🐀 Discord Bots</h2>
        <div className="bots-grid" id="botsGrid">
          <LoginPlaceholder message="To see bots, please login with the guest credentials" />
        </div>
        {user.role === 'owner' && (
          <button className="add-btn owner-only" id="addBotBtn">🐀 Add Bot</button>
        )}
      </div>
    </section>
  );
}

export function ProjectsSection({ isLoaded, isActive, user }) {
  if (!isLoaded) {
    return (
      <section id="projects" className={`section${isActive ? ' active' : ''}`}>
        <SectionSkeleton cardCount={3} />
      </section>
    );
  }

  return (
    <section id="projects" className={`section${isActive ? ' active' : ''}`}>
      <div className="content-wrapper skeleton-fade-in">
        <h2 className="section-title">🐀 Coding Projects</h2>
        <div className="projects-grid" id="projectsGrid">
          <LoginPlaceholder message="To see projects, please login with the guest credentials" />
        </div>
        {user.role === 'owner' && (
          <button className="add-btn owner-only" id="addProjectBtn">🐀 Add Project</button>
        )}
      </div>
    </section>
  );
}

export function ArtSection({ isLoaded, isActive, user }) {
  if (!isLoaded) {
    return (
      <section id="art" className={`section${isActive ? ' active' : ''}`}>
        <SectionSkeleton cardCount={6} isGallery />
      </section>
    );
  }

  return (
    <section id="art" className={`section${isActive ? ' active' : ''}`}>
      <div className="content-wrapper skeleton-fade-in">
        <h2 className="section-title">🎨 Art Gallery</h2>
        <div className="gallery-controls">
          {user.role === 'owner' && (
            <>
              <input type="file" id="imageUpload" accept="image/*" multiple style={{ display: 'none' }} />
              <button className="upload-btn owner-only" id="uploadBtn">🎨 Upload from Device</button>
              <button className="upload-btn owner-only" id="addUrlBtn">🔗 Add Image URL</button>
              <button className="clear-btn owner-only" id="clearGalleryBtn">🗑️ Clear Gallery</button>
            </>
          )}
        </div>
        <div className="gallery-grid" id="galleryGrid">
          <LoginPlaceholder message="To view the art gallery, please login with the guest credentials" />
        </div>
      </div>
    </section>
  );
}

export function CommissionsSection({ isLoaded, isActive, user }) {
  if (!isLoaded) {
    return (
      <section id="commissions" className={`section${isActive ? ' active' : ''}`}>
        <SectionSkeleton cardCount={6} isGallery />
      </section>
    );
  }

  return (
    <section id="commissions" className={`section${isActive ? ' active' : ''}`}>
      <div className="content-wrapper skeleton-fade-in">
        <h2 className="section-title">🎨 Commission Gallery</h2>
        <div className="gallery-controls">
          {(user.role === 'owner' || user.role === 'commission') && (
            <>
              <input type="file" id="commissionImageUpload" accept="image/*" multiple style={{ display: 'none' }} />
              <button className="upload-btn commission-only" id="uploadCommissionBtn">🎨 Upload from Device</button>
              <button className="upload-btn commission-only" id="addCommissionUrlBtn">🔗 Add Image URL</button>
            </>
          )}
          {user.role === 'owner' && (
            <button className="clear-btn owner-only" id="clearCommissionsBtn">🗑️ Clear Gallery</button>
          )}
        </div>
        <div className="gallery-grid" id="commissionsGrid">
          <LoginPlaceholder message="To view commissioned artwork, please login with the guest credentials" />
        </div>
      </div>
    </section>
  );
}
