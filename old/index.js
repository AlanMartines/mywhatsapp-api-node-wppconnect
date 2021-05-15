//
// Configuração dos módulos
const fs = require('fs');
const session = require('cookie-session');
const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const http = require('http');
const https = require('https');
const cors = require('cors');
const path = require('path');
//
fs.access("./config/server.config.json", fs.constants.F_OK, (err) => {
  if (err) {
    if (err.code === 'ENOENT') {
      console.error('- Arquivo "./config/server.config.json" não existe');
      var modelo = {
        "_comment_engine": "Configuração da engine VENOM ou WPPCONNECT",
        "engine": "VENOM",
        "_comment_host": "Configuração do host",
        "host": "0.0.0.0",
        "port": "9000",
        "https": false,
        "_comment_jsonbin": "Configuração do jsonbin",
        "jsonbinio_bin_id": null,
        "jsonbinio_secret_key": null,
        "_comment_jwt": "Configuração do jwt",
        "jwt_secret": "09f26e402586e2faa8da4c98a35f1b20d6b033c60",
        "_comment_mongodb": "Configuração do mongo db",
        "local_mongo_conn_url": "mongodb://localhost:27017/",
        "mongo_db_name": "mywhats-api-node",
        "_comment_ssl": "Configuração dos certificados key e csr",
        "ssl_key_patch": "sslcert/server.key",
        "ssl_csr_patch": "sslcert/server.crt"
      };
      console.log("- Modelo do arquivo de configuração:\n", modelo);
      process.exit(1);
    } else {
      console.error('- Arquivo "server.config.json" existe');
    }
  } else {
    console.error('- Arquivo "server.config.json" existe');
  }
});
//
/*
const privateKey = fs.readFileSync(path.join(__dirname, 'sslcert/localhost.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'sslcert/localhost.crt'), 'utf8');
const credentials = {
  key: privateKey,
  cert: certificate
};
*/
const server = http.createServer({}, app);
//const server = https.createServer(credentials, app);
//
const home = require("./routes/home.routes");
const pages = require("./routes/pages.routes");
const painel = require("./routes/painel.routes");
const sistem = require("./controllers/sistem.controller");
const auth = require("./controllers/auth.controller");
const projects = require("./controllers/projects.controller");
const Sessions = require("./sessions.js");
const serverConfig = require("./config/server.config.json");
//
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:9000",
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'],
    credentials: true
  },
  allowEIO3: true
});
//
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
// Handlebars
app.engine('handlebars', handlebars({
  extname: 'handlebars',
  defaultView: 'index',
  defaultLayout: 'index',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine', 'handlebars');
//
// Public
app.use(express.static(path.join(__dirname, "public")));
//
// Listen both http & https ports
if (serverConfig.https === true) {
  //with ssl
  //
  server.listen(serverConfig.port, serverConfig.host, function(err) {
    if (err) {
      console.log(err);
    } else {
      const host = server.address().address;
      const port = server.address().port;
      console.log(`- HTTPS Server running on: ${host}:${port}`);
    }
  });
  //
} else {
  //http
  //
  server.listen(serverConfig.port, serverConfig.host, function(err) {
    if (err) {
      console.log(err);
    } else {
      const host = server.address().address;
      const port = server.address().port;
      console.log(`- HTTP Server running on: ${host}:${port}`);
    }
  });
  //
} // End the server web
//
// Rotas
app.use("/", home);
app.use("/pages", pages);
app.use("/painel", painel);
app.use("/sistema", sistem);
app.use("/auth", auth);
app.use("/projects", projects);
//
app.use((req, res, next) => {
  req.io = io;
  next();
});
//
io.on('connection', sock => {
  console.log(`- ID: ${sock.id} connected`);

  sock.on('event', data => {
    console.log(data);
  });

  sock.on('disconnect', () => {
    console.log(`- ID: ${sock.id} disconnected`);
  });
});
//
app.get("/test", async (req, res) => {
  res.render("painel/io");
});
//
//
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
//