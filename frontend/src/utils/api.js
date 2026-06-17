/**
 * API wrapper for communicating with the InsightSphere backend.
 * Dev proxy in vite.config.js routes /api to http://localhost:5000 in development.
 * In production, server serves frontend build and API requests are served from same origin.
 */

const API_BASE = ''; // Same origin

export const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      let errorJson = {};
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        // ignore
      }
      throw new Error(errorJson.error || `HTTP error! status: ${response.status}`);
    }
    
    // Parse json if content-type is json
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } catch (error) {
    console.error(`API Call failed on ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Analytics endpoints
 */
export const analyticsApi = {
  getOverview: (range, start, end) => {
    let params = `?range=${range || '30d'}`;
    if (range === 'custom' && start) {
      params += `&start=${start}${end ? `&end=${end}` : ''}`;
    }
    return fetchApi(`/api/analytics/overview${params}`);
  },

  getTimeseries: (range, start, end) => {
    let params = `?range=${range || '30d'}`;
    if (range === 'custom' && start) {
      params += `&start=${start}${end ? `&end=${end}` : ''}`;
    }
    return fetchApi(`/api/analytics/timeseries${params}`);
  },

  getBreakdowns: (range, start, end) => {
    let params = `?range=${range || '30d'}`;
    if (range === 'custom' && start) {
      params += `&start=${start}${end ? `&end=${end}` : ''}`;
    }
    return fetchApi(`/api/analytics/breakdowns${params}`);
  },

  getFunnel: (range, start, end) => {
    let params = `?range=${range || '30d'}`;
    if (range === 'custom' && start) {
      params += `&start=${start}${end ? `&end=${end}` : ''}`;
    }
    return fetchApi(`/api/analytics/funnel${params}`);
  },

  getLive: () => {
    return fetchApi('/api/analytics/live');
  },

  getHealth: () => {
    return fetchApi('/api/health');
  },

  toggleSimulator: (action) => {
    return fetchApi('/api/analytics/simulate', {
      method: 'POST',
      body: { action } // 'start' or 'stop'
    });
  },

  // Log custom client-side events
  trackEvent: (eventType, eventName, metadata = {}) => {
    // Collect client environment info automatically
    const browser = getBrowserName();
    const device = getDeviceType();
    const referrer = document.referrer || 'Direct';
    
    // Check if session ID is in localStorage
    let sessionId = localStorage.getItem('insightsphere_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('insightsphere_session_id', sessionId);
    }

    return fetchApi('/api/events', {
      method: 'POST',
      body: {
        session_id: sessionId,
        event_type: eventType,
        event_name: eventName,
        metadata,
        browser,
        device,
        referrer,
        country: 'Localhost' // Simulating local environment
      }
    });
  }
};

// Simple helper to detect browser
function getBrowserName() {
  const agent = navigator.userAgent.toLowerCase();
  if (agent.includes('chrome') && !agent.includes('edge') && !agent.includes('opr')) return 'Chrome';
  if (agent.includes('safari') && !agent.includes('chrome')) return 'Safari';
  if (agent.includes('firefox')) return 'Firefox';
  if (agent.includes('edge') || agent.includes('edg')) return 'Edge';
  if (agent.includes('opr') || agent.includes('opera')) return 'Opera';
  return 'Chrome'; // Default
}

// Simple helper to detect device
function getDeviceType() {
  const agent = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(agent)) {
    return 'Tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(agent)) {
    return 'Mobile';
  }
  return 'Desktop';
}
