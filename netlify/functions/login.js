/**
 * Netlify Function: POST /.netlify/functions/login
 * Authenticate with Zwift and return user profile + XP
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "password"
 * }
 * 
 * Note: Credentials are sent to client in response and stored in localStorage.
 * This is necessary because Netlify Functions are stateless - sessions don't
 * persist between function invocations.
 */

import { ZwiftAPI } from '@codingwithspike/zwift-api-wrapper';

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email, password } = JSON.parse(event.body || '{}');

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Email and password are required',
        }),
      };
    }

    // Authenticate with Zwift
    const api = new ZwiftAPI(email, password);

    try {
      await api.authenticate();
    } catch (authError) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Invalid Zwift credentials',
          details: authError.message,
        }),
      };
    }

    // Get user profile
    let profile;
    let athleteId;
    let profileError = null;

    try {
      profile = await api.getProfile();
      athleteId = profile.id;
    } catch (error) {
      profileError = error;
      console.error('[LOGIN] Profile fetch error:', error.message, error);
    }

    // DEBUG: Log what we got from the API
    if (profileError) {
      console.log('[LOGIN] Profile fetch failed, returning error');
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'Failed to fetch profile',
          details: profileError.message,
        }),
      };
    }

    // DEBUG: Log the profile structure
    console.log('[LOGIN] Profile object type:', typeof profile);
    console.log('[LOGIN] Profile is null/undefined:', profile === null || profile === undefined);
    if (profile) {
      try {
        console.log('[LOGIN] Profile keys:', Object.keys(profile));
        console.log('[LOGIN] profile.totalXp:', profile.totalXp);
        console.log('[LOGIN] profile.xp:', profile.xp);
        console.log('[LOGIN] profile.experience:', profile.experience);
        console.log('[LOGIN] profile.level:', profile.level);
        console.log('[LOGIN] JSON stringified profile:', JSON.stringify(profile, null, 2));
      } catch (logError) {
        console.error('[LOGIN] Error logging profile:', logError.message);
      }
    }

    // Extract XP and level from profile - try multiple field names
    let xp = 0;
    let level = 0;

    if (profile) {
      xp = profile.totalXp || profile.xp || profile.experience || 0;
      level = profile.level || 0;
    }

    console.log('[LOGIN] Extracted XP:', xp, 'Level:', level);

    // IMPORTANT: Return the full profile object for debugging
    // This will help us understand what fields are actually available from Zwift
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        athleteId,
        profile: {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          countryAlpha3: profile.countryAlpha3,
        },
        xp,
        level,
        // Return full profile object for debugging
        _debugProfile: profile,
        _debugProfileKeys: Object.keys(profile),
        // Return credentials for client to use in subsequent requests
        // These will be stored in localStorage on the client
        credentials: {
          email,
          password,
        },
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Server error',
        details: error.message,
      }),
    };
  }
};
