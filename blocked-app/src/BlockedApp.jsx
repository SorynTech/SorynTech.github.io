import React from 'react';
import useDelayedLoad from './useDelayedLoad';
import './blocked.css';
import './skeleton.css';

function BlockedSkeleton() {
  return (
    <div className="blocked-card">
      <div className="skeleton skeleton-circle" style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem' }} />
      <div className="skeleton skeleton-title" style={{ width: '220px', height: '2.5rem', margin: '0 auto 0.5rem' }} />
      <div className="skeleton skeleton-title" style={{ width: '320px', height: '1.8rem', margin: '0 auto 1rem' }} />
      <div className="skeleton" style={{ width: '90%', height: '1em', margin: '0 auto 0.5rem' }} />
      <div className="skeleton" style={{ width: '85%', height: '1em', margin: '0 auto 0.5rem' }} />
      <div className="skeleton" style={{ width: '70%', height: '1em', margin: '0 auto 2rem' }} />
      <div className="skeleton" style={{ width: '100%', height: '120px', borderRadius: '8px', marginBottom: '2rem' }} />
      <div className="skeleton" style={{ width: '200px', height: '1.3rem', margin: '0 auto 1.25rem' }} />
      <div className="browser-grid">
        <div className="skeleton" style={{ height: '140px', borderRadius: '15px' }} />
        <div className="skeleton" style={{ height: '140px', borderRadius: '15px' }} />
      </div>
    </div>
  );
}

function BlockedContent() {
  return (
    <div className="blocked-card skeleton-fade-in">
      <div className="block-icon">🚫</div>

      <div className="block-title">Edge Blocked</div>

      <h1>Microsoft Edge Is Not Welcome Here</h1>

      <p className="message">
        This site does not support Microsoft Edge. I refuse to support Microsoft's aggressive AI-first approach
        and their push toward an "agentic" browser that prioritizes AI integration over user privacy and autonomy.
      </p>

      <div className="reason">
        <strong>Why is Edge blocked?</strong>
        <p>
          Microsoft is transforming Edge into an AI-driven "agentic" browser that acts on your behalf without meaningful consent,
          harvests browsing data to feed AI models, and strips away user control in favor of automated decision-making.
          I don't support this direction and I won't serve content to a browser built on these principles.
          Especially with my art also being hosted here.
        </p>
      </div>

      <div className="browser-alternatives">
        <h2>Try one of these browsers instead</h2>
        <div className="browser-grid">
          <a href="https://zen-browser.app/" className="browser-link" target="_blank" rel="noopener noreferrer">
            <span className="browser-emoji">🧘</span>
            <span className="browser-name">Zen Browser</span>
            <span className="browser-desc">Privacy-focused, beautifully crafted, and built on Firefox</span>
          </a>
          <a href="https://arc.net/" className="browser-link" target="_blank" rel="noopener noreferrer">
            <span className="browser-emoji">🌐</span>
            <span className="browser-name">Arc Browser</span>
            <span className="browser-desc">A browser designed for how you actually use the internet</span>
          </a>
        </div>
      </div>

      <div className="footer">
        SorynTech &copy; 2026 | Your browser, your choice... just not Edge.
        Protected by Soryntech Security System 🐀
      </div>
    </div>
  );
}

export default function BlockedApp() {
  const isLoaded = useDelayedLoad(500);

  return (
    <>
      <div className="cheese-bg">
        <div className="cheese-piece" style={{ top: '10%', left: '10%' }}>🧀</div>
        <div className="cheese-piece" style={{ top: '20%', right: '15%' }}>🧀</div>
        <div className="cheese-piece" style={{ bottom: '15%', left: '20%' }}>🧀</div>
        <div className="cheese-piece" style={{ bottom: '20%', right: '10%' }}>🧀</div>
      </div>

      {isLoaded ? <BlockedContent /> : <BlockedSkeleton />}
    </>
  );
}
