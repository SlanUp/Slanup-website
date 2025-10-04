const fs = require('fs');
const path = require('path');

// Simple ICO file creator from PNG
// This creates a basic ICO with PNG data embedded
function createIcoFromPng(pngPath, icoPath) {
  const pngData = fs.readFileSync(pngPath);
  const pngSize = pngData.length;
  
  // ICO header (6 bytes)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: 1 = ICO
  header.writeUInt16LE(1, 4); // Number of images
  
  // Image directory entry (16 bytes)
  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(32, 0);   // Width (32 pixels)
  dirEntry.writeUInt8(32, 1);   // Height (32 pixels)
  dirEntry.writeUInt8(0, 2);   // Color palette
  dirEntry.writeUInt8(0, 3);   // Reserved
  dirEntry.writeUInt16LE(1, 4); // Color planes
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel
  dirEntry.writeUInt32LE(pngSize, 8); // Image data size
  dirEntry.writeUInt32LE(22, 12); // Offset to image data (6 + 16)
  
  // Combine all parts
  const icoData = Buffer.concat([header, dirEntry, pngData]);
  fs.writeFileSync(icoPath, icoData);
  console.log(`✓ Created ${icoPath}`);
}

// Create favicon.ico from the 32x32 PNG
const faviconPng = path.join(__dirname, '..', 'app', 'favicon-32.png');
const faviconIco = path.join(__dirname, '..', 'app', 'favicon.ico');

if (fs.existsSync(faviconPng)) {
  createIcoFromPng(faviconPng, faviconIco);
} else {
  console.error('Error: favicon-32.png not found');
  process.exit(1);
}
