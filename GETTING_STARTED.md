# Zwift XP Tracker - Complete Setup & Usage Guide

## Quick Start

### Prerequisites
- Node.js 16+ installed
- Your Zwift username and password

### Setup (5 minutes)

1. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Start the backend server:**
   ```bash
   npm start
   ```
   You should see: `Zwift XP Tracker backend running on port 3001`

3. **In a new terminal, start the frontend:**
   ```bash
   npm start
   ```
   The app opens at `http://localhost:3000/zwift-xp-tracker`

4. **Use the app:**
   - Click "Login with Zwift"
   - Enter your Zwift email and password
   - Click "Login with Zwift"
   - Once logged in, click "Sync XP from Zwift"
   - Your XP updates automatically!

## How It Works

### Authentication Flow

```
User enters credentials → Backend authenticates with Zwift
                         ↓
                Backend creates session
                         ↓
           Frontend receives sessionId
                         ↓
        Frontend stores sessionId in localStorage
                         ↓
    All future requests use sessionId (not credentials)
```

### Data Flow

```
React App
  ↓ (sends email/password)
  ↓
Express Backend
  ↓ (authenticates)
  ↓
Zwift API (via rally25rs wrapper)
  ↓ (returns profile + XP)
  ↓
Express Backend
  ↓ (returns XP + sessionId)
  ↓
React App (displays XP)
```

## Features

✅ **Zwift Authentication** - Login with your Zwift account
✅ **Automatic XP Syncing** - Fetch current XP from Zwift
✅ **Session Persistence** - Stay logged in across page reloads
✅ **Manual XP Input** - Still supported when not logged in
✅ **Security** - Credentials never stored, uses sessions
✅ **Error Handling** - Clear feedback for authentication issues

## File Structure

```
zwift-xp-tracker/
├── public/                      # Static files
├── src/                         # React frontend
│   ├── App.js                  # Main app component
│   ├── services/
│   │   └── zwiftBackend.js     # Backend API client
│   ├── hooks/
│   │   └── useZwiftAuth.js     # Authentication hook
│   ├── components/
│   │   └── ZwiftLogin.js       # Login UI component
│   └── imageMap.js              # Image mappings
├── server/                      # Node.js/Express backend
│   ├── package.json            # Backend dependencies
│   └── index.js                # Express server + API
├── BACKEND_SETUP.md            # Backend documentation
└── README.md                    # Original README
```

## Available Commands

### Frontend

```bash
npm start        # Start development server (port 3000)
npm build        # Create production build
npm test         # Run tests
```

### Backend

```bash
cd server
npm start        # Start backend server (port 3001)
npm run dev      # Start with hot-reload
```

## Environment Configuration

### Frontend (.env.local)

```bash
# Backend API URL (optional, defaults to localhost:3001)
REACT_APP_API_URL=http://localhost:3001/api
```

### Backend

No environment variables required. Optional:

```bash
PORT=3001  # Backend port (default 3001)
```

## API Endpoints

All endpoints are prefixed with `/api/zwift`

### POST /login
**Authenticate with Zwift**

Request:
```json
{
  "email": "your@email.com",
  "password": "password"
}
```

Response:
```json
{
  "success": true,
  "sessionId": "session_...",
  "athleteId": 12345,
  "xp": 50000,
  "level": 15,
  "profile": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### POST /sync
**Get updated XP**

Request:
```json
{
  "sessionId": "session_..."
}
```

Response:
```json
{
  "success": true,
  "xp": 55000,
  "level": 16
}
```

### POST /logout
**Clear session**

Request:
```json
{
  "sessionId": "session_..."
}
```

### GET /health
**Health check**

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-30T..."
}
```

## Troubleshooting

### "Backend not running" error

Make sure the backend server is started:
```bash
cd server
npm start
```

### "Invalid Zwift credentials"

- Check your email and password are correct
- Try logging into Zwift directly to verify credentials
- Make sure your Zwift account is not banned or suspended

### Port already in use

Backend uses port 3001. If it's in use:

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm start
```

### Browser shows loading but nothing happens

Check browser console (F12):
- Look for network errors
- Verify `REACT_APP_API_URL` is correct
- Ensure backend is running and accessible

### Session expired

Sessions last 1 hour. Log out and log back in if needed.

## Deployment

### Frontend: GitHub Pages
Already configured! Just run:
```bash
npm run deploy
```

### Backend: Vercel (Recommended)

```bash
npm install -g vercel
cd server
vercel
```

Then update `.env.local`:
```
REACT_APP_API_URL=https://your-project.vercel.app/api
```

### Backend: Heroku

```bash
heroku create your-app-name
git push heroku main
```

### Backend: Self-hosted VPS

```bash
# SSH to server
ssh user@server.com
cd /path/to/app/server

# Install & start
npm install
npm start  # Or use PM2 for production
```

## Security Notes

- **Credentials**: Sent directly to backend, never stored locally
- **Sessions**: Stored in-memory on backend, cleared after 1 hour
- **CORS**: Enabled for frontend domain
- **Password Storage**: Never persisted anywhere

For production, consider:
- Using HTTPS
- Adding rate limiting
- Using database for sessions (instead of in-memory)
- Adding request validation
- Implementing request logging

## Performance

- Sessions auto-cleanup every hour
- Frontend caches last sync time
- API calls are minimal (only when syncing)
- Small bundle size (~54KB gzipped)

## Limitations

- Backend stores sessions in-memory (will be lost on restart)
- Zwift API may rate-limit requests
- Passwords are sent in plaintext over HTTP (use HTTPS in production)
- Sessions expire after 1 hour of inactivity

## Support

### Check Logs

**Frontend**: Open browser DevTools (F12) → Console tab
**Backend**: Terminal where you ran `npm start`

### Common Issues

1. **Backend not responding**
   - Is it running? Check terminal
   - Check port 3001 is available
   - Try: `curl http://localhost:3001/api/health`

2. **Can't login to Zwift**
   - Verify email/password work in Zwift app
   - Check for account restrictions
   - Review backend logs

3. **XP not syncing**
   - Ensure you're logged in (blue login section should be hidden)
   - Check browser console for errors
   - Try logging out and back in

## Next Steps

1. ✅ Set up backend: `cd server && npm install && npm start`
2. ✅ Set up frontend: `npm install && npm start`
3. ✅ Test login with your Zwift credentials
4. ✅ Verify XP syncs correctly
5. Deploy backend to Vercel/Heroku
6. Update `.env.local` with production backend URL
7. Deploy frontend to GitHub Pages: `npm run deploy`

## Resources

- **API Wrapper**: https://github.com/rally25rs/zwift-api-wrapper
- **Zwift Community**: https://zwiftinsider.com
- **Backend Docs**: See `BACKEND_SETUP.md`

## Questions?

Review the documentation files:
- `BACKEND_SETUP.md` - Backend configuration and deployment
- `README.md` - Original project readme
- `.env.example` - Environment variable template
