module.exports = class Sessions {
	//
	static async ApiStatus(SessionName) {
		console.log("- Status");
		var session = this.getSession(SessionName);
		//
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
						//let result = await startAll.startSession(SessionName);
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
			//
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
	static async Start(SessionName) {
		this.sessions = this.sessions || []; //start array

		var session = this.getSession(SessionName);

		if (session == false) {
			//create new session
			session = await this.addSesssion(SessionName);
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
			session.client = this.initSession(SessionName);
		} else if (["CONFLICT", "UNPAIRED", "UNLAUNCHED", "UNPAIRED_IDLE"].includes(session.state)) {
			session.state = "CLOSED";
			session.status = 'notLogged';
			session.qrcode = null;
			session.message = 'Sistema desconectado';
			//
			console.log('- Nome da sessão:', session.name);
			console.log('- State do sistema:', session.state);
			console.log('- Status da sessão:', session.status);
			//
			session.client = this.initSession(SessionName);
		} else if (["DISCONNECTED"].includes(session.state)) {
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
			session.client = this.initSession(SessionName);
		} else if (["NOTFOUND"].includes(session.state)) {
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
			session = await this.addSesssion(SessionName);
		} else {
			console.log('- Nome da sessão:', session.name);
			console.log('- State do sistema:', session.state);
			console.log('- Status da sessão:', session.status);
		}
		//
		await updateStateDb(session.state, session.status, AuthorizationToken);
		//
		return session;
	} //start
	//
	// ------------------------------------------------------------------------------------------------------- //
	//
	static async addSesssion(SessionName) {
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
			state: 'STARTING',
			status: 'notLogged',
			message: 'Sistema iniciando e indisponivel para uso',
			attempts: 0,
			browserSessionToken: null
		}
		this.sessions.push(newSession);
		console.log("- Nova sessão: " + newSession.state);

		//setup session
		newSession.client = this.initSession(SessionName);
		this.setup(SessionName);

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
}