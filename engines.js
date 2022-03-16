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
//
// ------------------------------------------------------------------------------------------------------- //
//
module.exports = class Wppconnect {

	static async Start(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion) {

		let session = SessionName;
		var data = Sessions?.getSession(session);

		const funcoesSocket = new fnSocket(socket);
		funcoesSocket.events(session, {
			message: 'Iniciando WhatsApp. Aguarde...',
			state: 'STARTING',
			session: session
		})


		if (data) {
			this.initSession(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion)
		}
		else
			if (data == false) {
				Sessions.checkAddUser(session)
				Sessions.addInfoSession(session, {

					state: 'STARTING',
					status: 'notLogged',
					funcoesSocket: funcoesSocket
				})
				this.initSession(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion);
			}
	}

	static async initSession(socket, SessionName, AuthorizationToken, MultiDevice, whatsappVersion) {
		let session = SessionName
		let token = await this.getToken(session);
		const funcoesSocket = new fnSocket(socket);
		try {
			wppconnect?.create({
				session: session,
				whatsappVersion: whatsappVersion ? `${whatsappVersion}` : '', // whatsappVersion: '2.2204.13',
				deviceName: `${config.DEVICE_NAME}`,
				tokenStore: 'memory',
				catchQR: (base64Qrimg, urlCode) => {
					webhooks?.wh_qrcode(session, base64Qrimg, urlCode)
					this.exportQR(socket, base64Qrimg, urlCode, session);
					Sessions?.addInfoSession(session, {
						qrCode: base64Qrimg,
						urlCode: urlCode,
						state: "QRCODE"
					})
				},
				statusFind: (statusSession, session) => {
					Sessions?.addInfoSession(session, {
						status: statusSession
					})
					webhooks?.wh_connect(session, statusSession)
					if (statusSession == 'qrReadSuccess') {
						funcoesSocket.events(session, {
							message: 'Leitura do QRCode feita com sucesso...',
							status: statusSession,
							session: session
						})

					}
					if (statusSession == 'qrReadError' || statusSession == 'qrReadFail') {
						funcoesSocket.events(session, {
							message: 'Falha na leitura do QRCode ...',
							status: statusSession,
							state: 'DISCONNECTED',
							session: session
						})
					}
					if (statusSession === 'browserClose' ||
						statusSession === 'desconnectedMobile' ||
						statusSession === 'phoneNotConnected' ||
						statusSession === 'autocloseCalled' ||
						statusSession === 'serverClose') {
						funcoesSocket.events(session, {
							message: 'Desconectado...',
							state: 'DISCONNECTED',
							status: statusSession,
							session: session
						})

					}
					if (statusSession === 'isLogged' ||
						statusSession === 'chatsAvailable' ||
						statusSession === 'inChat') {
						funcoesSocket.events(session, {
							message: 'WhatsApp autenticado com sucesso...',
							state: 'CONNECTED',
							status: statusSession,
							session: session
						})
					}
				},
				headless: true,
				logQR: parseInt(config.VIEW_QRCODE_TERMINAL), // Logs QR automatically in terminal
				browserWS: config.BROWSER_WSENDPOINT ? `${config.BROWSER_WSENDPOINT}` : '', // If u want to use browserWSEndpoint
				useChrome: true,
				updatesLog: true,
				autoClose: parseInt(config.AUTO_CLOSE), // Automatically closes the wppconnect only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
				browserArgs: [
					'--log-level=3',
					'--no-default-browser-check',
					'--disable-site-isolation-trials',
					'--no-experiments',
					'--ignore-gpu-blacklist',
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
				],
				disableSpins: false,
				createPathFileToken: false,
				puppeteerOptions: {
					userDataDir: MultiDevice ? `${tokenPatch}/WPP-${SessionName}` : undefined, // or your custom directory
					browserWSEndpoint: config.BROWSER_WSENDPOINT ? `${config.BROWSER_WSENDPOINT}` : undefined,
				},
				waitForLogin: true

			}).then(async (client) => {

				let tokens = await client.getSessionTokenBrowser();
				let phone = await client?.getWid();
				webhooks?.wh_connect(session, 'CONNECTED', phone);
				events?.receiveMessage(session, client, socket);
				events?.statusMessage(session, client, socket);
				events?.statusConnection(session, client, socket);
				events?.extraEvents(session, client, socket);
				//

				Sessions?.addInfoSession(session, {
					state: 'CONNECTED',
					client: client,
					tokens: tokens,
					phone: phone
				});

				client?.onIncomingCall(async (call) => {
					if (req?.body?.AutoRejectCall == 'true') {
						client?.rejectCall();
					}
					if (config?.incoming_call !== '') {
						client?.sendText(call?.peerJid, config?.incoming_call);
					}
				});

				console?.log({
					"result": 200,
					"status": "CONNECTED",
					"response": `Sessão ${SessionName} gravada com sucesso no Firebase`
				})

			}).catch(async (error) => {
				//exec(`rm -R tokens/${session}/`);
				//
				exec(`rm -rf ${config.tokenPatch}/${session}.data.json`, (error, stdout, stderr) => {
					if (error) {
						console.log(`Error: ${error.message}`);
						return;
					}
					if (stderr) {
						console.log(`Stderr: ${stderr}`);
						return;
					}
					console.log(`Stdout: ${stdout}`);
				});
				//
				exec(`rm -rf ${config.tokenPatch}/WPP-${session}/`, (error, stdout, stderr) => {
					if (error) {
						console.log(`error: ${error.message}`);
						return;
					}
					if (stderr) {
						console.log(`stderr: ${stderr}`);
						return;
					}
					console.log(`stdout: ${stdout}`);
				});
				//
				await firestore?.collection('Sessions')?.doc(session)?.delete();
			})

			wppconnect.defaultLogger.level = 'silly';

		} catch (error) {
			return error
		}
	}

	static async exportQR(socket, qrCode, urlCode, session) {
		socket.emit('events', {
			message: 'QRCode Iniciando, Escanei por favor...',
			state: 'QRCODE',
			qrCode: qrCode,
			urlCode: urlCode,
			session: session
		})
	}

	static async getToken(session) {
		return new Promise(async (resolve, reject) => {
			try {
				const Session = await firestore?.collection('Sessions')?.doc(session);
				const dados = await Session?.get();
				if (!dados?.exists) {
					resolve('no results found')
				} else {
					let data = {
						'WABrowserId': dados?.data()?.WABrowserId,
						'WASecretBundle': dados?.data()?.WASecretBundle,
						'WAToken1': dados?.data()?.WAToken1,
						'WAToken2': dados?.data()?.WAToken2
					}
					resolve(data)
				}

			} catch (error) {
				reject(error)
			}
		})
	}

}