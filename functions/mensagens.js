
const Sessions = require('../controllers/sessions');

module.exports = class Mensagens {
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
		try {
			// Send contact
			return await session.client.sendContactVcard(
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
		} catch (erro) {
			console.error("Error when:", erro); //return object error
			//
			return {
				"erro": true,
				"status": 404,
				"number": number,
				"message": "Erro ao enviar contato"
			};
			//
		};
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
		try {
			// Send contact
			return await session.client.sendContactVcardList(
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
		} catch (erro) {
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
		};
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
		try {
			// Send basic text
			return await session.client.sendText(
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
		} catch (erro) {
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
		};
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
		try {
			// Send basic text
			return await session.client.sendLocation(
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
		} catch (erro) {
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
		};
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
		try {
			// Send basic text
			return await session.client.sendLinkPreview(
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
		} catch (erro) {
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
		};
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
		try {
			return await session.client.sendImage(
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
		} catch (erro) {
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
		};
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
		try {
			return await session.client.sendFile(
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
		} catch (erro) {
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
		};
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
		try {
			return await session.client.sendFileFromBase64(
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
		} catch (erro) {
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
		};
	} //sendFileFromBase64
	//
	// ------------------------------------------------------------------------------------------------//
	//

}