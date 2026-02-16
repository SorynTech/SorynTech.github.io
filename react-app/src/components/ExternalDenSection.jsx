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
              Come hang out in the rat&apos;s Discord server!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <iframe
                src="https://discord.com/widget?id=1431308132717432975&theme=dark"
                width="350"
                height="500"
                allowTransparency="true"
                frameBorder="0"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                title="Discord Server Widget"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
