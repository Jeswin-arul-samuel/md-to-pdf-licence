const nodemailer = require('nodemailer');

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ADDRESS,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Generate a valid license key for MD to PDF Converter
 * Format: MDPDF-XXXX-XXXX-XXXX-XXXX
 * Validation: sum of (charCode * position) % 97 === 0
 */
function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const prefix = 'MDPDF';

  // Generate random characters for first 3 groups (15 chars after prefix)
  let keyChars = '';
  for (let i = 0; i < 15; i++) {
    keyChars += chars[Math.floor(Math.random() * chars.length)];
  }

  // Calculate current sum (prefix + 15 random chars)
  const fullPrefix = prefix + keyChars;
  let sum = 0;
  for (let i = 0; i < fullPrefix.length; i++) {
    sum += fullPrefix.charCodeAt(i) * (i + 1);
  }

  // Find the last character that makes sum % 97 === 0
  const lastPosition = fullPrefix.length + 1;
  const needed = (97 - (sum % 97)) % 97;

  // Find a character whose (charCode * lastPosition) % 97 === needed
  let lastChar = null;
  for (let i = 0; i < chars.length; i++) {
    if ((chars.charCodeAt(i) * lastPosition) % 97 === needed) {
      lastChar = chars[i];
      break;
    }
  }

  // If no exact match found, regenerate
  if (!lastChar) {
    return generateLicenseKey();
  }

  keyChars += lastChar;

  // Format as MDPDF-XXXX-XXXX-XXXX-XXXX
  const key = `${prefix}-${keyChars.slice(0, 4)}-${keyChars.slice(4, 8)}-${keyChars.slice(8, 12)}-${keyChars.slice(12, 16)}`;

  // Verify the key
  const verifyChars = key.replace(/-/g, '');
  let verifySum = 0;
  for (let i = 0; i < verifyChars.length; i++) {
    verifySum += verifyChars.charCodeAt(i) * (i + 1);
  }

  if (verifySum % 97 !== 0) {
    return generateLicenseKey();
  }

  return key;
}

/**
 * Send license key email to customer
 */
async function sendLicenseEmail(customerEmail, customerName, licenseKey) {
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #667eea;">Thank You for Your Purchase!</h1>

      <p>Hi ${customerName || 'there'},</p>

      <p>Thank you for purchasing MD to PDF Converter! Here is your license key:</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <code style="font-size: 24px; font-weight: bold; color: #333; letter-spacing: 2px;">${licenseKey}</code>
      </div>

      <h3>How to Activate:</h3>
      <ol>
        <li>Open MD to PDF Converter</li>
        <li>Click on the <strong>"Trial"</strong> badge in the header</li>
        <li>Enter your license key</li>
        <li>Click <strong>"Activate"</strong></li>
      </ol>

      <p>If you haven't downloaded the app yet, get it here:<br>
      <a href="https://github.com/Jeswin-arul-samuel/md_to_pdf_convertor/releases">Download MD to PDF Converter</a></p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <p style="color: #666; font-size: 14px;">
        Need help? Reply to this email or contact us at jeswin.arul.samuel@gmail.com
      </p>

      <p>Best regards,<br>Jeswin</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.GMAIL_ADDRESS,
    to: customerEmail,
    subject: 'Your MD to PDF Converter License Key',
    html: emailHtml,
  };

  const info = await transporter.sendMail(mailOptions);

  if (!info.messageId) {
    throw new Error('Failed to send email');
  }

  return info;
}

/**
 * Main webhook handler for Gumroad Ping
 */
module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;

    // Log the incoming request (for debugging)
    console.log('Received Gumroad webhook:', JSON.stringify(payload, null, 2));

    // Verify this is from Gumroad (check for required fields)
    if (!payload.email) {
      return res.status(400).json({ error: 'Invalid payload: missing email' });
    }

    // Extract customer details from Gumroad payload
    const customerEmail = payload.email;
    const customerName = payload.full_name || payload.name || '';
    const productName = payload.product_name || 'MD to PDF Converter';
    const saleId = payload.sale_id || 'unknown';

    // Generate license key
    const licenseKey = generateLicenseKey();

    console.log(`Generated license key for ${customerEmail}: ${licenseKey}`);

    // Send license key email
    await sendLicenseEmail(customerEmail, customerName, licenseKey);

    console.log(`License key sent to ${customerEmail}`);

    // Return success
    return res.status(200).json({
      success: true,
      message: 'License key sent successfully',
      saleId: saleId,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
