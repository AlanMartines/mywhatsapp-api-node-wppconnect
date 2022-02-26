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
	static async confToken(filePath, filename, dataRes, read) {
		//
		try {
			if (read) {
				if (fs.existsSync(`${filePath}/${filename}`)) {
					/*
					const confTokenRes = await fs.readFileSync(`${filePath}/${filename}`, 'utf8' , (err, data) => {
						if (err) throw err;
						let confToken = JSON.parse(data);
						return confToken;
					});
					*/
					let confTokenRes = require(`${filePath}/${filename}`);
					return confTokenRes;
				} else {
					return false;
				}
			} else {
				let data = JSON.stringify(dataRes, null, 2);
				await fs.writeFileSync(`${filePath}/${filename}`, data);
			}
		} catch (err) {
			return false;
		}
	}
	//
	// ------------------------------------------------------------------------------------------------------- //
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

	static async startSession(SessionName) {
		if (SessionName != null || typeof SessionName != 'undefined') {
			const confToken = await startAll.confToken(`${config.tokenPatch}`, `${SessionName}.auto.json`, null, true);
			return await axios.post(`http://127.0.0.1:${config.PORT}/sistema/Start`, {
				"SessionName": confToken.SessionName ? `${confToken.SessionName}` : SessionName,
				"MultiDevice": confToken.MultiDevice ? `${confToken.MultiDevice}` : null,
				"whatsappVersion": confToken.whatsappVersion ? `${confToken.whatsappVersion}` : null
			}).then(function (response) {
				return JSON.stringify(response.data, null, 2);
			}).catch(function (error) {
				console.log(error);
			});
		}
	}

	static async startAllSessions() {
		let dados = await startAll.getAllSessions();
		if (dados != null) {
			dados.map(async (SessionName) => {
				const confToken = await startAll.confToken(`${config.tokenPatch}`, `${SessionName}.auto.json`, null, true);
				await axios.post(`http://127.0.0.1:${config.PORT}/sistema/Start`, {
					"SessionName": confToken.SessionName ? `${confToken.SessionName}` : SessionName,
					"MultiDevice": confToken.MultiDevice ? `${confToken.MultiDevice}` : null,
					"whatsappVersion": confToken.whatsappVersion ? `${confToken.whatsappVersion}` : null
				}).then(function (response) {
					console.log(JSON.stringify(response.data, null, 2));
				}).catch(function (error) {
					console.log(error);
				});
			});
		}
	}
}