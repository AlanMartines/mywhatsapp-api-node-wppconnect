const Sessions = require('../controllers/sessions')

module.exports = class Status {
	/*
	╔╦╗┌─┐┬  ┬┬┌─┐┌─┐  ╔═╗┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐
	 ║║├┤ └┐┌┘││  ├┤   ╠╣ │ │││││   │ ││ ││││└─┐
	═╩╝└─┘ └┘ ┴└─┘└─┘  ╚  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘└─┘
	*/
	//
	// Delete the Service Worker
	static async killServiceWorker(SessionName) {
		console.log("- Delete the Service Worker");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultkillServiceWorker = await session.client.then(async client => {
			return await session.client.killServiceWorker().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Serviço parado com sucesso.",
					"killService": result
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao parar serviço."
				};
				//
			});
		});
		return resultkillServiceWorker;
	} //killServiceWorker
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Load the service again
	static async restartService(SessionName) {
		console.log("- Reload the service again");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultrestartService = await session.client.then(async client => {
			return await session.client.restartService().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Serviço reiniciado com sucesso.",
					"restartService": result
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao reiniciar serviço."
				};
				//
			});
		});
		return resultrestartService;
	} //restartService
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Get device info
	static async getHostDevice(SessionName) {
		console.log("- Obtendo informações do dispositivo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetHostDevice = await session.client.then(async client => {
			return await session.client.getHostDevice().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Dados do dispositivo obtido com sucesso",
					"HostDevice": {
						"user": result.wid.user,
						"connected": result.connected,
						"isResponse": result.isResponse,
						"battery": result.battery,
						"plugged": result.plugged,
						"locales": result.locales,
						"is24h": result.is24h,
						"device_manufacturer": result.phone.device_manufacturer,
						"platform": result.platform,
						"os_version": result.phone.os_version,
						"wa_version": result.phone.wa_version,
						"pushname": result.pushname
					}
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao obter dados do dispositivo"
				};
				//
			});
		});
		return resultgetHostDevice;
	} //getHostDevice
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Get is multi device info
	static async isMultiDevice(SessionName) {
		console.log("- Obendo informações do multi-device");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetHostDevice = await session.client.then(async client => {
			return await session.client.isMultiDevice().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Estado do MultiDevice obtido com sucesso",
					"isMultiDevice": result

				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao obter estatus do MultiDevice"
				};
				//
			});
		});
		return resultgetHostDevice;
	} //isMultiDevice
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Get connection state
	static async getConnectionState(SessionName) {
		console.log("- getConnectionState");
		var session = Sessions.getSession(SessionName);
		var resultisConnected = await session.client.then(async client => {
			return await session.client.getConnectionState().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Estado do dispositivo obtido com sucesso",
					"ConnectionState": result

				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao obter o estado da conexão"
				};
				//
			});
		});
		return resultisConnected;
	} //getConnectionState
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Get battery level
	static async getBatteryLevel(SessionName) {
		console.log("- Obtendo nivel de bateria");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetBatteryLevel = await session.client.then(async client => {
			return await session.client.getBatteryLevel().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Nivel da bateria obtido com sucesso",
					"BatteryLevel": result

				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao obter o nivel da bateria"
				};
				//
			});
		});
		return resultgetBatteryLevel;
	} //getBatteryLevel
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Is Connected
	static async isConnected(SessionName) {
		console.log("- Obtendo se esta conectado");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultisConnected = await session.client.then(async client => {
			return await session.client.isConnected().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Estatus obtido com sucesso",
					"Connected": result
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao obter estatus"
				};
				//
			});
		});
		return resultisConnected;
	} //isConnected
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Obter versão do WhatsappWeb
	static async getWAVersion(SessionName) {
		console.log("- Obtendo versão do WhatsappWeb");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetWAVersion = await session.client.then(async client => {
			return await session.client.getWAVersion().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Versão do WhatsappWeb obtido com sucesso",
					"WAVersion": result
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao obter versão do WhatsappWeb"
				};
				//
			});
		});
		return resultgetWAVersion;
	} //getWAVersion
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Inicia a verificação de conexão do telefone
	static async startPhoneWatchdog(SessionName, interval) {
		console.log("- Iniciando a verificação de conexão do telefone");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultstartPhoneWatchdog = await session.client.then(async client => {
			return await session.client.startPhoneWatchdog(interval).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Verificação de conexão do telefone iniciada com sucesso",
					"PhoneWatchdog": result
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao inicia a verificação de conexão do telefone"
				};
				//
			});
		});
		return resultstartPhoneWatchdog;
	} //startPhoneWatchdog
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Para a verificação de conexão do telefone
	static async stopPhoneWatchdog(SessionName) {
		console.log("- Parando a verificação de conexão do telefone");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultstopPhoneWatchdog = await session.client.then(async client => {
			return await session.client.stopPhoneWatchdog().then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Verificação de conexão parada iniciada com sucesso",
					"PhoneWatchdog": result
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao parar a verificação de conexão do telefone"
				};
				//
			});
		});
		return resultstopPhoneWatchdog;
	} //stopPhoneWatchdog
	//
	// ------------------------------------------------------------------------------------------------//
	//
}