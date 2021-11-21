const mysql = require('mysql2/promise');
const config = require('../config.global');
//
// connect to the db
const dbConnection = {
  host: config.HOST_MYSQL, // O host do banco. Ex: localhost
  port: config.PORT_MYSQL, // Port do banco. Ex: 3306
  user: config.USER_MYSQL, // Um usuário do banco. Ex: user 
  password: config.PASSWORD_MYSQL, // A senha do usuário. Ex: user123
  database: config.DATABASE_MYSQL // A base de dados a qual a aplicação irá se conectar, deve ser a mesma onde foi executado o Código 1. Ex: node_mysql
};
//
// connect to the db
const dbConnectionPool = {
  host: config.HOST_MYSQL, // O host do banco. Ex: localhost
  port: config.PORT_MYSQL, // Port do banco. Ex: 3306
  user: config.USER_MYSQL, // Um usuário do banco. Ex: user 
  password: config.PASSWORD_MYSQL, // A senha do usuário. Ex: user123
  database: config.DATABASE_MYSQL, // A base de dados a qual a aplicação irá se conectar, deve ser a mesma onde foi executado o Código 1. Ex: node_mysql
  waitForConnections: true, // Determina a ação do pool quando nenhuma conexão está disponível e o limite foi atingido.
  connectionLimit: 10, // O número máximo de conexões a serem criadas de uma vez. (Padrão: 10)
  queueLimit: 10, // O número máximo de solicitações de conexão que o pool irá enfileirar antes de retornar um erro
  getConnection: 0 //Se definido como 0, não há limite para o número de solicitações de conexão na fila. (Padrão: 0)
};

async function query(sql, params) {

  const connection = await mysql.createConnection(dbConnection);

  let results = {}

  try {

    [results, ] = await connection.execute(sql, params);

  } catch (error) {

    console.log('Database error: ' + error)

  } finally {

    await connection.end();
  }
  return results;
}

module.exports = {
  query
}