const { sequelize } = require('../../config/config');
const { User } = require('../../models');

/**
 * Controller to check database connection and tables
 */
const checkDatabase = async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    // Get all tables
    const [tables] = await sequelize.query('SHOW TABLES');
    
    // Get users table structure if it exists
    let usersTableStructure = null;
    let usersCount = 0;
    let sampleUsers = [];
    
    try {
      const [structure] = await sequelize.query('DESCRIBE users');
      usersTableStructure = structure;
      
      // Get users count
      usersCount = await User.count();
      
      // Get sample users (first 5)
      sampleUsers = await User.findAll({
        limit: 5,
        attributes: ['id', 'name', 'email', 'role', 'createdAt']
      });
      
    } catch (error) {
      console.log('Users table not found or error:', error.message);
    }
    
    res.status(200).json({
      success: true,
      database: {
        connected: true,
        tables: tables,
        usersTable: {
          exists: usersTableStructure !== null,
          structure: usersTableStructure,
          count: usersCount,
          sampleData: sampleUsers
        }
      }
    });
    
  } catch (error) {
    console.error('Database check error:', error);
    res.status(500).json({
      success: false,
      message: 'Database check failed',
      error: error.message
    });
  }
};

module.exports = { checkDatabase };