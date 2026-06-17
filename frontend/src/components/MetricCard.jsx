import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MetricCard = ({ title, value, change, icon: Icon, format, loading }) => {
  const isPositive = change >= 0;
  
  const displayValue = () => {
    if (loading) return <span className="skeleton-loader"></span>;
    if (format === 'time') {
      const mins = Math.floor(value / 60);
      const secs = value % 60;
      return `${mins}m ${secs}s`;
    }
    if (format === 'percent') {
      return `${value}%`;
    }
    return Number(value).toLocaleString();
  };

  return (
    <div className="metric-card glass-panel">
      <div className="card-top">
        <span className="card-title">{title}</span>
        <div className="card-icon-container">
          {Icon && <Icon size={18} className="card-icon" />}
        </div>
      </div>
      
      <div className="card-value-container">
        <h3 className="card-value">{displayValue()}</h3>
      </div>

      {!loading && change !== undefined && (
        <div className={`card-trend ${isPositive ? 'trend-up' : 'trend-down'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span className="trend-text">
            {Math.abs(change)}% vs last period
          </span>
        </div>
      )}

      <style>{`
        .metric-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .metric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--border-glow), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .metric-card:hover::before {
          transform: translateX(100%);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .card-title {
          font-size: 0.825rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .card-icon-container {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .metric-card:hover .card-icon-container {
          background: var(--primary-glow);
          color: var(--secondary);
          border-color: rgba(6, 182, 212, 0.3);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.2);
        }

        .card-value-container {
          margin-bottom: 0.5rem;
        }

        .card-value {
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .card-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .trend-up {
          color: var(--success);
        }

        .trend-down {
          color: var(--danger);
        }

        .trend-text {
          color: var(--text-muted);
        }

        /* Skeleton animation */
        .skeleton-loader {
          display: inline-block;
          width: 90px;
          height: 28px;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.03) 25%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0.03) 75%
          );
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 4px;
        }

        @keyframes skeleton-loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default MetricCard;
