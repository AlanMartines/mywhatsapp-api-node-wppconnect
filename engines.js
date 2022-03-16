//
// Configuração dos módulos
const fs = require('fs-extra');
const rimraf = require("rimraf");
const sleep = require('sleep-promise');
const fnSocket = require('./controllers/fnSockets');
const {
	forEach
} = require('p-iteration');
/*
const PQueue = require("p-queue");
const queue = new PQueue({
	concurrency: 1
});
*/
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
const events = require('./controllers/events');
const webhooks = require('./controllers/webhooks.js');
const Sessions = require('./controllers/sessions.js');
const config = require('./config.global');
const tokenPatch = config.tokenPatch;
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
module.exports = class Wppconnect {

	static async Start(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion) {

		var data = Sessions?.getSession(SessionName);

		const funcoesSocket = new fnSocket(req.io);
		funcoesSocket.events(SessionName, {
			message: 'Iniciando WhatsApp. Aguarde...',
			state: 'STARTING',
			session: SessionName
		})


		if (data) {
			this.initSession(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion)
		}
		else
			if (data == false) {
				Sessions.checkAddUser(SessionName)
				Sessions.addInfoSession(SessionName, {
					state: 'STARTING',
					status: 'notLogged',
					funcoesSocket: funcoesSocket
				})
				this.initSession(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion)
			}
	}

	//
	static async initSession(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion) {
		//
		/*
			╔═╗┌─┐┌┬┐┌┬┐┬┌┐┌┌─┐  ┌─┐┌┬┐┌─┐┬─┐┌┬┐┌─┐┌┬┐
			║ ╦├┤  │  │ │││││ ┬  └─┐ │ ├─┤├┬┘ │ ├┤  ││
			╚═╝└─┘ ┴  ┴ ┴┘└┘└─┘  └─┘ ┴ ┴ ┴┴└─ ┴ └─┘─┴┘
		*/
		//
		if (MultiDevice == 'true' || MultiDevice == true) {
			//
			await deletaToken(`${tokenPatch}`, `${SessionName}.data.json`);
			//
		} else if (MultiDevice == 'false' || typeof MultiDevice == 'undefined' || MultiDevice == false) {
			//
			await deletaCache(`${tokenPatch}`, `WPP-${SessionName}`);
			//
		}
		//
		await Sessions.addInfoSession(SessionName, {
			result: "info",
			state: "STARTING",
			status: "notLogged",
			message: 'Sistema iniciando e indisponivel para uso'
		});
		//
		await updateStateDb('STARTING', 'notLogged', SessionName);
		//
		try {
			const client = await wppconnect.create({
				session: SessionName,
				tokenStore: 'memory',
				catchQR: async (base64Qrimg, asciiQR, attempts, urlCode) => {
					//
					console.log("- Saudação:", await saudacao());
					//
					console.log('- Nome da sessão:', SessionName);
					//
					console.log('- Número de tentativas de ler o qr-code:', attempts);
					//
					console.log("- Captura do QR-Code");
					//console.log(base64Qrimg);
					//
					console.log("- Captura do asciiQR");
					// Registrar o QR no terminal
					//console.log(asciiQR);
					//
					console.log("- Captura do urlCode");
					// Registrar o QR no terminal
					//console.log(urlCode);
					//
					if (attempts <= 2) {
						await updateStateDb('QRCODE', 'qrRead', AuthorizationToken);
					}
					//
					await webhooks.wh_qrcode(SessionName, base64Qrimg);
					this.exportQR(socket, base64Qrimg, SessionName, attempts);
					await Sessions.addInfoSession(SessionName, {
						result: "info",
						state: "QRCODE",
						status: "qrRead",
						CodeasciiQR: asciiQR,
						CodeurlCode: urlCode,
						qrCode: base64Qrimg,
						mensagem: "Sistema aguardando leitura do QR-Code"
					});
					//
				},
				statusFind: async (statusSession, session) => {
					console.log('- Status da sessão:', statusSession);
					//return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
					//Create session wss return "serverClose" case server for close
					console.log('- Session name: ', session);
					//
					//
					switch (statusSession) {
						case 'isLogged':
						case 'qrReadSuccess':
						case 'inChat':
						case 'chatsAvailable':
							//
							await webhooks.wh_connect(SessionName, statusSession);
							await Sessions.addInfoSession(SessionName, {
								result: "success",
								state: "CONNECTED",
								status: statusSession,
								CodeasciiQR: null,
								CodeurlCode: null,
								qrCode: null,
								message: "Sistema iniciado e disponivel para uso"
							});
							//
							await updateStateDb('CONNECTED', statusSession, AuthorizationToken);
							//
							break;
						case 'autocloseCalled':
						case 'browserClose':
						case 'serverClose':
						case 'autocloseCalled':
							//
							webhooks.wh_connect(SessionName, statusSession);
							await Sessions.addInfoSession(session, {
								result: "info",
								state: "CLOSED",
								status: statusSession,
								CodeasciiQR: null,
								CodeurlCode: null,
								qrCode: null,
								message: "Sistema fechado"
							});
							//
							await updateStateDb('CLOSED', statusSession, AuthorizationToken);
							//
							break;
						case 'qrReadFail':
						case 'notLogged':
						case 'deviceNotConnected':
						case 'desconnectedMobile':
						case 'deleteToken':
							//
							await webhooks.wh_status(SessionName, statusSession);
							await Sessions.addInfoSession(SessionName, {
								result: "info",
								state: "DISCONNECTED",
								status: statusSession,
								CodeasciiQR: null,
								CodeurlCode: null,
								qrCode: null,
								message: "Dispositivo desconetado"
							});
							//
							await updateStateDb('DISCONNECTED', statusSession, AuthorizationToken);
							//
							break;
						default:
							//
							await webhooks.wh_connect(SessionName, 'notLogged');
							await Sessions.addInfoSession(SessionName, {
								result: "error",
								state: "NOTFOUND",
								status: statusSession,
								CodeasciiQR: null,
								CodeurlCode: null,
								qrCode: null,
								message: "Sistema Off-line"
							});
							//
							await updateStateDb('DISCONNECTED', statusSession, AuthorizationToken);
						//
					}
					//
				},
				whatsappVersion: whatsappVersion ? `${whatsappVersion}` : '', // whatsappVersion: '2.2204.13',
				deviceName: `${config.DEVICE_NAME}`,
				headless: true, // Headless chrome
				devtools: false, // Open devtools by default
				useChrome: true, // If false will use Chromium instance
				debug: false, // Opens a debug session
				logQR: parseInt(config.VIEW_QRCODE_TERMINAL), // Logs QR automatically in terminal
				browserWS: config.BROWSER_WSENDPOINT ? `${config.BROWSER_WSENDPOINT}` : '', // If u want to use browserWSEndpoint
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
					userDataDir: MultiDevice ? `${tokenPatch}/WPP-${SessionName}` : undefined, // or your custom directory
					browserWSEndpoint: config.BROWSER_WSENDPOINT ? `${config.BROWSER_WSENDPOINT}` : undefined,
				},
				disableWelcome: false, // Option to disable the welcoming message which appears in the beginning
				updatesLog: true, // Logs info updates automatically in terminal
				autoClose: parseInt(config.AUTO_CLOSE), // Automatically closes the wppconnect only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
				tokenStore: 'file', // Define how work with tokens, that can be a custom interface
				folderNameToken: `${tokenPatch}`, //folder name when saving tokens
			});
			// Levels: 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'
			// All logs: 'silly'
			wppconnect.defaultLogger.level = 'silly';
			let info = await client.getWid();
			let tokens = await client.getSessionTokenBrowser();
			let browser = [];
			//
			await webhooks.wh_connect(SessionName, 'connected', info, browser, tokens);
			events.receiveMessage(SessionName, client, socket);
			events.statusMessage(SessionName, client, socket);
			events.extraEvents(SessionName, client, socket);
			//
			if (parseInt(config.useHere) == true) {
				events.statusConnection(SessionName, client, socket)
			}
			//
			await Sessions.addInfoSession(SessionName, {
				client: client,
				tokens: tokens,
				result: "success",
				state: "CONNECTED",
				status: 'isLogged',
				CodeasciiQR: null,
				CodeurlCode: null,
				qrCode: null,
				message: "Sistema On-line"
			});
			//
			console.log("- Token WPPConnect:\n", JSON.stringify(tokens, null, 2));
			//
			return client;
		} catch (error) {
			//
			await Sessions.addInfoSession(SessionName, {
				result: "error",
				state: "NOTFOUND",
				CodeasciiQR: null,
				CodeurlCode: null,
				qrCode: null,
				message: "Sistema Off-line"
			});
			//
			const sessionUser = await Sessions.getSession(SessionName);
			//
			socket.emit('status',
				{
					status: sessionUser.status,
					SessionName: SessionName
				});
			//
			console.log("- Instância não criada:", error);
		}
	} //initSession
	//
	// ------------------------------------------------------------------------------------------------//
	//
	static async exportQR(socket, qrCode, SessionName, attempts) {
		qrCode = qrCode.replace('data:image/png;base64,', '');
		const imageBuffer = Buffer.from(qrCode, 'base64');
		socket.emit('qrCode',
			{
				data: 'data:image/png;base64,' + imageBuffer.toString('base64'),
				SessionName: SessionName,
				attempts: attempts,
				message: 'QRCode Iniciando, Escanei por favor...'
			}
		);
	}
}