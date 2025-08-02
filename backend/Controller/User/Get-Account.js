const { User } = require('../../models');
const redisClient = require('../../config/redis');

const getUserAccount = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Try to get user from Redis cache first
        const cacheKey = `user_profile:${userId}`;
        const cachedUser = await redisClient.get(cacheKey);
        
        if (cachedUser) {
            return res.status(200).json({
                success: true,
                user: JSON.parse(cachedUser),
                cached: true
            });
        }

        // If not in cache, get from database
        const user = await User.findByPk(userId, {
            attributes: ['name', 'email', 'role', 'profileImage']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userData = {
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage || null
        };

        // Cache user data for 1 hour
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(userData));

        res.status(200).json({
            success: true,
            user: userData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving user account',
            error: error.message
        });
    }
};

module.exports = { getUserAccount };




