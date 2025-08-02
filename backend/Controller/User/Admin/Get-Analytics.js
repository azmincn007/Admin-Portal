const { User } = require('../../../models');
const { Op } = require('sequelize');
const moment = require('moment');

const getUserAnalytics = async (req, res) => {
    try {
        // Get total users count
        const totalUsers = await User.count();

        // Get new users in last 24 hours
        const last24Hours = moment().subtract(24, 'hours').toDate();
        const newUsersLast24h = await User.count({
            where: {
                createdAt: { [Op.gte]: last24Hours }
            }
        });

        // Get total admin accounts
        const totalAdmins = await User.count({ 
            where: { role: 'admin' } 
        });

        // Get total regular users
        const totalRegularUsers = await User.count({ 
            where: { role: 'user' } 
        });

        res.status(200).json({
            success: true,
            analytics: {
                totalUsers,
                newUsersLast24h,
                totalAdmins,
                totalRegularUsers,
                timestamp: new Date()
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user analytics',
            error: error.message
        });
    }
};

module.exports = { getUserAnalytics };

