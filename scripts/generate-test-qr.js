#!/usr/bin/env node

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Test reference numbers
const testCodes = [
  'DIW123456ABCD',
  'DIW789012EFGH', 
  'SLANUP-DIWALI-DIW555555XXXX-TestUser',
  'G12-RIS-4' // From your complimentary tickets
];

async function generateTestQRCodes() {
  console.log('🎯 Generating test QR codes for scanning...');
  
  const outputDir = path.join(__dirname, '../public/test-qr-codes');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  for (let i = 0; i < testCodes.length; i++) {
    const code = testCodes[i];
    const filename = `qr-test-${i + 1}-${code.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    const filepath = path.join(outputDir, filename);
    
    try {
      await QRCode.toFile(filepath, code, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      console.log(`✅ Generated: ${filename} -> "${code}"`);
    } catch (error) {
      console.error(`❌ Error generating QR for ${code}:`, error);
    }
  }
  
  // Generate an HTML page to display all QR codes
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Test QR Codes - Slanup Check-in</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #000; color: #fff; }
        .qr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .qr-item { text-align: center; background: #111; padding: 20px; border-radius: 10px; }
        .qr-item img { max-width: 100%; border: 2px solid #fbbf24; border-radius: 10px; }
        .qr-code { font-family: monospace; font-size: 14px; margin-top: 10px; color: #fbbf24; }
        .instructions { background: #1f2937; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
    </style>
</head>
<body>
    <h1>🎯 Slanup QR Test Codes</h1>
    
    <div class="instructions">
        <h2>📱 How to Test:</h2>
        <ol>
            <li>Open your check-in page: <code>http://localhost:3000/checkin</code></li>
            <li>Enter auth code: <code>SLANUP2025</code></li>
            <li>Click "Scan QR Code"</li>
            <li>Point your camera at any of the QR codes below</li>
            <li>The scanner should detect and process the code automatically</li>
        </ol>
    </div>
    
    <div class="qr-grid">
${testCodes.map((code, i) => `
        <div class="qr-item">
            <h3>Test QR #${i + 1}</h3>
            <img src="qr-test-${i + 1}-${code.replace(/[^a-zA-Z0-9]/g, '_')}.png" alt="${code}">
            <div class="qr-code">${code}</div>
        </div>
`).join('')}
    </div>
    
    <div style="margin-top: 30px; text-align: center; color: #6b7280;">
        <p>💡 Tip: Hold your phone steady and ensure good lighting for best results</p>
    </div>
</body>
</html>
`;
  
  const htmlPath = path.join(outputDir, 'index.html');
  fs.writeFileSync(htmlPath, htmlContent);
  
  console.log('\n🌐 Test page created at:', htmlPath);
  console.log('📂 QR codes saved in:', outputDir);
  console.log('\n🚀 To test:');
  console.log('1. Start your dev server: npm run dev');
  console.log('2. Open: http://localhost:3000/test-qr-codes/');
  console.log('3. Use these QR codes to test your scanner!\n');
}

generateTestQRCodes().catch(console.error);