const moment = require('moment');
const { User } = require('../../../models');

const getRecentUsers = async (req, res) => {
    try {
        // Get 6 most recent users
        const recentUsers = await User.findAll({
            order: [['createdAt', 'DESC']],
            limit: 6,
            attributes: ['name', 'email', 'profileImage', 'createdAt']
        });

        // Format the users with relative time
        const formattedUsers = recentUsers.map(user => {
            const now = moment();
            const createdAt = moment(user.createdAt);
            const diffInMinutes = now.diff(createdAt, 'minutes');
            const diffInHours = now.diff(createdAt, 'hours');
            const diffInDays = now.diff(createdAt, 'days');

            let joinedAt;
            
            if (diffInMinutes < 1) {
                joinedAt = 'Just now';
            } else if (diffInMinutes < 60) {
                joinedAt = `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
            } else if (diffInHours < 24) {
                joinedAt = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
            } else if (diffInDays === 1) {
                joinedAt = '1 day ago';
            } else if (diffInDays === 2) {
                joinedAt = '2 days ago';
            } else {
                joinedAt = createdAt.format('DD MMM');
            }

            return {
                name: user.name,
                email: user.email,
                profileImage: user.profileImage || null,
                joinedAt
            };
        });

        res.status(200).json({
            success: true,
            recentUsers: formattedUsers
        });

    } catch (error) {
        console.error('Error fetching recent users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent users',
            error: error.message
        });
    }
};

const { getAllUsers } = require('./Get-AllUsers');

module.exports = { getRecentUsers, getAllUsers };

