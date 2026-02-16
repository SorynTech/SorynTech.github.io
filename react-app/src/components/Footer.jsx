import React from 'react';
import { FooterSkeleton } from './Skeletons';

export default function Footer({ isLoaded, onPrivacyClick }) {
  if (!isLoaded) return <FooterSkeleton />;

  return (
    <footer className="site-footer skeleton-fade-in">
      <p>
        This site uses{' '}
        <a
          href="#"
          className="nav-link privacy-footer-link"
          data-section="privacy"
          onClick={(e) => {
            e.preventDefault();
            onPrivacyClick();
          }}
        >
          Dark Visitors
        </a>{' '}
        bot detection. IP addresses, request patterns, and usage data are logged as part of bot detection. Read more at the Darkvistors privacy policy here:{' '}
        <a href="https://darkvisitors.com/privacy" target="_blank" rel="noopener noreferrer">
          Learn more
        </a>
      </p>
    </footer>
  );
}
