'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.url) {
  // For production with URL
  sequelize = new Sequelize(config.url, config);
} else {
  // For development with separate credentials
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Load the User model from the model folder
const User = require('../model/UserSchema.js')(sequelize, Sequelize.DataTypes);
db[User.name] = User;

// If you have other models in the model folder, add them here
// const AnotherModel = require('../model/AnotherModel.js')(sequelize, Sequelize.DataTypes);
// db[AnotherModel.name] = AnotherModel;

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
