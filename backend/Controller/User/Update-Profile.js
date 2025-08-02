const { User } = require('../../models');
const redisClient = require('../../config/redis');

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;
    
    // Create update object with only provided fields
    const updateData = {};
    
    // Only add name if provided
    if (name !== undefined) updateData.name = name;
    
    // If profile image was uploaded, add it to update data
    if (req.uploadedProfileImage) {
      updateData.profileImage = req.uploadedProfileImage.url;
    }

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided for update'
      });
    }

    // Update user with new data using Sequelize
    const [updatedRowsCount] = await User.update(
      updateData,
      { 
        where: { id: userId },
        returning: true
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // CACHE INVALIDATION - Clear user cache after update
    const cacheKey = `user_profile:${userId}`;
    await redisClient.del(cacheKey);

    // Fetch updated user data
    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'profileImage', 'role']
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
      imageInfo: req.uploadedProfileImage?.compressionInfo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

module.exports = { updateUserProfile };
