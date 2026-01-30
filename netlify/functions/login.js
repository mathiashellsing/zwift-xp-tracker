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

    try {
      profile = await api.getProfile();
      athleteId = profile.id;
    } catch (profileError) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'Failed to fetch profile',
          details: profileError.message,
        }),
      };
    }

    // Extract XP and level from profile
    const xp = profile.totalXp || 0;
    const level = profile.level || 0;

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
