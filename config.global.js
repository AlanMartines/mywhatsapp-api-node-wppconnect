require('dotenv').config();
const config = module.exports = {};
//
config.NODE_ENV = process.env.NODE_ENV || 'production';
config.HOST = process.env.HOST || 'localhost';
config.PORT = process.env.PORT || '9001';
config.DOMAIN_SSL = process.env.DOMAIN_SSL || '';
config.VIEW_QRCODE_TERMINAL = process.env.VIEW_QRCODE_TERMINAL || 1;
config.DEVICE_NAME = process.env.DEVICE_NAME || 'My Whatsapp';
config.AUTO_CLOSE = process.env.AUTO_CLOSE || 60000;
config.JWT_SECRET = process.env.JWT_SECRET || '09f26e402586e2faa8da4c98a35f1b20d6b033c60';
config.VALIDATE_MYSQL = process.env.VALIDATE_MYSQL || 0;
config.MYSQL_DIALECT = process.env.MYSQL_ENGINE || 'mysql';
config.MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
config.MYSQL_PORT = process.env.MYSQL_PORT || '3306';
config.MYSQL_USER = process.env.MYSQL_USER || 'root';
config.MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
config.MYSQL_DATABASE = process.env.MYSQL_DATABASE || '';
config.MYSQL_TIMEZONE = process.env.MYSQL_TIMEZONE || '-04:00';
config.BROWSER_WSENDPOINT = process.env.BROWSER_WSENDPOINT || undefined;
config.START_ALL_SESSIONS = process.env.START_ALL_SESSIONS || 0;
config.useHere = process.env.FORCE_CONNECTION_USE_HERE || 0;
//
config.tokenPatch = "/usr/local/tokens";
//
// console.log("- Variaveis de ambente");
// console.log(config);