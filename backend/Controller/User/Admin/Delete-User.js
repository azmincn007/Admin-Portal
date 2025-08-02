const { User } = require('../../../models');
const redisClient = require('../../../config/redis');

/**
 * Controller to delete a specific user (Admin only)
 * Requires admin role and valid token
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const adminUserId = req.user.userId; // From auth middleware

    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check admin role from database
    const adminUser = await User.findByPk(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Check if admin is trying to delete themselves
    if (parseInt(userId) === parseInt(adminUserId)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Find the user to be deleted
    const userToDelete = await User.findByPk(userId);
    
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting another admin (optional security measure)
    if (userToDelete.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin accounts'
      });
    }

    // Delete the user
    await User.destroy({
      where: { id: userId }
    });

    // CACHE INVALIDATION - Clear deleted user's cache
    const cacheKey = `user_profile:${userId}`;
    await redisClient.del(cacheKey);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: {
        id: userToDelete.id,
        name: userToDelete.name,
        email: userToDelete.email,
        role: userToDelete.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

module.exports = { deleteUser };

