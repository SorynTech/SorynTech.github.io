import React from 'react';
import { SectionSkeleton } from './Skeletons';

export default function ExternalDenSection({ isLoaded, isActive }) {
  if (!isLoaded) {
    return (
      <section id="external-den" className={`section${isActive ? ' active' : ''}`}>
        <SectionSkeleton cardCount={1} />
      </section>
    );
  }

  return (
    <section id="external-den" className={`section${isActive ? ' active' : ''}`}>
      <div className="content-wrapper skeleton-fade-in">
        <h2 className="section-title">🐀 External Den</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          <div className="privacy-card" style={{ textAlign: 'center' }}>
            <div className="privacy-header" style={{ justifyContent: 'center' }}>
              <span className="privacy-icon">🐀</span>
              <h3>Discord Den</h3>
            </div>
            <p className="privacy-intro">
              Come hang out with the rat on Discord!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <a
                href="https://discord.com/users/447812883158532106"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/discord_profile.png"
                  alt="Soryn's Discord Profile"
                  style={{ maxWidth: '320px', width: '100%', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }}
                />
              </a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <a
                href="https://discord.com/users/447812883158532106"
                target="_blank"
                rel="noopener noreferrer"
                className="tech-item tech-item-discord"
                aria-label="Connect with me on Discord"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', textDecoration: 'none', fontSize: '1.1rem' }}
              >
                💬 Connect on Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
