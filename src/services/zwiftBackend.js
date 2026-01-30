/**
 * Zwift Backend API Client
 * Communicates with the Netlify Functions backend to authenticate and sync XP
 * 
 * URLs:
 * - Local development: http://localhost:8888/.netlify/functions
 * - Netlify production: https://yourdomain.netlify.app/.netlify/functions
 * - Custom domain: https://your-custom-domain/.netlify/functions
 */

// Determine API base URL based on environment
const getAPIBaseUrl = () => {
  // Custom API URL from environment variable (highest priority)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Check current hostname
  const hostname = window.location.hostname;
  const port = window.location.port;

  // Local development with Netlify CLI (localhost:8888)
  if (hostname === 'localhost' && port === '8888') {
    return '/.netlify/functions';
  }

  // Local development with Create React App dev server (localhost:3000)
  if (hostname === 'localhost' && port === '3000') {
    return 'http://localhost:3001/api'; // Old Express backend fallback
  }

  // Running on Netlify (production or preview)
  // Netlify domains: *.netlify.app, or custom domains
  if (hostname.includes('netlify.app') || hostname.includes('zwiftxptracker')) {
    return '/.netlify/functions';
  }

  // Default to relative path (works for same-origin)
  return '/.netlify/functions';
};

const API_BASE_URL = getAPIBaseUrl();

/**
 * Login to Zwift using backend API
 */
export async function loginToZwift(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Sync XP for a session
 */
export async function syncXP(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Sync failed');
    }

    return data;
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
}

/**
 * Logout
 */
export async function logoutZwift(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Logout failed');
    }

    return data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}
