import express from 'express';
import cors from 'cors';
import { ZwiftAPI } from '@codingwithspike/zwift-api-wrapper';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for authenticated sessions
// In production, use a proper database with encryption
const sessions = new Map();

/**
 * POST /api/zwift/login
 * Authenticate with Zwift and return user profile + XP
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "password"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "athleteId": 12345,
 *   "profile": { ... },
 *   "xp": 50000,
 *   "level": 15,
 *   "sessionId": "abc123"
 * }
 */
app.post('/api/zwift/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Authenticate with Zwift
    const api = new ZwiftAPI(email, password);

    try {
      await api.authenticate();
    } catch (authError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Zwift credentials',
        details: authError.message,
      });
    }

    // Get user profile
    let profile;
    let athleteId;

    try {
      profile = await api.getProfile();
      athleteId = profile.id;
    } catch (profileError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch profile',
        details: profileError.message,
      });
    }

    // Extract XP and level from profile
    const xp = profile.totalXp || 0;
    const level = profile.level || 0;

    // Create session ID for this authenticated user
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store session with API instance for later use
    sessions.set(sessionId, {
      api,
      athleteId,
      email,
      profile,
      createdAt: Date.now(),
    });

    // Clean up old sessions (older than 1 hour)
    for (const [key, value] of sessions.entries()) {
      if (Date.now() - value.createdAt > 3600000) {
        sessions.delete(key);
      }
    }

    res.json({
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
      sessionId,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message,
    });
  }
});

/**
 * POST /api/zwift/sync
 * Sync XP for an authenticated session
 * 
 * Request body:
 * {
 *   "sessionId": "abc123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "xp": 50000,
 *   "level": 15
 * }
 */
app.post('/api/zwift/sync', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session',
      });
    }

    const session = sessions.get(sessionId);
    const { api } = session;

    // Get updated profile
    let profile;
    try {
      profile = await api.getProfile();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Session expired or invalid',
        details: error.message,
      });
    }

    const xp = profile.totalXp || 0;
    const level = profile.level || 0;

    // Update cached profile
    session.profile = profile;

    res.json({
      success: true,
      xp,
      level,
      profile: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
      },
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message,
    });
  }
});

/**
 * POST /api/zwift/logout
 * Clear a session
 * 
 * Request body:
 * {
 *   "sessionId": "abc123"
 * }
 */
app.post('/api/zwift/logout', (req, res) => {
  try {
    const { sessionId } = req.body;

    if (sessionId && sessions.has(sessionId)) {
      sessions.delete(sessionId);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Zwift XP Tracker backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
