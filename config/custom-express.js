//
// Configuração dos módulos
const fs = require('fs');
const express = require('express');
const app = express();
const consign = require('consign');
const cors = require('cors');
const path = require('path');
//
const sistem = require("../controllers/sistem.controller");
const verifyToken = require("../middleware/verifyToken");
//
module.exports = () => {
  const http = require('http').createServer({}, app);
  const io = require('socket.io')(http);
  app.use(cors());
  //
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  //
  // Express Parser
  app.use(express.json({
    limit: '50mb',
    extended: true
  }));
  //
  app.use(express.urlencoded({
    limit: '50mb',
    extended: true
  }));
  //
  const sockets = {};
  //socket
  //
  //cria um callback para quando alguém conectar
  //socket => instancia da conexão do usuário
  io.on('connection', (socket) => {
    //adiciona todas os id's do socket na variavel sockets
    sockets[socket.id] = socket;
    console.log('socketid ' + socket.id);
  });
  //
  //socket
  io.on('connection', (socket) => {
    socket.on('disconnect', function() {
      console.log('-------');
      console.log('Fechou conexão');
      console.log('socketid ' + socket.id);
    });
  });
  //
  // Rotas
  app.use("/sistema", verifyToken.verify, sistem);
  //
  app.get('/', function(req, res) {
    res.status(200).send('Server WPPConnect is running');
  });
  //
  return http
}