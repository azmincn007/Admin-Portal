const { User } = require('../models');

const removeAllUsers = async () => {
  try {
    const deletedCount = await User.destroy({
      where: {},
      truncate: true
    });
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

removeAllUsers();