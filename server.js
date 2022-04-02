const fs = require('fs-extra');
const express = require('express');
require('express-async-errors');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const path = require('path');
//
const http = require('http').Server(app);
// https://www.scaleway.com/en/docs/tutorials/socket-io/
const io = require('socket.io')(http, {
	cors: {
		origins: ["*"],
		methods: ["GET", "POST"],
		transports: ['websocket', 'polling'],
		credentials: true
	},
	allowEIO3: true
});
//
const {
	yo
} = require('yoo-hoo');
//
const config = require('./config.global');
const startAll = require("./middleware/startup.js");
//
yo('My-WhatsApp', {
	color: 'rainbow',
	spacing: 1,
});
//
// ------------------------------------------------------------------------------------------------//
//
fs.access(".env", fs.constants.F_OK, async (err) => {
	if (err && err.code === 'ENOENT') {
		console.error('- Arquivo ".env');
		var modelo = `
NODE_EN=production
#
# Defina o HOST aqui caso voce utilize uma VPS deve ser colocado o IP da VPS
# Exemplos:
# HOST=204.202.54.2 => IP da VPS, caso esteja usando virtualização via hospedagem
# HOST=10.0.0.10 => IP da VM, caso esteja usando virtualização
# HOST=localhost => caso esteja usando na sua proprima maquina local
HOST=localhost
#
# Defina o numero da porta a ser usada pela API.
PORT=9001
#
# Redis config => NÃO MEXER NA VARIAVEL REDIS_URL
REDIS_URL=redis://localhost:6379
#
# CASO UTILIZE CERTIFICADO SSL COM REDIRECIONAMENTO DE PORTA, DEVE PREENCHER A VARIAVEL DOMAIN_SSL
# CASO DE NÃO SER CONFIGURADO UM DOMÍNIO MATENHA A VARIAVEL DOMAIN_SSL VAZIA
# Exemplos:
# DOMAIN_SSL=api.meudomai.com.br ou meudomai.com.br
# DOMAIN_SSL=
DOMAIN_SSL=
#
# Define se o qrcode vai ser mostrado no terminal
VIEW_QRCODE_TERMINAL=0
#
# Device name
DEVICE_NAME='My-Whatsapp'
#
# Auto close
AUTO_CLOSE=60000
#
# Chave de segurança para validação no JWT
JWT_SECRET=09f26e402586e2faa8da4c98a35f1b20d6b033c60
#
# Validate in terminal false or true
VALIDATE_MYSQL=0
#
# mysql ou mariabd
MYSQL_ENGINE=mysql
#
# Vesão
MYSQL_VERSION=latest
#
# O host do banco. Ex: localhost
MYSQL_HOST=localhost
#
# Port do banco. Ex: 3306
MYSQL_PORT=3306
#
# Um usuário do banco. Ex: user
MYSQL_USER=mywhatsappapi
#
# A senha do usuário do banco. Ex: user123
MYSQL_PASSWORD=TuUep8KkjCtAA@
#
# A base de dados a qual a aplicação irá se conectar. Ex: node_mysql
MYSQL_DATABASE=mywhatsapp-api
#
# Time Zone
MYSQL_TIMEZONE='-04:00'
#
# Time Zone
TZ='America/Sao_Paulo'
#
# Gag image
TAG=1.0.0
#
# browserWSEndpoint Ex.: ws://127.0.0.1:3000
BROWSER_WSENDPOINT=
#
# Default 1
MAX_CONCURRENT_SESSIONS=1
#
# Set name instace for use ecosystem.config.js
NAME_INSTANCES=ApiWPPConnectClus
#
# Set count instace for use ecosystem.config.js
INSTANCES=1
#
# Caso queira que ao iniciar a API todas as sessões salvas sejam inicializadas automaticamente
START_ALL_SESSIONS=0
#
# Caso queira forçar a reconexão da API em caso de desconexão do WhatsApp defina true
FORCE_CONNECTION_USE_HERE=0
`;
		console.log("- Modelo do arquivo de configuração:\n", modelo);
		process.exit(1);
	} else {
		//
		// ------------------------------------------------------------------------------------------------//
		//
		try {
			//
			const sistem = require("./controllers/sistem.controller");
			//
			// Body Parser
			app.use(cors());
			app.use(bodyParser.json({
				limit: '50mb',
				type: 'application/json'
			}));
			app.use(bodyParser.urlencoded({
				extended: true
			}));
			//
			// Express Parser
			app.use(express.json({
				limit: '50mb',
				extended: true
			}));
			//
			app.use(express.urlencoded({
				limit: '50mb',
				extended: true,
				parameterLimit: 50000
			}));
			// Rotas
			app.set('view engine', 'hbs');
			app.engine('hbs', exphbs({extname: '.hbs'}));
			app.use('/public', express.static(__dirname + '/public'));
			//
			app.use((req, res, next) => {
				req.io = io;
				next();
			});
			//
			app.use((err, req, res, next) => {
				res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
				res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
				//
				if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
					//
					//console.error(err);
					res.setHeader('Content-Type', 'application/json');
					return res.status(404).json({
						"Status": {
							"result": "error",
							"state": "FAILURE",
							"status": "notProvided",
							"message": "Json gerado de forma incorreta, efetue a correção e tente novamente"
						}
					});
				}
				//
				next();
			});
			//
			//
			app.get('/', function (req, res) {
				//res.status(200).send('Server WPPConnect is running API. https://github.com/AlanMartines/mywhatsapp-api-node-wppconnect');
				res.sendFile(path.join(__dirname, './views/index.html'));
			});
			//
			app.use("/sistema", sistem);
			//
			const sockets = {};
			//socket
			//
			//cria um callback para quando alguém conectar
			io.on('connection', (socket) => {
				//adiciona todas os id's do socket na variavel sockets
				sockets[socket.id] = socket;
				console.log('- Abriu conexão');
				console.log('- Socketid ' + socket.id);
			});
			//
			//socket
			io.on('connection', (socket) => {
				socket.on('disconnect', function () {
					console.log('- Fechou conexão');
					console.log('- Socketid ' + socket.id);
				});
			});
			//
			app.get('/Start', function (req, res, next) {
				res.render('index', {
					port: config.PORT,
					host: config.HOST,
					host_ssl: config.DOMAIN_SSL,
					validate_mysql: parseInt(config.VALIDATE_MYSQL),
				});
			});
			//
			//
			// ------------------------------------------------------------------------------------------------//
			//
			http.listen(config.PORT, config.HOST, async function (err) {
				if (err) {
					console.log(err);
				} else {
					const host = http.address().address;
					const port = http.address().port;
					console.log(`- HTTP Server running on: ${host}:${port}`);
				}

				if (parseInt(config.START_ALL_SESSIONS) == true) {
					let result = await startAll.startAllSessions();
				}
			});
		} catch (error) {
			console.log('- Não foi fossivel iniciar o sistema');
			console.log(error);
			process.exit(1);
		}
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