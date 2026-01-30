/**
 * Netlify Function: GET /.netlify/functions/health
 * Health check endpoint
 */

export const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }),
  };
};
