const fs = require('fs-extra');
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
DEVICE_NAME='My Whatsapp'
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
MYSQL_ENGINE=mariadb
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
		try{
		const customExpress = require('./config/custom-express');
		const http = customExpress();
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
	}catch(error){
		console.log('- Não foi fossivel iniciar o sistema');
		console.log(error.message);
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
	/*
	if (options.cleanup) {
		console.log("- Cleanup");
		await Sessions.getSessions().forEach(async session => {
			await Sessions.closeSession(session.sessionName);
		});
	}
	*/
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