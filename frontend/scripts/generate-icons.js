/**
 * Script to generate logo variants for PWA and favicon
 * 
 * Usage: node scripts/generate-icons.js
 * 
 * Requires: sharp (npm install sharp)
 * 
 * Generates:
 * - favicon.ico (16x16, 32x32, 48x48)
 * - logo-192.png (192x192 for PWA)
 * - logo-512.png (512x512 for PWA)
 * - apple-touch-icon.png (180x180 for iOS)
 * - logo-og.png (1200x630 for Open Graph)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_LOGO = path.join(__dirname, '../public/El rincon de Angie3.png');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Ensure source file exists
if (!fs.existsSync(SOURCE_LOGO)) {
  console.error('❌ Source logo not found:', SOURCE_LOGO);
  process.exit(1);
}

console.log('🎨 Generating logo variants...\n');

// Generate different sizes
const sizes = [
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-48.png', size: 48 },
  { name: 'logo-192.png', size: 192 },
  { name: 'logo-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generateIcons() {
  try {
    // Generate square icons
    for (const { name, size } of sizes) {
      const outputPath = path.join(PUBLIC_DIR, name);
      
      await sharp(SOURCE_LOGO)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 27, g: 77, b: 62, alpha: 1 } // #1B4D3E
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    // Generate Open Graph image (1200x630)
    const ogPath = path.join(PUBLIC_DIR, 'logo-og.png');
    await sharp(SOURCE_LOGO)
      .resize(1200, 630, {
        fit: 'contain',
        background: { r: 27, g: 77, b: 62, alpha: 1 } // #1B4D3E
      })
      .png()
      .toFile(ogPath);
    
    console.log(`✅ Generated logo-og.png (1200x630)`);

    // Note: favicon.ico generation requires additional tools
    console.log('\n📝 Note: To generate favicon.ico, use an online tool like:');
    console.log('   https://favicon.io/favicon-converter/');
    console.log('   Upload favicon-16.png, favicon-32.png, and favicon-48.png');

    console.log('\n✨ Icon generation complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Generate favicon.ico from the PNG files');
    console.log('   2. Update manifest.json with new icon paths');
    console.log('   3. Update index.html with favicon links');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
