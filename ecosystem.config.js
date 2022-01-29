//ecosystem.config.js
//
require('dotenv/config');
//
const NODE_ENV = process.env.NODE_ENV || 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '9001';
const VIEW_QRCODE_TERMINAL = process.env.VIEW_QRCODE_TERMINAL || 1;
const WHATSAPPVERSION = process.env.WHATSAPPVERSION || '';
const DEVICE_NAME = process.env.DEVICE_NAME || 'My Whatsapp';
const MULTIDEVICE = process.env.MULTIDEVICE || 0;
const AUTO_CLOSE = process.env.AUTO_CLOSE || 60000;
const JWT_SECRET = process.env.JWT_SECRET;
const TOKENSPATCH = process.env.TOKENSPATCH || 'tokens';
const VALIDATE_MYSQL = process.env.VALIDATE_MYSQL || 0;
const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = process.env.MYSQL_PORT || '3306';
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_DIALECT = process.env.MYSQL_DIALECT || 'mysql';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || '';
const MYSQL_TIMEZONE = process.env.MYSQL_TIMEZONE || '-04:00';
const BROWSER_WSENDPOINT = process.env.BROWSER_WSENDPOINT || '';
const NAME_INSTANCES = process.env.NAME_INSTANCES || 'ApiWPPConnect';
const INSTANCES = process.env.INSTANCES || 1;
//
module.exports = {
  apps: [{
    name: NAME_INSTANCES,
    script: "./server.js",
    instances: INSTANCES,
    exec_mode: "cluster",
    watch: true,
    env: {
			NODE_ENV,
			HOST,
			PORT,
			VIEW_QRCODE_TERMINAL,
			WHATSAPPVERSION,
			DEVICE_NAME,
			MULTIDEVICE,
			AUTO_CLOSE,
			JWT_SECRET,
			TOKENSPATCH,
			VALIDATE_MYSQL,
			MYSQL_HOST,
			MYSQL_PORT,
			MYSQL_USER,
			MYSQL_DIALECT,
			MYSQL_PASSWORD,
			MYSQL_DATABASE,
			MYSQL_TIMEZONE,
			BROWSER_WSENDPOINT
    },
  }]
}