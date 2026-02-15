import React from 'react';

export function NavSkeleton() {
  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="skeleton skeleton-text" style={{ width: '150px', height: '1.5em' }} />
        </div>
        <ul className="nav-menu">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <li key={i}>
              <div className="skeleton skeleton-nav-link" />
            </li>
          ))}
        </ul>
        <div className="skeleton" style={{ width: '80px', height: '36px', borderRadius: '20px' }} />
      </div>
    </nav>
  );
}

export function LanyardSkeleton() {
  return (
    <div className="lanyard">
      <div className="lanyard-string" />
      <div className="lanyard-card">
        <div className="lanyard-hole" />
        <div className="lanyard-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="skeleton skeleton-circle skeleton-lanyard-image" />
          <div className="skeleton skeleton-lanyard-name" />
          <div className="skeleton skeleton-lanyard-role" />
          <div className="skeleton-lanyard-barcode">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="skeleton skeleton-barcode-line" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GitHubGraphSkeleton() {
  return (
    <div className="github-graph-container">
      <div className="skeleton skeleton-title" style={{ width: '250px' }} />
      <div className="skeleton skeleton-github-graph" />
    </div>
  );
}

export function SocialLinksSkeleton() {
  return (
    <>
      <div className="skeleton skeleton-title" style={{ width: '200px' }} />
      <div className="skeleton-social-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div key={i} className="skeleton skeleton-social-link" />
        ))}
      </div>
    </>
  );
}

export function FriendsSkeleton() {
  return (
    <div className="friends-section">
      <div className="skeleton skeleton-title" style={{ width: '250px' }} />
      <div className="friends-grid">
        <div className="skeleton skeleton-friend-card" />
      </div>
    </div>
  );
}

export function TechStackSkeleton() {
  return (
    <div className="tech-stack-section">
      <div className="skeleton skeleton-title" style={{ width: '200px' }} />
      {[1, 2, 3, 4].map((cat) => (
        <div key={cat} style={{ marginBottom: '2rem' }}>
          <div className="skeleton skeleton-text" style={{ width: '150px', margin: '0 auto 1rem' }} />
          <div className="skeleton-tech-grid">
            {Array.from({ length: cat === 1 ? 13 : cat === 4 ? 2 : cat === 3 ? 4 : 2 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-tech-item" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GameAccountsSkeleton() {
  return (
    <div className="friends-section">
      <div className="skeleton skeleton-title" style={{ width: '250px' }} />
      <div className="skeleton skeleton-text-short" style={{ margin: '0 auto 1.5rem', height: '1em', width: '250px' }} />
      <div className="skeleton-game-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton skeleton-game-card" />
        ))}
      </div>
    </div>
  );
}

export function SectionSkeleton({ title, cardCount = 3, isGallery = false }) {
  return (
    <div className="content-wrapper">
      <div className="skeleton skeleton-section-title" />
      {isGallery ? (
        <div className="skeleton-gallery-grid">
          {Array.from({ length: cardCount }).map((_, i) => (
            <div key={i} className="skeleton skeleton-gallery-item" />
          ))}
        </div>
      ) : (
        <div className="skeleton-cards-grid">
          {Array.from({ length: cardCount }).map((_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      )}
    </div>
  );
}

export function PrivacySkeleton() {
  return (
    <div className="content-wrapper">
      <div className="skeleton skeleton-section-title" />
      <div className="skeleton-privacy-card">
        <div className="skeleton skeleton-text" style={{ width: '60%', margin: '0 auto 1rem' }} />
        <div className="skeleton skeleton-text" style={{ width: '90%', marginBottom: '1rem' }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton skeleton-privacy-block" />
        ))}
      </div>
    </div>
  );
}

export function FooterSkeleton() {
  return (
    <footer className="site-footer">
      <div className="skeleton skeleton-footer" />
    </footer>
  );
}
