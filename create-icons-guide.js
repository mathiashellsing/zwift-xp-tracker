#!/usr/bin/env node
/**
 * Icon Generator Guide for Zwift XP Tracker PWA
 * 
 * This guide helps you create the required PWA icons.
 * Run: node create-icons-guide.js
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║         Zwift XP Tracker - PWA Icon Creation Guide           ║
╚══════════════════════════════════════════════════════════════╝

📋 REQUIRED ICON FILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File Name              | Size     | Purpose
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
icon-192.png           | 192x192  | Home screen, browser
icon-512.png           | 512x512  | Splash screens, stores
icon-192-maskable.png  | 192x192  | Adaptive icon (Android)
icon-512-maskable.png  | 512x512  | Adaptive icon (Android)

Save these files in: public/

🎨 DESIGN GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Color Scheme:
  • Background: #ff6b35 (Zwift Orange)
  • Text: #ffffff (White)
  • Accent: Consider bike/cycling theme

Content:
  • Large "XP" text in the center
  • OR: Zwift logo + bike icon
  • Clear, recognizable design
  • High contrast (white on orange)

Maskable Icon Special Requirements:
  • Add padding around all edges
  • Keep important content within center circle (45% radius)
  • Avoid text near edges (gets cut off in adaptive icons)
  • Example:
    - Canvas: 192x192px
    - Safe zone: 45% of 192 = 86.4px radius from center
    - Keep all content within 86px radius circle

🔧 TOOLS TO CREATE ICONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ EASIEST: PWA Builder
   URL: https://www.pwabuilder.com/
   Steps:
   1. Go to pwabuilder.com
   2. Upload your logo/design
   3. Let it generate all icon sizes
   4. Download the icons
   5. Place in public/
   
   Pros: Automatic generation, handles maskable formats
   Cons: Requires upload

🎨 DESIGN TOOL: Figma (Free)
   URL: https://figma.com/
   Steps:
   1. Create new file
   2. Set canvas to 192x192
   3. Add orange rectangle background
   4. Add white "XP" text in center
   5. Export as PNG (File → Export)
   6. Repeat for 512x512
   7. For maskable: add padding, create center-safe version
   
   Pros: Full design control, free tier
   Cons: Need design skills

🖼️ ONLINE GENERATOR: Real Favicon Generator
   URL: https://realfavicongenerator.net/
   Steps:
   1. Go to site
   2. Upload your design
   3. Configure for PWA
   4. Download zip file
   5. Extract icons to public/
   
   Pros: Complete favicon solution
   Cons: May need custom sizing

📦 BATCH TOOL: PWA Asset Generator
   URL: https://tomayac.github.io/pwa-asset-generator/
   Command-line:
     npm install -g pwa-asset-generator
     pwa-asset-generator logo.svg public/ --splash-only
   
   Pros: Batch generation
   Cons: Need Node.js installed

💻 IMAGEMAGICK (Command Line)
   Install: brew install imagemagick
   Create Orange Background:
     convert -size 192x192 xc:'#ff6b35' icon-192.png
     convert -size 512x512 xc:'#ff6b35' icon-512.png
   
   Add Text:
     convert icon-192.png -pointsize 80 -fill white \
       -gravity center -annotate +0+0 'XP' icon-192.png
   
   Pros: Full automation
   Cons: Steep learning curve

📱 RECOMMENDED APPROACH (Easiest)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Use Figma (or similar free design tool)
   - Create a simple design: orange background + white "XP"
   - Export 192x192 and 512x512
   - Total time: 5-10 minutes

2. OR use PWA Builder
   - Upload PNG or create inline
   - Auto-generates all sizes
   - Total time: 2-3 minutes

3. Place in public/:
   cp icon-*.png /path/to/public/

✅ VERIFICATION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After creating icons:
  ☐ icon-192.png exists (192x192px)
  ☐ icon-512.png exists (512x512px)
  ☐ icon-192-maskable.png exists (192x192px)
  ☐ icon-512-maskable.png exists (512x512px)
  ☐ All files are PNG format
  ☐ All files have transparent areas (if needed)
  ☐ Orange background (#ff6b35)
  ☐ White text/content
  ☐ Files placed in: public/

🧪 TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After adding icons:

1. Run app locally:
   npm start

2. Check PWA in DevTools:
   • Open Chrome DevTools (F12)
   • Go to Application tab
   • Check Manifest section
   • Should show icons with correct sizes

3. Test installation:
   • Should see install icon in address bar
   • Icon should display in install prompt
   • App should use icon on home screen

4. Test offline:
   • DevTools → Application → Service Workers
   • Check "Offline" checkbox
   • Refresh page
   • App should work without network

📚 RESOURCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• PWA Documentation: https://web.dev/progressive-web-apps/
• Maskable Icons: https://web.dev/maskable-icon/
• Manifest Reference: https://developer.mozilla.org/en-US/docs/Web/Manifest
• Service Workers: https://web.dev/service-workers/

Questions? Check PWA_SETUP.md for more details!
`);
