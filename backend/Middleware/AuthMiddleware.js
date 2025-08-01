const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify access token
    req.user = decoded; // Attach user info to request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

// Middleware to verify refresh token
const refreshTokenMiddleware = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(403).json({ message: 'Invalid refresh token type.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired refresh token.' });
  }
};

module.exports = { authMiddleware, refreshTokenMiddleware };
