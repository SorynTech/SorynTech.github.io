import React from 'react';
import { PrivacySkeleton } from './Skeletons';

export default function PrivacySection({ isLoaded, isActive }) {
  if (!isLoaded) {
    return (
      <section id="privacy" className={`section${isActive ? ' active' : ''}`}>
        <PrivacySkeleton />
      </section>
    );
  }

  return (
    <section id="privacy" className={`section${isActive ? ' active' : ''}`}>
      <div className="content-wrapper skeleton-fade-in">
        <h2 className="section-title">🐀 The Rat&apos;s Privacy Policy</h2>
        <div className="privacy-card">
          <div className="privacy-header">
            <span className="privacy-icon">🔒</span>
            <h3>What&apos;s Lurking in the Shadows?</h3>
          </div>
          <p className="privacy-intro">
            This site uses <strong>Dark Visitors</strong> tracking to monitor and block AI bots and scrapers from crawling my content. Here&apos;s exactly what that means for you.
          </p>
          <div className="privacy-block">
            <h4><span>👾</span> What Gets Tracked</h4>
            <p>
              Dark Visitors logs incoming requests to detect and identify automated bots – not you. It looks at user-agent strings and request patterns to tell the difference between a real visitor and a bot trying to scrape or train on this site&apos;s content.
            </p>
          </div>
          <div className="privacy-block">
            <h4><span>🧀</span> What It Does Do</h4>
            <p>
              Your IP address, User agent, Request patterns and usage data are stored. If you&apos;re a real person reading this 🐀 the rat doesn&apos;t care about your data. Only the bots should be worried.
            </p>
          </div>
          <div className="privacy-block">
            <h4><span>🐀</span> Will I view your data</h4>
            <p>
              No. I Won&apos;t be viewing your data as it has no use to me the Rat has zero care for your data only ai scrapers should be worried
            </p>
          </div>
          <div className="privacy-block">
            <h4><span>🛡️</span> Why It&apos;s Here</h4>
            <p>
              AI companies and web scrapers crawl sites like this to harvest content for training models or republishing without credit. Dark Visitors helps identify those bots so I can block them. I use this to protect my art and projects from being used without my permission.
            </p>
          </div>
          <div className="privacy-block">
            <h4><span>🔓</span> The Full Picture</h4>
            <p>
              If you want the complete details on how Dark Visitors operates, you can read their privacy policy directly at{' '}
              <a href="https://darkvisitors.com/privacy" target="_blank" rel="noopener noreferrer">darkvisitors.com/privacy</a>.
              This site has no other third-party trackers, analytics, or ad networks.
            </p>
          </div>
          <div className="privacy-footer-note">
            <span>🐀</span> The rat sees you. The rat trusts you. The bots? Not so much.
          </div>
        </div>
      </div>
    </section>
  );
}
