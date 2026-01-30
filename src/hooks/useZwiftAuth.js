/**
 * useZwiftAuth Hook
 * Manages Zwift authentication state and API interactions
 */

import { useState, useEffect, useCallback } from 'react';
import { loginToZwift, syncXP, logoutZwift } from '../services/zwiftBackend';

const STORAGE_KEYS = {
  credentials: 'zwift-session.credentials',
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
    credentials: null,
    athleteId: null,
    profile: null,
    xp: null,
    level: null,
    lastSynced: null,
  });

  // Restore session from storage on mount
  useEffect(() => {
    const storedCredentials = localStorage.getItem(STORAGE_KEYS.credentials);
    if (storedCredentials) {
      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        credentials: JSON.parse(storedCredentials),
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

      // Store credentials and user data
      const credentials = { email, password };
      localStorage.setItem(STORAGE_KEYS.credentials, JSON.stringify(credentials));
      localStorage.setItem(STORAGE_KEYS.athleteId, result.athleteId);
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(result.profile));
      localStorage.setItem(STORAGE_KEYS.xp, String(result.xp || 0));
      localStorage.setItem(STORAGE_KEYS.level, String(result.level || 0));
      localStorage.setItem(STORAGE_KEYS.lastSynced, new Date().toISOString());

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        credentials,
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
    if (!state.credentials) {
      setState((prev) => ({
        ...prev,
        error: 'Not authenticated',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await syncXP(state.credentials.email, state.credentials.password);

      const now = new Date().toISOString();

      // Update stored data
      localStorage.setItem(STORAGE_KEYS.xp, String(result.xp || 0));
      localStorage.setItem(STORAGE_KEYS.level, String(result.level || 0));
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
  }, [state.credentials]);

  const handleLogout = useCallback(async () => {
    if (state.credentials) {
      try {
        await logoutZwift();
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
      credentials: null,
      athleteId: null,
      profile: null,
      xp: null,
      level: null,
      lastSynced: null,
    });
  }, [state.credentials]);

  return {
    ...state,
    login: handleLogin,
    sync: handleSync,
    logout: handleLogout,
  };
}
