import React from 'react';
import { ChevronDown, Users, Percent, HelpCircle } from 'lucide-react';

const FunnelChart = ({ data, loading }) => {
  if (loading) {
    return <div className="funnel-loading glass-panel">Loading funnel analytical data...</div>;
  }

  // Calculate conversion rates
  const formattedSteps = data.map((step, idx) => {
    const previousCount = idx > 0 ? data[idx - 1].count : step.count;
    
    // Percent of total (first step)
    const pctOfTotal = data[0].count > 0 ? Math.round((step.count / data[0].count) * 100) : 0;
    
    // Pct of previous step (retention rate)
    const pctOfPrevious = previousCount > 0 ? Math.round((step.count / previousCount) * 100) : 0;
    
    // Drop-off rate from previous step
    const dropOffRate = 100 - pctOfPrevious;

    return {
      ...step,
      pctOfTotal,
      pctOfPrevious,
      dropOffRate,
    };
  });

  const totalConversion = formattedSteps.length > 0 && formattedSteps[0].count > 0 
    ? ((formattedSteps[formattedSteps.length - 1].count / formattedSteps[0].count) * 100).toFixed(1) 
    : 0;

  return (
    <div className="funnel-panel glass-panel">
      <div className="funnel-header">
        <div>
          <h3 className="funnel-title">Conversion Funnel</h3>
          <p className="funnel-subtitle">Tracks pageview progression & checkout checkout flow</p>
        </div>
        <div className="funnel-badge">
          <Percent size={12} />
          <span>Overall Conversion: {totalConversion}%</span>
        </div>
      </div>

      <div className="funnel-flow">
        {formattedSteps.map((step, idx) => (
          <React.Fragment key={step.name}>
            <div className="funnel-step">
              <div className="step-content">
                <div className="step-info">
                  <span className="step-name">{step.name}</span>
                  <div className="step-values">
                    <span className="step-count">
                      <Users size={12} style={{ marginRight: '4px' }} />
                      {step.count.toLocaleString()} sessions
                    </span>
                    <span className="step-percent">{step.pctOfTotal}% of total</span>
                  </div>
                </div>

                <div className="funnel-bar-container">
                  <div 
                    className="funnel-bar" 
                    style={{ width: `${Math.max(step.pctOfTotal, 3)}%` }}
                  >
                    <span className="bar-label">{step.pctOfTotal}%</span>
                  </div>
                </div>
              </div>

              {idx > 0 && (
                <div className="step-transition-metrics">
                  <span className="retention-stat">{step.pctOfPrevious}% converted</span>
                  <span className="drop-stat">-{step.dropOffRate}% drop-off</span>
                </div>
              )}
            </div>

            {idx < formattedSteps.length - 1 && (
              <div className="funnel-divider">
                <ChevronDown size={18} className="divider-arrow" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <style>{`
        .funnel-panel {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .funnel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .funnel-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .funnel-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .funnel-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--primary-glow);
          color: hsl(250, 95%, 75%);
          border: 1px solid rgba(139, 92, 246, 0.3);
          padding: 0.3rem 0.75rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .funnel-flow {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .funnel-step {
          position: relative;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .funnel-step:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(99, 102, 241, 0.1);
        }

        .step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .step-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .step-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .step-values {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
        }

        .step-count {
          color: var(--text-secondary);
          display: inline-flex;
          align-items: center;
        }

        .step-percent {
          color: var(--text-muted);
          font-weight: 600;
        }

        .funnel-bar-container {
          width: 100%;
          height: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          overflow: hidden;
        }

        .funnel-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 0.5rem;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bar-label {
          font-size: 0.65rem;
          font-weight: 800;
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .step-transition-metrics {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          min-width: 100px;
          text-align: right;
        }

        .retention-stat {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--success);
        }

        .drop-stat {
          font-size: 0.725rem;
          font-weight: 600;
          color: var(--danger);
        }

        .funnel-divider {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 24px;
          margin: -0.25rem 0;
        }

        .divider-arrow {
          color: var(--text-muted);
          animation: bounce-arrow 2s infinite;
        }

        @keyframes bounce-arrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }

        .funnel-loading {
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

export default FunnelChart;
