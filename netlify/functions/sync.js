/**
 * Netlify Function: POST /.netlify/functions/sync
 * Sync XP for authenticated user
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "password"
 * }
 * 
 * Note: We re-authenticate on each sync because Netlify Functions are stateless.
 * This is safer anyway - credentials are always fresh and validated.
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

    // Get updated profile
    let profile;
    try {
      profile = await api.getProfile();
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Failed to fetch profile',
          details: error.message,
        }),
      };
    }

    const xp = profile.totalXp || 0;
    const level = profile.level || 0;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        xp,
        level,
        profile: {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
        },
      }),
    };
  } catch (error) {
    console.error('Sync error:', error);
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
