const express = require("express");
const { googleAuth } = require("../Controller/authentication/googleAuthController");
const { sendOTP } = require("../Controller/authentication/SendOtp");
const { verifyOTP } = require("../Controller/authentication/VerifyOtp");
const { sendResetLink, resetPassword } = require("../Controller/authentication/ResetPassword");
const { 
  emailValidation, 
  passwordValidation, 
  otpValidation, 
  tokenValidation,
  handleValidationErrors 
} = require("../Middleware/ValidationMiddleware");

const router = express.Router();

// Google login route (no validation needed for credential)
router.post('/google-login', googleAuth);

// Send OTP with validation
router.post('/send-otp', 
  [emailValidation, passwordValidation, handleValidationErrors], 
  sendOTP
);

// Verify OTP with validation
router.post('/verify-otp', 
  [emailValidation, otpValidation, handleValidationErrors], 
  verifyOTP
);

// Send reset link with validation
router.post('/send-reset-link', 
  [emailValidation], 
  sendResetLink
);

// Reset password with validation
router.post('/reset-password', 
  [tokenValidation, passwordValidation], 
  resetPassword
);

module.exports = router;
