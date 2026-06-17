import React from 'react';
import { Users, Eye, Clock, LogOut, Globe, Compass } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { TimeseriesChart, BreakdownsSection } from '../components/AnalyticsCharts';

const Overview = ({ 
  overviewData, 
  timeseriesData, 
  breakdownData, 
  loading, 
  dateRange, 
  setDateRange,
  customDates,
  setCustomDates
}) => {

  const handleRangeChange = (range) => {
    setDateRange(range);
  };

  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    setCustomDates(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Pre-calculated comparison values (mock trends for visual enhancement)
  const trends = {
    sessions: dateRange === 'today' ? 12.4 : 8.2,
    pageviews: dateRange === 'today' ? 15.1 : 11.5,
    visitors: dateRange === 'today' ? 9.8 : 7.4,
    duration: dateRange === 'today' ? -2.4 : 3.1,
    bounce: dateRange === 'today' ? -1.2 : -0.8
  };

  return (
    <div className="overview-page">
      {/* Upper header section */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title text-gradient-blue">Analytics Overview</h1>
          <p className="page-subtitle">Visualizing audience traffic and session data</p>
        </div>
        
        {/* Date Filters Controls */}
        <div className="filters-container glass-panel">
          <div className="range-selector">
            {['today', '7d', '30d', 'custom'].map((range) => (
              <button
                key={range}
                onClick={() => handleRangeChange(range)}
                className={`btn btn-secondary btn-tab ${dateRange === range ? 'btn-active' : ''}`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="custom-date-inputs">
              <input
                type="date"
                name="start"
                value={customDates.start}
                onChange={handleCustomDateChange}
                className="date-input"
              />
              <span className="date-sep">to</span>
              <input
                type="date"
                name="end"
                value={customDates.end}
                onChange={handleCustomDateChange}
                className="date-input"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Sessions"
          value={overviewData.totalSessions}
          change={trends.sessions}
          icon={Users}
          loading={loading}
        />
        <MetricCard
          title="Page Views"
          value={overviewData.totalPageviews}
          change={trends.pageviews}
          icon={Eye}
          loading={loading}
        />
        <MetricCard
          title="Unique Visitors"
          value={overviewData.uniqueVisitors}
          change={trends.visitors}
          icon={Users}
          loading={loading}
        />
        <MetricCard
          title="Avg Session Duration"
          value={overviewData.avgSessionDuration}
          change={trends.duration}
          icon={Clock}
          format="time"
          loading={loading}
        />
        <MetricCard
          title="Bounce Rate"
          value={overviewData.bounceRate}
          change={trends.bounce}
          icon={LogOut}
          format="percent"
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <TimeseriesChart data={timeseriesData} loading={loading} />

      {/* Device & Referrer breakdowns */}
      <BreakdownsSection data={breakdownData} loading={loading} />

      {/* Country & Browser details grids */}
      <div className="details-grid">
        {/* Top Countries List */}
        <div className="details-card glass-panel">
          <div className="details-header">
            <Globe size={18} className="secondary-color" />
            <h3 className="details-title">Traffic by Location</h3>
          </div>
          <div className="details-content">
            {loading ? (
              <div className="loader">Loading locations...</div>
            ) : breakdownData?.countries?.length === 0 ? (
              <div className="no-data">No geographic traffic data available.</div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Sessions</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdownData?.countries?.map((country) => {
                    const total = breakdownData.countries.reduce((sum, c) => sum + c.value, 0);
                    const pct = total > 0 ? ((country.value / total) * 100).toFixed(1) : 0;
                    return (
                      <tr key={country.label}>
                        <td className="country-cell">
                          <span className="flag-icon">📍</span>
                          <span>{country.label}</span>
                        </td>
                        <td>{country.value.toLocaleString()}</td>
                        <td className="progress-cell">
                          <span className="progress-num">{pct}%</span>
                          <div className="mini-progress-bar">
                            <div className="fill" style={{ width: `${pct}%` }}></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Browsers List */}
        <div className="details-card glass-panel">
          <div className="details-header">
            <Compass size={18} className="primary-color" />
            <h3 className="details-title">Top Browsers</h3>
          </div>
          <div className="details-content">
            {loading ? (
              <div className="loader">Loading browsers...</div>
            ) : breakdownData?.browsers?.length === 0 ? (
              <div className="no-data">No browser usage data available.</div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Browser</th>
                    <th>Sessions</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdownData?.browsers?.map((browser) => {
                    const total = breakdownData.browsers.reduce((sum, b) => sum + b.value, 0);
                    const pct = total > 0 ? ((browser.value / total) * 100).toFixed(1) : 0;
                    return (
                      <tr key={browser.label}>
                        <td>{browser.label}</td>
                        <td>{browser.value.toLocaleString()}</td>
                        <td className="progress-cell">
                          <span className="progress-num">{pct}%</span>
                          <div className="mini-progress-bar">
                            <div className="fill secondary-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .overview-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .page-title {
          font-size: 2.25rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .page-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .filters-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem;
          border-radius: 12px;
          flex-wrap: wrap;
        }

        .filters-container:hover {
          transform: none;
          box-shadow: var(--shadow-md);
        }

        .range-selector {
          display: flex;
          gap: 0.25rem;
        }

        .btn-tab {
          padding: 0.45rem 0.9rem;
          font-size: 0.8rem;
          border-radius: 8px;
        }

        .custom-date-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: fade-in-left 0.2s ease;
        }

        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .date-input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 0.35rem 0.65rem;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 0.8rem;
          outline: none;
        }

        .date-input:focus {
          border-color: var(--secondary);
        }

        .date-sep {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .details-card {
          padding: 1.5rem;
        }

        .details-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .details-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .country-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .flag-icon {
          font-size: 1.1rem;
        }

        .progress-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 130px;
        }

        .progress-num {
          font-size: 0.775rem;
          font-weight: 700;
          min-width: 32px;
          text-align: right;
        }

        .mini-progress-bar {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 3px;
          overflow: hidden;
        }

        .mini-progress-bar .fill {
          height: 100%;
          background: var(--primary);
          border-radius: 3px;
        }

        .mini-progress-bar .fill.secondary-fill {
          background: var(--secondary);
        }

        .loader, .no-data {
          padding: 2rem 0;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .filters-container {
            width: 100%;
            justify-content: space-between;
          }
          .range-selector {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
          }
          .btn-tab {
            text-align: center;
          }
          .custom-date-inputs {
            width: 100%;
            justify-content: space-between;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Overview;
