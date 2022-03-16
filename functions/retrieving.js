const Sessions = require('../controllers/sessions')

module.exports = class Status {
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
		try {
			return await session.client.getAllContacts().then(async (result) => {
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
		} catch (erro) {
			console.error("Error when:", erro); //return object error
			//
			return {
				"erro": true,
				"status": 404,
				"message": "Erro ao recuperar contatos"
			};
			//
		};
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
		try {
			return await session.client.getAllGroups().then(async (result) => {
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
		} catch (erro) {
			console.error('Error when sending: ', erro); //return object error
			//
			return {
				"erro": true,
				"status": 404,
				"message": "Erro ao recuperar grupos"
			};
			//
		};
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
			return await session.client.getSessionTokenBrowser().then((result) => {
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
			return await session.client.getBlockList().then((result) => {
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
			return await session.client.getStatus(number).then((result) => {
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
			return await session.client.getNumberProfile(number).then((result) => {
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
		try {
			return await session.client.checkNumberStatus(number).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				if (result.canReceiveMessage === true) {
					//
					return {
						"erro": false,
						"status": result.status,
						"number": result.id._serialized,
						"message": "O número informado pode receber mensagens via whatsapp"
					};
					//
				} else if (result.status === 404 && result.canReceiveMessage === false) {
					//
					return {
						"erro": true,
						"status": result.status,
						"number": result.id._serialized,
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
		} catch (erro) {
			console.error("Error when:", erro); //return object error
			//
			return {
				"erro": true,
				"status": 404,
				"number": number,
				"message": "Erro ao verificar número informado"
			};
			//
		}
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
}