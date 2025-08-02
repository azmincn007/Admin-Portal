const bcrypt = require('bcrypt');
const { sendEmail, prepareEmailTemplate } = require('../../config/Mailer');
const { User } = require('../../models');
const redisClient = require('../../config/redis');

// Simple OTP generation function
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Controller to send OTP to email
 * Validates email and password before sending OTP
 * Creates new user if doesn't exist
 */
const sendOTP = async (req, res) => {
  try {
    // Express-validator already validated these fields
    const { email, password } = req.body;

    // Find user by email
    let user = await User.findOne({ where: { email } });
    let isNewUser = false;
    
    if (!user) {
      // Create new user if doesn't exist
      isNewUser = true;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Extract name from email
      let emailName = email.split('@')[0];
      emailName = emailName
        .split(/[._-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      user = await User.create({
        name: emailName || "User",
        email,
        password: hashedPassword,
        role: 'user'
      });
      

    } else {
      // Verify password for existing user
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Store OTP in Redis instead of memory
    const otpKey = `otp:${email}`;
    await redisClient.setEx(otpKey, 300, JSON.stringify({
      otp,
      expiry: otpExpiry,
      timestamp: new Date(),
      isNewUser
    }));

    // Prepare email template with OTP
    const htmlContent = await prepareEmailTemplate(otp);

    // Send email
    await sendEmail(
      email,
      'Login Verification Code - Moovo',
      htmlContent
    );

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      email: email
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
};

module.exports = { sendOTP };
