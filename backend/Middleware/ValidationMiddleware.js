const { body, validationResult } = require('express-validator');

const emailValidation = body('email')
  .isEmail()
  .withMessage('Please provide a valid email address')
  .normalizeEmail()
  .trim();

const passwordValidation = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  .trim();

const nameValidation = body('name')
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters')
  .matches(/^[a-zA-Z\s]+$/)
  .withMessage('Name can only contain letters and spaces')
  .escape();

const otpValidation = body('otp')
  .isLength({ min: 6, max: 6 })
  .withMessage('OTP must be exactly 6 digits')
  .isNumeric()
  .withMessage('OTP must contain only numbers')
  .trim();

const tokenValidation = body('token')
  .notEmpty()
  .withMessage('Token is required')
  .isLength({ min: 10 })
  .withMessage('Invalid token format')
  .trim();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

module.exports = {
  emailValidation,
  passwordValidation,
  nameValidation,
  otpValidation,
  tokenValidation,
  handleValidationErrors
};