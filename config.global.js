require('dotenv').config();
const config = module.exports = {};
//
config.NODE_ENV = process.env.NODE_ENV || 'production';
config.HOST = process.env.HOST || 'localhost';
config.PORT = process.env.PORT || '9001';
config.DOMAIN_SSL = process.env.DOMAIN_SSL || '';
config.VIEW_QRCODE_TERMINAL = process.env.VIEW_QRCODE_TERMINAL || 1;
config.DEVICE_NAME = process.env.DEVICE_NAME || 'My Whatsapp';
config.WA_VERSION = process.env.WA_VERSION || '';
config.AUTO_CLOSE = process.env.AUTO_CLOSE || 60000;
config.SECRET_KEY = process.env.SECRET_KEY || '09f26e402586e2faa8da4c98a35f1b20d6b033c60';
config.BROWSER_WSENDPOINT = process.env.BROWSER_WSENDPOINT || undefined;
config.START_ALL_SESSIONS = process.env.START_ALL_SESSIONS || 0;
config.useHere = process.env.FORCE_CONNECTION_USE_HERE || 0;
//
config.tokenPatch = "/usr/local/tokens";
//
// console.log("- Variaveis de ambente");
//console.log(config);