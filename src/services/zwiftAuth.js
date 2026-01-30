/**
 * Zwift OAuth 2.0 Authentication Service
 * Handles OAuth flow, token management, and authentication state
 */

// OAuth Configuration
const ZWIFT_OAUTH_CONFIG = {
  clientId: process.env.REACT_APP_ZWIFT_CLIENT_ID || 'your_client_id_here',
  redirectUri: window.location.origin + '/zwift-xp-tracker', // Adjust path if needed
  authorizationEndpoint: 'https://www.zwift.com/oauth/authorize',
  tokenEndpoint: 'https://www.zwift.com/oauth/token',
  scopes: ['profile', 'email'], // Request minimal required scopes
};

// Storage keys
const STORAGE_KEYS = {
  accessToken: 'zwift-auth.accessToken',
  refreshToken: 'zwift-auth.refreshToken',
  tokenExpiry: 'zwift-auth.tokenExpiry',
  userId: 'zwift-auth.userId',
  profileData: 'zwift-auth.profileData',
  codeVerifier: 'zwift-auth.codeVerifier', // For PKCE
};

/**
 * Generate a random string for PKCE code challenge
 */
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => String.fromCharCode(byte))
    .join('')
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      return String.fromCharCode((code % 26) + 97); // Convert to a-z
    })
    .join('')
    .substring(0, 43);
}

/**
 * Generate PKCE code challenge from verifier
 */
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashString = hashArray.map((b) => String.fromCharCode(b)).join('');
  return btoa(hashString).replace(/[+/=]/g, (char) => {
    if (char === '+') return '-';
    if (char === '/') return '_';
    return '';
  });
}

/**
 * Initiate OAuth login flow
 */
export async function initiateLogin() {
  try {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Store code verifier for later verification
    localStorage.setItem(STORAGE_KEYS.codeVerifier, codeVerifier);
    
    // Generate a random state for CSRF protection
    const state = generateCodeVerifier().substring(0, 32);
    sessionStorage.setItem('zwift-auth.state', state);
    
    // Build authorization URL
    const authUrl = new URL(ZWIFT_OAUTH_CONFIG.authorizationEndpoint);
    authUrl.searchParams.append('client_id', ZWIFT_OAUTH_CONFIG.clientId);
    authUrl.searchParams.append('redirect_uri', ZWIFT_OAUTH_CONFIG.redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', ZWIFT_OAUTH_CONFIG.scopes.join(' '));
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    
    // Redirect to Zwift OAuth endpoint
    window.location.href = authUrl.toString();
  } catch (error) {
    console.error('Failed to initiate login:', error);
    throw error;
  }
}

/**
 * Handle OAuth callback and exchange code for token
 */
export async function handleOAuthCallback() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }
    
    if (!code) {
      throw new Error('No authorization code received');
    }
    
    // Verify state for CSRF protection
    const savedState = sessionStorage.getItem('zwift-auth.state');
    if (state !== savedState) {
      throw new Error('State mismatch - possible CSRF attack');
    }
    
    // Exchange code for token
    const codeVerifier = localStorage.getItem(STORAGE_KEYS.codeVerifier);
    const response = await fetch(ZWIFT_OAUTH_CONFIG.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: ZWIFT_OAUTH_CONFIG.clientId,
        redirect_uri: ZWIFT_OAUTH_CONFIG.redirectUri,
        code_verifier: codeVerifier,
      }).toString(),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
    }
    
    const tokenData = await response.json();
    
    // Store tokens
    saveTokens(tokenData);
    
    // Clean up temporary data
    localStorage.removeItem(STORAGE_KEYS.codeVerifier);
    sessionStorage.removeItem('zwift-auth.state');
    
    // Clear OAuth params from URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    return tokenData;
  } catch (error) {
    console.error('OAuth callback handling failed:', error);
    throw error;
  }
}

/**
 * Save tokens to localStorage with expiry tracking
 */
function saveTokens(tokenData) {
  localStorage.setItem(STORAGE_KEYS.accessToken, tokenData.access_token);
  
  if (tokenData.refresh_token) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, tokenData.refresh_token);
  }
  
  // Calculate expiry time
  const expiryTime = Date.now() + (tokenData.expires_in * 1000);
  localStorage.setItem(STORAGE_KEYS.tokenExpiry, expiryTime.toString());
}

/**
 * Get valid access token, refreshing if necessary
 */
export async function getAccessToken() {
  const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
  const tokenExpiry = localStorage.getItem(STORAGE_KEYS.tokenExpiry);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
  
  if (!accessToken) {
    return null;
  }
  
  // Check if token is expired or expiring soon (within 5 minutes)
  const expiryTime = parseInt(tokenExpiry, 10);
  if (expiryTime && Date.now() > expiryTime - 5 * 60 * 1000) {
    if (refreshToken) {
      try {
        return await refreshAccessToken(refreshToken);
      } catch (error) {
        console.error('Token refresh failed:', error);
        // If refresh fails, clear tokens and return null
        clearAuth();
        return null;
      }
    }
  }
  
  return accessToken;
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch(ZWIFT_OAUTH_CONFIG.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: ZWIFT_OAUTH_CONFIG.clientId,
      }).toString(),
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const tokenData = await response.json();
    saveTokens(tokenData);
    
    return tokenData.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    clearAuth();
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
  return !!accessToken;
}

/**
 * Get stored user ID
 */
export function getUserId() {
  return localStorage.getItem(STORAGE_KEYS.userId);
}

/**
 * Set user ID after fetching profile
 */
export function setUserId(userId) {
  localStorage.setItem(STORAGE_KEYS.userId, userId);
}

/**
 * Get stored profile data
 */
export function getProfileData() {
  const profileData = localStorage.getItem(STORAGE_KEYS.profileData);
  return profileData ? JSON.parse(profileData) : null;
}

/**
 * Set profile data
 */
export function setProfileData(profileData) {
  localStorage.setItem(STORAGE_KEYS.profileData, JSON.stringify(profileData));
}

/**
 * Clear all authentication data
 */
export function clearAuth() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  sessionStorage.removeItem('zwift-auth.state');
}

/**
 * Logout user
 */
export function logout() {
  clearAuth();
  window.location.href = window.location.pathname;
}
