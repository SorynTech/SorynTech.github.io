import React, { useEffect, useRef, useState } from 'react';

const API_BASE_URL = 'https://soryntech-api.zippydrawzstudioz.workers.dev';
const GITHUB_USERNAME = 'SorynTech';
const ACCOUNT_CREATED_AT = new Date('2025-11-01');
const CUTOFF_DATE = new Date('2025-11-01T00:00:00');

function getContributionLevel(count) {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 9) return 3;
  return 4;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function parseRealContributions(data) {
  const accountCreatedAt = data.createdAt ? new Date(data.createdAt) : ACCOUNT_CREATED_AT;

  const weeks = (data.weeks || [])
    .map((week) => ({
      contributionDays: week.contributionDays
        .filter((day) => new Date(day.date) >= CUTOFF_DATE)
        .map((day) => ({ date: day.date, contributionCount: day.contributionCount })),
    }))
    .filter((week) => week.contributionDays.length > 0);

  const totalContributions = weeks.reduce(
    (sum, w) => sum + w.contributionDays.reduce((s, d) => s + d.contributionCount, 0),
    0,
  );

  return { totalContributions, weeks, accountCreatedAt, isDemo: false };
}

function createDemoGraph(accountCreatedAt) {
  const now = new Date();
  const weeks = [];
  const startDate = new Date(Math.max(CUTOFF_DATE.getTime(), accountCreatedAt.getTime()));
  let currentDate = new Date(startDate);
  let totalContributions = 0;

  while (currentDate <= now) {
    const week = { contributionDays: [] };
    for (let i = 0; i < 7 && currentDate <= now; i++) {
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const count = Math.floor(isWeekend ? Math.random() * 3 : Math.random() * 8);
      totalContributions += count;
      week.contributionDays.push({
        date: currentDate.toISOString().split('T')[0],
        contributionCount: count,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    if (week.contributionDays.length > 0) weeks.push(week);
  }

  return { totalContributions, weeks, accountCreatedAt, isDemo: true };
}

async function fetchContributions() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/github/contributions?username=${encodeURIComponent(GITHUB_USERNAME)}`,
    );

    if (response.ok) {
      const data = await response.json();
      if (data.weeks && Array.isArray(data.weeks)) {
        return parseRealContributions(data);
      }
    }

    return createDemoGraph(ACCOUNT_CREATED_AT);
  } catch {
    return createDemoGraph(ACCOUNT_CREATED_AT);
  }
}

function ContributionDay({ day, onHover, onLeave }) {
  return (
    <div
      className={`contribution-day level-${getContributionLevel(day.contributionCount)}`}
      data-date={day.date}
      data-count={day.contributionCount}
      onMouseEnter={(e) => onHover(e, day)}
      onMouseLeave={onLeave}
    />
  );
}

export default function GitHubGraph() {
  const [calendar, setCalendar] = useState(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    fetchContributions().then(setCalendar);
  }, []);

  const handleHover = (e, day) => {
    const tooltip = tooltipRef.current;
    if (!tooltip) return;
    const rect = e.target.getBoundingClientRect();
    tooltip.textContent = `${day.contributionCount} contributions on ${formatDate(day.date)}`;
    tooltip.style.display = 'block';
    let left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
    let top = rect.top - tooltip.offsetHeight - 10;
    if (left < 0) left = 5;
    if (left + tooltip.offsetWidth > window.innerWidth) left = window.innerWidth - tooltip.offsetWidth - 5;
    if (top < 0) top = rect.bottom + 10;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };

  const handleLeave = () => {
    if (tooltipRef.current) tooltipRef.current.style.display = 'none';
  };

  if (!calendar) {
    return (
      <div className="github-graph-container">
        <h3 style={{ fontFamily: "'Righteous', cursive", fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <span className="rat-emoji">🐀</span> GitHub Activity <span className="rat-emoji">🐀</span>
        </h3>
        <div className="github-graph">
          <div className="loading-spinner">Loading GitHub contributions...</div>
        </div>
      </div>
    );
  }

  const totalDays = calendar.weeks.reduce((sum, week) => sum + week.contributionDays.length, 0);
  const activeDays = calendar.weeks.reduce(
    (sum, week) => sum + week.contributionDays.filter((d) => d.contributionCount > 0).length,
    0,
  );
  const avgPerDay = (calendar.totalContributions / totalDays).toFixed(1);

  return (
    <div className="github-graph-container">
      <h3 style={{ fontFamily: "'Righteous', cursive", fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        <span className="rat-emoji">🐀</span> GitHub Activity <span className="rat-emoji">🐀</span>
      </h3>

      {calendar.isDemo && (
        <div style={{
          textAlign: 'center', padding: '0.4rem 0.8rem', marginBottom: '0.75rem',
          background: 'rgba(255,165,0,0.15)', border: '1px solid rgba(255,165,0,0.4)',
          borderRadius: '8px', color: '#ffa502', fontSize: '0.85rem', fontWeight: 500,
        }}>
          ⚠️ Demo / Sample Data — GitHub API key not configured
        </div>
      )}

      <div className="contribution-graph">
        {calendar.weeks.map((week, wi) => (
          <div key={wi} className="contribution-week">
            {week.contributionDays.map((day) => (
              <ContributionDay key={day.date} day={day} onHover={handleHover} onLeave={handleLeave} />
            ))}
          </div>
        ))}
      </div>

      <div className="graph-legend">
        <span>Less</span>
        <div className="legend-scale">
          <div className="legend-day level-0" />
          <div className="legend-day level-1" />
          <div className="legend-day level-2" />
          <div className="legend-day level-3" />
          <div className="legend-day level-4" />
        </div>
        <span>More</span>
      </div>

      <div className="graph-stats">
        <div className="stat-item">
          <div className="stat-value">{calendar.totalContributions.toLocaleString()}</div>
          <div className="stat-label">Total Contributions</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{activeDays.toLocaleString()}</div>
          <div className="stat-label">Active Days</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{avgPerDay}</div>
          <div className="stat-label">Avg per Day</div>
        </div>
      </div>

      <div ref={tooltipRef} className="graph-tooltip" style={{ display: 'none' }} />
    </div>
  );
}
