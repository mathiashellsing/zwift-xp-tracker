# Zwift API Integration Setup Guide

This guide explains how to set up and use the Zwift API integration for the Zwift XP Tracker.

## Overview

The application now supports fetching your current XP directly from Zwift using OAuth 2.0 authentication. This eliminates the need to manually input your XP values.

## Prerequisites

Before you can use Zwift API integration, you'll need:

1. A Zwift account
2. A Zwift Developer API key (Client ID)
3. Your application's redirect URI configured in Zwift's developer dashboard

## Step 1: Register Your Application with Zwift

1. Visit the [Zwift Developer Portal](https://www.zwift.com/developers)
2. Sign in with your Zwift account
3. Create a new application/register your app
4. Configure the redirect URI to match your deployment:
   - **Local development**: `http://localhost:3000/zwift-xp-tracker`
   - **GitHub Pages**: `https://mathiashellsing.github.io/zwift-xp-tracker`
   - **Other**: Your application's base URL + `/zwift-xp-tracker`

5. Copy your **Client ID** from the developer portal

## Step 2: Configure Environment Variables

1. Copy `.env.local` and add your Zwift Client ID:

```bash
REACT_APP_ZWIFT_CLIENT_ID=your_client_id_here
```

Replace `your_client_id_here` with the Client ID from your Zwift Developer application.

### Important Notes

- **Never commit `.env.local`** - It contains sensitive information
- The `.env.local` file is already in `.gitignore`
- Each environment (local, GitHub Pages, etc.) may need its own Client ID with appropriate redirect URIs

## Step 3: Using the Zwift Login

Once configured:

1. The app displays a "Connect to Zwift" section at the top
2. Click "Login with Zwift" button
3. You'll be redirected to Zwift to authorize the application
4. After authorization, you'll be redirected back to the app
5. Click "Sync XP from Zwift" to fetch your current XP
6. Your XP will update automatically and be reflected in the tracker

## How It Works

### OAuth 2.0 with PKCE

The integration uses OAuth 2.0 with PKCE (Proof Key for Code Exchange) for security:

- **PKCE**: Prevents authorization code interception attacks on desktop/mobile apps
- **State Parameter**: Prevents CSRF attacks
- **Token Management**: Access tokens are stored in browser's localStorage with automatic refresh

### File Structure

New files created for Zwift integration:

```
src/
├── services/
│   ├── zwiftAuth.js       # OAuth 2.0 authentication
│   └── zwiftAPI.js        # Zwift API client
├── hooks/
│   └── useZwiftAuth.js    # React hook for auth state
└── components/
    └── ZwiftLogin.js      # Login UI component
```

### Storage

Authentication data is stored in browser localStorage:

- `zwift-auth.accessToken` - OAuth access token
- `zwift-auth.refreshToken` - OAuth refresh token
- `zwift-auth.tokenExpiry` - Token expiration timestamp
- `zwift-auth.userId` - Zwift user ID
- `zwift-auth.profileData` - User profile information

## API Endpoints

The integration uses the following Zwift API endpoints:

- `GET /api/v3/profile` - Fetch user profile
- `GET /api/v3/player/{playerId}` - Fetch player stats (XP, level, etc.)
- `GET /api/v3/player/{playerId}/achievements` - Fetch achievements/unlocked items

> **Note**: These are the standard Zwift API endpoints. If Zwift's API has changed, endpoints may need to be updated in `src/services/zwiftAPI.js`.

## Troubleshooting

### "Not authenticated" or login not working

1. Verify Client ID in `.env.local` is correct
2. Check that redirect URI is configured in Zwift Developer Portal
3. Clear browser localStorage and try again
4. Check browser console for error messages

### XP not syncing

1. Ensure you're logged in with Zwift (green "Connected to Zwift" section shows)
2. Check that Zwift API endpoints are accessible
3. Check browser console for API errors
4. Try logging out and logging back in

### Token expiration

Tokens automatically refresh when:
- They're within 5 minutes of expiration
- A new API call is made

If you see "Unauthorized" errors, try:
1. Logging out (click logout button)
2. Logging back in
3. Syncing XP again

## Manual XP Input (Fallback)

If you're not logged in with Zwift, the app still supports manual XP input:

1. Enter your XP value in the input field (only visible when not logged in)
2. Click "Update" to save your XP locally

## API Scopes

The app requests minimal scopes from Zwift:

- `profile` - Access to user profile information
- `email` - Access to user email

These scopes allow reading:
- User ID, name, email
- Current XP and player level
- Unlocked achievements

## Security Considerations

1. **No Server-Side Storage**: All tokens are stored in browser localStorage
2. **PKCE Protection**: Prevents authorization code interception
3. **CSRF Protection**: State parameter prevents CSRF attacks
4. **Token Refresh**: Automatic token refresh prevents expired token errors
5. **Logout Clears Data**: All auth data is cleared when user logs out

## Limitations

### GitHub Pages Deployment

Since GitHub Pages is a static hosting service:
- You need to use Client-Side OAuth flow (which is implemented)
- Zwift must allow your GitHub Pages domain in their CORS settings
- If you get CORS errors, Zwift may need to whitelist your domain

### Zwift API Availability

- The Zwift API availability and endpoints may change
- Some endpoints may have rate limits
- Zwift may require additional scopes or permissions in the future

## Next Steps

1. Set `REACT_APP_ZWIFT_CLIENT_ID` in `.env.local`
2. Deploy the app or run locally
3. Test the Zwift login flow
4. Verify XP syncing works

## Support

If you encounter issues:

1. Check browser console (F12 Developer Tools) for error messages
2. Verify Client ID and redirect URI configuration
3. Ensure Zwift account is active
4. Check network tab to see API request/response details

## References

- [Zwift Developer Portal](https://www.zwift.com/developers)
- [OAuth 2.0 PKCE Specification](https://tools.ietf.org/html/rfc7636)
- [Zwift Insider Community](https://zwiftinsider.com)
