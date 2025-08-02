const { Sequelize } = require('sequelize');

// Database configuration for different environments
const config = {
  development: {
    username: 'root',
    password: 'CRhbXhuqOqNGluWSubaNnjprxtGgGeRx',
    database: 'railway',
    host: 'centerbeam.proxy.rlwy.net',
    port: 45053,
    dialect: 'mysql',
    logging: console.log,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
};

const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[env]);

const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection successful to MySQL database');
  } catch (error) {
    console.log('Connection error:', error);
    process.exit(1);
  }
};

// Export both the config object (for models/index.js) and connection utilities
module.exports = config;
module.exports.sequelize = sequelize;
module.exports.connection = connection;