import React from 'react';
import { Activity, Server, Database, HardDrive, Clock, CheckCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const SystemHealth = ({ healthData, loading, refreshHealth }) => {
  // Store latency history in state to show an animated line graph
  const [latencyHistory, setLatencyHistory] = React.useState([]);

  React.useEffect(() => {
    if (healthData && healthData.dbLatencyMs !== undefined) {
      setLatencyHistory((prev) => {
        const updated = [...prev, {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          latency: healthData.dbLatencyMs
        }];
        // Keep last 15 ticks
        if (updated.length > 15) updated.shift();
        return updated;
      });
    }
  }, [healthData]);

  // Set up interval to poll health API for real-time monitoring
  React.useEffect(() => {
    const interval = setInterval(() => {
      refreshHealth();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [refreshHealth]);

  const latencyChartData = {
    labels: latencyHistory.map(h => h.time),
    datasets: [
      {
        label: 'Database Latency (ms)',
        data: latencyHistory.map(h => h.latency),
        borderColor: '#10b981', // Emerald
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.2,
        fill: true,
        pointRadius: 3,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#0f172a' }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' },
        min: 0,
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    return parts.join(' ');
  };

  if (loading && !healthData) {
    return <div className="loading-state glass-panel">Verifying system vitals...</div>;
  }

  return (
    <div className="health-page">
      <div className="health-header">
        <div>
          <h1 className="page-title text-gradient-blue">System Health</h1>
          <p className="page-subtitle">Real-time server diagnostics and database health metrics</p>
        </div>
        <div className="health-status-badge glass-panel">
          <CheckCircle size={14} className="icon-success" />
          <span>SYSTEM ONLINE</span>
        </div>
      </div>

      <div className="health-grid">
        {/* API Server Status */}
        <div className="health-card glass-panel">
          <div className="card-top">
            <div className="icon-wrapper server-icon">
              <Server size={20} />
            </div>
            <h3>Express API Server</h3>
          </div>
          <div className="card-body">
            <div className="metric-row">
              <span className="label">Status</span>
              <span className="value text-success">Healthy</span>
            </div>
            <div className="metric-row">
              <span className="label">Server Uptime</span>
              <span className="value">{formatUptime(healthData?.uptime)}</span>
            </div>
            <div className="metric-row">
              <span className="label">Environment</span>
              <span className="value text-highlight">Production Node</span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="health-card glass-panel">
          <div className="card-top">
            <div className="icon-wrapper db-icon">
              <Database size={20} />
            </div>
            <h3>SQLite Database</h3>
          </div>
          <div className="card-body">
            <div className="metric-row">
              <span className="label">Database Size</span>
              <span className="value">{healthData?.dbSizeKb || 0} KB</span>
            </div>
            <div className="metric-row">
              <span className="label">Response Latency</span>
              <span className="value">{healthData?.dbLatencyMs || 0} ms</span>
            </div>
            <div className="metric-row">
              <span className="label">Storage Type</span>
              <span className="value">Local File (persistent)</span>
            </div>
          </div>
        </div>

        {/* Node.js Memory */}
        <div className="health-card glass-panel">
          <div className="card-top">
            <div className="icon-wrapper memory-icon">
              <HardDrive size={20} />
            </div>
            <h3>Node.js Memory</h3>
          </div>
          <div className="card-body">
            <div className="metric-row">
              <span className="label">Heap Memory Used</span>
              <span className="value">{healthData?.memory?.heapUsed || 0} MB</span>
            </div>
            <div className="metric-row">
              <span className="label">Total Heap Size</span>
              <span className="value">{healthData?.memory?.heapTotal || 0} MB</span>
            </div>
            <div className="metric-row">
              <span className="label">RSS Memory</span>
              <span className="value">{healthData?.memory?.rss || 0} MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Latency History Line Chart */}
      <div className="latency-chart-panel glass-panel">
        <div className="chart-header">
          <Activity size={18} className="success-color" />
          <h3>Database Query Latency History (Real-Time)</h3>
        </div>
        <div style={{ height: '260px' }}>
          {latencyHistory.length < 2 ? (
            <div className="chart-gathering">Gathering latency statistics...</div>
          ) : (
            <Line data={latencyChartData} options={chartOptions} />
          )}
        </div>
      </div>

      <style>{`
        .health-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .health-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .health-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--success);
          border-color: rgba(16, 185, 129, 0.25);
          background: rgba(16, 185, 129, 0.05);
          letter-spacing: 0.05em;
        }

        .icon-success {
          color: var(--success);
        }

        .health-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .health-card {
          padding: 1.5rem;
        }

        .card-top {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .card-top h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .server-icon {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .db-icon {
          background: rgba(6, 182, 212, 0.1);
          color: var(--secondary);
          border: 1px solid rgba(6, 182, 212, 0.2);
        }

        .memory-icon {
          background: rgba(236, 72, 153, 0.1);
          color: var(--accent);
          border: 1px solid rgba(236, 72, 153, 0.2);
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .metric-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .metric-row .label {
          color: var(--text-secondary);
        }

        .metric-row .value {
          font-weight: 600;
          color: var(--text-primary);
        }

        .text-success {
          color: var(--success) !important;
        }

        .text-highlight {
          color: var(--secondary) !important;
        }

        .latency-chart-panel {
          padding: 1.5rem;
        }

        .chart-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .chart-header h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .success-color {
          color: var(--success);
        }

        .chart-gathering {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default SystemHealth;
