const { connection, sequelize } = require('./config/config');

async function checkDatabase() {
  try {
    await connection();
    
    console.log('📋 Checking database tables...');
    const [results] = await sequelize.query('SHOW TABLES');
    console.log('Tables found:', results);
    
    if (results.length === 0) {
      console.log('❌ No tables found! Need to create them.');
    } else {
      console.log('✅ Tables exist!');
      
      // Check users table structure
      try {
        const [userTable] = await sequelize.query('DESCRIBE users');
        console.log('Users table structure:', userTable);
      } catch (err) {
        console.log('❌ Users table not found');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabase();