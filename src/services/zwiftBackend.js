/**
 * Zwift Backend API Client
 * Communicates with the Netlify Functions backend to authenticate and sync XP
 * 
 * Architecture: Credentials-based (stateless)
 * - Credentials are stored client-side in localStorage
 * - Each sync request sends credentials to backend
 * - Backend re-authenticates on each call (no server sessions)
 * - More secure than session tokens and works with stateless functions
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
 * Returns credentials that should be stored client-side
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
 * Sync XP for a user
 * Requires email and password (stored from login)
 */
export async function syncXP(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
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
 * Logout (client-side cleanup)
 */
export async function logoutZwift() {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
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
