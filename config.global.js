require('dotenv').config();
const config = module.exports = {};
//
config.NODE_ENV = process.env.NODE_ENV || 'development';
config.HOST = process.env.HOST || 'localhost';
config.PORT = process.env.PORT || '9001';
config.VIEW_QRCODE_TERMINAL = process.env.VIEW_QRCODE_TERMINAL || true;
config.JWT_SECRET = process.env.JWT_SECRET;
config.TOKENSPATCH_LINUX = process.env.TOKENSPATCH_LINUX || 'tokens';
config.TOKENSPATCH_WIN = process.env.TOKENSPATCH_WIN || 'tokens';
config.VALIDATE_MYSQL = process.env.VALIDATE_MYSQL || false;
config.HOST_MYSQL = process.env.HOST_MYSQL || 'localhost';
config.PORT_MYSQL = process.env.PORT_MYSQL || '3306';
config.USER_MYSQL = process.env.USER_MYSQL || 'root';
config.PASSWORD_MYSQL = process.env.PASSWORD_MYSQL || '';
config.DATABASE_MYSQL = process.env.DATABASE_MYSQL || '';
//