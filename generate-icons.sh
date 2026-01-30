#!/bin/bash
# PWA Icon Generator Script
# This script helps generate PWA icons using available tools

echo "=== Zwift XP Tracker - PWA Icon Generator ==="
echo ""
echo "This script helps you create the required PWA icons."
echo ""
echo "Required icon files:"
echo "  - icon-192.png (192x192px)"
echo "  - icon-512.png (512x512px)"
echo "  - icon-192-maskable.png (192x192px, maskable)"
echo "  - icon-512-maskable.png (512x512px, maskable)"
echo ""

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
    echo "✓ ImageMagick found!"
    echo ""
    echo "You can generate icons using:"
    echo "  convert -size 192x192 xc:'#ff6b35' icon-192.png"
    echo "  convert -size 512x512 xc:'#ff6b35' icon-512.png"
    echo ""
else
    echo "✗ ImageMagick not found"
    echo ""
fi

echo "Recommended tools for creating PWA icons:"
echo ""
echo "1. Online Tools (No installation needed):"
echo "   - PWA Builder: https://www.pwabuilder.com/"
echo "   - App Icon Studio: https://www.AppIconStudio.com/"
echo "   - Favicon Generator: https://realfavicongenerator.net/"
echo ""
echo "2. Design Tools:"
echo "   - Figma (Free tier available)"
echo "   - Adobe XD"
echo "   - Sketch"
echo ""
echo "3. Command Line Tools:"
echo "   - ImageMagick: brew install imagemagick"
echo "   - GraphicsMagick: brew install graphicsmagick"
echo ""
echo "Icon Design Suggestions:"
echo "  - Background color: #ff6b35 (Zwift orange)"
echo "  - Text/Icon color: White (#ffffff)"
echo "  - Include 'XP' text or bike/cycling icon"
echo "  - For maskable icons: Keep important content within 45% radius circle"
echo ""
echo "Once you have created the icons, place them in: public/"
echo ""
