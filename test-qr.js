const QRCode = require('qrcode');

async function testQR() {
  console.log('🧪 Testing QR Code generation...\n');
  
  try {
    const testData = 'SLANUP-DIWALI-TEST123-Siddhi';
    console.log('QR Data:', testData);
    
    const qrDataURL = await QRCode.toDataURL(testData, {
      width: 200,
      margin: 1,
      color: {
        dark: '#636B50',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    console.log('✅ QR Code generated successfully!');
    console.log('Data URL length:', qrDataURL.length);
    console.log('Starts with:', qrDataURL.substring(0, 50) + '...');
    
    if (qrDataURL.startsWith('data:image/png;base64,')) {
      console.log('✅ Correct format: data:image/png;base64');
    } else {
      console.log('❌ Incorrect format');
    }
    
  } catch (error) {
    console.error('❌ QR Code generation failed:', error);
  }
}

testQR();