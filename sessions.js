//
// Configuração dos módulos
const config = require('./config.global');
const events = require('./controllers/events');
const webhooks = require('./controllers/webhooks.js');
const fnSocket = require('./controllers/fnSockets');
const fs = require('fs-extra');
const rimraf = require("rimraf");
const sleep = require('sleep-promise');
const {
	forEach
} = require('p-iteration');
//const PQueue = require('p-queue');
const {default: pQueue} = require('p-queue');
if (fs.existsSync('./wppconnect/dist/index.js')) {
	//
	console.log("- Wppconnect is patch");
	var wppconnect = require('./wppconnect/dist/index');
	//
} else {
	console.log("- Wppconnect is package");
	var wppconnect = require('@wppconnect-team/wppconnect');
}
//
const tokenPatch = "/usr/local/tokens";
//
// ------------------------------------------------------------------------------------------------------- //
//
async function saudacao() {
	//
	var data = new Date();
	var hr = data.getHours();
	//
	if (hr >= 0 && hr < 12) {
		var saudacao = "Bom dia";
		//
	} else if (hr >= 12 && hr < 18) {
		var saudacao = "Boa tarde";
		//
	} else if (hr >= 18 && hr < 23) {
		var saudacao = "Boa noite";
		//
	} else {
		var saudacao = "---";
		//
	}
	return saudacao;
}
//
async function osplatform() {
	//
	var opsys = process.platform;
	if (opsys == "darwin") {
		opsys = "MacOS";
	} else if (opsys == "win32" || opsys == "win64") {
		opsys = "Windows";
	} else if (opsys == "linux") {
		opsys = "Linux";
	}
	//
	console.log("- Sistema operacional", opsys) // I don't know what linux is.
	console.log("-", os.type());
	console.log("-", os.release());
	console.log("-", os.platform());
	//
	return opsys;
}
//
// ------------------------------------------------------------------------------------------------------- //
//
async function updateStateDb(state, status, AuthorizationToken) {
	//
	const date_now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	console.log("- Date:", date_now);
	//
	//
	const sql = "UPDATE tokens SET state=?, status=?, lastactivit=? WHERE token=?";
	const values = [state, status, date_now, AuthorizationToken];
	//
	if (parseInt(config.VALIDATE_MYSQL) == true) {
		console.log('- Atualizando status');
		const conn = require('./config/dbConnection').promise();
		const resUpdate = await conn.execute(sql, values);
		//conn.end();
		//conn.release();
		if (resUpdate) {
			console.log('- Status atualizado');
		} else {
			console.log('- Status não atualizado');
		}
	}
	//
}
//
// ------------------------------------------------------------------------------------------------------- //
//
async function deletaToken(filePath, filename) {
	//
	fs.unlink(`${filePath}/${filename}`, function (err) {
		if (err && err.code == 'ENOENT') {
			// file doens't exist
			console.log(`- Arquivo "${filePath}/${filename}" não existe`);
		} else if (err) {
			// other errors, e.g. maybe we don't have enough permission
			console.log(`- Erro ao remover arquivo "${filePath}/${filename}"`);
		} else {
			console.log(`- Arquivo json "${filePath}/${filename}" removido com sucesso`);
		}
	});
}
//
// ------------------------------------------------------------------------------------------------------- //
//
async function deletaCache(filePath, userDataDir) {
	//
	if (fs.existsSync(`${filePath}/${userDataDir}`)) {
		//
		rimraf(`${filePath}/${userDataDir}`, (error) => {
			if (error) {
				console.error(`- Diretório "${filePath}/${userDataDir}" não removido`);
			} else {
				console.log(`- Diretórios "${filePath}/${userDataDir}" removida com sucesso`);
			}
		});
		//
	} else {
		console.error(`- Diretório "${filePath}/${userDataDir}" não encontrado`);
	}
	//
}
//
// ------------------------------------------------------------------------------------------------------- //
//
module.exports = class Sessions {
	//
	static async ApiStatus(SessionName) {
		console.log("- Status");
		var session = Sessions.getSession(SessionName);

		if (session) { //só adiciona se não existir
			if (session.state == "CONNECTED") {
				return {
					result: "info",
					state: session.state,
					status: session.status,
					message: "Sistema iniciado e disponivel para uso"
				};
			} else if (session.state == "STARTING") {
				return {
					result: "info",
					state: session.state,
					status: session.status,
					message: "Sistema iniciando e indisponivel para uso"
				};
			} else if (session.state == "QRCODE") {
				return {
					result: "warning",
					state: session.state,
					status: session.status,
					message: "Sistema aguardando leitura do QR-Code"
				};
			} else {
				switch (session.status) {
					case 'isLogged':
						return {
							result: "success",
							state: session.state,
							status: session.status,
							message: "Sistema iniciado e disponivel para uso"
						};
						break;
					case 'notLogged':
						return {
							result: "error",
							state: session.state,
							status: session.status,
							message: "Sistema indisponivel para uso"
						};
						break;
					case 'browserClose':
						return {
							result: "info",
							state: session.state,
							status: session.status,
							message: "Navegador interno fechado"
						};
						break;
					case 'qrReadSuccess':
						return {
							result: "success",
							state: session.state,
							status: session.status,
							message: "Verificação do QR-Code feita com sucesso"
						};
						break;
					case 'qrReadFail':
						return {
							result: "warning",
							state: session.state,
							status: session.status,
							message: "Falha na verificação do QR-Code"
						};
						break;
					case 'qrRead':
						return {
							result: "warning",
							state: session.state,
							status: session.status,
							message: "Sistema aguardando leitura do QR-Code"
						};
						break;
					case 'autocloseCalled':
						return {
							result: "info",
							state: session.state,
							status: session.status,
							message: "Navegador interno fechado"
						};
						break;
					case 'desconnectedMobile':
						return {
							result: "info",
							state: session.state,
							status: session.status,
							message: "Dispositivo desconectado"
						};
						break;
					case 'deleteToken':
						return {
							result: "info",
							state: session.state,
							status: session.status,
							message: "Token de sessão removido"
						};
						break;
					case 'chatsAvailable':
						return {
							result: "success",
							state: session.state,
							status: session.status,
							message: "Sistema iniciado e disponivel para uso"
						};
						break;
					case 'deviceNotConnected':
						return {
							result: "info",
							state: session.state,
							status: session.status,
							message: "Dispositivo desconectado"
						};
						break;
					case 'serverWssNotConnected':
						return {
							result: "info",
							state: session.state,
							status: session.status,
							message: "O endereço wss não foi encontrado"
						};
						break;
					case 'noOpenBrowser':
						return {
							result: "error",
							state: session.state,
							status: session.status,
							message: "Não foi encontrado o navegador ou falta algum comando no args"
						};
						break;
					case 'serverClose':
						return {
							result: "info",
							state: session.state,
							status: session.status,
							message: "O cliente se desconectou do wss"
						};
						break;
					case 'OPENING':
						return {
							result: "warning",
							state: session.state,
							status: session.status,
							message: "'Sistema iniciando e indisponivel para uso'"
						};
						break;
					case 'CONFLICT':
						return {
							result: "info",
							state: session.state,
							status: session.status,
							message: "Dispositivo conectado em outra sessão, reconectando"
						};
						break;
					case 'UNPAIRED':
					case 'UNLAUNCHED':
					case 'UNPAIRED_IDLE':
						return {
							result: "warning",
							state: session.state,
							status: session.status,
							message: "Dispositivo desconectado"
						};
						break;
					case 'DISCONNECTED':
						return {
							result: "info",
							state: session.state,
							status: session.status,
							message: "Dispositivo desconectado"
						};
						break;
					case 'SYNCING':
						return {
							result: "warning",
							state: session.state,
							status: session.status,
							message: "Dispositivo sincronizando"
						};
						break;
					case 'CLOSED':
						return {
							result: "info",
							state: session.state,
							status: session.status,
							message: "O cliente fechou a sessão ativa"
						};
						break;
					default:
						//
						return {
							result: 'error',
							state: 'NOTFOUND',
							status: 'notLogged',
							message: 'Sistema Off-line'
						};
					//
				}
			}
		} else {
			return {
				result: 'error',
				state: 'NOTFOUND',
				status: 'notLogged',
				message: 'Sistema Off-line'
			};
		}
	} //status
	//
	// ------------------------------------------------------------------------------------------------------- //
	//
	static async Start(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion) {
		Sessions.sessions = Sessions.sessions || []; //start array

		var session = Sessions.getSession(SessionName);

		//
		if (session == false) {
			//create new session
			session = await Sessions.addSesssion(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion);
			//
		} else if (["CLOSED"].includes(session.state)) {
			//restart session
			console.log("- State: CLOSED");
			session.state = "CLOSED";
			session.status = "notLogged";
			session.qrcode = null;
			session.attempts = 0;
			session.message = "Sistema iniciando e indisponivel para uso";
			session.prossesid = null;
			//
			console.log('- Nome da sessão:', session.name);
			console.log('- State do sistema:', session.state);
			console.log('- Status da sessão:', session.status);
			//
			session.client = Sessions.initSession(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion);
			Sessions.setup(socket, SessionName);
			//
		} else if (["CONFLICT", "UNPAIRED", "UNLAUNCHED", "UNPAIRED_IDLE"].includes(session.state)) {
			//
			session.state = "CLOSED";
			session.status = 'notLogged';
			session.qrcode = null;
			session.message = 'Sistema desconectado';
			//
			console.log('- Nome da sessão:', session.name);
			console.log('- State do sistema:', session.state);
			console.log('- Status da sessão:', session.status);
			//
			session.client.then(client => {
				console.log("- Client UseHere");
				client.useHere();
			});
			//
			session.client = Sessions.initSession(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion);
			//
		} else if (["DISCONNECTED"].includes(session.state)) {
			//
			//restart session
			session.state = "CLOSE";
			session.status = "notLogged";
			session.qrcode = null;
			session.attempts = 0;
			session.message = 'Sistema desconectado';
			session.prossesid = null;
			//
			console.log('- Nome da sessão:', session.name);
			console.log('- State do sistema:', session.state);
			console.log('- Status da sessão:', session.status);
			//
			session.client = Sessions.initSession(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion);
			Sessions.setup(socket, SessionName);
			//
		} else if (["NOTFOUND"].includes(session.state)) {
			//
			//restart session
			session.state = "CLOSE";
			session.status = "notLogged";
			session.qrcode = null;
			session.attempts = 0;
			session.message = 'Sistema desconectado';
			session.prossesid = null;
			//
			console.log('- Nome da sessão:', session.name);
			console.log('- State do sistema:', session.state);
			console.log('- Status da sessão:', session.status);
			//
			session = await Sessions.addSesssion(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion);
			//
		} else {
			//
			console.log('- Nome da sessão:', session.name);
			console.log('- State do sistema:', session.state);
			console.log('- Status da sessão:', session.status);
			//
		}
		//
		await updateStateDb(session.state, session.status, AuthorizationToken);
		//
		return session;
	} //start
	//
	// ------------------------------------------------------------------------------------------------------- //
	//
	static async addSesssion(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion) {
		console.log("- Adicionando sessão");
		var newSession = {
			AuthorizationToken: AuthorizationToken,
			MultiDevice: MultiDevice,
			name: SessionName,
			process: null,
			qrcode: null,
			client: false,
			result: null,
			tokenPatch: null,
			state: null,
			status: null,
			message: null,
			attempts: 0,
			browserSessionToken: null,
			funcoesSocket: null,
			wh_status: null,
			wh_message: null,
			wh_qrcode: null,
			wh_connect: null,
		}
		//
		Sessions.sessions.push(newSession);
		console.log("- Nova sessão: " + SessionName);

		//setup session
		newSession.client = Sessions.initSession(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion);
		Sessions.setup(socket, SessionName);

		return newSession;
	} //addSession
	//
	// ------------------------------------------------------------------------------------------------//
	//
	static getSession(SessionName) {
		var foundSession = false;
		if (Sessions.sessions)
			Sessions.sessions.forEach(session => {
				if (SessionName == session.name) {
					foundSession = session;
				}
			});
		return foundSession;
	} //getSession
	//
	// ------------------------------------------------------------------------------------------------//
	//
	static getSessions() {
		if (Sessions.sessions) {
			return Sessions.sessions;
		} else {
			return [];
		}
	} //getSessions
	//
	// ------------------------------------------------------------------------------------------------------- //
	//
	static async initSession(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion) {
		console.log("- Iniciando sessão");
		console.log("- Multi-Device:", MultiDevice);
		var session = Sessions.getSession(SessionName);
		session.browserSessionToken = null;
		session.AuthorizationToken = AuthorizationToken;
		session.state = 'STARTING';
		session.status = 'notLogged';
		//
		session.process = new pQueue({ concurrency: 2 });
		//
		//
		/*
			╔═╗┌─┐┌┬┐┬┌─┐┌┐┌┌─┐┬    ╔═╗┬─┐┌─┐┌─┐┌┬┐┌─┐  ╔═╗┌─┐┬─┐┌─┐┌┬┐┌─┐┌┬┐┌─┐┬─┐┌─┐
			║ ║├─┘ │ ││ ││││├─┤│    ║  ├┬┘├┤ ├─┤ │ ├┤   ╠═╝├─┤├┬┘├─┤│││├┤  │ ├┤ ├┬┘└─┐
			╚═╝┴   ┴ ┴└─┘┘└┘┴ ┴┴─┘  ╚═╝┴└─└─┘┴ ┴ ┴ └─┘  ╩  ┴ ┴┴└─┴ ┴┴ ┴└─┘ ┴ └─┘┴└─└─┘
	 */
		//
		if (MultiDevice == true || MultiDevice == 'true') {
			//
			await deletaToken(`${tokenPatch}`, `${SessionName}.data.json`);
			//
		} else if (MultiDevice == false || typeof MultiDevice == 'undefined') {
			//
			await deletaCache(`${tokenPatch}`, `WPP-${SessionName}`);
			//
		}
		//
		try {
			const client = await wppconnect.create({
				session: SessionName,
				catchQR: async (base64Qrimg, asciiQR, attempts, urlCode) => {
					//
					console.log("- Saudação:", await saudacao());
					//
					console.log('- Nome da sessão:', SessionName);
					//
					session.state = "QRCODE";
					session.status = "qrRead";
					session.message = 'Sistema iniciando e indisponivel para uso';
					//
					console.log('- Número de tentativas de ler o qr-code:', attempts);
					session.attempts = attempts;
					//
					console.log("- Captura do QR-Code");
					//console.log(base64Qrimg);
					session.qrcode = base64Qrimg;
					//
					console.log("- Captura do asciiQR");
					// Registrar o QR no terminal
					//console.log(asciiQR);
					session.CodeasciiQR = asciiQR;
					//
					console.log("- Captura do urlCode");
					// Registrar o QR no terminal
					//console.log(urlCode);
					session.CodeurlCode = urlCode;
					//
					if (attempts <= 2) {
						await updateStateDb(session.state, session.status, session.AuthorizationToken);
					}
					//
					var qrCode = base64Qrimg.replace('data:image/png;base64,', '');
					const imageBuffer = Buffer.from(qrCode, 'base64');
					//
					webhooks?.wh_qrcode(Sessions.getSession(SessionName), base64Qrimg, urlCode);
					this.exportQR(socket, base64Qrimg, SessionName, attempts);
					//
				},
				statusFind: async (statusSession, session_wppconnect) => {
					console.log('- Status da sessão:', statusSession);
					//return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
					//Create session wss return "serverClose" case server for close
					console.log('- Session name: ', session_wppconnect);
					webhooks?.wh_connect(Sessions.getSession(SessionName), statusSession)
					//
					//
					switch (statusSession) {
						case 'isLogged':
						case 'qrReadSuccess':
						case 'inChat':
						case 'chatsAvailable':
							session.result = "success";
							session.state = "CONNECTED";
							session.status = statusSession
							session.qrcode = null;
							session.CodeasciiQR = null;
							session.CodeurlCode = null;
							session.message = "Sistema iniciado e disponivel para uso";
							//
							await updateStateDb(session.state, session.status, session.AuthorizationToken);
							//
							break;
						case 'autocloseCalled':
						case 'browserClose':
						case 'serverClose':
						case 'autocloseCalled':
							session.result = "info";
							session.state = "CLOSED";
							session.status = statusSession;
							session.qrcode = null;
							session.CodeasciiQR = null;
							session.CodeurlCode = null;
							session.message = "Sistema fechado";
							//
							await updateStateDb(session.state, session.status, session.AuthorizationToken);
							//
							break;
						case 'qrReadFail':
						case 'notLogged':
						case 'deviceNotConnected':
						case 'desconnectedMobile':
						case 'deleteToken':
							//session.client = false;
							session.result = "info";
							session.state = "DISCONNECTED";
							session.status = statusSession;
							session.qrcode = null;
							session.message = "Dispositivo desconetado";
							//
							await updateStateDb(session.state, session.status, session.AuthorizationToken);
							//
							break;
						default:
							//session.client = false;
							session.result = "info";
							session.state = "DISCONNECTED";
							session.status = statusSession;
							session.qrcode = null;
							session.message = "Dispositivo desconetado";
							//
							await updateStateDb(session.state, session.status, session.AuthorizationToken);
						//
					}
				},
				whatsappVersion: whatsappVersion ? `${whatsappVersion}` : '', // whatsappVersion: '2.2142.12',
				deviceName: `${config.DEVICE_NAME}`,
				tokenStore: 'memory',
				headless: true, // Headless chrome
				devtools: false, // Open devtools by default
				useChrome: true, // If false will use Chromium instance
				debug: false, // Opens a debug session
				logQR: parseInt(config.VIEW_QRCODE_TERMINAL), // Logs QR automatically in terminal
				browserWS: '', // If u want to use browserWSEndpoint
				browserArgs: [
					'--log-level=3',
					'--no-default-browser-check',
					'--disable-site-isolation-trials',
					'--no-experiments',
					'--ignore-gpu-blacklist',
					'--ignore-ssl-errors',
					'--ignore-certificate-errors',
					'--ignore-certificate-errors-spki-list',
					'--disable-gpu',
					'--disable-extensions',
					'--disable-default-apps',
					'--enable-features=NetworkService',
					'--disable-setuid-sandbox',
					'--no-sandbox',
					// Extras
					'--disable-webgl',
					'--disable-threaded-animation',
					'--disable-threaded-scrolling',
					'--disable-in-process-stack-traces',
					'--disable-histogram-customizer',
					'--disable-gl-extensions',
					'--disable-composited-antialiasing',
					'--disable-canvas-aa',
					'--disable-3d-apis',
					'--disable-accelerated-2d-canvas',
					'--disable-accelerated-jpeg-decoding',
					'--disable-accelerated-mjpeg-decode',
					'--disable-app-list-dismiss-on-blur',
					'--disable-accelerated-video-decode',
					'--disable-infobars',
					'--window-position=0,0',
					'--ignore-certifcate-errors',
					'--ignore-certifcate-errors-spki-list',
					'--disable-dev-shm-usage',
					'--disable-gl-drawing-for-tests',
					'--incognito',
					//Outros
					'--disable-web-security',
					'--aggressive-cache-discard',
					'--disable-cache',
					'--disable-application-cache',
					'--disable-offline-load-stale-cache',
					'--disk-cache-size=0',
					'--disable-background-networking',
					'--disable-sync',
					'--disable-translate',
					'--hide-scrollbars',
					'--metrics-recording-only',
					'--mute-audio',
					'--no-first-run',
					'--safebrowsing-disable-auto-update',
				],
				puppeteerOptions: {
					userDataDir: `${tokenPatch}/WPP-${SessionName}`, // or your custom directory
					browserWSEndpoint: config.BROWSER_WSENDPOINT ? `${config.BROWSER_WSENDPOINT}` : undefined,
				},
				disableWelcome: false, // Option to disable the welcoming message which appears in the beginning
				updatesLog: true, // Logs info updates automatically in terminal
				autoClose: parseInt(config.AUTO_CLOSE), // Automatically closes the wppconnect only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
				tokenStore: 'file', // Define how work with tokens, that can be a custom interface
				folderNameToken: `${tokenPatch}`, //folder name when saving tokens
			}).then(async (client) => {

				let phone = await client?.getWid();
				let browserSessionToken = await client.getSessionTokenBrowser();
				console.log("- Token WPPConnect:\n", JSON.parse(JSON.stringify(browserSessionToken)));
				session.state = "CONNECTED";
				session.browserSessionToken = browserSessionToken;
				//
				webhooks?.wh_connect(Sessions.getSession(SessionName), 'CONNECTED', phone);
				events?.receiveMessage(Sessions.getSession(SessionName), client, socket);
				events?.statusMessage(Sessions.getSession(SessionName), client, socket);
				events?.statusConnection(Sessions.getSession(SessionName), client, socket);
				//
				console.log("- Sessão criada com sucesso");
				//
				socket.emit('status',
					{
						status: session.status,
						SessionName: SessionName
					}
				);
				//
				return client;
			}).catch(async (error) => {
				session.state = "NOTFOUND";
				session.status = "notLogged";
				session.qrcode = null;
				session.attempts = 0;
				session.message = 'Sistema desconectado';
				console.log("- Sessão não criada");
				//
				socket.emit('status',
					{
						status: session.status,
						SessionName: SessionName
					}
				);
				//
			});
			// Levels: 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'
			// All logs: 'silly'
			wppconnect.defaultLogger.level = 'silly';
			//
			return client;
		} catch (error) {
			session.state = "NOTFOUND";
			session.status = "notLogged";
			session.qrcode = null;
			session.attempts = 0;
			session.message = 'Sistema desconectado';
			console.log("- Instância não criada:", error.message);
			//
			socket.emit('status',
				{
					status: session.state,
					SessionName: SessionName
				}
			);
		}
	} //initSession
	//
	static async exportQR(socket, qrCode, SessionName, attempts) {
		qrCode = qrCode.replace('data:image/png;base64,', '');
		const imageBuffer = Buffer.from(qrCode, 'base64');
		socket.emit('qrCode',
			{
				data: 'data:image/png;base64,' + imageBuffer.toString('base64'),
				SessionName: SessionName,
				attempts: attempts,
				message: 'QRCode Iniciado, Escanei por favor...'
			}
		);
	};
	//
	// ------------------------------------------------------------------------------------------------//
	//
	/*
		╔═╗┌─┐┌┬┐┌┬┐┬┌┐┌┌─┐  ┌─┐┌┬┐┌─┐┬─┐┌┬┐┌─┐┌┬┐
		║ ╦├┤  │  │ │││││ ┬  └─┐ │ ├─┤├┬┘ │ ├┤  ││
		╚═╝└─┘ ┴  ┴ ┴┘└┘└─┘  └─┘ ┴ ┴ ┴┴└─ ┴ └─┘─┴┘
	*/
	//
	static async setup(socket, SessionName) {
		var session = Sessions.getSession(SessionName);
		await session.client.then(async (client) => {
			/*
			try {
				//
				events?.receiveMessage(session, client, socket);
				events?.statusMessage(session, client, socket);
				events?.statusConnection(session, client, socket);
				events?.extraEvents(session, client, socket);
				//
			} catch (error) {
				session.state = "NOTFOUND";
				session.status = "notLogged";
				session.qrcode = null;
				session.attempts = 0;
				session.message = 'Sistema desconectado';
				console.log("- Instância não iniciada:", error.message);
			}
			*/
		});
	} //setup
	//
	// ------------------------------------------------------------------------------------------------//
	//
	static async closeSession(SessionName) {
		console.log("- Fechando sessão");
		var session = Sessions.getSession(SessionName);
		var closeSession = await session.client.then(async client => {
			try {
				const strClosed = await client.close();
				//
				console.log("- Close:", strClosed);
				//
				if (strClosed) {
					//
					session.state = "CLOSED";
					session.status = "CLOSED";
					session.client = false;
					session.qrcode = null;
					console.log("- Sessão fechada");
					//
					var returnClosed = {
						result: "success",
						state: session.state,
						status: session.status,
						qrcode: session.qrcode,
						message: "Sessão fechada com sucesso"
					};
					//
					await updateStateDb(session.state, session.status, session.AuthorizationToken);
					//
				} else {
					//
					var returnClosed = {
						result: "error",
						state: session.state,
						status: session.status,
						qrcode: session.qrcode,
						message: "Erro ao fechar sessão"
					};
					//
				}
				//
				return returnClosed;
				//
			} catch (error) {
				console.log("- Erro ao fechar sessão");
				//
				return {
					result: "error",
					state: session.state,
					status: session.status,
					qrcode: session.qrcode,
					message: "Erro ao fechar sessão"
				};
				//
			}
		});
		//
		return closeSession;
	} //closeSession
	//
	// ------------------------------------------------------------------------------------------------//
	//
	static async logoutSession(SessionName) {
		console.log("- Fechando sessão");
		var session = Sessions.getSession(SessionName);
		var LogoutSession = await session.client.then(async client => {
			try {
				const strLogout = await client.logout();
				if (strLogout) {
					//
					const strClosed = await client.close();
					//
					session.state = "DISCONNECTED";
					session.status = "DISCONNECTED";
					session.client = false;
					session.qrcode = null;
					console.log("- Sessão desconetada");
					//
					var returnLogout = {
						result: "success",
						state: session.state,
						status: session.status,
						qrcode: session.qrcode,
						message: "Sessão desconetada"
					};
					//
				} else {
					//
					var returnLogout = {
						result: "error",
						state: session.state,
						status: session.status,
						message: "Erro ao desconetar sessão"
					};
					//
				}
				//
				//
				await deletaToken(`${tokenPatch}`, `${SessionName}.data.json`);
				await deletaCache(`${tokenPatch}`, `WPP-${SessionName}`);
				//
				//
				await updateStateDb(session.state, session.status, session.AuthorizationToken);
				//
				return returnLogout;
				//
			} catch (error) {
				console.log("- Erro ao desconetar sessão:", error.message);
				//
				return {
					result: "error",
					state: session.state,
					status: session.status,
					message: "Erro ao desconetar sessão"
				};
				//
			}
		});
		//
		await updateStateDb(session.state, session.status, session.AuthorizationToken);
		//
		return LogoutSession;
	} //LogoutSession
	//
	// ------------------------------------------------------------------------------------------------------- //
	//
	/*
	╔╗ ┌─┐┌─┐┬┌─┐  ╔═╗┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐  ┬ ┬┌─┐┌─┐┌─┐┌─┐
	╠╩╗├─┤└─┐││    ╠╣ │ │││││   │ ││ ││││└─┐  │ │└─┐├─┤│ ┬├┤
	╚═╝┴ ┴└─┘┴└─┘  ╚  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘└─┘  └─┘└─┘┴ ┴└─┘└─┘
	*/
	//
	// Enviar Contato
	static async sendContactVcard(
		SessionName,
		number,
		contact,
		namecontact
	) {
		console.log("- Enviando contato.");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var sendResult = await session.client.then(async client => {
			// Send contact
			return await client.sendContactVcard(
				number,
				contact,
				namecontact).then((result) => {
					//console.log('Result: ', result); //return object success
					//
					return {
						"erro": false,
						"status": 200,
						"number": number,
						"message": "Contato envido com sucesso."
					};
					//
				}).catch((erro) => {
					console.error("Error when:", erro); //return object error
					//
					return {
						"erro": true,
						"status": 404,
						"number": number,
						"message": "Erro ao enviar contato"
					};
					//
				});
		});
		return sendResult;
	} //sendContactVcard
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Enviar Lista Contato
	static async sendContactVcardList(
		SessionName,
		number,
		contactlistValid,
		contactlistInvalid

	) {
		console.log("- Enviando lista de contato.");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var sendResult = await session.client.then(async client => {
			// Send contact
			return await client.sendContactVcardList(
				number,
				contactlistValid,
				contactlistInvalid
			).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"canReceiveMessage": true,
					"contactlistValid": contactlistValid,
					"contactlistInvalid": contactlistInvalid,
					"message": "Lista de contatos validos envida com sucesso."
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"canReceiveMessage": false,
					"contactlistValid": contactlistValid,
					"contactlistInvalid": contactlistInvalid,
					"message": "Erro ao enviar lista de contatos validos"
				};
				//
			});
		});
		return sendResult;
	} //sendContactVcardList
	//
	// ------------------------------------------------------------------------------------------------//
	//
	//Enviar Texto
	static async sendText(
		SessionName,
		number,
		msg
	) {
		console.log("- Enviando menssagem de texto.");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var sendResult = await session.client.then(async client => {
			// Send basic text
			return await client.sendText(
				number,
				msg
			).then((result) => {
				//console.log("Result: ", result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"number": number,
					"message": "Menssagem envida com sucesso."
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//return { result: 'error', state: session.state, message: "Erro ao enviar menssagem" };
				//return (erro);
				//
				return {
					"erro": true,
					"status": 404,
					"number": number,
					"message": "Erro ao enviar menssagem"
				};
				//
			});
		});
		return sendResult;
	} //sendText
	//
	// ------------------------------------------------------------------------------------------------//
	//
	//Enviar localização
	static async sendLocation(
		SessionName,
		number,
		lat,
		long,
		local
	) {
		console.log("- Enviando localização.");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var sendResult = await session.client.then(async client => {
			// Send basic text
			return await client.sendLocation(
				number,
				lat,
				long,
				local
			).then((result) => {
				//console.log("Result: ", result); //return object success
				//return { result: "success", state: session.state, message: "Sucesso ao enviar menssagem" };
				//return (result);
				//
				return {
					"erro": false,
					"status": 200,
					"number": number,
					"message": "Localização envida com sucesso."
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//return { result: 'error', state: session.state, message: "Erro ao enviar menssagem" };
				//return (erro);
				//
				return {
					"erro": true,
					"status": 404,
					"number": number,
					"message": "Erro ao enviar localização."
				};
				//
			});
		});
		return sendResult;
	} //sendLocation
	//
	// ------------------------------------------------------------------------------------------------//
	//
	//Enviar links com preview
	static async sendLinkPreview(
		SessionName,
		number,
		link,
		detail
	) {
		console.log("- Enviando link.");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var sendResult = await session.client.then(async client => {
			// Send basic text
			return await client.sendLinkPreview(
				number,
				link,
				detail
			).then((result) => {
				//console.log("Result: ", result); //return object success
				//return { result: "success", state: session.state, message: "Sucesso ao enviar menssagem" };
				//return (result);
				//
				return {
					"erro": false,
					"status": 200,
					"number": number,
					"message": "Link envido com sucesso."
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//return { result: 'error', state: session.state, message: "Erro ao enviar menssagem" };
				//return (erro);
				//
				return {
					"erro": true,
					"status": 404,
					"number": number,
					"message": "Erro ao enviar link."
				};
				//
			});
		});
		return sendResult;
	} //sendLinkPreview
	//
	// ------------------------------------------------------------------------------------------------//
	//
	//Enviar Imagem
	static async sendImage(
		SessionName,
		number,
		filePath,
		fileName,
		caption
	) {
		console.log("- Enviando menssagem com imagem.");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultsendImage = await session.client.then(async (client) => {
			return await client.sendImage(
				number,
				filePath,
				fileName,
				caption
			).then((result) => {
				//console.log('Result: ', result); //return object success
				//return (result);
				//
				return {
					"erro": false,
					"status": 200,
					"number": number,
					"message": "Menssagem envida com sucesso."
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//return (erro);
				//
				return {
					"erro": true,
					"status": 404,
					"number": number,
					"message": "Erro ao enviar menssagem"
				};
				//
			});
		});
		return resultsendImage;
	} //sendImage
	//
	// ------------------------------------------------------------------------------------------------//
	//
	//Enviar arquivo
	static async sendFile(
		SessionName,
		number,
		filePath,
		originalname,
		caption
	) {
		console.log("- Enviando arquivo.");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultsendImage = await session.client.then(async (client) => {
			return await client.sendFile(
				number,
				filePath,
				originalname,
				caption
			).then((result) => {
				//console.log('Result: ', result); //return object success
				//return (result);
				//
				return {
					"erro": false,
					"status": 200,
					"number": number,
					"message": "Arquivo envido com sucesso."
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//return (erro);
				//
				return {
					"erro": true,
					"status": 404,
					"number": number,
					"message": "Erro ao enviar arquivo"
				};
				//
			});
		});
		return resultsendImage;
	} //sendFile
	//
	// ------------------------------------------------------------------------------------------------//
	//
	//Enviar Arquivo em Base64
	static async sendFileFromBase64(
		SessionName,
		number,
		base64Data,
		mimetype,
		originalname,
		caption
	) {
		console.log("- Enviando arquivo em Base64Data");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultSendFile = await session.client.then(async (client) => {
			return await client.sendFileFromBase64(
				number,
				"data:" + mimetype + ";base64," + base64Data,
				originalname,
				caption
			).then((result) => {
				//console.log('Result: ', result); //return object success
				//return (result);
				//
				return {
					"erro": false,
					"status": 200,
					"number": number,
					"message": "Arquivo envida com sucesso."
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//return (erro);
				//
				return {
					"erro": true,
					"status": 404,
					"number": number,
					"message": "Erro ao enviar arquivo"
				};
				//
			});
		});
		//
		return resultSendFile;
	} //sendFileFromBase64
	//
	// ------------------------------------------------------------------------------------------------//
	//
	/*
	╦═╗┌─┐┌┬┐┬─┐┬┌─┐┬  ┬┬┌┐┌┌─┐  ╔╦╗┌─┐┌┬┐┌─┐
	╠╦╝├┤  │ ├┬┘│├┤ └┐┌┘│││││ ┬   ║║├─┤ │ ├─┤
	╩╚═└─┘ ┴ ┴└─┴└─┘ └┘ ┴┘└┘└─┘  ═╩╝┴ ┴ ┴ ┴ ┴
	*/
	//
	// Recuperar contatos
	static async getAllContacts(
		SessionName
	) {
		console.log("- Obtendo todos os contatos!");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetAllContacts = await session.client.then(async client => {
			return await client.getAllContacts().then(async (result) => {
				//console.log('Result: ', result); //return object success
				//
				var getChatGroupNewMsg = [];
				//
				await forEach(result, async (resultAllContacts) => {
					//
					if (resultAllContacts.isMyContact === true || resultAllContacts.isMyContact === false) {
						//
						getChatGroupNewMsg.push({
							"user": resultAllContacts.id.user,
							"name": resultAllContacts.name,
							"shortName": resultAllContacts.shortName,
							"pushname": resultAllContacts.pushname,
							"formattedName": resultAllContacts.formattedName,
							"isMyContact": resultAllContacts.isMyContact,
							"isWAContact": resultAllContacts.isWAContact
						});
					}
					//
				});
				//
				return getChatGroupNewMsg;
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao recuperar contatos"
				};
				//
			});
			//
		});
		//
		return resultgetAllContacts;
	} //getAllContacts
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Recuperar grupos
	static async getAllGroups(
		SessionName
	) {
		console.log("- Obtendo todos os grupos!");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetAllGroups = await session.client.then(async client => {
			return await client.getAllGroups().then(async (result) => {
				//console.log('Result: ', result); //return object success
				//
				var getAllGroups = [];
				//
				await forEach(result, async (resultAllContacts) => {
					//
					if (resultAllContacts.isGroup === true) {
						//
						getAllGroups.push({
							"user": resultAllContacts.id.user,
							"name": resultAllContacts.name,
							"formattedName": resultAllContacts.contact.formattedName
						});
					}
					//
				});
				//
				return getAllGroups;
				//
			}).catch((erro) => {
				console.error('Error when sending: ', erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao recuperar grupos"
				};
				//
			});
			//
		});
		//
		return resultgetAllGroups;
	} //getAllGroups
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Returns browser session token
	static async getSessionTokenBrowser(SessionName) {
		console.log("- Obtendo  Session Token Browser.");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetSessionTokenBrowser = await session.client.then(async client => {
			return await client.getSessionTokenBrowser().then((result) => {
				//console.log('Result: ', result); //return object success
				return result;
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao recuperar token browser"
				};
				//
			});
		});
		return resultgetSessionTokenBrowser;
	} //getSessionTokenBrowser
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Chama sua lista de contatos bloqueados
	static async getBlockList(SessionName) {
		console.log("- Obtendo lista de contatos bloqueados");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetBlockList = await session.client.then(async client => {
			return await client.getBlockList().then((result) => {
				//console.log('Result: ', result); //return object success
				return result;
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao recuperar lista de contatos bloqueados"
				};
				//
			});
		});
		return resultgetBlockList;
	} //getBlockList
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Recuperar status
	static async getStatus(
		SessionName,
		number
	) {
		console.log("- Obtendo status!");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetStatus = await session.client.then(async client => {
			return await client.getStatus(number).then((result) => {
				//console.log('Result: ', result); //return object success
				return result;
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao recuperar status de contato"
				};
				//
			});
		});
		return resultgetStatus;
	} //getStatus
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Recuperar status do contato
	static async getNumberProfile(
		SessionName,
		number
	) {
		console.log("- Obtendo status do contato!");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetNumberProfile = await session.client.then(async client => {
			return await client.getNumberProfile(number).then((result) => {
				//console.log('Result: ', result); //return object success
				return result;
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao recuperar profile"
				};
				//
			});
		});
		return resultgetNumberProfile;
	} //getStatus
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Verificar o status do número
	static async checkNumberStatus(
		SessionName,
		number
	) {
		console.log("- Validando numero");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultcheckNumberStatus = await session.client.then(async client => {
			return await client.checkNumberStatus(number).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				if (result.canReceiveMessage === true) {
					//
					return {
						"erro": false,
						"status": result.status,
						"number": result.id.user,
						"message": "O número informado pode receber mensagens via whatsapp"
					};
					//
				} else if (result.status === 404 && result.canReceiveMessage === false) {
					//
					return {
						"erro": true,
						"status": result.status,
						"number": result.id.user,
						"message": "O número informado não pode receber mensagens via whatsapp"
					};
					//
				} else {
					//
					return {
						"erro": true,
						"status": 404,
						"number": number,
						"message": "Erro ao verificar número informado"
					};
					//
				}
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"number": number,
					"message": "Erro ao verificar número informado"
				};
				//
			});
		});
		return resultcheckNumberStatus;
	} //checkNumberStatus
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Obter a foto do perfil do servidor
	static async getProfilePicFromServer(
		SessionName,
		number
	) {
		console.log("- Obtendo a foto do perfil do servidor!");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetProfilePicFromServer = await session.client.then(async client => {
			try {
				const url = await client.getProfilePicFromServer(number);
				//console.log('Result: ', result); //return object success
				return url;
			} catch (erro) {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao obtendo a foto do perfil no servidor"
				};
				//
			};
		});
		return resultgetProfilePicFromServer;
	} //getProfilePicFromServer
	//
	// ------------------------------------------------------------------------------------------------//
	//
	/*
	╔═╗┬─┐┌─┐┬ ┬┌─┐  ╔═╗┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐
	║ ╦├┬┘│ ││ │├─┘  ╠╣ │ │││││   │ ││ ││││└─┐
	╚═╝┴└─└─┘└─┘┴    ╚  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘└─┘
	*/
	//
	// Deixar o grupo
	static async leaveGroup(
		SessionName,
		groupId
	) {
		console.log("- Deixar o grupo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultleaveGroup = await session.client.then(async client => {
			return await client.leaveGroup(groupId).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"groupId": groupId,
					"message": "Grupo deixado com sucesso"
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"groupId": groupId,
					"message": "Erro ao deixar o grupo"
				};
				//
			});
		});
		return resultleaveGroup;
	} //leaveGroup
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Obtenha membros do grupo
	static async getGroupMembers(
		SessionName,
		groupId
	) {
		console.log("- Obtendo membros do grupo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetGroupMembers = await session.client.then(async client => {
			return await client.getGroupMembers(groupId).then(async (result) => {
				//console.log('Result: ', result); //return object success
				//
				var getGroupMembers = [];
				//
				await forEach(result, async (resultGroupMembers) => {
					//
					if (resultGroupMembers.isMyContact === true || resultGroupMembers.isMyContact === false) {
						//
						getGroupMembers.push({
							"user": resultGroupMembers.id.user,
							"name": resultGroupMembers.name,
							"shortName": resultGroupMembers.shortName,
							"pushname": resultGroupMembers.pushname,
							"formattedName": resultGroupMembers.formattedName
						});
					}
					//
				});
				//
				return getGroupMembers;
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"groupId": groupId,
					"message": "Erro ao obter membros do grupo"
				};
				//
			});
		});
		return resultgetGroupMembers;
	} //getGroupMembers
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Obter IDs de membros do grupo
	static async getGroupMembersIds(
		SessionName,
		groupId
	) {
		console.log("- Obter IDs dos membros do grupo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetGroupMembersIds = await session.client.then(async client => {
			return await client.getGroupMembersIds(groupId).then((result) => {
				//console.log('Result: ', result); //return object success
				return result;
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"groupId": groupId,
					"message": "Erro ao obter membros do grupo"
				};
				//
			});
		});
		return resultgetGroupMembersIds;
	} //getGroupMembersIds
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Gerar link de url de convite de grupo
	static async getGroupInviteLink(
		SessionName,
		groupId
	) {
		console.log("- Gerar link de convite do grupo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetGroupInviteLink = await session.client.then(async client => {
			return await client.getGroupInviteLink(groupId).then((result) => {
				//console.log('Result: ', result); //return object success
				return result;
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"groupId": groupId,
					"message": "Erro ao obter link de convite de grupo"
				};
				//
			});
		});
		return resultgetGroupInviteLink;
	} //getGroupInviteLink
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Criar grupo (título, participantes a adicionar)
	static async createGroup(
		SessionName,
		title,
		contactlistValid,
		contactlistInvalid
	) {
		console.log("- Criando grupo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetGroupInviteLink = await session.client.then(async client => {
			return await client.createGroup(title, contactlistValid).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				if (result.status === 200) {
					return {
						"erro": false,
						"status": 200,
						"gid": result.gid.user,
						"contactlistValid": contactlistValid,
						"contactlistInvalid": contactlistInvalid,
						"message": "Grupo criado com a lista de contatos validos"
					};
				} else {
					//
					return {
						"erro": true,
						"status": 404,
						"gid": null,
						"contactlistValid": contactlistValid,
						"contactlistInvalid": contactlistInvalid,
						"message": "Erro ao criar grupo"
					};
					//
				}
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"gid": null,
					"contactlistValid": contactlistValid,
					"contactlistInvalid": contactlistInvalid,
					"message": "Erro ao criar grupo"
				};
				//
			});
		});
		return resultgetGroupInviteLink;
	} //createGroup
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Remove participante
	static async removeParticipant(
		SessionName,
		groupId,
		phonefull
	) {
		console.log("- Removendo participante do grupo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultremoveParticipant = await session.client.then(async client => {
			return await client.removeParticipant(groupId, phonefull).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				if (result === true) {
					return {
						"erro": false,
						"status": 200,
						"number": phonefull,
						"message": "Participante removido com sucesso"
					};
				} else {
					//
					return {
						"erro": true,
						"status": 404,
						"number": phonefull,
						"message": "Erro ao remover participante"
					};
					//
				}
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"number": phonefull,
					"message": "Erro ao remover participante"
				};
				//
			});
		});
		return resultremoveParticipant;
	} //removeParticipant
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Adicionar participante
	static async addParticipant(
		SessionName,
		groupId,
		phonefull
	) {
		console.log("- Adicionando participante no grupo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultaddParticipant = await session.client.then(async client => {
			return await client.addParticipant(groupId, phonefull).then((result) => {
				//console.log('Result: ', addParticipant); //return object success
				//
				if (result === true) {
					return {
						"erro": false,
						"status": 200,
						"number": phonefull,
						"message": "Participante adicionado com sucesso"
					};
				} else {
					//
					return {
						"erro": true,
						"status": 404,
						"number": phonefull,
						"message": "Erro ao adicionar participante"
					};
					//
				}
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"number": phonefull,
					"message": "Erro ao adicionar participante"
				};
				//
			});
		});
		return resultaddParticipant;
	} //addParticipant
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Promote participante (Give admin privileges)
	static async promoteParticipant(
		SessionName,
		groupId,
		number
	) {
		console.log("- Promovendo participante do grupo para admin");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultpromoteParticipant = await session.client.then(async client => {
			return await client.promoteParticipant(groupId, number).then((result) => {
				//console.log('Result: ', promoteParticipant); //return object success
				//
				if (result === true) {
					return {
						"erro": false,
						"status": 200,
						"number": number,
						"message": "Participante promovido a administrador"
					};
				} else {
					//
					return {
						"erro": true,
						"status": 404,
						"number": number,
						"message": "Erro ao promover participante a administrador"
					};
					//
				}
				//
			}).catch((erro) => {
				console.error('Error when sending: ', erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"number": number,
					"message": "Erro ao promover participante a administrador"
				};
				//
			});
		});
		return resultpromoteParticipant;
	} //promoteParticipant
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Depromote participant (Give admin privileges)
	static async demoteParticipant(
		SessionName,
		groupId,
		phonefull
	) {
		console.log("- Removendo participante do grupo de admin");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultdemoteParticipant = await session.client.then(async client => {
			return await client.demoteParticipant(groupId, phonefull).then((result) => {
				//console.log('Result: ', demoteParticipant); //return object success
				//
				if (demoteParticipant === true) {
					return {
						"erro": false,
						"status": 200,
						"number": phonefull,
						"message": "Participante removido de administrador"
					};
				} else {
					//
					return {
						"erro": true,
						"status": 404,
						"number": phonefull,
						"message": "Erro ao remover participante de administrador"
					};
					//
				}
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"number": phonefull,
					"message": "Erro ao remover participante de administrador"
				};
				//
			});
		});
		return resultdemoteParticipant;
	} //demoteParticipant
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Retorna o status do grupo, jid, descrição do link de convite
	static async getGroupInfoFromInviteLink(
		SessionName,
		InviteCode
	) {
		console.log("- Obtendo status do grupo via link de convite");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetGroupInfoFromInviteLink = await session.client.then(async client => {
			return await client.getGroupInfoFromInviteLink(InviteCode).then((result) => {
				//console.log('Result: ', result); //return object success
				return result;
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao obter link de convite"
				};
				//
			});
		});
		return resultgetGroupInfoFromInviteLink;
	} //getGroupInfoFromInviteLink
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Junte-se a um grupo usando o código de convite do grupo
	static async joinGroup(
		SessionName,
		InviteCode
	) {
		console.log("- Entrando no grupo via link de convite");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultjoinGroup = await session.client.then(async client => {
			return await client.joinGroup(InviteCode).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				if (result.status === 200) {
					return {
						"erro": false,
						"status": 200,
						"message": "Convite para grupo aceito com suceso"
					};
				} else {
					//
					return {
						"erro": true,
						"status": 404,
						"message": "Erro ao aceitar convite para grupo"
					};
					//
				}
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao entra no grupo via convite"
				};
				//
			});
		});
		return resultjoinGroup;
	} //joinGroup
	//
	// ------------------------------------------------------------------------------------------------//
	//
	/*
	╔═╗┬─┐┌─┐┌─┐┬┬  ┌─┐  ╔═╗┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐
	╠═╝├┬┘│ │├┤ ││  ├┤   ╠╣ │ │││││   │ ││ ││││└─┐
	╩  ┴└─└─┘└  ┴┴─┘└─┘  ╚  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘└─┘
	*/
	//
	// Set client status
	static async setProfileStatus(
		SessionName,
		ProfileStatus
	) {
		console.log("- Mudando o estatus");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultsetProfileStatus = await session.client.then(async client => {
			return await client.setProfileStatus(ProfileStatus).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Profile status alterado com sucesso."
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//return erro;
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao alterar profile status."
				};
				//
			});
		});
		return resultsetProfileStatus;
	} //setProfileStatus
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Set client profile name
	static async setProfileName(
		SessionName,
		ProfileName
	) {
		console.log("- Mudando profile name");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultsetProfileName = await session.client.then(async client => {
			return await client.setProfileName(ProfileName).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Profile name alterado com sucesso."
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//return erro;
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao alterar profile name."
				};
				//
			});
		});
		return resultsetProfileName;
	} //setProfileName
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Set client profile photo
	static async setProfilePic(
		SessionName,
		path
	) {
		console.log("- Mudando imagem do perfil");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultsetProfilePic = await session.client.then(async client => {
			return await client.setProfilePic(path).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Profile pic alterado com sucesso."
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao alterar profile pic."
				};
				//
			});
		});
		return resultsetProfilePic;
	} //setProfilePic
	//
	// ------------------------------------------------------------------------------------------------//
	//
	/*
	╔╦╗┌─┐┬  ┬┬┌─┐┌─┐  ╔═╗┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐
	 ║║├┤ └┐┌┘││  ├┤   ╠╣ │ │││││   │ ││ ││││└─┐
	═╩╝└─┘ └┘ ┴└─┘└─┘  ╚  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘└─┘
	*/
	//
	// Delete the Service Worker
	static async killServiceWorker(SessionName) {
		console.log("- Delete the Service Worker");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultkillServiceWorker = await session.client.then(async client => {
			return await client.killServiceWorker().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Serviço parado com sucesso.",
					"killService": result
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao parar serviço."
				};
				//
			});
		});
		return resultkillServiceWorker;
	} //killServiceWorker
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Load the service again
	static async restartService(SessionName) {
		console.log("- Reload the service again");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultrestartService = await session.client.then(async client => {
			return await client.restartService().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Serviço reiniciado com sucesso.",
					"restartService": result
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao reiniciar serviço."
				};
				//
			});
		});
		return resultrestartService;
	} //restartService
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Get device info
	static async getHostDevice(SessionName) {
		console.log("- Obtendo informações do dispositivo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetHostDevice = await session.client.then(async client => {
			return await client.getHostDevice().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Dados do dispositivo obtido com sucesso",
					"HostDevice": {
						"user": result.wid.user,
						"connected": result.connected,
						"isResponse": result.isResponse,
						"battery": result.battery,
						"plugged": result.plugged,
						"locales": result.locales,
						"is24h": result.is24h,
						"device_manufacturer": result.phone.device_manufacturer,
						"platform": result.platform,
						"os_version": result.phone.os_version,
						"wa_version": result.phone.wa_version,
						"pushname": result.pushname
					}
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao obter dados do dispositivo"
				};
				//
			});
		});
		return resultgetHostDevice;
	} //getHostDevice
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Get is multi device info
	static async isMultiDevice(SessionName) {
		console.log("- Obendo informações do multi-device");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetHostDevice = await session.client.then(async client => {
			return await client.isMultiDevice().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Estado do MultiDevice obtido com sucesso",
					"isMultiDevice": result

				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao obter estatus do MultiDevice"
				};
				//
			});
		});
		return resultgetHostDevice;
	} //isMultiDevice
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Get connection state
	static async getConnectionState(SessionName) {
		console.log("- getConnectionState");
		var session = Sessions.getSession(SessionName);
		var resultisConnected = await session.client.then(async client => {
			return await client.getConnectionState().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Estado do dispositivo obtido com sucesso",
					"ConnectionState": result

				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao obter o estado da conexão"
				};
				//
			});
		});
		return resultisConnected;
	} //getConnectionState
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Get battery level
	static async getBatteryLevel(SessionName) {
		console.log("- Obtendo nivel de bateria");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetBatteryLevel = await session.client.then(async client => {
			return await client.getBatteryLevel().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Nivel da bateria obtido com sucesso",
					"BatteryLevel": result

				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao obter o nivel da bateria"
				};
				//
			});
		});
		return resultgetBatteryLevel;
	} //getBatteryLevel
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Is Connected
	static async isConnected(SessionName) {
		console.log("- Obtendo se esta conectado");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultisConnected = await session.client.then(async client => {
			return await client.isConnected().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Estatus obtido com sucesso",
					"Connected": result
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao obter estatus"
				};
				//
			});
		});
		return resultisConnected;
	} //isConnected
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Obter versão do WhatsappWeb
	static async getWAVersion(SessionName) {
		console.log("- Obtendo versão do WhatsappWeb");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetWAVersion = await session.client.then(async client => {
			return await client.getWAVersion().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Versão do WhatsappWeb obtido com sucesso",
					"WAVersion": result
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao obter versão do WhatsappWeb"
				};
				//
			});
		});
		return resultgetWAVersion;
	} //getWAVersion
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Inicia a verificação de conexão do telefone
	static async startPhoneWatchdog(SessionName, interval) {
		console.log("- Iniciando a verificação de conexão do telefone");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultstartPhoneWatchdog = await session.client.then(async client => {
			return await client.startPhoneWatchdog(interval).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Verificação de conexão do telefone iniciada com sucesso",
					"PhoneWatchdog": result
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao inicia a verificação de conexão do telefone"
				};
				//
			});
		});
		return resultstartPhoneWatchdog;
	} //startPhoneWatchdog
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Para a verificação de conexão do telefone
	static async stopPhoneWatchdog(SessionName) {
		console.log("- Parando a verificação de conexão do telefone");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultstopPhoneWatchdog = await session.client.then(async client => {
			return await client.stopPhoneWatchdog().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Verificação de conexão parada iniciada com sucesso",
					"PhoneWatchdog": result
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao parar a verificação de conexão do telefone"
				};
				//
			});
		});
		return resultstopPhoneWatchdog;
	} //stopPhoneWatchdog
	//
	// ------------------------------------------------------------------------------------------------//
	//
	/*
	╔╦╗┌─┐┌─┐┌┬┐┌─┐┌─┐  ┌┬┐┌─┐  ╦═╗┌─┐┌┬┐┌─┐┌─┐
	 ║ ├┤ └─┐ │ ├┤ └─┐   ││├┤   ╠╦╝│ │ │ ├─┤└─┐
	 ╩ └─┘└─┘ ┴ └─┘└─┘  ─┴┘└─┘  ╩╚═└─┘ ┴ ┴ ┴└─┘
	 */
	//
	// ------------------------------------------------------------------------------------------------//
	//
	static async RotaTeste() {
		console.log("- Iniciando rota de teste");
		await sleep(3000);
	} //RotaTeste
	//
	// ------------------------------------------------------------------------------------------------//
	//
}