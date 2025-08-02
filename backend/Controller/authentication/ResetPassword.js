const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sendEmail, prepareResetEmailTemplate } = require('../../config/Mailer');
const { User } = require('../../models');

/**
 * Controller to send password reset link to email
 */
const sendResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }

    // Find user by email in database
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate JWT token with user data
    const resetToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        type: 'reset',
        timestamp: Date.now() // Add timestamp for extra security
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create reset URL
    const resetUrl = `http://localhost:8080/reset-password?token=${resetToken}`;

    // Prepare and send email
    const htmlContent = await prepareResetEmailTemplate(resetUrl, user.name);
    await sendEmail(email, 'Password Reset Request - Moovo', htmlContent);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email',
      email: email
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending reset link',
      error: error.message
    });
  }
};

/**
 * Controller to reset password using token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate inputs
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Validate token type
    if (decoded.type !== 'reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Find user in database using token data
    const user = await User.findOne({ 
      where: { 
        id: decoded.userId,
        email: decoded.email 
      } 
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or token invalid'
      });
    }

    // Additional security: Check if token is too old (beyond JWT expiry)
    const tokenAge = Date.now() - decoded.timestamp;
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    
    if (tokenAge > oneHour) {
      return res.status(400).json({
        success: false,
        message: 'Token has expired'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const [updatedRows] = await User.update(
      { password: hashedPassword },
      { where: { id: decoded.userId } }
    );

    if (updatedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

module.exports = { sendResetLink, resetPassword };





