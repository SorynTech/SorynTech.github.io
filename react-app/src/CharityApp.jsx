import React, { useState, useEffect } from 'react';

const STREAM_START = new Date('2026-08-15T12:00:00+01:00');
const STREAM_END = new Date('2026-08-16T12:00:00+01:00');
const TWITCH_URL = 'https://twitch.soryntech.me';
const TWITCH_CHANNEL = 'soryntech';

function getTimeRemaining(target) {
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function getStreamStatus() {
  const now = new Date();
  if (now < STREAM_START) return 'upcoming';
  if (now >= STREAM_START && now < STREAM_END) return 'live';
  return 'ended';
}

function CountdownUnit({ value, label }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      background: 'rgba(125, 211, 252, 0.1)',
      borderRadius: '12px',
      minWidth: '80px',
      border: '1px solid rgba(125, 211, 252, 0.2)',
    }}>
      <span style={{
        fontFamily: "'Righteous', cursive",
        fontSize: '2rem',
        background: 'linear-gradient(135deg, #7dd3fc, #a855f7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        {String(value).padStart(2, '0')}
      </span>
      <span style={{ fontSize: '0.75rem', color: '#b2bec3', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {label}
      </span>
    </div>
  );
}

function Countdown() {
  const [remaining, setRemaining] = useState(getTimeRemaining(STREAM_START));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getTimeRemaining(STREAM_START));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!remaining) return null;

  return (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
      <CountdownUnit value={remaining.days} label="Days" />
      <CountdownUnit value={remaining.hours} label="Hours" />
      <CountdownUnit value={remaining.minutes} label="Mins" />
      <CountdownUnit value={remaining.seconds} label="Secs" />
    </div>
  );
}

function LiveBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'rgba(239, 68, 68, 0.2)',
      color: '#ef4444',
      padding: '0.4rem 1rem',
      borderRadius: '20px',
      fontWeight: 700,
      fontSize: '0.9rem',
      border: '1px solid rgba(239, 68, 68, 0.4)',
      animation: 'pulse 2s infinite',
    }}>
      <span style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#ef4444',
        display: 'inline-block',
      }} />
      LIVE NOW
    </span>
  );
}

function StreamEndedBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'rgba(125, 211, 252, 0.15)',
      color: '#7dd3fc',
      padding: '0.4rem 1rem',
      borderRadius: '20px',
      fontWeight: 700,
      fontSize: '0.9rem',
      border: '1px solid rgba(125, 211, 252, 0.3)',
    }}>
      Stream Ended — Thanks for watching!
    </span>
  );
}

function TimeRemainingInStream() {
  const [remaining, setRemaining] = useState(getTimeRemaining(STREAM_END));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getTimeRemaining(STREAM_END));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!remaining) return null;

  return (
    <p style={{ color: '#b2bec3', fontSize: '0.95rem' }}>
      Stream ends in: {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
    </p>
  );
}

export default function CharityApp() {
  const [status, setStatus] = useState(getStreamStatus);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(getStreamStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'DM Sans', sans-serif;
          background: #1a1d2e;
          color: #dfe6e9;
          min-height: 100vh;
        }
        body::before {
          content: '';
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background:
            radial-gradient(circle at 20% 50%, rgba(125,211,252,0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(168,85,247,0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(192,132,252,0.03) 0%, transparent 40%);
          pointer-events: none;
          z-index: 0;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(0) rotate(-5deg); }
          75% { transform: translateY(20px) rotate(5deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        a { color: #7dd3fc; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      {/* Cheese background */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', fontSize: '3rem', opacity: 0.1, animation: 'float 20s infinite ease-in-out' }}>🧀</div>
        <div style={{ position: 'absolute', top: '20%', right: '10%', fontSize: '3rem', opacity: 0.1, animation: 'float 20s infinite ease-in-out 5s' }}>🧀</div>
        <div style={{ position: 'absolute', bottom: '15%', left: '15%', fontSize: '3rem', opacity: 0.1, animation: 'float 20s infinite ease-in-out 10s' }}>🧀</div>
        <div style={{ position: 'absolute', bottom: '25%', right: '8%', fontSize: '3rem', opacity: 0.1, animation: 'float 20s infinite ease-in-out 15s' }}>🧀</div>
      </div>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <a href="/" style={{
            display: 'inline-block',
            marginBottom: '1rem',
            padding: '0.5rem 1.25rem',
            background: 'rgba(125, 211, 252, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(125, 211, 252, 0.2)',
            color: '#7dd3fc',
            fontSize: '0.85rem',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}>
            ← Back to SorynTech
          </a>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🎮</div>
          <h1 style={{
            fontFamily: "'Righteous', cursive",
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
            background: 'linear-gradient(135deg, #7dd3fc, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
          }}>
            24-Hour Charity Livestream
          </h1>
          <p style={{ color: '#b2bec3', fontSize: '1.1rem', marginBottom: '1rem' }}>
            15th August 2026 • Starting at 12:00 PM
          </p>
          {status === 'live' && <LiveBadge />}
          {status === 'ended' && <StreamEndedBadge />}
        </header>

        {/* Countdown or Stream Status */}
        {status === 'upcoming' && (
          <section style={{
            background: '#2d3446',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontFamily: "'Righteous', cursive",
              fontSize: '1.3rem',
              marginBottom: '1.25rem',
              color: '#dfe6e9',
            }}>
              Stream starts in
            </h2>
            <Countdown />
          </section>
        )}

        {/* Twitch Embed / Link */}
        <section style={{
          background: '#2d3446',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
        }}>
          {status === 'live' && <TimeRemainingInStream />}
          <div style={{
            width: '100%',
            aspectRatio: '16 / 9',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            border: '1px solid rgba(125, 211, 252, 0.15)',
            overflow: 'hidden',
          }}>
            {status === 'live' ? (
              <iframe
                src={`https://player.twitch.tv/?channel=${TWITCH_CHANNEL}&parent=soryntech.me`}
                height="100%"
                width="100%"
                allowFullScreen
                style={{ border: 'none' }}
                title="SorynTech Twitch Stream"
              />
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📺</div>
                <p style={{ color: '#b2bec3', marginBottom: '0.5rem' }}>
                  {status === 'upcoming'
                    ? 'The stream will appear here when we go live!'
                    : 'The stream has ended. Thanks for watching!'}
                </p>
              </div>
            )}
          </div>
          <a
            href={TWITCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: '#9146FF',
              color: '#fff',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              border: 'none',
            }}
          >
            Watch on Twitch
          </a>
        </section>

        {/* Info Section */}
        <section style={{
          background: '#2d3446',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <h2 style={{
            fontFamily: "'Righteous', cursive",
            fontSize: '1.3rem',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #7dd3fc, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            About the Stream
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#b2bec3', lineHeight: 1.7 }}>
            <p>
              <strong style={{ color: '#dfe6e9' }}>🕐 When:</strong> 15th August 2026, 12:00 PM — 16th August 2026, 12:00 PM (24 hours)
            </p>
            <p>
              <strong style={{ color: '#dfe6e9' }}>📍 Where:</strong>{' '}
              <a href={TWITCH_URL} target="_blank" rel="noopener noreferrer">twitch.soryntech.me</a>
            </p>
            <p>
              Come hang out, have fun, and support a good cause! The stream runs for a full 24 hours so drop in whenever you can. 🎉
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '1.5rem 0', color: '#636e72', fontSize: '0.85rem' }}>
          <p>
            <a href="/" style={{ color: '#7dd3fc', textDecoration: 'none' }}>soryntech.me</a>
            {' '} • {' '}
            <a href={TWITCH_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#9146FF', textDecoration: 'none' }}>
              Twitch
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
