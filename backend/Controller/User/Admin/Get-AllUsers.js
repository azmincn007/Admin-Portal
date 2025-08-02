const { User } = require('../../../models');
const { Op } = require('sequelize');
const moment = require('moment');

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const role = req.query.role || 'all';
        const date = req.query.date || 'all';
        
        // NEW: Add loadType parameter for lazy loading
        const loadType = req.query.loadType || 'basic';

        // Build search query (same as before)
        let whereClause = {};
        
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        if (role !== 'all') {
            whereClause.role = role;
        }

        // Date filter logic (same as before)
        if (date !== 'all') {
            const now = moment();
            let startDate;

            switch (date) {
                case '1': // Today
                    startDate = now.startOf('day').toDate();
                    whereClause.createdAt = { [Op.gte]: startDate };
                    break;
                case '2': // Yesterday
                    startDate = now.subtract(1, 'day').startOf('day').toDate();
                    const endDate = now.endOf('day').toDate();
                    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
                    break;
                case '7': // Last 7 days
                    startDate = now.subtract(7, 'days').startOf('day').toDate();
                    whereClause.createdAt = { [Op.gte]: startDate };
                    break;
                case '30': // Last 30 days
                    startDate = now.subtract(30, 'days').startOf('day').toDate();
                    whereClause.createdAt = { [Op.gte]: startDate };
                    break;
                case '90': // Last 90 days
                    startDate = now.subtract(90, 'days').startOf('day').toDate();
                    whereClause.createdAt = { [Op.gte]: startDate };
                    break;
                case 'custom': // Custom date range (requires fromDate and toDate)
                    const fromDate = req.query.fromDate;
                    const toDate = req.query.toDate;
                    if (fromDate && toDate) {
                        whereClause.createdAt = {
                            [Op.between]: [
                                moment(fromDate).startOf('day').toDate(),
                                moment(toDate).endOf('day').toDate()
                            ]
                        };
                    }
                    break;
            }
        }

        const totalUsers = await User.count({ where: whereClause });

        // NEW: Different attributes based on loadType
        let attributes;
        if (loadType === 'basic') {
            // Fast loading - only essential fields
            attributes = ['id', 'name', 'email', 'role', 'createdAt'];
        } else {
            // Detailed loading - all fields including profileImage
            attributes = ['id', 'name', 'email', 'profileImage', 'role', 'createdAt'];
        }

        const users = await User.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            offset,
            limit,
            attributes
        });

        // Format users based on loadType
        const formattedUsers = users.map(user => {
            const baseUser = {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                joinedAt: formatJoinedAt(user.createdAt) // Extract this to a function
            };

            // Add profileImage only for detailed load
            if (loadType === 'detailed') {
                baseUser.profileImage = user.profileImage || null;
            }

            return baseUser;
        });

        res.status(200).json({
            success: true,
            users: formattedUsers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                hasNextPage: page < Math.ceil(totalUsers / limit),
                hasPrevPage: page > 1
            },
            filters: {
                search: search,
                role: role,
                date: date
            },
            loadType // Include loadType in response
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching all users',
            error: error.message
        });
    }
};

// Extract joined date formatting to separate function
const formatJoinedAt = (createdAt) => {
    const now = moment();
    const created = moment(createdAt);
    const diffInMinutes = now.diff(created, 'minutes');
    const diffInHours = now.diff(created, 'hours');
    const diffInDays = now.diff(created, 'days');

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays === 2) return '2 days ago';
    return created.format('DD MMM');
};

module.exports = { getAllUsers };



