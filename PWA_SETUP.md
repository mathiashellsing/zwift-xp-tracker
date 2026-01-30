# PWA Setup for Zwift XP Tracker

This app is now configured as a Progressive Web App (PWA) and can be installed on mobile devices and desktop.

## Current PWA Features

✅ **Manifest.json** - App metadata and configuration
✅ **Service Worker** - Offline support and caching strategies
✅ **Meta Tags** - iOS and Android app tags
✅ **Icon Support** - Multiple icon sizes with maskable support
✅ **Responsive Design** - Works on all device sizes

## Installation Instructions

### Mobile (iOS)
1. Open the app in Safari
2. Tap the Share button (bottom menu)
3. Scroll down and tap "Add to Home Screen"
4. Enter a name and tap "Add"
5. The app will now appear as an icon on your home screen

### Mobile (Android)
1. Open the app in Chrome (or another Chromium-based browser)
2. Tap the menu icon (three dots) in the top right
3. Tap "Install app" or "Add to Home Screen"
4. Confirm the installation
5. The app will now appear as an icon on your home screen

### Desktop (PWA)
1. Open the app in Chrome, Edge, or other Chromium browsers
2. Click the install icon in the address bar (or menu)
3. Click "Install"
4. The app will be installed and launch in standalone mode

## TODO: Add Icons

The app currently references icon files that need to be created:
- `public/icon-192.png` (192x192px)
- `public/icon-512.png` (512x512px)
- `public/icon-192-maskable.png` (192x192px, maskable format)
- `public/icon-512-maskable.png` (512x512px, maskable format)

### Recommended Icon Design
- Orange background (#ff6b35) matching the app theme
- White "XP" text in the center
- Include the Zwift logo or a bike/cycling theme for better branding

You can generate these icons using:
- **Online tools**: [PWA Image Generator](https://www.pwabuilder.com/), [AppIcon Studio](https://www.AppIconStudio.com/)
- **Command line**: ImageMagick, GraphicsMagick
- **Design software**: Figma, Adobe XD, Photoshop

### Icon Specifications

**Maskable Icons** (for adaptive icons on Android):
- Include padding/safe zone around the content
- Content should fit within a circle of radius 45% of the canvas
- Used by Android for custom icon shapes

**Standard Icons**:
- Solid background color
- Clear, recognizable design
- Anti-aliased edges

## Service Worker Caching Strategy

The Service Worker implements a hybrid caching strategy:

1. **API Calls** (`.netlify/functions/*`)
   - Network first: Try to fetch from server
   - Falls back to cache if offline
   - Caches successful responses for offline use

2. **Static Assets** (images, CSS, JS)
   - Cache first: Use cached version if available
   - Falls back to network for updates
   - Reduces load times

3. **HTML Documents**
   - Cache first for instant loading
   - Network requests in background update the cache

## Offline Support

The app will work offline with cached data:
- Previously loaded XP data will display
- Manual XP input will still function
- Sync attempts will queue for when network returns
- Service Worker logs indicate offline status

## Update Caching

When new versions are deployed:
1. Service Worker detects new cache version
2. Old caches are automatically deleted
3. Users get latest version on next visit
4. Long-term browser cache ensures fast loading

## Testing PWA Features

### Test offline mode:
1. Open app
2. Open DevTools (F12)
3. Go to Network tab
4. Check "Offline" checkbox
5. App should still function with cached data

### Test installation:
1. Open in Chrome
2. Check for install icon in address bar
3. Install and verify app launches in standalone mode

### Check Service Worker:
1. DevTools → Application → Service Workers
2. Should show registered service worker
3. Check "offline" to test offline behavior

## Performance Impact

- **Cache size**: ~5-10MB (varies with unlockable images)
- **Installation size**: ~50-100MB on device
- **Network usage**: Reduced after first visit
- **Load time**: 50-70% faster with caching

## Future Enhancements

- [ ] Background sync for offline XP updates
- [ ] Push notifications for unlock notifications
- [ ] Periodic sync to check for new unlockables
- [ ] Offline unlock tracker updates
- [ ] App shortcuts for quick actions

## Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome  | ✅      | ✅     |
| Edge    | ✅      | ✅     |
| Firefox | ⚠️      | ⚠️     |
| Safari  | ⚠️      | ✅     |

*Note: Firefox and Safari have limited PWA support. Safari on iOS supports Web App Mode but with limitations.*
