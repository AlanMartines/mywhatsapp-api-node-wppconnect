const mysql = require("mysql2");
const serverConfig = require("../config/server.config.json");
//
// connect to the db
const dbConnectionInfo = {
  host: serverConfig.host_mysql, // O host do banco. Ex: localhost
  user: serverConfig.user_mysql, // Um usuário do banco. Ex: user 
  password: serverConfig.password_mysql, // A senha do usuário. Ex: user123
  database: serverConfig.database_mysql, // A base de dados a qual a aplicação irá se conectar, deve ser a mesma onde foi executado o Código 1. Ex: node_mysql
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
//
//For mysql single connection
/* var dbconnection = mysql.createConnection(
        dbConnectionInfo
); 
//
 dbconnection.connect(function (err) {
    if (!err) {
        console.log("Database is connected ...");
    } else {
        console.log("Error connecting database ...");
    }
}); 
//
*/
//Create mysql connection pool
var dbconnection = mysql.createPool(
  dbConnectionInfo
);
//
// Attempt to catch disconnects 
dbconnection.on('connection', function(connection) {
  console.log('- DB Connection established');
  //
  connection.on('error', function(err) {
    console.error(new Date(), '- MySQL error', err.code);
  });
  //
  connection.on('close', function(err) {
    console.error(new Date(), '- MySQL close', err);
  });
  //
  connection.on('enqueue', function() {
    console.log('- Waiting for available connection slot');
  });
  //
  /*
  connection.end(function(err) {
    console.log('- All connections in the pool have ended');
  });
	*/
});
//
module.exports = dbconnection;