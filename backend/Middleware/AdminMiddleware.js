/**
 * Middleware to check if user has admin role
 * Must be used after authMiddleware
 */
const adminMiddleware = (req, res, next) => {
  
  try {
    // Check if user object exists (from authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

module.exports = { adminMiddleware };