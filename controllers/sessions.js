const urlExists = require("url-exists");//
module.exports = class Sessions {

	static session = Sessions.session || []; //start array
	//
	static async ApiStatus(SessionName) {
		const sessionUser = await this.getSession(SessionName);
		//console.log("- Status", sessionUser);
		console.log("- Status");
		//
		if (sessionUser) {
			if (sessionUser.state == "CONNECTED") {
				return {
					result: "info",
					state: sessionUser.state,
					status: sessionUser.status,
					message: "Sistema iniciado e disponivel para uso"
				};
			} else if (sessionUser.state == "STARTING") {
				return {
					result: "info",
					state: sessionUser.state,
					status: sessionUser.status,
					message: "Sistema iniciando e indisponivel para uso"
				};
			} else if (sessionUser.state == "QRCODE") {
				return {
					result: "warning",
					state: sessionUser.state,
					status: sessionUser.status,
					message: "Sistema aguardando leitura do QR-Code"
				};
			} else {
				switch (sessionUser.status) {
					case 'isLogged':
						return {
							result: "success",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Sistema iniciado e disponivel para uso"
						};
						break;
					case 'notLogged':
						return {
							result: "error",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Sistema indisponivel para uso"
						};
						break;
					case 'browserClose':
						return {
							result: "info",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Navegador interno fechado"
						};
						break;
					case 'qrReadSuccess':
						return {
							result: "success",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Verificação do QR-Code feita com sucesso"
						};
						break;
					case 'qrReadFail':
						return {
							result: "warning",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Falha na verificação do QR-Code"
						};
						break;
					case 'qrRead':
						return {
							result: "warning",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Sistema aguardando leitura do QR-Code"
						};
						break;
					case 'autocloseCalled':
						return {
							result: "info",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Navegador interno fechado"
						};
						break;
					case 'desconnectedMobile':
						return {
							result: "info",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Dispositivo desconectado"
						};
						break;
					case 'deleteToken':
						return {
							result: "info",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Token de sessão removido"
						};
						break;
					case 'chatsAvailable':
						return {
							result: "success",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Sistema iniciado e disponivel para uso"
						};
						break;
					case 'deviceNotConnected':
						return {
							result: "info",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Dispositivo desconectado"
						};
						break;
					case 'serverWssNotConnected':
						return {
							result: "info",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "O endereço wss não foi encontrado"
						};
						break;
					case 'noOpenBrowser':
						return {
							result: "error",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Não foi encontrado o navegador ou falta algum comando no args"
						};
						break;
					case 'serverClose':
						return {
							result: "info",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "O cliente se desconectou do wss"
						};
						break;
					case 'OPENING':
						return {
							result: "warning",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "'Sistema iniciando e indisponivel para uso'"
						};
						break;
					case 'CONFLICT':
						return {
							result: "info",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Dispositivo conectado em outra sessão, reconectando"
						};
						break;
					case 'UNPAIRED':
					case 'UNLAUNCHED':
					case 'UNPAIRED_IDLE':
						return {
							result: "warning",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Dispositivo desconectado"
						};
						break;
					case 'DISCONNECTED':
						return {
							result: "info",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Dispositivo desconectado"
						};
						break;
					case 'SYNCING':
						return {
							result: "warning",
							state: sessionUser.state,
							status: sessionUser.status,
							message: "Dispositivo sincronizando"
						};
						break;
					case 'CLOSED':
						return {
							result: "info",
							state: sessionUser.state,
							status: sessionUser.status,
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
			//
			return {
				result: 'error',
				state: 'NOTFOUND',
				status: 'notLogged',
				message: 'Sistema Off-line'
			};
		}
	} //status

	static async checkPath(path) {
		urlExists(path, (error, exists) => {
			if (exists) {
				return true;
			}
			else {
				return false;
			}
		})
	}
	// checar ou adiciona um usuario na sessão
	static async checkAddUser(name) {
		var checkFilter = this.session.filter(order => (order.session === name)), add = null
		if (!checkFilter.length) {
			add = {
				session: name,
			}
			this.session.push(add);
			return true;
		}
		return false;
	}

	// checar se exite o usuario na sessão
	static async checkSession(name) {
		var checkFilter = this.session.filter(order => (order.session === name))
		if (checkFilter.length) {
			return true
		}
		return false
	}

	// pegar index da sessão (chave)
	static async getSessionKey(name) {
		if (await this.checkSession(name)) {
			for (var i in this.session) {
				if (this.session[i].session === name) {
					return i;
				}
			}
		}
		return false;
	}

	// adicionar informações a sessão 
	static async addInfoSession(name, extend) {
		if (await this.checkSession(name)) {
			for (var i in this.session) {
				if (this.session[i].session === name) {
					Object.assign(this.session[i], extend);
					return true;
				}
			}
		}
		return false;
	}

	// Remove object na sessão
	static async removeInfoObjects(name, key) {
		if (await this.checkSession(name)) {
			for (var i in this.session) {
				if (this.session[i].session === name) {
					delete this.session[i][key];
					return true;
				}
			}
		}
		return false;
	}

	// deletar sessão
	static async deleteSession(name) {
		if (await this.checkSession(name)) {
			var key = await this.getSessionKey(name)
			delete this.session[key]
			return true
		}
		return false
	}

	// retornar sessão
	static async getSession(name) {
		if (await this.checkSession(name)) {
			var key = await this.getSessionKey(name);
			return this.session[key];
		}
		return false;
	}

	// retornar todas
	static async getAll() {
		return this.session;
	}

	// checa o client
	static async checkClient(name) {
		if (await this.getSession(name) && await this.getSession(name).client) {
			return true;
		}
		return false;
	}

}
