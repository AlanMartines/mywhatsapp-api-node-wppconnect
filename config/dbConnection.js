const mysql = require("mysql2");
const serverConfig = require("../config/server.config.json");
//
const con = mysql.createConnection({
  host: serverConfig.host_mysql, // O host do banco. Ex: localhost
  user: serverConfig.user_mysql, // Um usuário do banco. Ex: user 
  password: serverConfig.password_mysql, // A senha do usuário. Ex: user123
  database: serverConfig.database_mysql, // A base de dados a qual a aplicação irá se conectar, deve ser a mesma onde foi executado o Código 1. Ex: node_mysql
}).on("error", (err) => {
  console.log("Failed to connect to Database - ", err);
});
//
module.exports = con;