/**
 * ZwiftLogin Component
 * Login UI for Zwift credentials
 */

import React, { useState } from 'react';
import { LogIn, LogOut, AlertCircle } from 'lucide-react';

export function ZwiftLogin({
  isAuthenticated,
  profile,
  isLoading,
  error,
  onLogin,
  onSync,
  onLogout,
  lastSynced,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Email and password are required');
      return;
    }

    try {
      await onLogin(email, password);
      setEmail('');
      setPassword('');
    } catch (err) {
      setLocalError(err.message || 'Login failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <LogIn className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-blue-900">Connect to Zwift</h2>
        </div>

        <p className="text-blue-800 mb-6 text-sm">
          Login with your Zwift account to automatically sync your XP
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {(error || localError) && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error || localError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login with Zwift'}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-600 text-center">
          Your credentials are sent to the server and never stored on your device
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-green-900">Connected to Zwift</h2>
          {profile && (
            <p className="text-green-700 text-sm">
              {profile.firstName} {profile.lastName}
            </p>
          )}
        </div>
        <button
          onClick={onLogout}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <button
        onClick={onSync}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg mb-4 transition-colors"
      >
        {isLoading ? 'Syncing...' : 'Sync XP from Zwift'}
      </button>

      {lastSynced && (
        <p className="text-sm text-green-700 text-center mb-2">
          Last synced: {new Date(lastSynced).toLocaleString()}
        </p>
      )}

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
