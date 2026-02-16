import React from 'react';
import {
  LanyardSkeleton,
  GitHubGraphSkeleton,
  SocialLinksSkeleton,
  FriendsSkeleton,
  TechStackSkeleton,
  GameAccountsSkeleton,
} from './Skeletons';
import { copyToClipboard } from '../hooks';
import GitHubGraph from './GitHubGraph';

const SOCIAL_LINKS = [
  { href: 'https://Ko-fi.com/soryntech', className: 'social-link-kofi', icon: 'kofi', label: 'Ko-fi' },
  { href: 'https://github.com/sorynTech', className: 'social-link-github', icon: 'github', label: 'GitHub' },
  { href: 'https://Discord.gg/users/447812883158532106', className: 'social-link-discord', icon: 'discord', label: 'Discord' },
  { href: 'https://x.com/ZippyDrawz_', className: 'social-link-twitter', icon: 'x', label: 'Twitter/X' },
  { href: 'https://www.instagram.com/zippydrawz.offical__/', className: 'social-link-instagram', icon: 'instagram', label: 'Instagram' },
  { href: 'https://www.youtube.com/@AstroFerretEN', className: 'social-link-youtube', icon: 'youtube', label: 'YouTube' },
  { href: 'https://www.tiktok.com/@zippydrawz', className: 'social-link-tiktok', icon: 'tiktok', label: 'TikTok' },
  { href: 'https://gitlab.com/SorynTech', className: 'social-link-gitlab', icon: 'gitlab', label: 'GitLab' },
  { href: 'https://tinyurl.com/2x8vvnw9', className: 'social-link-linkedin', icon: 'linkedin', label: 'Linkedin' },
];

const CODING_TECH = [
  { className: 'tech-item-python', icon: 'python', label: 'Python' },
  { className: 'tech-item-javascript', icon: 'javascript', label: 'JavaScript' },
  { className: 'tech-item-html5', icon: 'html5', label: 'HTML' },
  { className: 'tech-item-css3', icon: 'css3', label: 'CSS' },
  { className: 'tech-item-githubcopilot', icon: 'githubcopilot', label: 'GitHub Copilot' },
  { className: 'tech-item-github', icon: 'github', label: 'GitHub' },
  { className: 'tech-item-git', icon: 'git', label: 'Git' },
  { className: 'tech-item-windows', icon: 'windows10', label: 'Windows' },
  { className: 'tech-item-macos', icon: 'apple', label: 'macOS' },
  { className: 'tech-item-cloudflare', icon: 'cloudflare', label: 'Cloudflare' },
  { className: 'tech-item-supabase', icon: 'supabase', label: 'Supabase' },
  { className: 'tech-item-discord', icon: 'discord', label: 'Discord API' },
  { className: 'tech-item-render', icon: 'render', label: 'Render', useSimpleIcons: true },
  {className: 'tech-item-react', icon: 'react', label: 'React', useSimpleIcons: true},
  {className: 'tech-item-typescript', icon: 'typescript', label: 'TypeScript', useSimpleIcons: true},
];

const EDITOR_TECH = [
  { className: 'tech-item-pycharm', icon: 'pycharm', label: 'PyCharm', useSimpleIcons: true },
  { className: 'tech-item-vscode', icon: 'visualstudiocode', label: 'VS Code Insiders' },
];

const DESIGN_TECH = [
  { className: 'tech-item-photoshop', icon: 'adobephotoshop', label: 'Photoshop' },
  { className: 'tech-item-illustrator', icon: 'adobeillustrator', label: 'Illustrator' },
  { className: 'tech-item-krita', icon: 'krita', label: 'Krita' },
  { className: 'tech-item-gimp', icon: 'gimp', label: 'GIMP' },
];

const VIDEO_TECH = [
  { className: 'tech-item-premierepro', icon: 'adobepremierepro', label: 'Premiere Pro' },
  { className: 'tech-item-obs', icon: 'obsstudio', label: 'OBS Studio' },
];

const GAME_ACCOUNTS = [
  { icon: 'riotgames', iconClass: 'game-icon-riot', platform: 'Riot Games', subtitle: 'League of Legends • Valorant', username: 'SorynTech#Fang' },
  { icon: 'roblox', iconClass: 'game-icon-roblox', platform: 'Roblox', subtitle: 'Platform', username: 'Mineoblocks' },
  { icon: 'epicgames', iconClass: 'game-icon-epic', platform: 'Epic Games', subtitle: 'Rocket League • Fortnite', username: 'ZDS Sharky' },
  { icon: 'steam', iconClass: 'game-icon-steam', platform: 'Steam', subtitle: 'PC Gaming', username: 'SorynTech', altUsername: 'Korai Fangtail' },
];

function getIconUrl(icon, useSimpleIcons = false) {
  if (useSimpleIcons) return `https://simpleicons.org/icons/${icon}.svg`;
  return `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${icon}.svg`;
}

function TechItem({ item }) {
  return (
    <div className={`tech-item ${item.className}`}>
      <img src={getIconUrl(item.icon, item.useSimpleIcons)} alt={item.label} />
      <span>{item.label}</span>
    </div>
  );
}

export default function SocialsSection({ isLoaded, showNotification }) {
  if (!isLoaded) {
    return (
      <section id="socials" className="section active">
        <div className="profile-hero">
          <LanyardSkeleton />
          <div className="social-links-container">
            <GitHubGraphSkeleton />
            <SocialLinksSkeleton />
            <FriendsSkeleton />
            <TechStackSkeleton />
            <GameAccountsSkeleton />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="socials" className="section active">
      <div className="profile-hero skeleton-fade-in">
        <div className="lanyard">
          <div className="lanyard-string" />
          <div className="lanyard-card">
            <div className="lanyard-hole" />
            <div className="lanyard-content">
              <div className="lanyard-image-wrapper">
                <img src="profile.jpg" alt="Profile Picture" className="lanyard-image" id="lanyardImage" />
                <div className="rat-badge">🐀</div>
              </div>
              <h2 className="lanyard-name" id="lanyardName">SorynTech</h2>
              <p className="lanyard-role" id="lanyardRole">Backend Developer</p>
              <div className="lanyard-barcode">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="barcode-line" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="social-links-container">
          <GitHubGraph />

          <h3 style={{ fontFamily: "'Righteous', cursive", fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <span className="rat-emoji">🐀</span> My Socials <span className="rat-emoji">🐀</span>
          </h3>
          <div className="social-links">
            {SOCIAL_LINKS.map(({ href, className, icon, label }) => (
              <a key={label} href={href} className={`social-link ${className}`} target="_blank" rel="noopener noreferrer">
                <img src={getIconUrl(icon)} alt={label} />
                <span>{label}</span>
              </a>
            ))}
          </div>

          <div className="friends-section">
            <h3 className="friends-title">Friends &amp; Artists</h3>
            <div className="friends-grid">
              <div className="friend-card">
                <h4 className="friend-name">
                  <span className="bat-emoji">🦇</span>
                  M00n River
                  <span className="bat-emoji">🦇</span>
                </h4>
                <p className="friend-description">
                  An absolutely amazing artist and personal friend of mine with incredible talent! Check out their work and support them on Ko-fi (18+)! 💖
                </p>
                <a href="https://ko-fi.com/m00nriv3r/" className="friend-kofi-link" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
                  </svg>
                  Support M00n River
                </a>
              </div>
            </div>
          </div>

          <div className="tech-stack-section">
            <h3 className="tech-stack-title">
              <span style={{ fontSize: '1.5rem' }}>🛠️</span> Tech Stack <span style={{ fontSize: '1.5rem' }}>🛠️</span>
            </h3>
            <div className="tech-category">
              <h4 className="tech-category-title">💻 Coding</h4>
              <div className="tech-stack-grid coding-grid">
                {CODING_TECH.map((item) => (
                  <TechItem key={item.label} item={item} />
                ))}
              </div>
            </div>
            <div className="tech-category">
              <h4 className="tech-category-title">🖥️ Code Editors/IDE&apos;s</h4>
              <div className="tech-stack-grid">
                {EDITOR_TECH.map((item) => (
                  <TechItem key={item.label} item={item} />
                ))}
              </div>
            </div>
            <div className="tech-category">
              <h4 className="tech-category-title">🎨 Design</h4>
              <div className="tech-stack-grid">
                {DESIGN_TECH.map((item) => (
                  <TechItem key={item.label} item={item} />
                ))}
              </div>
            </div>
            <div className="tech-category">
              <h4 className="tech-category-title">🎬 Video</h4>
              <div className="tech-stack-grid">
                {VIDEO_TECH.map((item) => (
                  <TechItem key={item.label} item={item} />
                ))}
              </div>
            </div>
          </div>

          <div className="friends-section">
            <h3 className="friends-title">
              <span style={{ fontSize: '1.5rem' }}>🎮</span> Game Accounts <span style={{ fontSize: '1.5rem' }}>🎮</span>
            </h3>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Click any username to copy to clipboard!
            </p>
            <div className="game-accounts-grid">
              {GAME_ACCOUNTS.map(({ icon, iconClass, platform, subtitle, username, altUsername }) => (
                <div
                  key={platform}
                  className="game-account-card"
                  onClick={() => copyToClipboard(username, platform, showNotification)}
                >
                  <div className="game-icon">
                    <img src={getIconUrl(icon)} alt={platform} className={iconClass} />
                  </div>
                  <h4 className="game-platform">{platform}</h4>
                  <p className="game-subtitle">{subtitle}</p>
                  <div className="game-username">{username}</div>
                  {altUsername && <div className="game-username-alt">{altUsername}</div>}
                  <div className="copy-indicator">Click to copy 📋</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
