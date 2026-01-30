/**
 * useZwiftAuth Hook
 * Manages Zwift authentication state and API interactions
 */

import { useState, useEffect, useCallback } from 'react';
import { loginToZwift, syncXP, logoutZwift } from '../services/zwiftBackend';

const STORAGE_KEYS = {
  sessionId: 'zwift-session.sessionId',
  athleteId: 'zwift-session.athleteId',
  profile: 'zwift-session.profile',
  xp: 'zwift-session.xp',
  level: 'zwift-session.level',
  lastSynced: 'zwift-session.lastSynced',
};

export function useZwiftAuth() {
  const [state, setState] = useState({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    sessionId: null,
    athleteId: null,
    profile: null,
    xp: null,
    level: null,
    lastSynced: null,
  });

  // Restore session from storage on mount
  useEffect(() => {
    const sessionId = localStorage.getItem(STORAGE_KEYS.sessionId);
    if (sessionId) {
      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        sessionId,
        athleteId: localStorage.getItem(STORAGE_KEYS.athleteId),
        profile: JSON.parse(localStorage.getItem(STORAGE_KEYS.profile) || 'null'),
        xp: parseInt(localStorage.getItem(STORAGE_KEYS.xp) || '0', 10),
        level: parseInt(localStorage.getItem(STORAGE_KEYS.level) || '0', 10),
        lastSynced: localStorage.getItem(STORAGE_KEYS.lastSynced),
      }));
    }
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await loginToZwift(email, password);

      // Store session data
      localStorage.setItem(STORAGE_KEYS.sessionId, result.sessionId);
      localStorage.setItem(STORAGE_KEYS.athleteId, result.athleteId);
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(result.profile));
      localStorage.setItem(STORAGE_KEYS.xp, result.xp);
      localStorage.setItem(STORAGE_KEYS.level, result.level);
      localStorage.setItem(STORAGE_KEYS.lastSynced, new Date().toISOString());

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        sessionId: result.sessionId,
        athleteId: result.athleteId,
        profile: result.profile,
        xp: result.xp,
        level: result.level,
        lastSynced: new Date().toISOString(),
      }));

      return result;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, []);

  const handleSync = useCallback(async () => {
    if (!state.sessionId) {
      setState((prev) => ({
        ...prev,
        error: 'Not authenticated',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await syncXP(state.sessionId);

      const now = new Date().toISOString();

      // Update stored data
      localStorage.setItem(STORAGE_KEYS.xp, result.xp);
      localStorage.setItem(STORAGE_KEYS.level, result.level);
      localStorage.setItem(STORAGE_KEYS.lastSynced, now);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        xp: result.xp,
        level: result.level,
        lastSynced: now,
      }));

      return result;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, [state.sessionId]);

  const handleLogout = useCallback(async () => {
    if (state.sessionId) {
      try {
        await logoutZwift(state.sessionId);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear all data
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });

    setState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionId: null,
      athleteId: null,
      profile: null,
      xp: null,
      level: null,
      lastSynced: null,
    });
  }, [state.sessionId]);

  return {
    ...state,
    login: handleLogin,
    sync: handleSync,
    logout: handleLogout,
  };
}
