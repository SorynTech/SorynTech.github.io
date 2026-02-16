import React, { useState } from 'react';
import '../../styles.css';
import './skeleton.css';
import useDelayedLoad from './useDelayedLoad';
import { useAuth, useNotification } from './hooks';
import Navigation from './components/Navigation';
import LoginModal from './components/LoginModal';
import SocialsSection from './components/SocialsSection';
import BotsSection, {
  ProjectsSection,
  ArtSection,
  CommissionsSection,
} from './components/ContentSections';
import PrivacySection from './components/PrivacySection';
import ExternalDenSection from './components/ExternalDenSection';
import Footer from './components/Footer';

export default function App() {
  const isLoaded = useDelayedLoad(500);
  const { user, login, logout } = useAuth();
  const { notification, showNotification } = useNotification();
  const [activeSection, setActiveSection] = useState('socials');
  const [loginOpen, setLoginOpen] = useState(false);

  const handleLoginClick = () => {
    if (user.isLoggedIn) {
      logout();
    } else {
      setLoginOpen(true);
    }
  };

  return (
    <>
      <div className="cheese-bg">
        <div className="cheese-piece" style={{ top: '10%', left: '5%' }}>🧀</div>
        <div className="cheese-piece" style={{ top: '20%', right: '10%' }}>🧀</div>
        <div className="cheese-piece" style={{ bottom: '15%', left: '15%' }}>🧀</div>
        <div className="cheese-piece" style={{ bottom: '25%', right: '8%' }}>🧀</div>
      </div>

      <Navigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        user={user}
        onLoginClick={handleLoginClick}
        isLoaded={isLoaded}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={login}
      />

      {activeSection === 'socials' && (
        <SocialsSection isLoaded={isLoaded} showNotification={showNotification} />
      )}
      {activeSection === 'bots' && (
        <BotsSection isLoaded={isLoaded} isActive user={user} />
      )}
      {activeSection === 'projects' && (
        <ProjectsSection isLoaded={isLoaded} isActive user={user} />
      )}
      {activeSection === 'art' && (
        <ArtSection isLoaded={isLoaded} isActive user={user} />
      )}
      {activeSection === 'commissions' && (
        <CommissionsSection isLoaded={isLoaded} isActive user={user} />
      )}
      {activeSection === 'external-den' && (
        <ExternalDenSection isLoaded={isLoaded} isActive />
      )}
      {activeSection === 'privacy' && (
        <PrivacySection isLoaded={isLoaded} isActive />
      )}

      <Footer isLoaded={isLoaded} onPrivacyClick={() => setActiveSection('privacy')} />

      {notification && (
        <div
          className={`notification notification-${notification.type}`}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-card)',
            zIndex: 9999,
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          {notification.message}
        </div>
      )}
    </>
  );
}
