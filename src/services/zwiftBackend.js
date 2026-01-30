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

  // Running on Netlify (production or preview)
  if (process.env.REACT_APP_NETLIFY === 'true') {
    return '/.netlify/functions';
  }

  // Local development with Netlify CLI
  if (window.location.hostname === 'localhost' && window.location.port === '8888') {
    return '/.netlify/functions';
  }

  // Fallback to old Express backend for backward compatibility
  return 'http://localhost:3001/api';
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
