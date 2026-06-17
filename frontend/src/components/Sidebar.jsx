import React from 'react';
import { LayoutDashboard, Radio, Activity, HeartPulse, Terminal } from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, serverHealthy, simulatorActive, toggleSimulator }) => {
  const navItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'realtime', name: 'Real-Time Activity', icon: Radio },
    { id: 'behavior', name: 'User Behaviors', icon: Activity },
    { id: 'health', name: 'System Health', icon: HeartPulse },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="logo-section">
        <div className="logo-icon">
          <Terminal size={24} className="primary-color" />
        </div>
        <div className="logo-text">
          <span className="logo-main">Insight</span>
          <span className="logo-sub">Sphere</span>
        </div>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.name}</span>
              {item.id === 'realtime' && simulatorActive && (
                <span className="badge-live">LIVE</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {/* Live Traffic Simulator controls */}
        <div className="simulator-widget glass-panel">
          <div className="sim-header">
            <span className="sim-title">Live Simulator</span>
            <div className={`status-dot ${simulatorActive ? 'active' : ''}`}></div>
          </div>
          <p className="sim-desc">
            {simulatorActive ? 'Injecting traffic...' : 'Simulation idle.'}
          </p>
          <button 
            className={`btn btn-sm ${simulatorActive ? 'btn-danger' : 'btn-primary'}`}
            onClick={toggleSimulator}
          >
            {simulatorActive ? 'Stop Simulation' : 'Start Simulation'}
          </button>
        </div>

        {/* Server Status Widget */}
        <div className="server-status">
          <span className={`status-dot ${serverHealthy ? 'healthy' : 'unhealthy'}`}></span>
          <span className="status-label">
            Server: {serverHealthy ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>

      <style>{`
        .sidebar {
          position: fixed;
          top: 1.5rem;
          left: 1.5rem;
          bottom: 1.5rem;
          width: 240px;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          border-radius: 20px;
          z-index: 100;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
          padding-left: 0.5rem;
        }

        .logo-icon {
          background: linear-gradient(135deg, var(--primary) 0%, hsl(250, 95% ,65%) 100%);
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .logo-icon svg {
          color: white;
        }

        .logo-text {
          font-weight: 800;
          font-size: 1.2rem;
          letter-spacing: -0.03em;
        }

        .logo-main {
          color: var(--text-primary);
        }

        .logo-sub {
          background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          border-radius: 12px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          width: 100%;
        }

        .nav-item:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
          transform: translateX(3px);
        }

        .nav-item.active {
          color: var(--text-primary);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%);
          border: 1px solid rgba(99, 102, 241, 0.25);
          box-shadow: inset 0 0 12px rgba(99, 102, 241, 0.1);
        }

        .nav-item.active .nav-icon {
          color: var(--secondary);
          filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.5));
        }

        .nav-icon {
          transition: color 0.2s ease;
        }

        .badge-live {
          margin-left: auto;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.15rem 0.4rem;
          border-radius: 20px;
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.3);
          letter-spacing: 0.05em;
          animation: pulse-live 2s infinite;
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .simulator-widget {
          padding: 0.85rem;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .simulator-widget:hover {
          transform: none;
          box-shadow: var(--shadow-sm);
        }

        .sim-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }

        .sim-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .sim-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.65rem;
        }

        .btn-sm {
          padding: 0.4rem 0.8rem;
          font-size: 0.75rem;
          width: 100%;
          justify-content: center;
          border-radius: 6px;
        }

        .btn-danger {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.4);
        }

        .btn-danger:hover {
          background: rgba(239, 68, 68, 0.35);
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
        }

        .server-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          padding-left: 0.5rem;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ef4444;
        }

        .status-dot.healthy, .status-dot.active {
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }

        .status-dot.unhealthy {
          background: #ef4444;
          box-shadow: 0 0 6px #ef4444;
        }

        @media (max-width: 1024px) {
          .sidebar {
            width: 70px;
            padding: 1rem 0.5rem;
            left: 0.75rem;
            top: 0.75rem;
            bottom: 0.75rem;
          }

          .logo-section {
            justify-content: center;
            padding: 0;
            margin-bottom: 2rem;
          }

          .logo-text, .nav-item span, .simulator-widget, .server-status span:not(.status-dot) {
            display: none;
          }

          .nav-item {
            justify-content: center;
            padding: 0.75rem;
          }
          
          .badge-live {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: auto;
            width: 100%;
            height: 60px;
            flex-direction: row;
            align-items: center;
            padding: 0 1.25rem;
            border-radius: 0;
            border-width: 0 0 1px 0;
          }

          .logo-section {
            margin: 0;
          }

          .logo-text {
            display: block;
          }

          .nav-menu {
            display: none; /* Let App render a mobile navigation overlay if needed, or we keep it simple for now */
          }

          .sidebar-footer {
            margin-left: auto;
            flex-direction: row;
            align-items: center;
            gap: 1rem;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
