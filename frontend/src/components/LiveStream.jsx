import React from 'react';
import { Eye, MousePointerClick, MapPin, Laptop, Compass, Link2 } from 'lucide-react';

const LiveStream = ({ logs, loading }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'click':
        return <MousePointerClick size={14} className="icon-click" />;
      case 'pageview':
      default:
        return <Eye size={14} className="icon-view" />;
    }
  };

  const getRelativeTime = (isoString) => {
    const eventTime = new Date(isoString);
    const diffMs = new Date() - eventTime;
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 5) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    
    return eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (loading) {
    return <div className="loading-state glass-panel">Loading activity log...</div>;
  }

  return (
    <div className="live-stream-panel glass-panel">
      <div className="stream-header">
        <div className="header-left">
          <div className="live-indicator"></div>
          <span className="stream-title">Live Activity Feed</span>
        </div>
        <span className="log-count">{logs.length} active logs</span>
      </div>

      <div className="stream-container">
        {logs.length === 0 ? (
          <div className="empty-stream">No recent activity. Try triggering the Live Traffic Simulator.</div>
        ) : (
          <div className="logs-list">
            {logs.map((log) => (
              <div key={log.id} className="log-card">
                <div className="log-badge-container">
                  <div className={`log-type-icon ${log.event_type}`}>
                    {getEventIcon(log.event_type)}
                  </div>
                </div>
                
                <div className="log-details">
                  <div className="log-row-one">
                    <span className="log-event-name">{log.event_name}</span>
                    <span className="log-time">{getRelativeTime(log.created_at)}</span>
                  </div>
                  
                  <div className="log-metadata">
                    <span className="meta-badge"><MapPin size={10} /> {log.country || 'Local'}</span>
                    <span className="meta-badge"><Compass size={10} /> {log.browser}</span>
                    <span className="meta-badge"><Laptop size={10} /> {log.device}</span>
                    {log.referrer !== 'Direct' && (
                      <span className="meta-badge referrer"><Link2 size={10} /> {log.referrer}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .live-stream-panel {
          display: flex;
          flex-direction: column;
          height: 500px;
        }

        .stream-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .stream-title {
          font-size: 0.95rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .log-count {
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }

        .stream-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .empty-stream {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          font-size: 0.875rem;
          text-align: center;
          padding: 2rem;
        }

        .logs-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .log-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.02);
          transition: all 0.2s ease;
          animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .log-card:hover {
          background: rgba(255, 255, 255, 0.035);
          border-color: rgba(99, 102, 241, 0.15);
        }

        .log-badge-container {
          display: flex;
          align-items: center;
        }

        .log-type-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .log-type-icon.pageview {
          background: rgba(6, 182, 212, 0.1);
          color: var(--secondary);
          border: 1px solid rgba(6, 182, 212, 0.2);
        }

        .log-type-icon.click {
          background: rgba(236, 72, 153, 0.1);
          color: var(--accent);
          border: 1px solid rgba(236, 72, 153, 0.2);
        }

        .log-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .log-row-one {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .log-event-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary);
          font-family: var(--font-mono);
        }

        .log-time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .log-metadata {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .meta-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.03);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }

        .meta-badge svg {
          color: var(--text-muted);
        }

        .meta-badge.referrer {
          border-color: rgba(99, 102, 241, 0.15);
          color: hsl(250, 95%, 75%);
        }

        .loading-state {
          height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default LiveStream;
