//
// Configuração dos módulos
const express = require('express');
require('express-async-errors');
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
const sistem = require("../controllers/sistem.controller");
//
app.use(cors());
app.use(bodyParser.json({limit: '100mb', type: 'application/json'}));
app.use(bodyParser.urlencoded({ extended: true }));
//
// Express Parser
app.use(express.json({
	limit: '100mb',
	extended: true
}));
//
app.use(express.urlencoded({
	limit: '100mb',
	extended: true
}));
// Rotas
//
app.use((req, res, next) => {
	req.io = io;
	next();
});
//
module.exports = () => {
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
		res.sendFile(path.join(__dirname, '/index.html'));
	});
	//
	app.use("/sistema", sistem);
	//
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
	//
	return http
}