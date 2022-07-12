//ecosystem.config.js
//
require('dotenv/config');
//
const NODE_ENV = process.env.NODE_ENV || 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '9001';
const DOMAIN_SSL = process.env.DOMAIN_SSL || '';
const VIEW_QRCODE_TERMINAL = process.env.VIEW_QRCODE_TERMINAL || 1;
const DEVICE_NAME = process.env.DEVICE_NAME || 'My Whatsapp';
const WA_VERSION = process.env.WA_VERSION || '';
const AUTO_CLOSE = process.env.AUTO_CLOSE || 60000;
const SECRET_KEY = process.env.SECRET_KEY || '09f26e402586e2faa8da4c98a35f1b20d6b033c60';
const BROWSER_WSENDPOINT = process.env.BROWSER_WSENDPOINT || undefined;
const START_ALL_SESSIONS = process.env.START_ALL_SESSIONS || 0;
const useHere = process.env.FORCE_CONNECTION_USE_HERE || 0;
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
		// Delay between restart
		watch_delay: 1000,
		ignore_watch : ["node_modules", "client/img"],
    env: {
			NODE_ENV,
			HOST,
			PORT,
			DOMAIN_SSL,
			VIEW_QRCODE_TERMINAL,
			WHATSAPPVERSION,
			DEVICE_NAME,
			WA_VERSION,
			AUTO_CLOSE,
			SECRET_KEY,
			useHere,
			BROWSER_WSENDPOINT,
			START_ALL_SESSIONS
    },
  }]
}