import React, { useState, useEffect } from 'react';
import { 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonCard, 
  SkeletonButton,
  SkeletonNavItem,
  SkeletonLanyard 
} from './components/Skeleton';
import './styles/skeleton.css';
import './styles/styles.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [activeSection, setActiveSection] = useState('socials');

  // Simulate data loading with skeleton animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setProfileData({
        name: 'SorynTech',
        role: 'Backend Developer',
        image: '/profile.jpg'
      });
      setLoading(false);
    }, 2000); // 2 second demo of skeleton loading

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app">
      {/* Cheese background */}
      <div className="cheese-bg">
        <div className="cheese-piece" style={{ top: '10%', left: '5%' }}>🧀</div>
        <div className="cheese-piece" style={{ top: '20%', right: '10%' }}>🧀</div>
        <div className="cheese-piece" style={{ bottom: '15%', left: '15%' }}>🧀</div>
        <div className="cheese-piece" style={{ bottom: '25%', right: '8%' }}>🧀</div>
      </div>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="rat-icon">🐀</span> SORYNTECH
          </div>
          <ul className="nav-menu">
            {loading ? (
              <>
                <li><SkeletonNavItem /></li>
                <li><SkeletonNavItem /></li>
                <li><SkeletonNavItem /></li>
                <li><SkeletonNavItem /></li>
              </>
            ) : (
              <>
                <li>
                  <a 
                    href="#" 
                    className={`nav-link ${activeSection === 'socials' ? 'active' : ''}`}
                    onClick={() => setActiveSection('socials')}
                  >
                    Socials
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`nav-link ${activeSection === 'bots' ? 'active' : ''}`}
                    onClick={() => setActiveSection('bots')}
                  >
                    Discord Bots
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`}
                    onClick={() => setActiveSection('projects')}
                  >
                    Projects
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className={`nav-link ${activeSection === 'art' ? 'active' : ''}`}
                    onClick={() => setActiveSection('art')}
                  >
                    Art Gallery
                  </a>
                </li>
              </>
            )}
          </ul>
          <div className="user-badge">
            <span className="badge-icon">🔒</span>
            <span className="badge-text">Login</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section id="socials" className="section active">
        <div className="profile-hero">
          {loading ? (
            // Skeleton Loading State
            <div className="lanyard">
              <div className="lanyard-string"></div>
              <div className="lanyard-card">
                <div className="lanyard-hole"></div>
                <div className="lanyard-content">
                  <div className="lanyard-image-wrapper">
                    <SkeletonAvatar size={120} />
                    <div className="rat-badge">🐀</div>
                  </div>
                  <div style={{ width: '100%', marginTop: '1rem' }}>
                    <SkeletonText width="60%" height="2em" />
                    <SkeletonText width="80%" height="1.2em" />
                  </div>
                  <div className="lanyard-barcode" style={{ marginTop: '2rem' }}>
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Loaded Content with Fade-in Animation
            <div className="lanyard fade-in">
              <div className="lanyard-string"></div>
              <div className="lanyard-card">
                <div className="lanyard-hole"></div>
                <div className="lanyard-content">
                  <div className="lanyard-image-wrapper">
                    <img 
                      src={profileData.image} 
                      alt="Profile Picture" 
                      className="lanyard-image" 
                    />
                    <div className="rat-badge">🐀</div>
                  </div>
                  <h2 className="lanyard-name">{profileData.name}</h2>
                  <p className="lanyard-role">{profileData.role}</p>
                  <div className="lanyard-barcode">
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                    <div className="barcode-line"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Links Section */}
          <div className="social-grid" style={{ marginTop: '3rem' }}>
            {loading ? (
              <>
                <SkeletonCard>
                  <SkeletonText width="40%" />
                  <SkeletonText width="60%" />
                </SkeletonCard>
                <SkeletonCard>
                  <SkeletonText width="40%" />
                  <SkeletonText width="60%" />
                </SkeletonCard>
                <SkeletonCard>
                  <SkeletonText width="40%" />
                  <SkeletonText width="60%" />
                </SkeletonCard>
              </>
            ) : (
              <>
                <div className="social-card fade-in">
                  <div className="social-icon">🎮</div>
                  <h3>Discord</h3>
                  <p>soryntech</p>
                </div>
                <div className="social-card fade-in">
                  <div className="social-icon">🐙</div>
                  <h3>GitHub</h3>
                  <p>@SorynTech</p>
                </div>
                <div className="social-card fade-in">
                  <div className="social-icon">☕</div>
                  <h3>Ko-fi</h3>
                  <p>Support my work</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Demo: Show reload button to see skeleton again */}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button 
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 2000);
            }}
            style={{
              padding: '1rem 2rem',
              fontSize: '1rem',
              background: 'var(--accent-primary)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            🐀 Reload Demo (See Skeleton Loading Again)
          </button>
        </div>
      </section>
    </div>
  );
}

export default App;
