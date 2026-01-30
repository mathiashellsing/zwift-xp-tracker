# Zwift XP Tracker - Backend Setup Guide

## Overview

The Zwift XP Tracker now includes a Node.js/Express backend that communicates with Zwift using the `@codingwithspike/zwift-api-wrapper` library. The backend handles authentication and XP synchronization, while the React frontend provides the user interface.

## Architecture

```
┌─────────────────────────┐
│   React Frontend        │
│   (Browser)             │
└────────────┬────────────┘
             │ HTTP Requests
             ▼
┌─────────────────────────┐
│  Express Backend        │
│  (Node.js)              │
│  Port 3001              │
└────────────┬────────────┘
             │ API Calls
             ▼
┌─────────────────────────┐
│  Zwift API              │
│  rally25rs wrapper      │
└─────────────────────────┘
```

## Prerequisites

- Node.js 16+ installed
- npm or yarn
- A Zwift account with valid username/password

## Installation

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

This will install:
- **express** - Web framework
- **cors** - Cross-Origin Resource Sharing
- **@codingwithspike/zwift-api-wrapper** - Zwift API wrapper

### 2. Configure Frontend (Optional)

If your backend is not on `http://localhost:3001`, create a `.env.local` file in the root directory:

```bash
REACT_APP_API_URL=http://your-backend-url:port/api
```

## Running the Backend

### Local Development

```bash
cd server
npm start
```

Or with hot-reload:

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

### Test the Backend

```bash
# Health check
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-30T..."
}
```

## API Endpoints

### POST /api/zwift/login

Authenticate with Zwift and get current XP.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "athleteId": 12345,
  "profile": {
    "id": 12345,
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "countryAlpha3": "USA"
  },
  "xp": 50000,
  "level": 15,
  "sessionId": "session_1234567890_abc123"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid Zwift credentials"
}
```

### POST /api/zwift/sync

Get updated XP for an authenticated session.

**Request:**
```json
{
  "sessionId": "session_1234567890_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "xp": 55000,
  "level": 16,
  "profile": {
    "id": 12345,
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid or expired session"
}
```

### POST /api/zwift/logout

Clear a session.

**Request:**
```json
{
  "sessionId": "session_1234567890_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-30T..."
}
```

## How It Works

### Session Management

1. User enters Zwift credentials in the React frontend
2. Frontend sends request to `/api/zwift/login` with email and password
3. Backend authenticates using the Zwift wrapper
4. Backend creates a session and stores the API instance
5. Frontend receives `sessionId` and caches it in localStorage
6. All future requests use the `sessionId` (not credentials)

### XP Synchronization

1. User clicks "Sync XP from Zwift"
2. Frontend sends `/api/zwift/sync` request with stored `sessionId`
3. Backend fetches fresh profile data
4. Backend returns updated XP
5. Frontend updates the display

### Security

- **No credential storage**: Passwords are never stored on the backend
- **Session-based**: Only `sessionId` is stored in browser localStorage
- **Auto cleanup**: Sessions older than 1 hour are automatically removed
- **CORS enabled**: Configured to accept requests from your frontend

## Deployment

### For GitHub Pages + Vercel/Netlify/Heroku

Since GitHub Pages is static-only, you need to deploy the backend separately.

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from server directory
cd server
vercel
```

Then update `.env.local` in the frontend:
```
REACT_APP_API_URL=https://your-project.vercel.app/api
```

#### Option 2: Heroku

```bash
# Create app
heroku create your-zwift-app

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Option 3: Self-hosted (VPS/Cloud Server)

```bash
# SSH into your server
ssh user@your-server.com

# Clone repository
git clone https://github.com/yourusername/zwift-xp-tracker.git
cd zwift-xp-tracker/server

# Install dependencies
npm install

# Start with PM2 (process manager)
npm install -g pm2
pm2 start index.js --name "zwift-xp-tracker"
pm2 startup
pm2 save
```

## Troubleshooting

### "Cannot find module '@codingwithspike/zwift-api-wrapper'"

```bash
cd server
npm install @codingwithspike/zwift-api-wrapper
```

### "EADDRINUSE: address already in use :::3001"

Another process is using port 3001. Either:
- Kill the process: `lsof -ti:3001 | xargs kill -9`
- Use a different port: `PORT=3002 npm start`

### "Invalid Zwift credentials"

- Verify your Zwift username and password
- Try logging into the Zwift app directly to confirm credentials work
- Check for any account restrictions (banned, expired password, etc.)

### Frontend can't reach backend

- Verify backend is running: `curl http://localhost:3001/api/health`
- Check `.env.local` has correct `REACT_APP_API_URL`
- Check browser console for CORS errors
- If deployed, verify backend URL in `.env.local` is correct

### Sessions expiring too quickly

Sessions last 1 hour. To adjust, edit `server/index.js`:

```javascript
// Change this line:
if (Date.now() - value.createdAt > 3600000) { // 1 hour in milliseconds
  sessions.delete(key);
}
```

## Environment Variables

### Backend

No required environment variables. Optional:

```bash
PORT=3001  # Backend port (default 3001)
```

### Frontend

```bash
REACT_APP_API_URL=http://localhost:3001/api  # Backend URL (default for local dev)
```

## File Structure

```
server/
├── package.json          # Backend dependencies
└── index.js              # Express server & API routes

src/
├── services/
│   └── zwiftBackend.js   # Backend API client
├── hooks/
│   └── useZwiftAuth.js   # Authentication hook
└── components/
    └── ZwiftLogin.js     # Login UI
```

## Performance Considerations

### Session Storage

Currently, sessions are stored in memory. For production:

```javascript
// Production: Use Redis, MongoDB, or database
const sessions = new Map(); // Current: in-memory only
```

### Rate Limiting

Add rate limiting for production:

```bash
npm install express-rate-limit
```

### Logging

Consider adding logging:

```bash
npm install morgan
```

## API Wrapper Documentation

The backend uses `@codingwithspike/zwift-api-wrapper`. For more details:

- **GitHub**: https://github.com/rally25rs/zwift-api-wrapper
- **NPM**: https://www.npmjs.com/package/@codingwithspike/zwift-api-wrapper

## Support & Issues

If you encounter issues:

1. Check backend logs: `console.log()` statements in `server/index.js`
2. Check frontend console (F12 DevTools)
3. Verify Zwift credentials work in Zwift app
4. Check API wrapper repository for known issues

## Next Steps

1. Install backend: `cd server && npm install`
2. Start backend: `npm start`
3. Verify: `curl http://localhost:3001/api/health`
4. Start frontend: `npm start` (in project root)
5. Test login flow in the app
