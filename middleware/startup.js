const fs = require('fs-extra');
const {
	forEach
} = require('p-iteration');
const request = require('request');
const axios = require('axios');
const config = require('../config.global');
//const Sessions = require("../engines.js");
const tokenPatch = config.tokenPatch;
//
module.exports = class startAll {
	static async confToken(filePath, filename, dataRes, read) {
		//
		try {
			if (read) {
				if (fs.existsSync(`${filePath}/${filename}`)) {
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
			fs.readdir(tokenPatch, function (err, files) {
				if (!err) {
					if (files.length) {
						//
						fs.readdirSync(tokenPatch).forEach(SessionName => {
							if (SessionName.split('.')[2] == 'json') {
								console.log(`- File json Session: ${SessionName.split('.')[0]}`);
								SessionsArray.push(SessionName.split('.')[0]);
							}
							//
						});
						//
					}
				}
			});
			//
			return SessionsArray;
		} catch (err) {
			console.log("- Error:", err);
		}
	}

	static async startSession(SessionName) {
		console.log("- Auto startSession");
		if (SessionName != null && typeof SessionName != 'undefined') {
			const confToken = await this.confToken(`${config.tokenPatch}`, `${SessionName}.auto.json`, null, true);
			await axios.post(`http://127.0.0.1:${config.PORT}/sistema/Start`, {
				"SessionName": confToken.SessionName ? `${confToken.SessionName}` : `${cSessionName}`,
				"MultiDevice": confToken.MultiDevice ? `${confToken.MultiDevice}` : null,
				"whatsappVersion": confToken.whatsappVersion ? `${confToken.whatsappVersion}` : null
			}).then(function (response) {
				//console.log(JSON.stringify(response.data, null, 2));
				console.log(`SessionName ${SessionName} iniciado`);
			}).catch(function (error) {
				console.log(error);
			});
		}
	}

	static async startAllSessions() {
		console.log("- Auto startAllSessions");
		let dados = await this.getAllSessions();
		if (dados != null) {
			dados.map(async (SessionName) => {
				const confToken = await this.confToken(`${config.tokenPatch}`, `${SessionName}.auto.json`, null, true);
				await axios.post(`http://127.0.0.1:${config.PORT}/sistema/Start`, {
					"SessionName": confToken.SessionName ? `${confToken.SessionName}` : SessionName,
					"MultiDevice": confToken.MultiDevice ? `${confToken.MultiDevice}` : null,
					"whatsappVersion": confToken.whatsappVersion ? `${confToken.whatsappVersion}` : null
				}).then(function (response) {
					//console.log(JSON.stringify(response.data, null, 2));
					console.log(`SessionName ${SessionName} iniciado`);
				}).catch(function (error) {
					console.log(error);
				});
			});
		}
	}
}