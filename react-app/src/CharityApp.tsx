import React, { useState, useEffect } from 'react';
import './nonprofit.css';

const STREAM_START: Date = new Date('2026-08-15T12:00:00+01:00');
const STREAM_END: Date = new Date('2026-08-16T12:00:00+01:00');
const TWITCH_URL: string = 'https://twitch.soryntech.me';
const TWITCH_CHANNEL: string = 'soryntech';

type StreamStatus = 'upcoming' | 'live' | 'ended';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeRemaining(target: Date): TimeRemaining | null {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function getStreamStatus(): StreamStatus {
  const now = new Date();
  if (now < STREAM_START) return 'upcoming';
  if (now >= STREAM_START && now < STREAM_END) return 'live';
  return 'ended';
}

interface CountdownUnitProps {
  value: number;
  label: string;
}

function CountdownUnit({ value, label }: CountdownUnitProps): React.ReactElement {
  return (
    <div className="charity-countdown-unit">
      <span className="charity-countdown-value">
        {String(value).padStart(2, '0')}
      </span>
      <span className="charity-countdown-label">{label}</span>
    </div>
  );
}

function Countdown(): React.ReactElement | null {
  const [remaining, setRemaining] = useState<TimeRemaining | null>(getTimeRemaining(STREAM_START));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getTimeRemaining(STREAM_START));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!remaining) return null;

  return (
    <div className="charity-countdown">
      <CountdownUnit value={remaining.days} label="Days" />
      <CountdownUnit value={remaining.hours} label="Hours" />
      <CountdownUnit value={remaining.minutes} label="Mins" />
      <CountdownUnit value={remaining.seconds} label="Secs" />
    </div>
  );
}

function LiveBadge(): React.ReactElement {
  return (
    <span className="charity-live-badge">
      <span className="charity-live-dot" />
      LIVE NOW
    </span>
  );
}

function StreamEndedBadge(): React.ReactElement {
  return (
    <span className="charity-ended-badge">
      Stream Ended — Thanks for watching!
    </span>
  );
}

function TimeRemainingInStream(): React.ReactElement | null {
  const [remaining, setRemaining] = useState<TimeRemaining | null>(getTimeRemaining(STREAM_END));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getTimeRemaining(STREAM_END));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!remaining) return null;

  return (
    <p className="charity-stream-remaining">
      Stream ends in: {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
    </p>
  );
}

export default function CharityApp(): React.ReactElement {
  const [status, setStatus] = useState<StreamStatus>(getStreamStatus);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(getStreamStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Cheese background */}
      <div className="charity-cheese-bg">
        <div className="charity-cheese-piece">🧀</div>
        <div className="charity-cheese-piece">🧀</div>
        <div className="charity-cheese-piece">🧀</div>
        <div className="charity-cheese-piece">🧀</div>
      </div>

      {/* Main content */}
      <div className="charity-main">
        {/* Header */}
        <header className="charity-header">
          <a href="/" className="charity-back-link">
            ← Back to SorynTech
          </a>
          <div className="charity-hero-icon">🎮</div>
          <h1 className="charity-title">24-Hour Charity Livestream</h1>
          <p className="charity-subtitle">
            15th August 2026 • Starting at 12:00 PM
          </p>
          {status === 'live' && <LiveBadge />}
          {status === 'ended' && <StreamEndedBadge />}
        </header>

        {/* Countdown */}
        {status === 'upcoming' && (
          <section className="charity-card charity-card--center">
            <h2 className="charity-countdown-title">Stream starts in</h2>
            <Countdown />
          </section>
        )}

        {/* Twitch Embed / Link */}
        <section className="charity-card charity-card--center">
          {status === 'live' && <TimeRemainingInStream />}
          <div className="charity-stream-embed">
            {status === 'live' ? (
              <iframe
                src={`https://player.twitch.tv/?channel=${TWITCH_CHANNEL}&parent=soryntech.me`}
                allowFullScreen
                title="SorynTech Twitch Stream"
              />
            ) : (
              <div className="charity-stream-placeholder">
                <div className="charity-stream-placeholder-icon">📺</div>
                <p className="charity-stream-placeholder-text">
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
            className="charity-twitch-btn"
          >
            Watch on Twitch
          </a>
        </section>

        {/* Info Section */}
        <section className="charity-card">
          <h2 className="charity-info-title">About the Stream</h2>
          <div className="charity-info-list">
            <p>
              <strong>🕐 When:</strong> 15th August 2026, 12:00 PM — 16th August 2026, 12:00 PM (24 hours)
            </p>
            <p>
              <strong>📍 Where:</strong>{' '}
              <a href={TWITCH_URL} target="_blank" rel="noopener noreferrer">twitch.soryntech.me</a>
            </p>
            <p>
              Come hang out, have fun, and support a good cause! The stream runs for a full 24 hours so drop in whenever you can. 🎉
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="charity-footer">
          <p>
            <a href="/" className="charity-footer-link--home">soryntech.me</a>
            {' '} • {' '}
            <a href={TWITCH_URL} target="_blank" rel="noopener noreferrer" className="charity-footer-link--twitch">
              Twitch
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
