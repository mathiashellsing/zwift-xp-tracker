# Netlify Deployment Guide for Zwift XP Tracker

## Quick Setup Steps (5 minutes)

### 1. Connect Your Repository to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Select GitHub
4. Authorize Netlify to access your GitHub account
5. Find and select your `zwift-xp-tracker` repository
6. Click "Deploy site"

### 2. Configure Build Settings (Netlify UI)

When Netlify asks for build settings, use these values:

**Build command:**
```
npm run build
```

**Publish directory:**
```
build
```

**Functions directory:**
```
netlify/functions
```

> **Note:** Netlify should auto-detect these from `netlify.toml`, but verify they're correct in the deploy settings.

### 3. Commit and Push Your Code

Before Netlify can deploy, commit the new files:

```bash
cd /Users/mhellsin/github/zwift-xp-tracker

# Add all new files (netlify functions, config, etc.)
git add -A

# Commit
git commit -m "Add Netlify Functions backend and configuration"

# Push to GitHub
git push origin main
```

Netlify will automatically detect the push and start deploying!

---

## What Gets Deployed

### Frontend (React App)
- **Source:** Everything in `src/` folder
- **Output:** Built to `build/` folder
- **Hosted at:** `https://your-project.netlify.app`

### Backend (Netlify Functions)
- **Source:** Everything in `netlify/functions/` folder
- **Functions available at:** `https://your-project.netlify.app/.netlify/functions/*`

### Redirects
- **API calls** to `/api/*` → automatically route to Netlify Functions
- **SPA routing** → all routes serve `index.html` (React Router support)

---

## Configuration File (netlify.toml)

The `netlify.toml` file in your project root handles all Netlify settings:

```toml
[build]
  command = "npm run build"          # Build React app
  functions = "netlify/functions"    # Where serverless functions are
  publish = "build"                  # Where to deploy from

[[redirects]]
  from = "/api/*"                    # Catch API calls
  to = "/.netlify/functions/:splat"  # Route to functions
  status = 200

[[redirects]]
  from = "/*"                        # Catch all other routes
  to = "/index.html"                 # For React Router SPA
  status = 200
```

---

## Environment Variables Setup

### 1. In Netlify Dashboard

If you need environment variables (optional for development):

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add any needed variables

For now, you don't need any - the app works without them.

### 2. Local Development Override

Create `.env.local` in your project root (already in `.gitignore`):

```bash
# .env.local (not committed to GitHub)
REACT_APP_API_URL=http://localhost:8888/.netlify/functions
```

When you run `netlify dev`, this will automatically use localhost.

---

## Deployment Verification

After pushing to GitHub, you should see:

1. **GitHub:** Green checkmark on your commit (Actions workflow)
2. **Netlify:** 
   - Email confirmation that build started
   - Status page shows build in progress
   - Build completes with green checkmark
   - Site URL appears: `https://your-project.netlify.app`

### Check Build Logs

If something fails:
1. Go to your Netlify site dashboard
2. Click **Deploys**
3. Click the failed deploy
4. Scroll down to see full build logs

---

## Testing the Live Site

Once deployed:

### Test Frontend
```bash
# Visit in browser
https://your-project.netlify.app/zwift-xp-tracker
```

You should see the Zwift login screen.

### Test Backend Functions

**Health Check:**
```bash
curl https://your-project.netlify.app/.netlify/functions/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-30T..."
}
```

**Test Login** (with real Zwift credentials):
```bash
curl -X POST https://your-project.netlify.app/.netlify/functions/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

---

## Troubleshooting

### Build Failed

Check the build logs in Netlify Dashboard:

**Common issues:**
- Missing `npm run build` command → Check `package.json` has build script
- Node version mismatch → Netlify uses Node 18 by default (OK for us)
- Dependencies not installed → `package.json` or `package-lock.json` corrupted

**Fix:**
1. Check logs for the exact error
2. Try building locally: `npm run build`
3. If local build fails, fix it first before pushing

### Functions not working (404 errors)

**Checklist:**
- ✅ Netlify Functions in `netlify/functions/` folder?
- ✅ `netlify.toml` has `functions = "netlify/functions"`?
- ✅ Function files have `.js` extension?
- ✅ Functions export a `handler` function?

### API calls returning CORS errors

Netlify should handle CORS automatically for `/.netlify/functions/*` routes. If you see CORS errors:

1. Clear browser cache (Cmd+Shift+R)
2. Check browser console for exact error
3. Verify your frontend is calling the correct URL

---

## Next Steps After Deployment

### 1. Test the Full Flow

1. Open `https://your-project.netlify.app/zwift-xp-tracker`
2. Login with your Zwift credentials
3. Click "Sync XP from Zwift"
4. Verify XP updates from Zwift

### 2. Monitor Performance

In Netlify Dashboard:
- **Functions** → See function invocations and performance
- **Analytics** → View visitor stats
- **Deploys** → See deployment history

### 3. Future Improvements

For production, consider:
- **Database:** Replace in-memory sessions with MongoDB, Supabase, or Firebase
- **Rate limiting:** Add `express-rate-limit` equivalent to functions
- **Logging:** Integrate with Sentry or LogRocket for error tracking
- **Custom domain:** Add your own domain in **Domain settings**

---

## File Structure (What Gets Deployed)

```
zwift-xp-tracker/
├── netlify/
│   └── functions/           ← Serverless backend
│       ├── login.js
│       ├── sync.js
│       ├── logout.js
│       ├── health.js
│       └── utils/
│           └── sessionStore.js
├── src/
│   ├── components/          ← React components
│   ├── hooks/               ← Custom React hooks
│   ├── services/            ← API client
│   └── App.js
├── netlify.toml             ← Netlify config ← CRITICAL
├── package.json             ← Dependencies
├── .gitignore               ← Git exclusions
└── build/                   ← Built app (auto-generated)
```

---

## Branch Deployments (Optional)

Netlify can auto-deploy different git branches:

- **main branch** → Production (`https://your-project.netlify.app`)
- **develop branch** → Preview (`https://develop--your-project.netlify.app`)
- **Pull requests** → Preview deploy (reviews before merging)

To set up branch deploys in Netlify Dashboard:
1. **Site settings** → **Build & deploy** → **Deploy contexts**
2. Configure branches as needed

---

## Support

If you have issues:

1. **Check Netlify logs:** Site Dashboard → Deploys → Failed deploy
2. **Check local build:** Run `npm run build` locally
3. **Check function logs:** Each function gets serverless logs
4. **Netlify docs:** https://docs.netlify.com/
5. **GitHub issues:** https://github.com/mathiashellsing/zwift-xp-tracker/issues

---

**You're all set!** Push your code and Netlify will automatically deploy everything.
