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

    let profileResponse;
    let profileError = null;
    let profile = null;
    let athleteId = null;

    try {
      // Try calling /api/profiles/me to get current user profile
      profileResponse = await api.fetchJSON('/api/profiles/me');
      console.log('[LOGIN] /api/profiles/me statusCode:', profileResponse?.statusCode);
      
      if (profileResponse?.statusCode === 200 && profileResponse?.body) {
        profile = profileResponse.body;
        athleteId = profile.id;
        console.log('[LOGIN] Got athlete ID:', athleteId);
      }
    } catch (error) {
      profileError = error;
      console.error('[LOGIN] Profile fetch error:', error.message);
    }

    // If we still don't have the athlete ID, return an error
    if (!athleteId || !profile) {
      console.error('[LOGIN] Could not fetch athlete profile');
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'Failed to fetch athlete profile',
          details: 'Could not determine athlete ID',
        }),
      };
    }

    // Extract XP and level from profile using correct Zwift field names
    let xp = 0;
    let level = 0;

    if (profile) {
      // Zwift uses "totalExperiencePoints" for cycling XP and "achievementLevel" for level
      xp = profile.totalExperiencePoints || 0;
      level = profile.achievementLevel || 0;
      console.log('[LOGIN] Extracted XP:', xp, 'Level:', level);
    }

    // Return response with profile data and credentials
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        athleteId,
        profile: profile ? {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          countryAlpha3: profile.countryAlpha3,
        } : null,
        xp,
        level,
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
