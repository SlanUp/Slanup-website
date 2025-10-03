// Standalone email test to debug Resend integration
require('dotenv').config({ path: '.env.local' });

async function testResend() {
  console.log('🧪 Testing Resend Email Service...\n');
  
  // Check environment variables
  console.log('📧 Environment Check:');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET ✅' : 'NOT SET ❌');
  console.log('API Key starts with "re_":', process.env.RESEND_API_KEY?.startsWith('re_') ? 'YES ✅' : 'NO ❌');
  console.log();

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment');
    return;
  }

  try {
    // Test with simple fetch to Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'test@resend.dev', // Using Resend test domain
        to: ['slannerclub@gmail.com'], // Using your Resend account email
        subject: '🎉 Slanup Email Test - Working!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #636B50;">🎉 Email Automation Test</h1>
              <p>This is a test email from your Slanup Diwali Party system!</p>
              <div style="background: #636B50; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2>✅ SUCCESS!</h2>
                <p>If you're reading this, the email automation is working perfectly!</p>
              </div>
              <p><strong>Next steps:</strong></p>
              <ul>
                <li>The system will automatically send beautiful tickets when payments are completed</li>
                <li>Failed payment notifications will also be sent</li>
                <li>All emails use Slanup branding and styling</li>
              </ul>
              <p>Ready to party! 🔥</p>
              <p><em>- Slanup Team</em></p>
            </div>
          </div>
        `
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log('Email ID:', data.id);
      console.log('Check your inbox at slannerclub@gmail.com\n');
      console.log('🎯 Next Steps:');
      console.log('1. Check your email inbox (might be in spam)');
      console.log('2. If email received, the automation is ready!');
      console.log('3. Test the full payment flow on your website');
    } else {
      console.error('❌ Failed to send email:');
      console.error('Status:', response.status);
      console.error('Error:', data);
    }
  } catch (error) {
    console.error('❌ Error testing Resend:', error.message);
  }
}

testResend();