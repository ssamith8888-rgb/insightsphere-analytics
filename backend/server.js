const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const { initDb, run, all, get } = require('./db');
const seedDb = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Live traffic simulation interval holder
let simulatorInterval = null;
let simulatorActive = false;

// Helper: parse date filter
const getDateFilter = (range, customStart, customEnd) => {
  const now = new Date();
  let startDate = new Date();

  if (range === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (range === '7d') {
    startDate.setDate(now.getDate() - 7);
  } else if (range === '30d' || !range) {
    startDate.setDate(now.getDate() - 30);
  } else if (range === 'custom' && customStart) {
    startDate = new Date(customStart);
  }

  let endDate = now;
  if (range === 'custom' && customEnd) {
    endDate = new Date(customEnd);
  }

  return {
    startStr: startDate.toISOString(),
    endStr: endDate.toISOString()
  };
};

// 1. Ingestion Endpoint
app.post('/api/events', async (req, res) => {
  try {
    const { session_id, event_type, event_name, metadata, country, browser, device, referrer } = req.body;
    
    if (!event_type || !event_name) {
      return res.status(400).json({ error: 'event_type and event_name are required' });
    }

    const curSessionId = session_id || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const createdAt = new Date().toISOString();

    // Check if session exists, otherwise create it
    const sessionExists = await get('SELECT session_id FROM sessions WHERE session_id = ?', [curSessionId]);
    if (!sessionExists) {
      await run(
        'INSERT INTO sessions (session_id, country, browser, device, referrer, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [
          curSessionId,
          country || 'Unknown',
          browser || 'Unknown',
          device || 'Unknown',
          referrer || 'Direct',
          createdAt
        ]
      );
    }

    // Insert event
    const eventResult = await run(
      'INSERT INTO events (session_id, event_type, event_name, metadata, created_at) VALUES (?, ?, ?, ?, ?)',
      [curSessionId, event_type, event_name, JSON.stringify(metadata || {}), createdAt]
    );

    res.status(201).json({
      success: true,
      session_id: curSessionId,
      event: {
        id: eventResult.id,
        session_id: curSessionId,
        event_type,
        event_name,
        metadata,
        created_at: createdAt
      }
    });
  } catch (err) {
    console.error('Error logging event:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 2. Overview Metrics
app.get('/api/analytics/overview', async (req, res) => {
  try {
    const { range, start, end } = req.query;
    const { startStr, endStr } = getDateFilter(range, start, end);

    // Total Sessions
    const sessionsRes = await get(
      'SELECT COUNT(DISTINCT session_id) as count FROM events WHERE created_at >= ? AND created_at <= ?',
      [startStr, endStr]
    );
    const totalSessions = sessionsRes.count || 0;

    // Total Pageviews
    const pageviewsRes = await get(
      'SELECT COUNT(*) as count FROM events WHERE event_type = "pageview" AND created_at >= ? AND created_at <= ?',
      [startStr, endStr]
    );
    const totalPageviews = pageviewsRes.count || 0;

    // Unique Visitors
    const visitorsRes = await get(
      'SELECT COUNT(DISTINCT session_id) as count FROM sessions WHERE created_at >= ? AND created_at <= ?',
      [startStr, endStr]
    );
    const uniqueVisitors = visitorsRes.count || 0;

    // Average Session Duration (approximate calculation based on min/max event timestamps per session)
    const durationRes = await get(`
      SELECT AVG(duration) as avg_duration FROM (
        SELECT session_id, 
        (strftime('%s', MAX(created_at)) - strftime('%s', MIN(created_at))) as duration
        FROM events
        WHERE created_at >= ? AND created_at <= ?
        GROUP BY session_id
        HAVING duration > 0
      )
    `, [startStr, endStr]);
    const avgSessionDuration = Math.round(durationRes.avg_duration || 0);

    // Bounce Rate: % of sessions with only 1 event
    const bounceRes = await get(`
      SELECT COUNT(*) as single_event_sessions FROM (
        SELECT session_id, COUNT(*) as event_count
        FROM events
        WHERE created_at >= ? AND created_at <= ?
        GROUP BY session_id
        HAVING event_count = 1
      )
    `, [startStr, endStr]);
    const singleEventSessions = bounceRes.single_event_sessions || 0;
    const bounceRate = totalSessions > 0 ? Math.round((singleEventSessions / totalSessions) * 100) : 0;

    res.json({
      totalSessions,
      totalPageviews,
      uniqueVisitors,
      avgSessionDuration,
      bounceRate
    });
  } catch (err) {
    console.error('Error fetching overview analytics:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 3. Timeseries data
app.get('/api/analytics/timeseries', async (req, res) => {
  try {
    const { range, start, end } = req.query;
    const { startStr, endStr } = getDateFilter(range, start, end);

    let query = '';
    let format = '';

    if (range === 'today') {
      // Group by hour
      // SQLite strftime('%H', created_at) or substring
      query = `
        SELECT strftime('%H:00', created_at) as label,
               COUNT(DISTINCT session_id) as visitors,
               COUNT(*) as pageviews
        FROM events
        WHERE event_type = "pageview" AND created_at >= ? AND created_at <= ?
        GROUP BY label
        ORDER BY label ASC
      `;
    } else {
      // Group by day
      query = `
        SELECT date(created_at) as label,
               COUNT(DISTINCT session_id) as visitors,
               COUNT(*) as pageviews
        FROM events
        WHERE event_type = "pageview" AND created_at >= ? AND created_at <= ?
        GROUP BY label
        ORDER BY label ASC
      `;
    }

    const timeseries = await all(query, [startStr, endStr]);
    res.json(timeseries);
  } catch (err) {
    console.error('Error fetching timeseries data:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 4. Breakdown data (Devices, Browsers, Referrers, Countries)
app.get('/api/analytics/breakdowns', async (req, res) => {
  try {
    const { range, start, end } = req.query;
    const { startStr, endStr } = getDateFilter(range, start, end);

    const referrers = await all(`
      SELECT s.referrer as label, COUNT(DISTINCT s.session_id) as value
      FROM sessions s
      JOIN events e ON s.session_id = e.session_id
      WHERE e.created_at >= ? AND e.created_at <= ?
      GROUP BY label
      ORDER BY value DESC
      LIMIT 10
    `, [startStr, endStr]);

    const devices = await all(`
      SELECT s.device as label, COUNT(DISTINCT s.session_id) as value
      FROM sessions s
      JOIN events e ON s.session_id = e.session_id
      WHERE e.created_at >= ? AND e.created_at <= ?
      GROUP BY label
      ORDER BY value DESC
    `, [startStr, endStr]);

    const browsers = await all(`
      SELECT s.browser as label, COUNT(DISTINCT s.session_id) as value
      FROM sessions s
      JOIN events e ON s.session_id = e.session_id
      WHERE e.created_at >= ? AND e.created_at <= ?
      GROUP BY label
      ORDER BY value DESC
    `, [startStr, endStr]);

    const countries = await all(`
      SELECT s.country as label, COUNT(DISTINCT s.session_id) as value
      FROM sessions s
      JOIN events e ON s.session_id = e.session_id
      WHERE e.created_at >= ? AND e.created_at <= ?
      GROUP BY label
      ORDER BY value DESC
      LIMIT 10
    `, [startStr, endStr]);

    res.json({
      referrers,
      devices,
      browsers,
      countries
    });
  } catch (err) {
    console.error('Error fetching breakdown analytics:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 5. Funnel Analysis
app.get('/api/analytics/funnel', async (req, res) => {
  try {
    const { range, start, end } = req.query;
    const { startStr, endStr } = getDateFilter(range, start, end);

    // Conversion steps:
    // Step 1: Home pageview ('/')
    // Step 2: Pricing pageview ('/pricing' or '/features')
    // Step 3: Register pageview ('/register')
    // Step 4: Dashboard pageview ('/dashboard')

    const step1 = await get(`
      SELECT COUNT(DISTINCT session_id) as count FROM events 
      WHERE event_name = '/' AND created_at >= ? AND created_at <= ?
    `, [startStr, endStr]);

    const step2 = await get(`
      SELECT COUNT(DISTINCT session_id) as count FROM events 
      WHERE (event_name = '/pricing' OR event_name = '/features') AND created_at >= ? AND created_at <= ?
      AND session_id IN (SELECT DISTINCT session_id FROM events WHERE event_name = '/' AND created_at >= ? AND created_at <= ?)
    `, [startStr, endStr, startStr, endStr]);

    const step3 = await get(`
      SELECT COUNT(DISTINCT session_id) as count FROM events 
      WHERE event_name = '/register' AND created_at >= ? AND created_at <= ?
      AND session_id IN (SELECT DISTINCT session_id FROM events WHERE (event_name = '/pricing' OR event_name = '/features') AND created_at >= ? AND created_at <= ?)
    `, [startStr, endStr, startStr, endStr]);

    const step4 = await get(`
      SELECT COUNT(DISTINCT session_id) as count FROM events 
      WHERE event_name = '/dashboard' AND created_at >= ? AND created_at <= ?
      AND session_id IN (SELECT DISTINCT session_id FROM events WHERE event_name = '/register' AND created_at >= ? AND created_at <= ?)
    `, [startStr, endStr, startStr, endStr]);

    const funnelData = [
      { name: '1. Landing Page', count: step1.count || 0 },
      { name: '2. Pricing / Features', count: step2.count || 0 },
      { name: '3. Registration', count: step3.count || 0 },
      { name: '4. Dashboard Checkout', count: step4.count || 0 }
    ];

    res.json(funnelData);
  } catch (err) {
    console.error('Error fetching funnel analytics:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 6. Live log feed
app.get('/api/analytics/live', async (req, res) => {
  try {
    const liveLogs = await all(`
      SELECT e.id, e.session_id, e.event_type, e.event_name, e.metadata, e.created_at,
             s.country, s.browser, s.device, s.referrer
      FROM events e
      JOIN sessions s ON e.session_id = s.session_id
      ORDER BY e.created_at DESC
      LIMIT 50
    `);
    
    // Parse metadata
    const parsedLogs = liveLogs.map(log => ({
      ...log,
      metadata: JSON.parse(log.metadata || '{}')
    }));

    res.json(parsedLogs);
  } catch (err) {
    console.error('Error fetching live events:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 7. System & Database Health Metrics
app.get('/api/health', async (req, res) => {
  try {
    const start = Date.now();
    // Tiny SQL to measure SQLite latency
    await get('SELECT 1');
    const dbLatency = Date.now() - start;

    const memoryUsage = process.memoryUsage();
    
    let dbSize = 0;
    try {
      const dbPath = path.resolve(__dirname, 'analytics.db');
      if (fs.existsSync(dbPath)) {
        dbSize = fs.statSync(dbPath).size;
      }
    } catch (e) {
      console.error('Error reading db file size', e);
    }

    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      dbLatencyMs: dbLatency,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
      },
      dbSizeKb: Math.round(dbSize / 1024),
      simulatorActive
    });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// 8. In-memory Traffic Simulator
app.post('/api/analytics/simulate', (req, res) => {
  const { action } = req.body; // 'start' or 'stop'

  if (action === 'start') {
    if (simulatorActive) {
      return res.json({ message: 'Simulator already running', active: true });
    }

    const COUNTRIES = ['United States', 'India', 'United Kingdom', 'Germany', 'Canada', 'France', 'Australia', 'Japan'];
    const BROWSERS = ['Chrome', 'Safari', 'Firefox', 'Edge'];
    const DEVICES = ['Mobile', 'Desktop', 'Tablet'];
    const REFERRERS = ['Google', 'Direct', 'GitHub', 'Twitter/X', 'LinkedIn'];
    const PAGES = ['/', '/features', '/pricing', '/docs', '/register', '/dashboard'];

    let activeSessions = [];

    simulatorInterval = setInterval(async () => {
      try {
        const rand = Math.random();
        let sessionId;
        let isNewSession = false;

        // 30% chance to create a new session, or if no active sessions exist
        if (rand < 0.3 || activeSessions.length === 0) {
          sessionId = Math.random().toString(36).substring(2, 15);
          const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
          const browser = BROWSERS[Math.floor(Math.random() * BROWSERS.length)];
          const device = DEVICES[Math.floor(Math.random() * DEVICES.length)];
          const referrer = REFERRERS[Math.floor(Math.random() * REFERRERS.length)];
          
          activeSessions.push({
            sessionId,
            stepIndex: 0,
            country,
            browser,
            device,
            referrer
          });
          isNewSession = true;
          if (activeSessions.length > 20) activeSessions.shift(); // Keep pool size bounded
        }

        // Pick a session to generate an event for
        const sessionObj = activeSessions[Math.floor(Math.random() * activeSessions.length)];
        if (!sessionObj) return;

        let eventName = '/';
        let eventType = 'pageview';
        let metadata = {};

        if (!isNewSession) {
          sessionObj.stepIndex++;
          const step = sessionObj.stepIndex;

          if (step === 1) {
            eventName = Math.random() > 0.5 ? '/features' : '/pricing';
          } else if (step === 2) {
            eventName = '/register';
          } else if (step === 3) {
            eventName = '/dashboard';
            // Funnel completed, remove from active pool
            activeSessions = activeSessions.filter(s => s.sessionId !== sessionObj.sessionId);
          } else {
            // Click event or random doc visit
            if (Math.random() > 0.5) {
              eventType = 'click';
              eventName = 'simulate_cta_click';
              metadata = { label: 'Click Simulator Event' };
            } else {
              eventName = '/docs';
            }
            // Expire session occasionally
            if (Math.random() > 0.7) {
              activeSessions = activeSessions.filter(s => s.sessionId !== sessionObj.sessionId);
            }
          }
        }

        const createdAt = new Date().toISOString();

        if (isNewSession) {
          await run(
            'INSERT INTO sessions (session_id, country, browser, device, referrer, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [sessionObj.sessionId, sessionObj.country, sessionObj.browser, sessionObj.device, sessionObj.referrer, createdAt]
          );
        }

        await run(
          'INSERT INTO events (session_id, event_type, event_name, metadata, created_at) VALUES (?, ?, ?, ?, ?)',
          [sessionObj.sessionId, eventType, eventName, JSON.stringify(metadata), createdAt]
        );

      } catch (e) {
        console.error('Simulator insert error:', e);
      }
    }, 2000); // Trigger event every 2 seconds

    simulatorActive = true;
    console.log('Live traffic simulation started.');
    return res.json({ message: 'Simulation started', active: true });

  } else {
    // Stop simulator
    if (simulatorInterval) {
      clearInterval(simulatorInterval);
      simulatorInterval = null;
    }
    simulatorActive = false;
    console.log('Live traffic simulation stopped.');
    return res.json({ message: 'Simulation stopped', active: false });
  }
});

// Production: serve React frontend static files
const frontendBuildPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendBuildPath)) {
  console.log(`Serving compiled frontend static files from: ${frontendBuildPath}`);
  app.use(express.static(frontendBuildPath));
  
  app.get('*', (req, res) => {
    // For React router routing inside frontend
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  });
} else {
  console.log('Frontend build folder not found. Running server in API-only dev mode.');
  app.get('/', (req, res) => {
    res.json({
      message: 'InsightSphere Analytics API is running. Build the frontend to serve UI.',
      healthCheck: '/api/health'
    });
  });
}

// Database startup & listen
const startServer = async () => {
  try {
    await initDb();
    // Run seed to insert mock data if db is brand new
    await seedDb();
    
    app.listen(PORT, () => {
      console.log(`InsightSphere Express Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
