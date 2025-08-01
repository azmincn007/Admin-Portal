const { User } = require('../models');

const removeAllUsers = async () => {
  try {
    // Remove all users from the table
    const deletedCount = await User.destroy({
      where: {},
      truncate: true
    });
    
    console.log(`Successfully removed all users from the table`);
    process.exit(0);
  } catch (error) {
    console.error('Error removing users:', error);
    process.exit(1);
  }
};

removeAllUsers();