const Sequelize = require('sequelize');
const config = require('../config.global');

const connection = new Sequelize(
  config.database.MYSQL_DATABASE,
  config.database.MYSQL_USER,
  config.database.MYSQL_PASSWORD,
  {
    host: config.database.MYSQL_HOST,
		port: config.database.MYSQL_PORT,
    dialect: config.database.MYSQL_DIALECT,
    timezone: config.database.MYSQL_TIMEZONE,
  }
);

export default connection;