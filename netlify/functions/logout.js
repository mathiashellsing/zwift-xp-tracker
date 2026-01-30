/**
 * Netlify Function: POST /.netlify/functions/logout
 * Clear a session
 * 
 * Request body:
 * {
 *   "sessionId": "abc123"
 * }
 */

import { deleteSession } from './utils/sessionStore.js';

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

    if (sessionId) {
      deleteSession(sessionId);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Logged out successfully',
      }),
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Server error',
      }),
    };
  }
};
