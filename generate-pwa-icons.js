#!/usr/bin/env node

/**
 * PWA Icon Generator
 * Creates 4 PNG icons for PWA manifest:
 * - icon-192.png (192x192)
 * - icon-512.png (512x512)
 * - icon-192-maskable.png (192x192, maskable format)
 * - icon-512-maskable.png (512x512, maskable format)
 */

const fs = require('fs');
const path = require('path');

// Try to use the canvas library if available, otherwise create simple SVG-based icons
let Canvas;
try {
  Canvas = require('canvas').Canvas;
} catch (e) {
  console.log('canvas library not found, will use SVG approach');
}

const publicDir = path.join(__dirname, 'public');

/**
 * Create icon using SVG + convert approach
 * This creates SVG files that can be viewed/converted
 */
function createIconSVG(size, isMaskable = false) {
  const padding = isMaskable ? size * 0.1 : size * 0.05;
  const contentSize = size - 2 * padding;
  
  // Colors
  const bgColor = '#ff6b35'; // Zwift Orange
  const textColor = '#ffffff'; // White
  
  // SVG markup
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  ${isMaskable ? '' : `<rect width="${size}" height="${size}" fill="${bgColor}"/>`}
  ${isMaskable ? `<circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${bgColor}"/>` : ''}
  <text 
    x="${size/2}" 
    y="${size/2 + contentSize * 0.15}" 
    font-family="Arial, sans-serif" 
    font-size="${contentSize * 0.6}" 
    font-weight="bold" 
    fill="${textColor}" 
    text-anchor="middle" 
    dominant-baseline="middle">XP</text>
</svg>`;

  return svg;
}

/**
 * Create icon using HTML5 Canvas (requires cairo)
 */
function createIconWithCanvas(size, isMaskable = false) {
  if (!Canvas) {
    console.log('Canvas not available, using SVG fallback');
    return null;
  }

  const canvas = new Canvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  if (isMaskable) {
    // Circular background for maskable
    ctx.fillStyle = '#ff6b35';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Square background
    ctx.fillStyle = '#ff6b35';
    ctx.fillRect(0, 0, size, size);
  }

  // Text "XP"
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.floor(size * 0.5)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('XP', size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

/**
 * Create icon using ImageMagick command line (most reliable)
 */
function createIconWithImageMagick(size, isMaskable = false) {
  const { execSync } = require('child_process');
  const filename = isMaskable ? `icon-${size}-maskable.png` : `icon-${size}.png`;
  const filepath = path.join(publicDir, filename);

  try {
    // Check if ImageMagick is available
    execSync('convert -version', { stdio: 'ignore' });

    // Create icon with convert command
    const bgColor = '#ff6b35';
    const textColor = '#ffffff';

    let cmd;
    if (isMaskable) {
      // Maskable version - circular
      cmd = `convert -size ${size}x${size} \\
        -background "${bgColor}" \\
        -gravity center \\
        -pointsize ${Math.floor(size * 0.4)} \\
        -fill "${textColor}" \\
        -font Arial-Bold \\
        label:XP \\
        -compose DstIn \\
        -composite \\
        -define png:color-type=6 \\
        "${filepath}"`;
    } else {
      // Regular square version
      cmd = `convert -size ${size}x${size} \\
        xc:"${bgColor}" \\
        -pointsize ${Math.floor(size * 0.4)} \\
        -fill "${textColor}" \\
        -font Arial-Bold \\
        -gravity center \\
        -annotate +0+0 "XP" \\
        -define png:color-type=6 \\
        "${filepath}"`;
    }

    execSync(cmd, { shell: '/bin/bash' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Create icon as PNG using Node.js native Canvas (if available)
 * Fallback: Create SVG representation
 */
async function generateIcons() {
  console.log('🎨 Generating PWA Icons...\n');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sizes = [192, 512];
  const variants = [
    { size: 192, maskable: false },
    { size: 512, maskable: false },
    { size: 192, maskable: true },
    { size: 512, maskable: true }
  ];

  let successCount = 0;

  for (const { size, maskable } of variants) {
    const filename = maskable ? `icon-${size}-maskable.png` : `icon-${size}.png`;
    const filepath = path.join(publicDir, filename);

    try {
      // Try ImageMagick first (most reliable)
      if (createIconWithImageMagick(size, maskable)) {
        console.log(`✅ Created ${filename} using ImageMagick`);
        successCount++;
        continue;
      }

      // Try Canvas
      const pngBuffer = createIconWithCanvas(size, maskable);
      if (pngBuffer) {
        fs.writeFileSync(filepath, pngBuffer);
        console.log(`✅ Created ${filename} using Canvas`);
        successCount++;
        continue;
      }

      // Fallback: Create SVG representation
      const svg = createIconSVG(size, maskable);
      const svgPath = filepath.replace('.png', '.svg');
      fs.writeFileSync(svgPath, svg);
      console.log(`⚠️  Created ${filename.replace('.png', '.svg')} (SVG fallback)`);
      console.log(`   Note: Convert SVG to PNG using: convert ${svgPath} ${filepath}`);

    } catch (error) {
      console.error(`❌ Failed to create ${filename}:`, error.message);
    }
  }

  console.log(`\n📊 Results: ${successCount}/${variants.length} icons created`);

  if (successCount === variants.length) {
    console.log('\n✨ All PWA icons created successfully!');
    console.log('   Icons are ready in:', publicDir);
    return true;
  } else if (successCount === 0) {
    console.log('\n⚠️  No icons created. Options:');
    console.log('   1. Install ImageMagick: brew install imagemagick');
    console.log('   2. Install canvas: npm install canvas');
    console.log('   3. Use online tool: https://pwabuilder.com');
    console.log('\n   For now, SVG files have been created as reference.');
    return false;
  }

  return successCount > 0;
}

// Run the generator
generateIcons().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
