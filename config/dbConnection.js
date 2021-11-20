const mysql = require("mysql2");
//require('dotenv/config');
/*
require("dotenv").config({
  path: "./.env"
});
*/
const config = require('../config.global');
//
// connect to the db
const dbConnectionInfo = {
  host: config.HOST_MYSQL, // O host do banco. Ex: localhost
  port: config.PORT_MYSQL, // Port do banco. Ex: 3306
  user: config.USER_MYSQL, // Um usuário do banco. Ex: user 
  password: config.PASSWORD_MYSQL, // A senha do usuário. Ex: user123
  database: config.DATABASE_MYSQL, // A base de dados a qual a aplicação irá se conectar, deve ser a mesma onde foi executado o Código 1. Ex: node_mysql
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
//
//For mysql single connection
/* 
//Create mysql connection pool
var dbconnection = mysql.createPool(
  dbConnectionInfo
);
*/
//Create mysql connection
var dbconnection = mysql.createConnection(
  dbConnectionInfo
);
//
const connect = promisify(dbconnection.connect.bind(dbconnection));
conn.execute = promisify(dbconnection.query.bind(dbconnection));
//
await connect();
//
dbconnection.connect(function(err) {
  if (!err) {
    console.log("- Database is connected");
  } else {
    console.log("- Error connecting database");
  }
});
// Attempt to catch disconnects 
dbconnection.on('connection', function(connection) {
  console.log('- MySQL Connection established');
  //
  dbconnection.on('error', function(err) {
    console.error(new Date(), '- MySQL error', err.code);
  });
  //
  dbconnection.on('enqueue', function() {
    console.log('- MySQL Waiting for available connection slot');
  });
  //
  dbconnection.end(function(err) {
    console.log('- All connections in the pool have ended');
  });
});
//
module.exports = dbconnection;