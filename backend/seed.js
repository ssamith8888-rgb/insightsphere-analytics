const { initDb, run, all } = require('./db');
const { v4: uuidv4 } = require('crypto'); // We can use a simple custom UUID function to avoid installing crypto if not present, or use standard crypto node library

// Simple function to generate unique ID since we don't want to rely on external uuid package if it requires installation
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const COUNTRIES = [
  { name: 'United States', code: 'US', weight: 35 },
  { name: 'India', code: 'IN', weight: 20 },
  { name: 'United Kingdom', code: 'GB', weight: 12 },
  { name: 'Germany', code: 'DE', weight: 10 },
  { name: 'Canada', code: 'CA', weight: 8 },
  { name: 'France', code: 'FR', weight: 5 },
  { name: 'Australia', code: 'AU', weight: 5 },
  { name: 'Japan', code: 'JP', weight: 5 }
];

const BROWSERS = [
  { name: 'Chrome', weight: 60 },
  { name: 'Safari', weight: 22 },
  { name: 'Firefox', weight: 10 },
  { name: 'Edge', weight: 6 },
  { name: 'Opera', weight: 2 }
];

const DEVICES = [
  { name: 'Mobile', weight: 52 },
  { name: 'Desktop', weight: 40 },
  { name: 'Tablet', weight: 8 }
];

const REFERRERS = [
  { name: 'Google', weight: 35 },
  { name: 'Direct', weight: 30 },
  { name: 'GitHub', weight: 18 },
  { name: 'Twitter/X', weight: 10 },
  { name: 'LinkedIn', weight: 5 },
  { name: 'ProductHunt', weight: 2 }
];

// Helper to pick based on weights
const pickWeighted = (list) => {
  const totalWeight = list.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * totalWeight;
  for (const item of list) {
    if (r < item.weight) return item.name || item;
    r -= item.weight;
  }
  return list[0].name || list[0];
};

const seed = async () => {
  try {
    await initDb();
    
    // Check if database is already seeded
    const rowCount = await getCount('sessions');
    if (rowCount > 0) {
      console.log('Database already has data. Skipping seeding.');
      return;
    }

    console.log('Seeding database with 30 days of analytics data...');
    
    const now = new Date();
    
    // We will generate data for the last 30 days
    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const currentDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      
      // Weekly trend: fewer visitors on weekends (0 = Sunday, 6 = Saturday)
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Determine number of sessions for this day
      let numSessions = Math.floor(Math.random() * 50) + 60; // 60-110 sessions on weekdays
      if (isWeekend) {
        numSessions = Math.floor(numSessions * 0.6); // 40% reduction on weekends
      }
      
      // Introduce an upward trend over the month to make it look like a growing app
      const growthFactor = 1 + (30 - dayOffset) * 0.02; // 1.0 to 1.6
      numSessions = Math.floor(numSessions * growthFactor);

      console.log(`Seeding Day -${dayOffset} (${currentDate.toDateString()}): Generating ${numSessions} sessions...`);

      for (let s = 0; s < numSessions; s++) {
        // Generate random time during the day
        const sessionTime = new Date(currentDate.getTime());
        sessionTime.setHours(Math.floor(Math.random() * 24));
        sessionTime.setMinutes(Math.floor(Math.random() * 60));
        sessionTime.setSeconds(Math.floor(Math.random() * 60));
        
        const sessionId = generateId();
        const country = pickWeighted(COUNTRIES);
        const browser = pickWeighted(BROWSERS);
        const device = pickWeighted(DEVICES);
        const referrer = pickWeighted(REFERRERS);
        const createdAt = sessionTime.toISOString();

        // 1. Insert session
        await run(
          'INSERT INTO sessions (session_id, country, browser, device, referrer, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [sessionId, country, browser, device, referrer, createdAt]
        );

        // 2. Generate events for this session (simulating user journey)
        const path = [];
        path.push('/'); // Everyone starts on homepage
        
        // Randomly navigate further
        const rand = Math.random();
        if (rand > 0.3) {
          path.push('/features');
          if (Math.random() > 0.4) {
            path.push('/pricing');
            if (Math.random() > 0.5) {
              path.push('/register');
              if (Math.random() > 0.3) {
                path.push('/dashboard'); // Funnel Completed!
              }
            }
          }
        } else if (rand > 0.1) {
          path.push('/pricing');
          if (Math.random() > 0.4) {
            path.push('/register');
            if (Math.random() > 0.3) {
              path.push('/dashboard'); // Funnel Completed!
            }
          }
        } else {
          path.push('/docs');
        }

        // Insert pageview events
        let timeOffsetSeconds = 0;
        for (const page of path) {
          const eventTime = new Date(sessionTime.getTime() + timeOffsetSeconds * 1000);
          
          await run(
            'INSERT INTO events (session_id, event_type, event_name, metadata, created_at) VALUES (?, ?, ?, ?, ?)',
            [sessionId, 'pageview', page, JSON.stringify({ title: `${page.substring(1) || 'home'} page` }), eventTime.toISOString()]
          );
          
          // Randomly trigger click events on page
          if (page === '/' && Math.random() > 0.5) {
            const clickTime = new Date(eventTime.getTime() + Math.floor(Math.random() * 10) * 1000);
            await run(
              'INSERT INTO events (session_id, event_type, event_name, metadata, created_at) VALUES (?, ?, ?, ?, ?)',
              [sessionId, 'click', 'hero_cta_click', JSON.stringify({ label: 'Get Started' }), clickTime.toISOString()]
            );
          }
          if (page === '/pricing' && Math.random() > 0.6) {
            const clickTime = new Date(eventTime.getTime() + Math.floor(Math.random() * 10) * 1000);
            await run(
              'INSERT INTO events (session_id, event_type, event_name, metadata, created_at) VALUES (?, ?, ?, ?, ?)',
              [sessionId, 'click', 'pricing_yearly_toggle', JSON.stringify({ currentPlan: 'yearly' }), clickTime.toISOString()]
            );
          }
          if (page === '/features' && Math.random() > 0.7) {
            const clickTime = new Date(eventTime.getTime() + Math.floor(Math.random() * 10) * 1000);
            await run(
              'INSERT INTO events (session_id, event_type, event_name, metadata, created_at) VALUES (?, ?, ?, ?, ?)',
              [sessionId, 'click', 'features_demo_video', JSON.stringify({ videoId: 'demo_123' }), clickTime.toISOString()]
            );
          }

          timeOffsetSeconds += Math.floor(Math.random() * 45) + 15; // 15 to 60 seconds on page
        }
      }
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding database:', error);
  }
};

const getCount = (table) => {
  return new Promise((resolve, reject) => {
    const { db } = require('./db');
    db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
      if (err) reject(err);
      else resolve(row ? row.count : 0);
    });
  });
};

// Run if direct execution
if (require.main === module) {
  seed();
}

module.exports = seed;
