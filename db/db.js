const {Sequelize} = require('sequelize');
const config = require('config');

module.exports = new Sequelize(
  config.get('DB_NAME'),
  config.get('DB_USER'),
  config.get('DB_PASSWORD'),
  {
    dialect: 'postgres',
    host: config.get('DB_HOST'),
    port: config.get('DB_PORT'),
  }
);