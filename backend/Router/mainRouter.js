const express = require("express");
const router = express.Router();
const { authMiddleware } = require('../Middleware/AuthMiddleware');
const { body, query } = require('express-validator');
const { handleValidationErrors, nameValidation, emailValidation } = require('../Middleware/ValidationMiddleware');

// Import your controllers
const { getUserAccount } = require('../Controller/User/Get-Account');
const { getUserAnalytics } = require("../Controller/User/Admin/Get-Analytics");
const { getRecentUsers, getAllUsers } = require('../Controller/User/Admin/Get-RecentUsers');
const { deleteUser } = require('../Controller/User/Admin/Delete-User');
const { adminMiddleware } = require('../Middleware/AdminMiddleware');
const { updateUserProfile } = require('../Controller/User/Update-Profile');
const uploadProfileImage = require('../Middleware/ProfileImageMiddleware');

// Get user account route
router.get('/user-details', authMiddleware, getUserAccount);

// User analytics route (admin only)
router.get('/user-analytics', authMiddleware, getUserAnalytics);

// Get users with pagination validation
router.get('/recent-users', 
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ],
  getRecentUsers
);

router.get('/all-users', 
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('loadType').optional().isIn(['basic', 'detailed']), // NEW: Add loadType validation
    handleValidationErrors
  ],
  getAllUsers
);

router.delete('/delete-user', 
  authMiddleware,
  [
    body('userId').notEmpty().isInt({ min: 1 }).withMessage('Valid user ID is required'),
    handleValidationErrors
  ],
  deleteUser
);

router.put('/update-profile', 
  authMiddleware,
  uploadProfileImage('profileImage'), // Handle image upload
  [
    body('name').optional().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    handleValidationErrors
  ],
  updateUserProfile
);

module.exports = router;
