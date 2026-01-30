/**
 * Netlify Function: POST /.netlify/functions/logout
 * Logout (no-op for stateless architecture)
 * 
 * Request body: {} (empty, just triggers client-side logout)
 * 
 * Note: Since we don't store sessions on the server, logout is just
 * client-side cleanup. This endpoint exists for consistency.
 */

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
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
