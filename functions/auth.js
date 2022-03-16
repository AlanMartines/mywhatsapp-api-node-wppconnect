const Sessions = require('../controllers/sessions');
const { exec } = require('child_process');
const config = require('../config.global');

module.exports = class Auth {

	static async logoutSession(req, res) {
		//#swagger.tags = ['Sessions']
		// #swagger.summary = 'Permite fazer logout da sessão desconectando do whats...'

		let session = req?.body?.session;
		let data = Sessions?.getSession(session)
		try {
			await data?.client?.logout();
			await data?.client?.close();
			await Sessions?.deleteSession(session);
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
			exec(`rm -rf ${config.tokenPatch}/WPP-${session}`, (error, stdout, stderr) => {
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
			req?.io?.emit('whatsapp-status', { status: false, session: session })
			res?.status(200)?.json({
				status: true,
				message: "Sessão Fechada com sucesso"
			});
		} catch (error) {
			res?.status(400)?.json({
				status: false,
				message: "Error ao fechar sessão", error
			});
		}
	}

	static async closeSession(req, res) {
		let session = req?.body?.session;
		let data = Sessions?.getSession(session)
		try {
			await data?.client?.close();
			await Sessions?.deleteSession(session);
			req?.io?.emit('whatsapp-status', { status: false, session: session });
			res?.status(200)?.json({
				status: true,
				message: "Sessão Fechada com sucesso"
			});
		} catch (error) {
			res?.status(400)?.json({
				status: false,
				message: "Error ao fechar sessão", error
			});
		}
	}

	static async RestartSession(req, res) {
		let session = req?.body?.session;
		let data = Sessions?.getSession(session);
		try {
			await data?.client?.restartService();

			req?.io?.emit('whatsapp-status', false, session);
			res?.status(200)?.json({
				status: true,
				message: "Sessão Reiniciada com sucesso"
			});
		} catch (error) {
			res?.status(400)?.json({
				status: false,
				message: "Error ao Reiniciar sessão", error
			});
		}
	}

	static async isMultiDevice(req, res) {
		let session = req?.body?.session;
		let data = Sessions?.getSession(session)
		try {
			let result = await data?.client?.isMultiDevice();
			res?.status(200)?.json({
				isMultiDevice: result
			});
		} catch (error) {
			res?.status(400)?.json({
				status: false,
				message: "Error ao checar sessão", error
			});
		}
	}

	static async getQrCode(req, res) {
		let session = req?.query?.session;
		let sessionkey = req?.query?.sessionkey;
		let data = Sessions?.getSession(session)
		if (!session) {
			return res?.status(401)?.json({
				"result": 401,
				"messages": "Não autorizado, verifique se o nome da sessão esta correto"
			})
		}
		else
			if (data?.sessionkey != sessionkey) {
				return res?.status(401)?.json({
					"result": 401,
					"messages": "Não autorizado, verifique se o sessionkey esta correto"
				})
			}
			else {
				try {
					var img = Buffer?.from(data?.qrCode?.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''), 'base64');
					res?.writeHead(200, {
						'Content-Type': 'image/png',
						'Content-Length': img?.length
					});
					res?.end(img);
				} catch (ex) {
					return res?.status(400)?.json({
						response: false,
						message: "Error ao recuperar QRCode !"
					});
				}
			}

	}

	static async getConnectionState(req, res) {
		try {
			let data = Sessions.getSession(req.body.session)
			let response = await data.client.getConnectionState()
			return res.status(200).json({
				"result": 200,
				"status": response
			})
		} catch (error) {
			return res.status(400).json({
				"result": 400,
				"status": "FAIL",
				"error": error
			})
		}
	}

	static async getConnectionStatus(req, res) {
		let data = Sessions?.getSession(req?.body?.session)
		try {
			return res?.status(200)?.json({
				"result": 200,
				status: data.status,
				state: data.state
			});
		} catch (error) {
			return res?.status(400)?.json({
				"result": 400,
				message: error
			});
		}
	}
	static async showAllSessions(req, res) {
		// let data = Sessions?.getAll();
		// const allSessions = data?.forEach(element => {
		//     return ({ session: element?.session, status: element?.status })

		// });
		// console?.log(allSessions);
		// return res?.status(200)?.json(allSessions);

		//res?.status(200)?.json({ sessions: Sessions?.getAll() })

		// const allSessions = await clientsArray?.map((client) => {
		//     console?.log(client);
		//     return client?.session;
		// });

		// console?.log(allSessions);
		// return res?.status(200)?.json(allSessions);
	}
}

