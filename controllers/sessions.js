const urlExists = require("url-exists");
const fs = require('fs');
const redis = require('redis');
const cache = redis?.createClient();
const { fromBuffer } = require('file-type');
const mimeTypes = require('mime-types');
const fileType = require('file-type');
const axios = require('axios');
const chalk = require('chalk');
const boxen = require('boxen');

module.exports = class Sessions {

	static session = new Array()
	//
	static async ApiStatus(name) {
		console.log("- Status");
		var session = this.getSession(name);

		if (session) {
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
	}

	static isURL(str) {
		var pattern = new RegExp(
			'^(https?:\\/\\/)?' +
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' +
			'((\\d{1,3}\\.){3}\\d{1,3}))' +
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
			'(\\?[;&a-z\\d%_.~+=-]*)?' +
			'(\\#[-a-z\\d_]*)?$',
			'i'
		);
		return pattern.test(str);
	}

	static checkPath(path) {
		urlExists(path, (error, exists) => {
			if (exists) {
				return true
			}
			else {
				return false
			}
		})
	}
	// checar ou adiciona um usuario na sessão
	static checkAddUser(name) {
		var checkFilter = this.session?.filter(order => (order?.session === name)), add = null
		if (!checkFilter?.length) {
			add = {
				session: name,
			}
			this.session?.push(add)
			return true
		}
		return false
	}

	// checar se exite o usuario na sessão
	static checkSession(name) {
		var checkFilter = this.session?.filter(order => (order?.session === name))
		if (checkFilter?.length) {
			return true
		}
		return false
	}

	// pegar index da sessão (chave)
	static getSessionKey(name) {
		if (this.checkSession(name)) {
			for (var i in this.session) {
				if (this.session[i]?.session === name) {
					return i
				}
			}
		}
		return false
	}

	// adicionar informações a sessão 
	static addInfoSession(name, extend) {

		if (this.checkSession(name)) {
			for (var i in this.session) {
				if (this.session[i]?.session === name) {
					Object?.assign(this.session[i], extend)
					return true
				}
			}
		}
		return false
	}

	// Remove object na sessão
	static removeInfoObjects(name, key) {
		if (this.checkSession(name)) {
			for (var i in this.session) {
				if (this.session[i]?.session === name) {
					delete this.session[i][key]
					return true
				}
			}
		}
		return false
	}

	// deletar sessão
	static deleteSession(name) {
		if (this.checkSession(name)) {
			var key = this.getSessionKey(name)
			delete this.session[key]
			return true
		}
		return false
	}

	// retornar sessão
	static getSession(name) {
		if (this.checkSession(name)) {
			var key = this.getSessionKey(name)
			return this.session[key]
		}
		return false
	}

	// retornar todas
	static getAll() {
		return this.session
	}

	// checa o client
	static checkClient(name) {
		if (this.getSession(name) && this.getSession(name)?.client) {
			return true
		}
		return false
	}

	static getCache(key) {
		return new Promise((resolve, reject) => {
			cache?.get(key, function (err, result) {
				if (err) {
					return reject(err);
				}
				return resolve(result);
			});
		});
	}

	static setCache(key, value) {
		return new Promise((resolve, reject) => {
			cache?.set(key, value, 'EX', 3600, (error) => {
				if (error) {
					reject(error)
				} else {
					resolve(true)
				}
			})
		})
	}


	static async UrlToBase64(url) {
		return new Promise((resolve, reject) => {
			try {
				axios?.get(url, { responseType: 'arraybuffer' }).then(async (result) => {
					let buffer = Buffer?.from(result?.data)?.toString('base64');
					resolve(`data:${(await fromBuffer(result?.data))?.mime};base64,${buffer}`);
				})
			} catch (error) {
				console.log(error)
				reject(error)
			}
		})
	}

	static async fileToBase64(path) {
		return new Promise(async (resolve, reject) => {
			try {
				if (fs?.existsSync(path)) {
					const base64 = fs?.readFileSync(path, { encoding: 'base64' });
					let mime = mimeTypes?.lookup(path);
					if (!mime) {
						const result = await fileType?.fromFile(path);
						mime = result?.mime;
					}
					if (!mime) {
						mime = 'application/octet-stream';
					}
					const data = `data:${mime};base64,${base64}`;
					resolve(data);
				}
				else
					if (path?.data) {
						let buffer = await path?.data?.toString('base64')
						let mime = mimeTypes?.lookup(path?.name);
						const data = `data:${mime};base64,${buffer}`
						resolve(data);
					}
					else {
						resolve(false);
					}
			} catch (error) {
				console?.log(error)
				reject(error);
			}
		})
	}

	static upToDate(local, remote) {
		const VPAT = /^\d+(\.\d+){0,2}$/;
		if (!local || !remote || local.length === 0 || remote.length === 0)
			return false;
		if (local == remote) return true;
		if (VPAT.test(local) && VPAT.test(remote)) {
			const lparts = local.split('.');
			while (lparts.length < 3) lparts.push('0');
			const rparts = remote.split('.');
			while (rparts.length < 3) rparts.push('0');
			for (let i = 0; i < 3; i++) {
				const l = parseInt(lparts[i], 10);
				const r = parseInt(rparts[i], 10);
				if (l === r) continue;
				return l > r;
			}
			return true;
		} else {
			return local >= remote;
		}
	}

	static logUpdateAvailable(current, latest) {
		const newVersionLog =
			`Há uma nova versão da ${chalk.bold(`API MyZAP-Premium`)} ${chalk.gray(current)} ➜  ${chalk.bold.green(latest)}\n` +
			`Atualize sua API executando:\n\n` +
			`${chalk.bold('\>')} ${chalk.blueBright('npm run update')}`;
		console.log(boxen(newVersionLog, { padding: 1 }));
		console.log(
			`Para mais informações visite: ${chalk.underline(
				'https://github.com/eduardo-policarpo/MyZAP2.0-Premiun/releases'
			)}\n`
		);
	}
}
