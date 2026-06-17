import React from 'react';
import FunnelChart from '../components/FunnelChart';
import { Target, HelpCircle, Layers } from 'lucide-react';

const Behaviors = ({ funnelData, timeseriesData, liveLogs, loading }) => {
  
  // Calculate top visited pages from timeseries or live logs as mock summaries
  const topPagesData = React.useMemo(() => {
    // We can extract pages from liveLogs to show realistic data
    const pageCounts = {};
    liveLogs.forEach(log => {
      if (log.event_type === 'pageview') {
        pageCounts[log.event_name] = (pageCounts[log.event_name] || 0) + 1;
      }
    });

    // Fallback if logs are empty (use standard template)
    const defaults = {
      '/': 324,
      '/pricing': 186,
      '/features': 152,
      '/docs': 98,
      '/register': 64,
      '/dashboard': 42
    };

    const finalCounts = Object.keys(pageCounts).length > 0 ? pageCounts : defaults;
    
    return Object.keys(finalCounts)
      .map(key => ({
        path: key,
        views: finalCounts[key],
        bounceRate: Math.floor(Math.random() * 20) + 25 // mock bounce rate for visual completeness
      }))
      .sort((a, b) => b.views - a.views);
  }, [liveLogs]);

  // Calculate top button click actions
  const topActionsData = React.useMemo(() => {
    const clickCounts = {};
    liveLogs.forEach(log => {
      if (log.event_type === 'click') {
        clickCounts[log.event_name] = (clickCounts[log.event_name] || 0) + 1;
      }
    });

    const defaults = {
      'hero_cta_click': 120,
      'pricing_yearly_toggle': 54,
      'features_demo_video': 38,
      'simulate_cta_click': 25
    };

    const finalCounts = Object.keys(clickCounts).length > 0 ? clickCounts : defaults;

    return Object.keys(finalCounts)
      .map(key => ({
        action: key,
        clicks: finalCounts[key]
      }))
      .sort((a, b) => b.clicks - a.clicks);
  }, [liveLogs]);

  return (
    <div className="behaviors-page">
      <div className="behaviors-header">
        <div>
          <h1 className="page-title text-gradient-blue">User Behaviors</h1>
          <p className="page-subtitle">Analyzing page pathways, CTA clicks, and conversion conversions</p>
        </div>
      </div>

      <div className="behaviors-grid">
        {/* Left Funnel component */}
        <div className="funnel-container">
          <FunnelChart data={funnelData} loading={loading} />
        </div>

        {/* Right tables */}
        <div className="tables-container">
          {/* Top Pages Table */}
          <div className="table-card glass-panel">
            <div className="card-header">
              <Layers size={18} className="secondary-color" />
              <h3>Top Visited Pages</h3>
            </div>
            
            <div className="card-body">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Page Path</th>
                    <th>Views</th>
                    <th>Avg Bounce</th>
                  </tr>
                </thead>
                <tbody>
                  {topPagesData.map((page) => (
                    <tr key={page.path}>
                      <td className="code-font">{page.path}</td>
                      <td>{page.views.toLocaleString()}</td>
                      <td>{page.bounceRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Custom Actions Table */}
          <div className="table-card glass-panel">
            <div className="card-header">
              <Target size={18} className="primary-color" />
              <h3>Top Click Interactions</h3>
            </div>
            
            <div className="card-body">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Action Identifier</th>
                    <th>Clicks Count</th>
                  </tr>
                </thead>
                <tbody>
                  {topActionsData.map((action) => (
                    <tr key={action.action}>
                      <td className="code-font">{action.action}</td>
                      <td>{action.clicks.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .behaviors-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .behaviors-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .funnel-container {
          min-width: 0;
        }

        .tables-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          min-width: 0;
        }

        .table-card {
          padding: 1.25rem 1.5rem;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 1.25rem;
        }

        .card-header h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .code-font {
          font-family: var(--font-mono);
          font-size: 0.825rem;
          color: var(--secondary) !important;
        }

        @media (max-width: 1024px) {
          .behaviors-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Behaviors;
