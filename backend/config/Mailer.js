const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Function to prepare email template with OTP
const prepareEmailTemplate = async (otp) => {
  // Hard-coded template instead of reading from file
  const template = `<!DOCTYPE html>
<html>
<head>
  <style>
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Arial, sans-serif;
      background-color: #f5f8ff;
    }
    .header {
      background: linear-gradient(135deg, #0062cc, #1e88e5);
      color: white;
      padding: 25px;
      text-align: center;
      border-radius: 12px 12px 0 0;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .content {
      padding: 30px;
      background-color: white;
      border: 1px solid #e0e7ff;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .otp-code {
      font-size: 36px;
      font-weight: bold;
      color: #0062cc;
      text-align: center;
      padding: 25px;
      letter-spacing: 8px;
      background-color: #f0f7ff;
      border-radius: 8px;
      margin: 20px 0;
      border: 2px dashed #1e88e5;
    }
    .message {
      color: #444;
      line-height: 1.6;
      font-size: 16px;
    }
    .warning {
      background-color: #fff8e1;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      color: #856404;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 25px;
      color: #666;
      font-size: 13px;
      padding-top: 20px;
      border-top: 1px solid #e0e7ff;
    }
    .social-links {
      margin: 15px 0;
    }
    .social-links a {
      color: #0062cc;
      text-decoration: none;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">MOOVO</div>
      <h2 style="margin: 0;">Login Verification Code</h2>
    </div>
    <div class="content">
      <p class="message">Hello!</p>
      <p class="message">Thank you for choosing Moovo. To complete your login, please use the following verification code:</p>
      
      <div class="otp-code">{OTP}</div>
      
      <p class="message">This code will expire in 5 minutes for your security.</p>
      
      <div class="warning">
        ⚠️ If you didn't attempt to log in to Moovo, please ignore this email and ensure your account security.
      </div>
      
      <p class="message">Need help? Contact our support team for assistance.</p>
    </div>
    <div class="footer">
      <div class="social-links">
        <a href="#">Facebook</a> |
        <a href="#">Twitter</a> |
        <a href="#">Instagram</a>
      </div>
      <p>This is an automated message, please do not reply.</p>
      <p>© 2024 Moovo. All rights reserved.</p>
      <p style="color: #999; font-size: 12px;">Sent with ❤️ from Moovo Team</p>
    </div>
  </div>
</body>
</html>`;

  // Replace OTP placeholder with actual OTP
  return template.replace('{OTP}', otp);
};

// Function to prepare reset email template
const prepareResetEmailTemplate = async (resetUrl, userName) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    // Read the template file
    const templatePath = path.join(__dirname, '../Template/ResetEmail.html');
    let template = await fs.readFile(templatePath, 'utf8');
    
    // Replace placeholders
    template = template.replace('{RESET_URL}', resetUrl);
    template = template.replace('{USER_NAME}', userName || 'User');
    
    return template;
  } catch (error) {
    console.error('Error reading reset email template:', error);
    throw error;
  }
};

// Function to send an email
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Moovo" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Verify connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.log('Email server connection error:', error);
  } else {
    console.log('Email server is ready to take messages');
  }
});

module.exports = { sendEmail, prepareEmailTemplate, prepareResetEmailTemplate };
