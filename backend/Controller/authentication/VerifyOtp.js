const jwt = require('jsonwebtoken');
const redisClient = require('../../config/redis');
const { User } = require('../../models');

/**
 * Controller to verify OTP and handle login/registration
 */
const verifyOTP = async (req, res) => {
  try {
    // Express-validator already validated these fields
    const { email, otp } = req.body;

    // Get OTP from Redis instead of tempOTPStorage
    const otpKey = `otp:${email}`;
    const otpData = await redisClient.get(otpKey);
    
    let tempData = null;
    if (otpData) {
      tempData = JSON.parse(otpData);
    }
    
    // Testing purpose only - accept 123456 as universal OTP
    if (otp === '123456') {
      console.log('Using test OTP 123456 - for testing purposes only');
    } else if (!tempData || tempData.otp !== otp || new Date(tempData.expiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Get isNewUser flag from temp storage (set during SendOTP)
    const isNewUser = tempData ? tempData.isNewUser : false;

    // OTP is valid, remove from temporary storage (skip for test OTP)
    if (otp !== '123456') {
      await redisClient.del(otpKey);
    }

    // Find user (should exist since SendOTP creates it)
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // Short-lived access token
    );

    const refreshToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' } // Long-lived refresh token
    );

    res.status(200).json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      isNewUser,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage || ""
      }
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

module.exports = { verifyOTP };
