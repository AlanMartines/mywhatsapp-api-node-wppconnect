const fs = require('fs-extra');
const {
  yo
} = require('yoo-hoo');
//
//
yo('My-WhatsApp', {
  color: 'rainbow',
  spacing: 1,
});
//
// ------------------------------------------------------------------------------------------------//
//
fs.access("./config/server.config.json", fs.constants.F_OK, (err) => {
  if (err) {
    if (err.code === 'ENOENT') {
      console.error('- Arquivo "./config/server.config.json" não existe');
      var modelo = {
        "_comment_host": "Configuração do host",
        "host": "0.0.0.0",
        "port": "9001",
        "view_qrcode_terminal": true,
        "_comment_jwt": "Configuração do jwt",
        "jwt_secret": "09f26e402586e2faa8da4c98a35f1b20d6b033c60",
        "_comment_token": "Pasta de tokens",
        "tokenspatch_linux": "/usr/local/tokens",
        "tokenspatch_win": "c:/tokens",
        "_comment_mysql": "Conexão com bando de dados",
        "validate_mysql": true,
        "host_mysql": "localhost",
        "user_mysql": "user",
        "password_mysql": "password",
        "database_mysql": "database"
      };
      console.log("- Modelo do arquivo de configuração:\n", modelo);
      process.exit(1);
    } else {
      //
      // ------------------------------------------------------------------------------------------------//
      //
      const customExpress = require('./config/custom-express');
      const http = customExpress();
      const serverConfig = require("./config/server.config.json");
      const Sessions = require("./sessions.js");
      //
      // ------------------------------------------------------------------------------------------------//
      //
      http.listen(serverConfig.port, serverConfig.host, function(err) {
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
    const serverConfig = require("./config/server.config.json");
    const Sessions = require("./sessions.js");
    //
    // ------------------------------------------------------------------------------------------------//
    //
    http.listen(serverConfig.port, serverConfig.host, function(err) {
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