const fs = require('fs-extra');
const {
  yo
} = require('yoo-hoo');
/*
require("dotenv").config({
  path: "./.env"
});
*/
const config = require('./config.global');
//
//
yo('My-WhatsApp', {
  color: 'rainbow',
  spacing: 1,
});
//
// ------------------------------------------------------------------------------------------------//
//
fs.access("./config.global.js", fs.constants.F_OK, (err) => {
  if (err) {
    if (err.code === 'ENOENT') {
      console.error('- Arquivo ".env');
      var modelo = `
NODE_ENV = "production"
#
# Set host
HOST = "0.0.0.0"
#
# Set port
PORT = "9001"
#
# QRCode in terminal 0 or 1
VIEW_QRCODE_TERMINAL = 0
#
# Secret key
JWT_SECRET = "09f26e402586e2faa8da4c98a35f1b20d6b033c60"
#
TOKENSPATCH_LINUX = "/usr/local/tokens"
#
TOKENSPATCH_WIN = "c:/tokens"
#
# Validate in terminal 0 or 1
VALIDATE_MYSQL = 0
#
HOST_MYSQL = "localhost"
#
PORT_MYSQL = "3306"
#
USER_MYSQL = "user"
#
PASSWORD_MYSQL = "password"
#
DATABASE_MYSQL = "database"
`;
      console.log("- Modelo do arquivo de configuração:\n", modelo);
      process.exit(1);
    } else {
      //
      // ------------------------------------------------------------------------------------------------//
      //
      const customExpress = require('./config/custom-express');
      const http = customExpress();
      const conn = require('./config/dbConnection').promise();
      const Sessions = require("./sessions.js");
      //
      // ------------------------------------------------------------------------------------------------//
      //
      http.listen(config.PORT, config.HOST, function(err) {
        if (err) {
          console.log(err);
        } else {
          const host = http.address().address;
          const port = http.address().port;
          console.log(`- HTTP Server running on: ${host}:${port}`);
        }
      });
      //
      // ------------------------------------------------------------------------------------------------//
      //
    }
  } else {
    //
    // ------------------------------------------------------------------------------------------------//
    //
    const customExpress = require('./config/custom-express');
    const http = customExpress();
    const Sessions = require("./sessions.js");
    //
    // ------------------------------------------------------------------------------------------------//
    //
    http.listen(config.PORT, config.HOST, function(err) {
      if (err) {
        console.log(err);
      } else {
        const host = http.address().address;
        const port = http.address().port;
        console.log(`- HTTP Server running on: ${host}:${port}`);
      }
    });
    //
    // ------------------------------------------------------------------------------------------------//
    //
  }
});
//
process.stdin.resume(); //so the program will not close instantly
//
async function exitHandler(options, exitCode) {
  if (options.cleanup) {
    console.log("- Cleanup");
    await Sessions.getSessions().forEach(async session => {
      await Sessions.closeSession(session.sessionName);
    });
  }
  if (exitCode || exitCode === 0) {
    console.log(exitCode);
  }
  //
  if (options.exit) {
    process.exit();
  }
} //exitHandler
//
// ------------------------------------------------------------------------------------------------//
//
//do something when sistema is closing
process.on('exit', exitHandler.bind(null, {
  cleanup: true
}));
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {
  exit: true
}));
// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {
  exit: true
}));
process.on('SIGUSR2', exitHandler.bind(null, {
  exit: true
}));
//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {
  exit: true
}));
//
// ------------------------------------------------------------------------------------------------//
//