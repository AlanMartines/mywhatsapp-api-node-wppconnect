const Sessions = require('./sessions.js');
const config = require('../config.global');
const Wppconnect = require("../engines");

module.exports = class Auth {

	static async start(req, res, next) {
		try {
			let SessionName = req.body.SessionName;
			let existSession = Sessions.checkSession(SessionName);
			if (!existSession) {
				init(session);
			}
			if (existSession) {
				let data = Sessions.getSession(SessionName);
				if (data.status !== 'inChat' && data.status !== 'isLogged' && data.status !== 'chatsAvailable') {
					init(session);
				} else {
					return {
						result: "success",
						state: 'CONNECTED',
						status: data.status,
						message: "Sistema iniciado e disponivel para uso"
					};
				}
			}

			async function init(SessionName) {
				Sessions.checkAddUser(SessionName);
				Sessions.addInfoSession(SessionName, {
					wh_status: req.body.wh_status,
					wh_message: req.body.wh_message,
					wh_qrcode: req.body.wh_qrcode,
					wh_connect: req.body.wh_connect
				});

				let response = await Wppconnect.initSession(req, res, SessionName)
				
				if (response != undefined) {
					return {
						"result": 200,
						"status": "CONNECTED",
						"response": `Sessão ${SessionName} inciada com sucesso`
					};
				}
			}
			
		} catch (error) {
			return {
				"result": 500,
				"status": "FAIL",
				"response": `${error.message}`
			};
		}
	}

	static async logoutSession(req, res, next) {
		let data = Sessions.getSession(req.body.SessionName)
		try {
			await data.client.logout();
			return {
				status: true,
				message: "Sessão Fechada com sucesso"
			};
		} catch (error) {
			return {
				status: 400,
				message: "Error ao fechar sessão", error
			};
		}
	}

	static async closeSession(req, res, next) {
		let session = req.body.SessionName;
		let data = Sessions.getSession(session)
		try {
			await data.client.close();
			res.setHeader('Content-Type', 'application/json');
			res.status(200).json({
				status: true,
				message: "Sessão Fechada com sucesso"
			});
		} catch (error) {
			res.setHeader('Content-Type', 'application/json');
			res.status(400).json({
				status: false,
				message: "Error ao fechar sessão", error
			});
		}
	}

	static async getQrCode(req, res) {
		let session = req.query.session;
		let sessionkey = req.query.sessionkey;
		let data = Sessions.getSession(session)
		if (!session) {
				return res.status(401).json({
						"result": 401,
						"messages": "Não autorizado, verifique se o nome da sessão esta correto"
				})
		}
		else
				if (data.sessionkey != sessionkey) {
						return res.status(401).json({
								"result": 401,
								"messages": "Não autorizado, verifique se o sessionkey esta correto"
						})
				}
				else {
						try {
								var img = Buffer.from(data.qrCode.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''), 'base64');
								res.writeHead(200, {
										'Content-Type': 'image/png',
										'Content-Length': img.length
								});
								res.end(img);
						} catch (ex) {
								return res.status(400).json({
										response: false,
										message: "Error ao recuperar QRCode !"
								});
						}
				}

}

	static async getSessionState(req, res, next) {
		let data = Sessions.getSession(req.body.SessionName)
		try {
			const client = data.client
			if (client == null || data.status == null){
			res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					status: 'CLOSED',
					qrcode: null
				});
			}else{
			res.setHeader('Content-Type', 'application/json');
			res.status(200).json({
				status: data.status
			});
		}
		} catch (ex) {
			res.setHeader('Content-Type', 'application/json');
			res.status(400).json({
				response: false,
				message: "A sessão não está ativa."
			});
		}
	}

	static async checkConnectionSession(req, res, next) {
		let data = Sessions.getSession(req.body.SessionName)
		try {
			await data.client.isConnected();
			res.setHeader('Content-Type', 'application/json');
			res.status(200).json({
				status: true,
				message: "Connected"
			});
		} catch (error) {
			res.setHeader('Content-Type', 'application/json');
			res.status(200).json({
				status: false,
				message: "Disconnected"
			});
		}
	}

	static async showAllSessions(req, res, next) {
		// let data = Sessions.getAll();
		// const allSessions = data.forEach(element => {
		//     return ({ session: element.session, status: element.status })

		// });
		// console.log(allSessions);
		// return res.status(200).json(allSessions);

		//res.status(200).json({ sessions: Sessions.getAll() })

		// const allSessions = await clientsArray.map((client) => {
		//     console.log(client);
		//     return client.session;
		// });

		// console.log(allSessions);
		// return res.status(200).json(allSessions);
	}
}
