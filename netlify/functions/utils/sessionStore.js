/**
 * Session Store - In-memory store for development
 * For production, replace with a proper database (MongoDB, PostgreSQL, etc.)
 * 
 * Netlify Functions are stateless, so we use in-memory storage.
 * Sessions will be lost if the function container restarts.
 * For persistence, consider using:
 * - Firebase Realtime Database
 * - MongoDB Atlas
 * - Supabase
 * - AWS DynamoDB
 */

const sessions = new Map();

/**
 * Create a new session
 */
export function createSession(data) {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  sessions.set(sessionId, {
    ...data,
    createdAt: Date.now(),
  });

  // Clean up old sessions (older than 1 hour)
  cleanupOldSessions();

  return sessionId;
}

/**
 * Get a session
 */
export function getSession(sessionId) {
  return sessions.get(sessionId);
}

/**
 * Delete a session
 */
export function deleteSession(sessionId) {
  sessions.delete(sessionId);
}

/**
 * Clean up sessions older than 1 hour
 */
export function cleanupOldSessions() {
  const ONE_HOUR = 3600000;
  const now = Date.now();

  for (const [key, value] of sessions.entries()) {
    if (now - value.createdAt > ONE_HOUR) {
      sessions.delete(key);
    }
  }
}

export default {
  createSession,
  getSession,
  deleteSession,
  cleanupOldSessions,
};
