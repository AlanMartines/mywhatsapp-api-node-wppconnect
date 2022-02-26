const fs = require('fs-extra');
const config = require('../config.global');
const tokenPatch = config.tokenPatch;
//
module.exports = class startAll {
	//
	static async getAllSessions() {
		try {
			const SessionsArray = [];
			//
			if (parseInt(config.VALIDATE_MYSQL) == true) {
				const conn = require('../config/dbConnection').promise();
				try {
					//
					const sql = "SELECT * FROM tokens WHERE token=? LIMIT 1";
					const values = [theTokenAuth];
					const [row] = await conn.execute(sql, values);
					//conn.end();
					//conn.release();
					//
					if (row.length > 0) {
						//
						const results = JSON.parse(JSON.stringify(row[0]));
						//
						const tokenToken = results.token.trim();
						//
					}
				} catch (err) {
					console.log("- Error:", err);
					res.setHeader('Content-Type', 'application/json');
					return res.status(400).json({
						"Status": {
							"result": "info",
							"state": "FAILURE",
							"status": "notChequed",
							"message": "Erro na verificação do token, contate o administrador do sistema"
						}
					});
				}
			} else {
				//
				fs.readdir(tokenPatch, function (err, files) {
					if (err) {
						console.log("- Error:", err);
						res.setHeader('Content-Type', 'application/json');
						return res.status(400).json({
							"Status": {
								"result": "info",
								"state": "FAILURE",
								"status": "notChequed",
								"message": "Erro na verificação do token, contate o administrador do sistema"
							}
						});
					} else {
						if (files.length) {
							//
							fs.readdirSync(tokenPatch).forEach(SessionName => {
								if (SessionName.split('.')[2] === 'json') {
									console.log(`- File json Session: ${SessionName.split('.')[0]}`);
									SessionsArray.push(SessionName.split('.')[0]);
								}
								//
							});
							//
						}
					}
				});
			}
			//
			return SessionsArray;
		} catch (error) {
			return (error.message);
		}
	}

	static async startAllSessions() {
		let dados = await startAll.getAllSessions();
		console.log("- Sessões:", dados);
		if (dados != null) {
			dados.map((SessionName) => {
				var options = {
					'method': 'POST',
					'json': true,
					'url': `http://127.0.0.1:${config.PORT}/sistema/Start`,
					'body': {
						"SessionName": SessionName,
						"MultiDevice": true,
						"whatsappVersion": null
					}

				};
				request(options).then(result => {
					console.log(result);
				}).catch(error => {
					console.log(error);
				})
			});
		}
	}
}