import React from 'react';
import LiveStream from '../components/LiveStream';
import { Radio, ShieldAlert, Cpu } from 'lucide-react';

const RealTime = ({ liveLogs, loading, simulatorActive, toggleSimulator }) => {
  // Count active sessions (sessions within last 5 minutes)
  const activeSessionsCount = React.useMemo(() => {
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const uniqueSessions = new Set(
      liveLogs
        .filter(log => new Date(log.created_at) > fiveMinsAgo)
        .map(log => log.session_id)
    );
    return uniqueSessions.size;
  }, [liveLogs]);

  // Event breakdowns (pageview vs click count)
  const eventStats = React.useMemo(() => {
    const stats = { pageviews: 0, clicks: 0 };
    liveLogs.forEach(log => {
      if (log.event_type === 'pageview') stats.pageviews++;
      else if (log.event_type === 'click') stats.clicks++;
    });
    return stats;
  }, [liveLogs]);

  return (
    <div className="realtime-page">
      <div className="realtime-header">
        <div>
          <h1 className="page-title text-gradient-purple">Real-Time Ingestion</h1>
          <p className="page-subtitle">Monitoring events streamed directly into SQLite in real-time</p>
        </div>
      </div>

      <div className="realtime-stats-grid">
        {/* Active Visitors */}
        <div className="stat-card glass-panel highlight">
          <div className="stat-left">
            <span className="stat-label">Active Users (Last 5m)</span>
            <h2 className="stat-value">{activeSessionsCount}</h2>
            <span className="stat-status">
              <span className="live-indicator"></span>
              Live Tracking Enabled
            </span>
          </div>
          <div className="stat-right">
            <Radio size={36} className="pulse-icon" />
          </div>
        </div>

        {/* Pageviews vs Clicks */}
        <div className="stat-card glass-panel">
          <div className="stat-left">
            <span className="stat-label">Pageview Events</span>
            <h2 className="stat-value text-cyan">{eventStats.pageviews}</h2>
            <span className="stat-desc">Captured in current session</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-left">
            <span className="stat-label">Interaction Events (Clicks)</span>
            <h2 className="stat-value text-pink">{eventStats.clicks}</h2>
            <span className="stat-desc">Button toggles and clicks</span>
          </div>
        </div>
      </div>

      {/* Simulator CTA Panel (If simulator is not running) */}
      {!simulatorActive && (
        <div className="simulator-cta-panel glass-panel">
          <div className="cta-left">
            <Cpu size={24} className="secondary-color" />
            <div>
              <h3>Would you like to simulate live user traffic?</h3>
              <p>Since this is a fresh setup, you might not have real-time users visiting. Click start to spawn a background generator that simulates live page views, button clicks and conversions.</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={toggleSimulator}>
            Start Traffic Simulator
          </button>
        </div>
      )}

      {/* LiveStream list panel */}
      <LiveStream logs={liveLogs} loading={loading} />

      <style>{`
        .realtime-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .realtime-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .realtime-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-card.highlight {
          border-color: rgba(99, 102, 241, 0.3);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.02) 100%);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1), var(--shadow-glow);
        }

        .stat-left {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 2.25rem;
          font-weight: 800;
          line-height: 1;
        }

        .text-cyan {
          color: var(--secondary);
        }

        .text-pink {
          color: var(--accent);
        }

        .stat-status {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .pulse-icon {
          color: var(--secondary);
          animation: pulse-view 2s infinite;
        }

        @keyframes pulse-view {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.4)); }
        }

        .simulator-cta-panel {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          border-color: rgba(6, 182, 212, 0.2);
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.05) 0%, transparent 100%);
        }

        .simulator-cta-panel:hover {
          transform: none;
          border-color: rgba(6, 182, 212, 0.35);
        }

        .cta-left {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .cta-left h3 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .cta-left p {
          font-size: 0.825rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .simulator-cta-panel {
            flex-direction: column;
            align-items: stretch;
            gap: 1.25rem;
          }
          .btn-primary {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default RealTime;
