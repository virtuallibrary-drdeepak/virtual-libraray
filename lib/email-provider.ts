/**
 * Email Provider Service
 * Handles sending emails via SendGrid
 * Designed to be easily swappable with other email providers
 */

import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@virtuallibrary.com';
const SENDER_NAME = process.env.SENDER_NAME || 'Virtual Library';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('⚠️  SENDGRID_API_KEY not configured. Email sending will fail.');
}

/**
 * Email Send Result Interface
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send OTP via Email
 */
export async function sendOTPViaEmail(
  email: string,
  otp: string,
  name?: string
): Promise<EmailResult> {
  try {
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const msg = {
      to: email,
      from: {
        email: SENDER_EMAIL,
        name: SENDER_NAME,
      },
      subject: `Your Virtual Library Login OTP: ${otp}`,
      text: generateOTPTextEmail(otp, name),
      html: generateOTPHTMLEmail(otp, name),
    };

    const response = await sgMail.send(msg);
    
    console.log('✅ OTP Email sent successfully to:', email);

    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
    };
  } catch (error: any) {
    console.error('❌ SendGrid Email Error:', error.response?.body || error.message);
    return {
      success: false,
      error: error.response?.body?.errors?.[0]?.message || error.message || 'Failed to send email',
    };
  }
}

/**
 * Generate plain text OTP email
 */
function generateOTPTextEmail(otp: string, name?: string): string {
  return `
Hi ${name || 'there'}!

Your One-Time Password (OTP) for Virtual Library login is:

${otp}

This code is valid for 5 minutes only.

Security Tips:
- Never share this OTP with anyone
- Virtual Library team will never ask for your OTP
- If you didn't request this, please ignore this email

Happy Learning! 📚

Best regards,
Virtual Library Team
  `.trim();
}

/**
 * Generate HTML OTP email with beautiful design
 */
function generateOTPHTMLEmail(otp: string, name?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Virtual Library OTP</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #333;
    }
    .message {
      font-size: 16px;
      color: #555;
      margin-bottom: 30px;
    }
    .otp-box {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border: 2px dashed #667eea;
      padding: 30px;
      text-align: center;
      border-radius: 10px;
      margin: 30px 0;
    }
    .otp-label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .otp-code {
      font-size: 42px;
      font-weight: bold;
      color: #667eea;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
      margin: 10px 0;
    }
    .otp-validity {
      font-size: 14px;
      color: #999;
      margin-top: 10px;
    }
    .warning-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .warning-box strong {
      color: #856404;
      display: block;
      margin-bottom: 5px;
    }
    .warning-box ul {
      margin: 10px 0 0 0;
      padding-left: 20px;
      color: #856404;
    }
    .warning-box li {
      margin: 5px 0;
    }
    .footer {
      background: #f9f9f9;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }
    .footer p {
      margin: 5px 0;
      color: #999;
      font-size: 13px;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #667eea;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .container {
        margin: 20px;
        border-radius: 8px;
      }
      .content {
        padding: 30px 20px;
      }
      .otp-code {
        font-size: 36px;
        letter-spacing: 6px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎓 Virtual Library</h1>
      <p>Your NEET PG Preparation Partner</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Hi ${name || 'there'}! 👋
      </div>
      
      <div class="message">
        Your One-Time Password (OTP) for logging into Virtual Library is:
      </div>
      
      <!-- OTP Box -->
      <div class="otp-box">
        <div class="otp-label">Your OTP Code</div>
        <div class="otp-code">${otp}</div>
        <div class="otp-validity">⏱️ Valid for 5 minutes only</div>
      </div>
      
      <!-- Security Warning -->
      <div class="warning-box">
        <strong>🔒 Security Tips:</strong>
        <ul>
          <li>Never share this OTP with anyone</li>
          <li>Virtual Library team will never ask for your OTP</li>
          <li>Use this code only on our official website/app</li>
        </ul>
      </div>
      
      <div class="message">
        If you didn't request this OTP, please ignore this email or contact our support team immediately.
      </div>
      
      <div class="message">
        Happy Learning! 📚
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Virtual Library Team</strong></p>
      <p>Empowering NEET PG aspirants across India</p>
      <p style="margin-top: 20px;">This is an automated message, please do not reply to this email.</p>
      <p style="color: #bbb; margin-top: 20px;">&copy; ${new Date().getFullYear()} Virtual Library. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send Welcome Email after successful registration
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<EmailResult> {
  try {
    if (!SENDGRID_API_KEY) {
      return { success: false, error: 'Email service not configured' };
    }

    const msg = {
      to: email,
      from: {
        email: SENDER_EMAIL,
        name: SENDER_NAME,
      },
      subject: 'Welcome to Virtual Library! 🎉',
      text: `Welcome to Virtual Library, ${name}!\n\nYour account has been created successfully.\n\nStart your NEET PG preparation journey with us today!\n\nBest regards,\nVirtual Library Team`,
      html: generateWelcomeHTMLEmail(name),
    };

    const response = await sgMail.send(msg);
    console.log('✅ Welcome email sent to:', email);

    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
    };
  } catch (error: any) {
    console.error('❌ Welcome Email Error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate HTML Welcome email
 */
function generateWelcomeHTMLEmail(name: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Virtual Library</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 30px; text-align: center; color: #999; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Virtual Library!</h1>
    </div>
    <div class="content">
      <h2>Hi ${name}!</h2>
      <p>Your account has been created successfully. We're excited to have you join our community of NEET PG aspirants!</p>
      <p>Start your preparation journey today and achieve your medical career goals.</p>
      <p><strong>What's Next?</strong></p>
      <ul>
        <li>📚 Access study materials</li>
        <li>📊 Track your rankings</li>
        <li>🔥 Build your study streak</li>
        <li>👥 Join the community</li>
      </ul>
      <p>Best of luck with your preparation!</p>
      <p><strong>Virtual Library Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Virtual Library. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Future: Send OTP via SMS (placeholder for when SMS is enabled)
 */
export async function sendOTPViaSMS(
  phone: string,
  otp: string
): Promise<EmailResult> {
  // TODO: Implement SMS provider (MSG91/Twilio)
  console.log('📱 SMS OTP sending not yet implemented:', phone, otp);
  return {
    success: false,
    error: 'SMS service not yet configured',
  };
}

