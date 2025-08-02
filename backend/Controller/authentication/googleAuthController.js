const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');

// Initialize the Google OAuth2 client with the environment variable
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authController = {
  googleAuth: async (req, res) => {
    try {
      const { credential } = req.body;

      // Verify the Google token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      // Get user data from the token
      const payload = ticket.getPayload();
      const { email, name, sub: googleId } = payload;

      // Check if user exists (Sequelize syntax)
      let user = await User.findOne({ where: { email } });

      // If user doesn't exist, create new user
      if (!user) {
        user = await User.create({
          name,
          email,
          password: '', // Google users don't need password
          role: 'user',
          googleId
        });
      }

      // Create JWT token
      const token = jwt.sign(
        { 
          userId: user.id, // Use 'id' instead of '_id' for Sequelize
          email: user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id, // Use 'id' instead of '_id'
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }
};

module.exports = authController;
