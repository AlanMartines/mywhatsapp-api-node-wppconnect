const fs = require('fs-extra');
const {
	forEach
} = require('p-iteration');
const request = require('request');
const axios = require('axios');
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
					const sql = "SELECT token FROM tokens";
					const [row] = await conn.execute(sql);
					//
					if (row.length > 0) {
						//
						await forEach(row, async (SessionName) => {
							SessionsArray.push(SessionName.token);
						});
						//
					}
					return SessionsArray;
				} catch (err) {
					console.log("- Error:", err);
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
		} catch (err) {
			console.log("- Error:", err);
		}
	}

	static async startAllSessions() {
		let dados = await startAll.getAllSessions();
		if (dados != null) {
			dados.map(async (SessionName) => {
				await axios.post(`http://127.0.0.1:${config.PORT}/sistema/Start`, {
					"SessionName": SessionName,
					"MultiDevice": false,
					"whatsappVersion": null
				}).then(function (response) {
					console.log(response);
				}).catch(function (error) {
					console.log(error);
				});
			});
		}
	}
}