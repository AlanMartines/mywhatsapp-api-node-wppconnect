//ecosystem.config.js
//
const path = require('path');
const os = require('os');
require('dotenv/config');
//
const HOST = process.env.NODE_ENV;
const HOST = process.env.HOST || localhost;
const PORT = process.env.PORT;
const VIEW_QRCODE_TERMINAL = process.env.VIEW_QRCODE_TERMINAL;
const JWT_SECRET = process.env.JWT_SECRET;
const TOKENSPATCH_LINUX = process.env.TOKENSPATCH_LINUX;
const TOKENSPATCH_WIN = process.env.TOKENSPATCH_WIN;
const VALIDATE_MYSQL = process.env.VALIDATE_MYSQL;
const HOST_MYSQL = process.env.HOST_MYSQL;
const PORT_MYSQL = process.env.PORT_MYSQL;
const USER_MYSQL = process.env.USER_MYSQL;
const PASSWORD_MYSQL = process.env.PASSWORD_MYSQL;
const DATABASE_MYSQL = process.env.DATABASE_MYSQL;
//
module.exports = {
  apps: [{
    name: "ApiWPPConnect",
    script: "./server.js",
    instances: 1,
    exec_mode: "cluster",
    watch: true,
    env: {
      NODE_ENV,
      HOST,
      PORT,
      VIEW_QRCODE_TERMINAL,
      JWT_SECRET,
      TOKENSPATCH_LINUX,
      TOKENSPATCH_WIN,
      VALIDATE_MYSQL,
      HOST_MYSQL,
      PORT_MYSQL,
      USER_MYSQL,
      PASSWORD_MYSQL,
      DATABASE_MYSQL
    },
  }]
}