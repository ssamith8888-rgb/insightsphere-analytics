import React from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Automatically registers all modules

export const TimeseriesChart = ({ data, loading }) => {
  if (loading) {
    return <div className="chart-loading glass-panel">Loading Chart data...</div>;
  }

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: 'Page Views',
        data: data.map((d) => d.pageviews),
        borderColor: '#a78bfa', // Purple
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        tension: 0.3,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: '#a78bfa',
      },
      {
        label: 'Unique Visitors',
        data: data.map((d) => d.visitors),
        borderColor: '#06b6d4', // Cyan
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.3,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: '#06b6d4',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0',
          font: { family: 'Plus Jakarta Sans', weight: '600' },
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } },
      },
    },
  };

  return (
    <div className="chart-container glass-panel">
      <h3 className="chart-title">Traffic Overview Over Time</h3>
      <div style={{ height: '320px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export const BreakdownsSection = ({ data, loading }) => {
  if (loading) {
    return <div className="chart-loading glass-panel">Loading Breakdown data...</div>;
  }

  // Device Doughnut Chart
  const deviceChartData = {
    labels: data.devices.map((d) => d.label),
    datasets: [
      {
        data: data.devices.map((d) => d.value),
        backgroundColor: ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'],
        borderWidth: 0,
      },
    ],
  };

  const deviceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#cbd5e1',
          font: { family: 'Plus Jakarta Sans', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
      },
    },
    cutout: '65%',
  };

  // Referral Sources Horizontal Bar Chart
  const referrerChartData = {
    labels: data.referrers.map((r) => r.label),
    datasets: [
      {
        label: 'Sessions',
        data: data.referrers.map((r) => r.value),
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        hoverBackgroundColor: 'rgba(99, 102, 241, 0.95)',
        borderRadius: 6,
        borderWidth: 0,
      },
    ],
  };

  const referrerOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#0f172a' },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', weight: '600' } },
      },
    },
  };

  return (
    <div className="breakdown-grid">
      <div className="chart-container glass-panel">
        <h3 className="chart-title">Sessions by Device</h3>
        <div style={{ height: '220px', position: 'relative' }}>
          <Doughnut data={deviceChartData} options={deviceOptions} />
        </div>
      </div>

      <div className="chart-container glass-panel">
        <h3 className="chart-title">Top Referral Sources</h3>
        <div style={{ height: '220px' }}>
          <Bar data={referrerChartData} options={referrerOptions} />
        </div>
      </div>
      
      <style>{`
        .breakdown-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .chart-container {
          padding: 1.5rem;
        }

        .chart-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .chart-loading {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};
