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
//
module.exports = () => {
  const http = require('http').createServer({}, app);
  app.use(cors());
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
  //
  // Rotas
  app.use("/sistema", sistem);
  //
  app.get('/', function(req, res) {
    res.status(200).send('Server is running');
  });
  //
  return http
}