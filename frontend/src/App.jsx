import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import RealTime from './pages/RealTime';
import Behaviors from './pages/Behaviors';
import SystemHealth from './pages/SystemHealth';
import { analyticsApi } from './utils/api';
import { Menu, X } from 'lucide-react';

const App = () => {
  const [activePage, setActivePage] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [customDates, setCustomDates] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Data states
  const [overviewData, setOverviewData] = useState({
    totalSessions: 0,
    totalPageviews: 0,
    uniqueVisitors: 0,
    avgSessionDuration: 0,
    bounceRate: 0
  });
  const [timeseriesData, setTimeseriesData] = useState([]);
  const [breakdownData, setBreakdownData] = useState({
    referrers: [],
    devices: [],
    browsers: [],
    countries: []
  });
  const [funnelData, setFunnelData] = useState([]);
  const [liveLogs, setLiveLogs] = useState([]);
  const [healthData, setHealthData] = useState(null);

  // Status/Loading States
  const [loading, setLoading] = useState(true);
  const [serverHealthy, setServerHealthy] = useState(false);
  const [simulatorActive, setSimulatorActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch all analytical data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const [overview, timeseries, breakdowns, funnel] = await Promise.all([
        analyticsApi.getOverview(dateRange, customDates.start, customDates.end),
        analyticsApi.getTimeseries(dateRange, customDates.start, customDates.end),
        analyticsApi.getBreakdowns(dateRange, customDates.start, customDates.end),
        analyticsApi.getFunnel(dateRange, customDates.start, customDates.end)
      ]);

      setOverviewData(overview);
      setTimeseriesData(timeseries);
      setBreakdownData(breakdowns);
      setFunnelData(funnel);
      setServerHealthy(true);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
      setServerHealthy(false);
    } finally {
      setLoading(false);
    }
  }, [dateRange, customDates]);

  // Fetch live logs and server health
  const fetchLiveAndHealth = useCallback(async () => {
    try {
      const [logs, health] = await Promise.all([
        analyticsApi.getLive(),
        analyticsApi.getHealth()
      ]);
      setLiveLogs(logs);
      setHealthData(health);
      setServerHealthy(health.status === 'healthy');
      setSimulatorActive(health.simulatorActive);
    } catch (e) {
      console.error('Failed to refresh live metrics:', e);
      setServerHealthy(false);
    }
  }, []);

  // Track page views on navigation inside the dashboard
  useEffect(() => {
    // track event
    analyticsApi.trackEvent('pageview', `/${activePage}`, { title: `${activePage} tab` })
      .catch(err => console.error('Failed to track navigation:', err));
  }, [activePage]);

  // Initial load & date filter change load
  useEffect(() => {
    fetchAnalyticsData();
    fetchLiveAndHealth();
  }, [fetchAnalyticsData, fetchLiveAndHealth]);

  // Polling for live feed
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveAndHealth();
    }, 4000); // refresh logs and simulator status every 4 seconds

    return () => clearInterval(interval);
  }, [fetchLiveAndHealth]);

  // Start / Stop simulator
  const toggleSimulator = async () => {
    try {
      const action = simulatorActive ? 'stop' : 'start';
      const result = await analyticsApi.toggleSimulator(action);
      setSimulatorActive(result.active);
      // Immediately refresh health/logs
      fetchLiveAndHealth();
    } catch (e) {
      console.error('Failed to toggle simulator:', e);
    }
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'realtime':
        return (
          <RealTime
            liveLogs={liveLogs}
            loading={loading}
            simulatorActive={simulatorActive}
            toggleSimulator={toggleSimulator}
          />
        );
      case 'behavior':
        return (
          <Behaviors
            funnelData={funnelData}
            timeseriesData={timeseriesData}
            liveLogs={liveLogs}
            loading={loading}
          />
        );
      case 'health':
        return (
          <SystemHealth
            healthData={healthData}
            loading={loading}
            refreshHealth={fetchLiveAndHealth}
          />
        );
      case 'overview':
      default:
        return (
          <Overview
            overviewData={overviewData}
            timeseriesData={timeseriesData}
            breakdownData={breakdownData}
            loading={loading}
            dateRange={dateRange}
            setDateRange={setDateRange}
            customDates={customDates}
            setCustomDates={setCustomDates}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="mobile-title">InsightSphere</span>
        <div className={`mobile-live-dot ${simulatorActive ? 'active' : ''}`}></div>
      </header>

      {/* Sidebar navigation */}
      <div className={`sidebar-wrapper ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <Sidebar
          activePage={activePage}
          setActivePage={(page) => {
            setActivePage(page);
            setMobileMenuOpen(false); // Close sidebar on mobile select
          }}
          serverHealthy={serverHealthy}
          simulatorActive={simulatorActive}
          toggleSimulator={toggleSimulator}
        />
      </div>

      {/* Main dashboard content */}
      <main className="main-content">
        {renderActivePage()}
      </main>

      <style>{`
        .sidebar-wrapper {
          transition: transform 0.3s ease;
        }

        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
          align-items: center;
          padding: 0 1.25rem;
          z-index: 101;
        }

        .mobile-menu-toggle {
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
        }

        .mobile-title {
          margin-left: 1rem;
          font-weight: 800;
          font-size: 1.15rem;
          letter-spacing: -0.02em;
        }

        .mobile-live-dot {
          margin-left: auto;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-muted);
        }

        .mobile-live-dot.active {
          background: var(--success);
          box-shadow: 0 0 8px var(--success);
        }

        @media (max-width: 768px) {
          .mobile-header {
            display: flex;
          }

          .sidebar-wrapper {
            position: fixed;
            top: 60px;
            left: 0;
            bottom: 0;
            width: 260px;
            transform: translateX(-100%);
            z-index: 100;
          }

          .sidebar-wrapper.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default App;
