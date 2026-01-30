/**
 * Netlify Function: POST /.netlify/functions/sync
 * Sync XP for an authenticated session
 * 
 * Request body:
 * {
 *   "sessionId": "abc123"
 * }
 */

import { getSession } from './utils/sessionStore.js';

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { sessionId } = JSON.parse(event.body || '{}');

    if (!sessionId || !getSession(sessionId)) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Invalid or expired session',
        }),
      };
    }

    const session = getSession(sessionId);
    const { api } = session;

    // Get updated profile
    let profile;
    try {
      profile = await api.getProfile();
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Session expired or invalid',
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
