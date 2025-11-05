import { Resend } from 'resend';
import { Booking } from './types';
import { formatCurrency } from './cashfreeIntegration';
import { getEventConfig } from './eventConfig';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const EMAIL_CONFIG = {
  from: 'Slanup Events <tickets@mail.slanup.com>', // Clean subdomain separation
  replyTo: 'support@slanup.com' // Business email for replies
};

export async function sendTicketEmail(booking: Booking): Promise<boolean> {
  try {
    // Check if email already sent (passed in booking object from database)
    if (booking.emailSent === true) {
      console.log(`⏭️ Email already sent for booking ${booking.id}, skipping duplicate`);
      return true; // Return true since email was already sent successfully
    }

    console.log(`📧 Sending ticket email to ${booking.customerEmail} for booking ${booking.id}`);

    // Get event config from booking eventName
    const eventName = booking.eventName.toLowerCase().includes('diwali') ? 'diwali' : 
                      booking.eventName.toLowerCase().includes('luau') ? 'luau' : 'diwali';
    const eventConfig = getEventConfig(eventName) || getEventConfig('diwali'); // Fallback to diwali
    
    const emailHtml = await generateTicketEmailHTML(booking, eventConfig);
    
    const { error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [booking.customerEmail],
      replyTo: EMAIL_CONFIG.replyTo,
      subject: `Your ${eventConfig.name.replace("Slanup's ", "").split(" -")[0]} Ticket - ${booking.referenceNumber}`,
      html: emailHtml,
      headers: {
        'X-Entity-Ref-ID': booking.referenceNumber,
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal'
      },
      tags: [
        {
          name: 'category',
          value: 'ticket-confirmation'
        },
        {
          name: 'event',
          value: `${eventConfig.id}-party-2025`
        }
      ]
    });

    if (error) {
      console.error('❌ Error sending ticket email:', error);
      return false;
    }

    console.log('✅ Ticket email sent successfully:', data?.id);
    console.log('✅ Email will be marked as sent by caller');
    
    return true;
  } catch (error) {
    console.error('❌ Error in sendTicketEmail:', error);
    return false;
  }
}

async function generateTicketEmailHTML(booking: Booking, eventConfig: { id: string; name: string; referencePrefix: string; theme: { emoji: string } }): Promise<string> {
  const eventDate = new Date(booking.eventDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Using external QR service for better email client compatibility
  const qrPrefix = `SLANUP-${eventConfig.referencePrefix.toUpperCase()}-`;
  console.log('📱 Using external QR service for:', `${qrPrefix}${booking.referenceNumber}-${booking.customerName}`);
  console.log('✅ QR will be loaded from external service - works in all email clients');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Your Diwali Party Ticket</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset and base styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      margin: 0 !important; 
      padding: 0 !important;
      background-color: #f4f4f4;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    /* Container styles */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    /* Header */
    .header {
      background: linear-gradient(135deg, #636B50, #7a8960);
      padding: 30px 20px;
      text-align: center;
      color: #ffffff;
    }
    .header-title {
      font-size: 28px;
      font-weight: bold;
      margin: 0 0 10px 0;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    }
    .header-subtitle {
      font-size: 16px;
      margin: 0;
      opacity: 0.95;
    }
    
    /* Content */
    .content {
      padding: 30px 20px;
    }
    
    /* Ticket */
    .ticket {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border: 3px dashed #636B50;
      border-radius: 20px;
      padding: 30px 20px;
      margin: 20px 0;
      text-align: center;
      position: relative;
    }
    .ticket::before, .ticket::after {
      content: '';
      position: absolute;
      width: 24px;
      height: 24px;
      background-color: #ffffff;
      border-radius: 50%;
      top: 50%;
      transform: translateY(-50%);
      box-shadow: 0 0 0 3px #f4f4f4;
    }
    .ticket::before { left: -12px; }
    .ticket::after { right: -12px; }
    
    .qr-code {
      width: 150px;
      height: 150px;
      margin: 0 auto 20px;
      border-radius: 15px;
      overflow: hidden;
      background: white;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .qr-code img {
      width: 100%;
      height: 100%;
      display: block;
    }
    
    .reference-number {
      font-size: 24px;
      font-weight: bold;
      color: #636B50;
      margin: 15px 0;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
      padding: 10px;
      background: rgba(99, 107, 80, 0.1);
      border-radius: 8px;
      display: inline-block;
    }
    
    /* Info sections */
    .info-section {
      background: #f8f9fa;
      border-radius: 15px;
      padding: 20px;
      margin: 20px 0;
    }
    .info-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin: 0 0 15px 0;
      display: flex;
      align-items: center;
    }
    .info-title span {
      margin-right: 10px;
    }
    
    .detail-table {
      width: 100%;
      border-collapse: collapse;
    }
    .detail-row {
      border-bottom: 1px solid #e9ecef;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-row td {
      padding: 12px 0;
      vertical-align: top;
    }
    .detail-label {
      font-weight: 600;
      color: #6c757d;
      width: 40%;
    }
    .detail-value {
      color: #333;
      font-weight: 500;
    }
    
    /* Important info */
    .important-info {
      background: linear-gradient(135deg, #fff3cd, #ffeeba);
      border: 2px solid #ffc107;
      border-radius: 15px;
      padding: 20px;
      margin: 25px 0;
    }
    .important-info h3 {
      color: #856404;
      margin: 0 0 15px 0;
      font-size: 18px;
    }
    .important-info ul {
      margin: 0;
      padding-left: 20px;
      color: #856404;
    }
    .important-info li {
      margin: 8px 0;
      line-height: 1.5;
    }
    
    /* Footer */
    .footer {
      background: #f8f9fa;
      padding: 25px 20px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      margin: 5px 0;
      color: #6c757d;
      font-size: 14px;
    }
    .footer .party-text {
      color: #636B50;
      font-weight: bold;
      font-size: 16px;
    }
    
    /* Mobile responsive */
    @media screen and (max-width: 600px) {
      .email-container {
        margin: 10px !important;
        border-radius: 15px !important;
      }
      .header {
        padding: 25px 15px !important;
      }
      .header-title {
        font-size: 24px !important;
      }
      .content {
        padding: 20px 15px !important;
      }
      .ticket {
        padding: 20px 15px !important;
        margin: 15px 0 !important;
      }
      .qr-code {
        width: 120px !important;
        height: 120px !important;
      }
      .reference-number {
        font-size: 20px !important;
        letter-spacing: 0.5px !important;
      }
      .info-section {
        padding: 15px !important;
      }
      .detail-row td {
        padding: 8px 0 !important;
        font-size: 14px !important;
      }
      .detail-label {
        width: 45% !important;
      }
      .important-info {
        padding: 15px !important;
      }
      .important-info li {
        font-size: 14px !important;
      }
    }
    
    @media screen and (max-width: 480px) {
      .detail-table {
        font-size: 13px !important;
      }
      .detail-row td {
        display: block !important;
        width: 100% !important;
        padding: 5px 0 !important;
      }
      .detail-label {
        font-weight: bold !important;
        color: #636B50 !important;
        width: 100% !important;
      }
      .detail-value {
        padding-left: 0 !important;
        margin-bottom: 10px !important;
      }
    }
  </style>
</head>
<body>
  <div style="background-color: #f4f4f4; padding: 20px 0;">
    <div class="email-container">
      
      <!-- Header -->
      <div class="header">
        <h1 class="header-title">You're Officially In!</h1>
        <p class="header-subtitle">Get ready for an amazing ${eventConfig.name.replace("Slanup's ", "").split(" -")[0]} experience!</p>
      </div>
      
      <!-- Content -->
      <div class="content">
        
        <!-- Ticket Section -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #636B50; font-size: 22px; margin: 0 0 20px 0;">🎫 YOUR GOLDEN TICKET 🎫</h2>
        </div>
        
        <div class="ticket">
          <div class="qr-code">
            <!-- External QR service - works in ALL email clients -->
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrPrefix}${booking.referenceNumber}-${encodeURIComponent(booking.customerName)}&color=636B50&bgcolor=FFFFFF&margin=5" 
                 alt="Entry QR Code - ${booking.referenceNumber}" 
                 style="width: 100%; height: 100%; display: block; border-radius: 10px;" 
                 title="Scan this QR code at the event entrance" />
          </div>
          <div class="reference-number">${booking.referenceNumber}</div>
          <p style="margin: 15px 0 0 0; color: #636B50; font-weight: bold;">Show this at entrance for VIP treatment!</p>
        </div>
        
        <!-- Event Details -->
        <div class="info-section">
          <h3 class="info-title"><span>🎉</span>Event Details</h3>
          <table class="detail-table">
            <tr class="detail-row">
              <td class="detail-label">Event:</td>
              <td class="detail-value">${booking.eventName}</td>
            </tr>
            <tr class="detail-row">
              <td class="detail-label">Date:</td>
              <td class="detail-value">${eventDate}</td>
            </tr>
            <tr class="detail-row">
              <td class="detail-label">Ticket Type:</td>
              <td class="detail-value">Ultimate Party Experience</td>
            </tr>
            <tr class="detail-row">
              <td class="detail-label">Amount Paid:</td>
              <td class="detail-value" style="color: #636B50; font-weight: bold;">${formatCurrency(booking.totalAmount)}</td>
            </tr>
            <tr class="detail-row">
              <td class="detail-label">Status:</td>
              <td class="detail-value" style="color: #28a745; font-weight: bold;">✅ Confirmed</td>
            </tr>
          </table>
        </div>
        
        <!-- Customer Details -->
        <div class="info-section">
          <h3 class="info-title"><span>👤</span>Your Details</h3>
          <table class="detail-table">
            <tr class="detail-row">
              <td class="detail-label">Name:</td>
              <td class="detail-value">${booking.customerName}</td>
            </tr>
            <tr class="detail-row">
              <td class="detail-label">Email:</td>
              <td class="detail-value">${booking.customerEmail}</td>
            </tr>
            <tr class="detail-row">
              <td class="detail-label">Phone:</td>
              <td class="detail-value">${booking.customerPhone}</td>
            </tr>
          </table>
        </div>
        
        <!-- Important Information -->
        <div class="important-info">
          <h3>${eventConfig.id === 'luau' ? '🥥' : '🎉'} Party Essentials - Important Information</h3>
          <ul>
            ${eventConfig.id === 'luau' ? `
            <li><strong>Save this reference number</strong> - it's your GOLDEN TICKET!</li>
            <li><strong>Show this reference</strong> at entrance for VIP treatment</li>
            <li><strong>Bring valid photo ID</strong> + your party energy 🌊</li>
            <li><strong>Get your best tropical fits out</strong> for the event 🍾</li>
            <li><strong>Prepare for a night</strong> you're gonna smile while dreaming of</li>
            <li><strong>Please schedule your return cab</strong> 1 hour prior</li>
            <li><strong>Drink safely</strong>, because playing with the rules and games is gonna get you a lot wasted, so be careful</li>
            ` : `
            <li><strong>Bring Valid Photo ID</strong> and your party energy</li>
            <li><strong>Show this email</strong> or QR code at entrance</li>
            <li><strong>BYOB</strong> - Bring your own booze</li>
            <li><strong>All mixers and sides provided</strong> by us</li>
            <li><strong>Unlimited food and beverages</strong> included</li>
            <li><strong>Games and DJ</strong> all night long</li>
            <li><strong>Photo setups</strong> available</li>
            `}
          </ul>
        </div>
        
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p class="party-text">🎉 See you at the party!</p>
        <p>Need help? Reply to this email or contact us</p>
        <p>© 2025 Slanup. All rights reserved.</p>
      </div>
      
    </div>
  </div>
</body>
</html>
  `;
}

// Send confirmation email for failed payments
export async function sendPaymentFailedEmail(booking: Booking): Promise<boolean> {
  try {
    console.log(`📧 Sending payment failed email to ${booking.customerEmail}`);

    const { error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [booking.customerEmail],
      replyTo: EMAIL_CONFIG.replyTo,
      subject: `❌ Payment Failed - ${booking.referenceNumber} | Try Again?`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Payment Failed for ${booking.eventName}</h2>
          <p>Hi ${booking.customerName},</p>
          <p>Unfortunately, your payment for the ${booking.eventName} ticket could not be processed.</p>
          <p><strong>Reference:</strong> ${booking.referenceNumber}</p>
          <p><strong>Amount:</strong> ${formatCurrency(booking.totalAmount)}</p>
          <p>Don't worry! Your invite code <strong>${booking.inviteCode}</strong> will be available again in 10 minutes. You can try booking again.</p>
          <p>If you need help, please reply to this email.</p>
          <br>
          <p>Thanks,<br>Slanup Team</p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Error sending payment failed email:', error);
      return false;
    }

    console.log('✅ Payment failed email sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in sendPaymentFailedEmail:', error);
    return false;
  }
}