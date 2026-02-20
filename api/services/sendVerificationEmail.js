const nodemailer = require("nodemailer");
require('dotenv').config(); 


//  Hardcoded Gmail credentials for the sender
// Load data from environment variables
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD;
// Sends a verification email to the user for password reset
async function sendVerificationEmail(email, code) {
  try {
    console.log("📨 Preparing to send email to:", email);
    console.log("📨 Verification code:", code);
  // Create a transporter object using Gmail service and authentication
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASSWORD,
      },
    });
      // Define the email options (sender, recipient, subject, and HTML body)
    const mailOptions = {
      from: `"Edu Map System" <${MAIL_USER}>`,
      to: email,
      subject: "🔐 Your Verification Code",
      html: `
        <p>Hello,</p>
        <p>You requested a password reset.</p>
        <p>Your verification code is:</p>
        <h2 style="color:#1a73e8;">${code}</h2>
        <p>Use this code in the reset page to update your password.</p>
        <p>If you didn't request this, you can ignore this message.</p>
      `,
    };
     // Send the email using the transporter
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    throw error;
  }
}

module.exports = sendVerificationEmail;
