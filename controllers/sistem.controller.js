//
// Configuração dos módulos
const os = require('os');
const {
	forEach
} = require('p-iteration');
const fs = require('fs-extra');
const path = require('path');
const express = require("express");
const multer = require('multer');
const sleep = require('sleep-promise');
// https://stackoverflow.com/questions/60408575/how-to-validate-file-extension-with-multer-middleware
const upload = multer({})
const router = express.Router();
const Sessions = require("../sessions.js");
const verifyToken = require("../middleware/verifyToken");
const verifyJson = require("../middleware/validateJson");
//
// ------------------------------------------------------------------------------------------------//
//
async function deletaArquivosTemp(filePath) {
	//
	const cacheExists = await fs.pathExists(filePath);
	console.log('- O arquivo é: ' + cacheExists);
	if (cacheExists) {
		fs.remove(filePath);
		console.log('- O arquivo removido: ' + cacheExists);
	}
}
//
function soNumeros(string) {
	var numbers = string.replace(/[^0-9]/g, '');
	return numbers;
}
//
// ------------------------------------------------------------------------------------------------//
//
function removeWithspace(string) {
	var string = string.replace(/\r?\n|\r|\s+/g, ""); /* replace all newlines and with a space */
	return string;
}
//
// ------------------------------------------------------------------------------------------------//
//
function validPhone(phone) {
	// A função abaixo demonstra o uso de uma expressão regular que identifica, de forma simples, telefones válidos no Brasil.
	// Nenhum DDD iniciado por 0 é aceito, e nenhum número de telefone pode iniciar com 0 ou 1.
	// Exemplos válidos: +55 (11) 98888-8888 / 9999-9999 / 21 98888-8888 / 5511988888888
	//
	var isValid = /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/
	return isValid.test(phone);
}
//
// ------------------------------------------------------------------------------------------------//
//
String.prototype.toHHMMSS = function () {
	var sec_num = parseInt(this, 10); // não se esqueça do segundo parâmetro

	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);

	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	var time = hours + ':' + minutes + ':' + seconds;
	return time;
}
//
// ------------------------------------------------------------------------------------------------//
//
const convertBytes = function (bytes) {
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

	if (bytes == 0) {
		return "n/a"
	}

	const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))

	if (i == 0) {
		return bytes + " " + sizes[i]
	}

	return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i]
}
//
// ------------------------------------------------------------------------------------------------//
//
/*
╔═╗┌─┐┌┬┐┌┬┐┬┌┐┌┌─┐  ┌─┐┌┬┐┌─┐┬─┐┌┬┐┌─┐┌┬┐
║ ╦├┤  │  │ │││││ ┬  └─┐ │ ├─┤├┬┘ │ ├┤  ││
╚═╝└─┘ ┴  ┴ ┴┘└┘└─┘  └─┘ ┴ ┴ ┴┴└─ ┴ └─┘─┴┘
*/
//
router.post("/Start", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
			case 'qrRead':
				//
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sessionStatus
				});
				break;
			case 'notLogged':
			case 'deviceNotConnected':
			case 'desconnectedMobile':
			case 'qrReadFail':
			case 'deleteToken':
			case 'browserClose':
			case 'autocloseCalled':
			case 'serverClose':
			case 'deleteToken':
			case 'CLOSED':
			case 'DISCONNECTED':
			case 'NOTFOUND':
			case 'qrRead':
				//
				var getStart = await Sessions.Start(removeWithspace(req.body.SessionName), removeWithspace(req.body.SessionName));
				var session = Sessions.getSession(removeWithspace(req.body.SessionName));
				console.log("- AuthorizationToken:", removeWithspace(req.body.SessionName));
				session.state = 'STARTING';
				session.status = 'notLogged';
				var Start = {
					result: "info",
					state: 'STARTING',
					status: 'notLogged',
					message: 'Sistema iniciando e indisponivel para uso'
				};
				//
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": Start
				});
				//
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
	//
});
//
// ------------------------------------------------------------------------------------------------//
//
router.post("/Status", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var Status = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		res.setHeader('Content-Type', 'application/json');
		res.status(200).json({
			Status
		});
	}
}); //Status
//
// ------------------------------------------------------------------------------------------------//
//
// Fecha a sessão
router.post("/Close", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
			case 'qrRead':
				//
				var closeSession = await Sessions.closeSession(removeWithspace(req.body.SessionName));
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": closeSession
				});
				//
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //Close
//
// ------------------------------------------------------------------------------------------------//
//
// Desconecta do whatsapp web
router.post("/Logout", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var LogoutSession = await Sessions.logoutSession(removeWithspace(req.body.SessionName));
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": LogoutSession
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //Logout
//
// ------------------------------------------------------------------------------------------------//
//
// Gera o QR-Code
router.post("/QRCode", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	console.log("- getQRCode");
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		var session = Sessions.getSession(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sessionStatus
				});
				break;
			//
			case 'notLogged':
			case 'qrReadFail':
			case 'deviceNotConnected':
			case 'desconnectedMobile':
			case 'deleteToken':
			case 'qrRead':
				//
				if (req.body.View === true) {
					var xSession = session.qrcode;
					if (xSession) {
						const imageBuffer = Buffer.from(xSession.replace('data:image/png;base64,', ''), 'base64');
						//
						res.writeHead(200, {
							'Content-Type': 'image/png',
							'Content-Length': imageBuffer.length
						});
						//
						res.status(200).end(imageBuffer);
						//
					} else {
						var getQRCode = {
							result: 'error',
							state: 'NOTFOUND',
							status: 'notLogged',
							message: 'Sistema Off-line'
						};
						//
						res.setHeader('Content-Type', 'application/json');
						res.status(200).json({
							"Status": getQRCode
						});
						//
					}
				} else if (req.body.View === false) {
					var getQRCode = {
						result: "success",
						state: session.state,
						status: session.status,
						qrcode: session.qrcode,
						message: "Aguardando leitura do QR-Code"
					};
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": getQRCode
					});
					//
				}
				//
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
	//
});
//
// ------------------------------------------------------------------------------------------------//
//
router.post("/getSessions", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var getSessions = await Sessions.getSessions();
		//
		//console.log(result);
		res.setHeader('Content-Type', 'application/json');
		res.status(200).json({
			getSessions
		});
	}
}); //getSessions
//
// ------------------------------------------------------------------------------------------------//
//
// Dados de memoria e uptime
router.post("/getHardWare", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	console.log("- getHardWare");
	//
	var getHardWare = {
		"noformat": {
			uptime: os.uptime(),
			freemem: os.freemem(),
			memusage: (os.totalmem() - os.freemem()),
			totalmem: os.totalmem(),
			freeusagemem: `${Math.round((os.freemem() * 100) / os.totalmem()).toFixed(0)}`,
			usagemem: `${Math.round(((os.totalmem() - os.freemem()) * 100) / os.totalmem()).toFixed(0)}`
		},
		"format": {
			uptime: (os.uptime() + "").toHHMMSS(),
			freemem: convertBytes(os.freemem()),
			memusage: convertBytes((os.totalmem() - os.freemem())),
			totalmem: convertBytes(os.totalmem()),
			freeusagemem: `${Math.round((os.freemem() * 100) / os.totalmem()).toFixed(0)} %`,
			usagemem: `${Math.round(((os.totalmem() - os.freemem()) * 100) / os.totalmem()).toFixed(0)} %`
		}
	};
	//console.log(result);
	res.setHeader('Content-Type', 'application/json');
	res.status(200).json({
		"Status": getHardWare
	});
}); //getHardWare
//
// ------------------------------------------------------------------------------------------------//
//
/*
╔╗ ┌─┐┌─┐┬┌─┐  ╔═╗┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐  ┬ ┬┌─┐┌─┐┌─┐┌─┐
╠╩╗├─┤└─┐││    ╠╣ │ │││││   │ ││ ││││└─┐  │ │└─┐├─┤│ ┬├┤ 
╚═╝┴ ┴└─┘┴└─┘  ╚  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘└─┘  └─┘└─┘┴ ┴└─┘└─┘
*/
//
//Eviar menssagem de voz
router.post("/sendVoice", upload.single('file'), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.file || !req.body.phonefull) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		//Eviar menssagem de voz
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.file.originalname);
					fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
					console.log("- File", filePath);
					//
					var checkNumberStatus = await Sessions.checkNumberStatus(
						removeWithspace(req.body.SessionName),
						soNumeros(req.body.phonefull).trim() + '@c.us'
					);
					//
					if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
						//
						var sendVoice = await Sessions.sendVoice(
							removeWithspace(req.body.SessionName),
							checkNumberStatus.number + '@c.us',
							filePath
						);
						//
					} else {
						var sendVoice = checkNumberStatus;
					}
					//
					await deletaArquivosTemp(filePath);
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendVoice
					});
				} catch (error) {
					//
					var erroStatus = {
						"erro": true,
						"status": 404,
						"message": "Erro ao enviar menssagem"
					};
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(400).json({
						"Status": erroStatus
					});
				}
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendVoice
//
// ------------------------------------------------------------------------------------------------//
//
//Eviar menssagem de voz
router.post("/sendVoiceBase64", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.body.base64 || !req.body.mimetype) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var sendVoiceBase64 = await Sessions.sendVoiceBase64(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						req.body.base64,
						req.body.mimetype
					);
					//
				} else {
					var sendVoiceBase64 = checkNumberStatus;
				}
				//
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sendVoiceBase64
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendVoice
//
// ------------------------------------------------------------------------------------------------//
//
//Eviar menssagem de voz
router.post("/sendVoiceFileBase64", upload.single('file'), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.file || !req.body.phonefull) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		//Eviar menssagem de voz
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var sendVoiceBase64 = await Sessions.sendVoiceBase64(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						req.file.buffer.toString('base64'),
						req.file.mimetype
					);
					//
				} else {
					var sendVoiceBase64 = checkNumberStatus;
				}
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sendVoiceBase64
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendVoice
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar Contato
router.post("/sendContactVcard", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.body.contact || !req.body.namecontact) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var sendContactVcard = await Sessions.sendContactVcard(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						soNumeros(req.body.contact) + '@c.us',
						req.body.namecontact
					);
					//
				} else {
					var sendContactVcard = checkNumberStatus;
				}
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sendContactVcard
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendContactVcard
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar Lista de Contato
router.post("/sendContactVcardList", upload.single('file'), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.file) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.file.originalname);
					fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
					console.log("- File:", filePath);
					//
					//
					var checkNumberStatus = await Sessions.checkNumberStatus(
						removeWithspace(req.body.SessionName),
						soNumeros(req.body.phonefull).trim() + '@c.us'
					);
					//
					if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
						//
						var arrayNumbers = fs.readFileSync(filePath, 'utf-8').toString().split(/\r?\n/);
						//
						var contactlistValid = [];
						var contactlistInvalid = [];
						//
						for (var i in arrayNumbers) {
							//console.log(arrayNumbers[i]);
							var numero = soNumeros(arrayNumbers[i]);
							//
							if (numero.length !== 0) {
								//
								contactlistValid.push(numero + '@c.us');
								//
							}
							await sleep(1000);
						}
						//
						var sendContactVcardList = await Sessions.sendContactVcardList(
							removeWithspace(req.body.SessionName),
							checkNumberStatus.number + '@c.us',
							contactlistValid,
							contactlistInvalid
						);
						//
					} else {
						var sendContactVcardList = sessionStatus;
					}
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendContactVcardList
					});
				} catch (error) {
					//
					var erroStatus = {
						"erro": true,
						"status": 404,
						"message": "Erro ao enviar menssagem"
					};
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(400).json({
						"Status": erroStatus
					});
				}
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendContactVcardList
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar Texto
router.post("/sendText", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.body.msg) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var sendText = await Sessions.sendText(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						req.body.msg
					);

					//
				} else {
					var sendText = checkNumberStatus;
				}
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sendText
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendText
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar Texto em Massa
router.post("/sendTextMassa", upload.single('file'), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.file || !req.body.msg) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var sendTextMassa = [];
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.file.originalname);
					fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
					console.log("- File:", filePath);
					//
					var arrayNumbers = fs.readFileSync(filePath, 'utf-8').toString().split(/\r?\n/);
					for (var i in arrayNumbers) {
						//console.log(arrayNumbers[i]);
						var numero = soNumeros(arrayNumbers[i]);
						//
						if (numero.length !== 0) {
							//
							var checkNumberStatus = await Sessions.checkNumberStatus(
								removeWithspace(req.body.SessionName),
								soNumeros(numero) + '@c.us'
							);
							//
							if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
								//
								var sendTextMassaRes = await Sessions.sendText(
									removeWithspace(req.body.SessionName),
									checkNumberStatus.number + '@c.us',
									req.body.msg
								);
								//
							} else {
								var sendTextMassaRes = checkNumberStatus;
							}
							//
							sendTextMassa.push(sendTextMassaRes);
							//
						}
						await sleep(1000);
					}
					//
					//
					await deletaArquivosTemp(filePath);
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendTextMassa
					});
				} catch (error) {
					//
					var erroStatus = {
						"erro": true,
						"status": 404,
						"message": "Erro ao enviar menssagem"
					};
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(400).json({
						"Status": erroStatus
					});
				}
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendText
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar localização
router.post("/sendLocation", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.body.lat || !req.body.long || !req.body.local) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var sendLocation = await Sessions.sendLocation(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						req.body.lat,
						req.body.long,
						req.body.local
					);
					//
				} else {
					var sendLocation = checkNumberStatus;
				}
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sendLocation
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendLocation
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar links com preview
router.post("/sendLinkPreview", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.body.link || !req.body.descricao) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		if (!validUrl.isUri(req.body.link)) {
			var validate = {
				result: "error",
				state: 'FAILURE',
				status: 'notProvided',
				message: 'O link informado é invalido, corrija e tente novamente.'
			};
			//
			res.setHeader('Content-Type', 'application/json');
			res.status(400).json({
				"Status": validate
			});
			//
		}
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var sendLinkPreview = await Sessions.sendLinkPreview(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						req.body.link,
						req.body.descricao
					);
					//
				} else {
					var sendLinkPreview = checkNumberStatus;
				}
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sendLinkPreview
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendLinkPreview
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar Imagem
router.post("/sendImage", upload.single('file'), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.file || !req.body.caption) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.file.originalname);
					fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
					console.log("- File", filePath);
					//
					var checkNumberStatus = await Sessions.checkNumberStatus(
						removeWithspace(req.body.SessionName),
						soNumeros(req.body.phonefull).trim() + '@c.us'
					);
					//
					if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
						//
						var sendImage = await Sessions.sendImage(
							removeWithspace(req.body.SessionName),
							checkNumberStatus.number + '@c.us',
							filePath,
							req.file.originalname,
							req.body.caption
						);
						//
					} else {
						var sendImage = checkNumberStatus;
					}
					//
					//
					await deletaArquivosTemp(filePath);
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendImage
					});
				} catch (error) {
					//
					var erroStatus = {
						"erro": true,
						"status": 404,
						"message": "Erro ao enviar menssagem"
					};
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(400).json({
						"Status": erroStatus
					});
				}
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendImage
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar Imagem em Massa
var sendImageMassa = upload.fields([{
	name: 'phonefull',
	maxCount: 1
}, {
	name: 'fileimg',
	maxCount: 1
}]);
//
router.post("/sendImageMassa", sendImageMassa, verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.phonefull[0] || !req.fileimg[0] || !req.body.caption) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
					var filePathContato = path.join(folderName, req.files['phonefull'][0].originalname);
					fs.writeFileSync(filePathContato, req.files['phonefull'][0].buffer.toString('base64'), 'base64');
					console.log("- File:", filePathContato);
					//
					//
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
					var filePathImagem = path.join(folderName, req.files['fileimg'][0].originalname);
					fs.writeFileSync(filePathImagem, req.files['fileimg'][0].buffer.toString('base64'), 'base64');
					console.log("- File:", filePathImagem);
					//
					var sendImageMassa = [];
					//
					var arrayNumbers = fs.readFileSync(filePathContato, 'utf-8').toString().split(/\r?\n/);
					for (var i in arrayNumbers) {
						//console.log(arrayNumbers[i]);
						var numero = arrayNumbers[i].trim();
						//
						if (numero.length !== 0) {
							//
							var checkNumberStatus = await Sessions.checkNumberStatus(
								removeWithspace(req.body.SessionName),
								soNumeros(numero) + '@c.us'
							);
							//
							if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
								//
								var sendImageMassaRes = await Sessions.sendImage(
									removeWithspace(req.body.SessionName),
									checkNumberStatus.number + '@c.us',
									filePathImagem,
									req.files['fileimg'][0].originalname,
									req.body.caption
								);
								//
							} else {
								var sendImageMassaRes = checkNumberStatus;
							}
							//
							//return sendResult;
							//
							sendImageMassa.push(sendImageMassaRes);
						}
						await sleep(1000);
					}
					//
					await deletaArquivosTemp(filePathContato);
					//
					//
					await deletaArquivosTemp(filePathImagem);
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendImageMassa
					});
				} catch (error) {
					//
					var erroStatus = {
						"erro": true,
						"status": 404,
						"message": "Erro ao enviar menssagem"
					};
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(400).json({
						"Status": erroStatus
					});
				}
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendImageMassa
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar varia imagens
router.post("/sendMultImage", upload.array('file', 50), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.files || !req.body.caption) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				//
				var resultsFiles = req.files;
				//
				var sendMultImage = [];
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					await forEach(resultsFiles, async (resultfile) => {
						//
						try {
							var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
							var filePathImagem = path.join(folderName, resultfile.originalname);
							fs.writeFileSync(filePathImagem, resultfile.buffer.toString('base64'), 'base64');
							console.log("- File:", filePathImagem);
							//
							var sendMultImageRes = await Sessions.sendImage(
								removeWithspace(req.body.SessionName),
								checkNumberStatus.number + '@c.us',
								filePathImagem,
								resultfile.originalname,
								req.body.caption
							);
							//
							sendMultImage.push(sendMultImageRes);
							//
							await sleep(1000);
							//
							await deletaArquivosTemp(filePathImagem);
							//
						} catch (error) {
							//
							var erroStatus = {
								"erro": true,
								"status": 404,
								"number": checkNumberStatus.number,
								"message": "Erro ao enviar menssagem"
							};
							//
							sendMultImage.push(erroStatus);
							//
							await sleep(1000);
							//
							await deletaArquivosTemp(filePathImagem);
							//
						}
					});
				} else {
					var sendMultImage = checkNumberStatus;
				}
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sendMultImage
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendMultImage
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar variar imagens para varios contaos
var sendMultImageMassa = upload.fields([{
	name: 'phonefull',
	maxCount: 1
}, {
	name: 'file',
	maxCount: 50
}]);
//
router.post("/sendMultImageMassa", sendMultImageMassa, verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.files['phonefull'][0] || !req.files.file) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				//
				var resultsFilesImg = req.files.file;
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
					var filePathContato = path.join(folderName, req.files['phonefull'][0].originalname);
					fs.writeFileSync(filePathContato, req.files['phonefull'][0].buffer.toString('base64'), 'base64');
					console.log("- File Contato:", filePathContato);
					var arrayNumbers = fs.readFileSync(filePathContato, 'utf-8').toString().split(/\r?\n/);
					//
					var sendMultImageMassa = [];
					//
					for (var i in arrayNumbers) {
						//console.log(arrayNumbers[i]);
						var numero = arrayNumbers[i].trim();
						//
						if (numero.length !== 0) {
							//
							var checkNumberStatus = await Sessions.checkNumberStatus(
								removeWithspace(req.body.SessionName),
								soNumeros(numero) + '@c.us'
							);
							//
							if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
								//
								await forEach(resultsFilesImg, async (resultfile) => {
									//
									try {
										var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
										var filePathImagem = path.join(folderName, resultfile.originalname);
										fs.writeFileSync(filePathImagem, resultfile.buffer.toString('base64'), 'base64');
										console.log("- File Imagem:", filePathImagem);
										//
										var sendMultImageMassaRes = await Sessions.sendImage(
											removeWithspace(req.body.SessionName),
											checkNumberStatus.number + '@c.us',
											filePathImagem,
											resultfile.originalname,
											req.body.caption
										);
										//
										sendMultImageMassa.push(sendMultImageMassaRes);
										//
										await sleep(1000);
										//
										//
										await deletaArquivosTemp(filePathImagem);
										//
									} catch (error) {
										//
										var erroStatus = {
											"erro": true,
											"status": 404,
											"number": checkNumberStatus.number,
											"message": "Erro ao enviar menssagem"
										};
										//
										//
										sendMultImageMassa.push(erroStatus);
										//
										await sleep(1000);
										//
										//
										await deletaArquivosTemp(filePathImagem);
										//
									}
								});
								//
								await deletaArquivosTemp(filePathContato);
								//

							} else {
								var sendMultImageMassa = checkNumberStatus;
							}
						}
						await sleep(1000);
					}
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendMultImageMassa
					});
				} catch (error) {
					//
					var erroStatus = {
						"erro": true,
						"status": 404,
						"message": "Erro ao enviar menssagem"
					};
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(400).json({
						"Status": erroStatus
					});
				}
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendMultImageMassa
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar arquivo/documento
router.post("/sendFile", upload.single('file'), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.file || !req.body.caption) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.file.originalname);
					fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
					console.log("- File", filePath);
					//
					var checkNumberStatus = await Sessions.checkNumberStatus(
						removeWithspace(req.body.SessionName),
						soNumeros(req.body.phonefull).trim() + '@c.us'
					);
					//
					if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
						//
						var sendFile = await Sessions.sendFile(
							removeWithspace(req.body.SessionName),
							checkNumberStatus.number + '@c.us',
							filePath,
							req.file.originalname,
							req.body.caption
						);
						//
					} else {
						var sendFile = checkNumberStatus;
					}
					//
					//
					await deletaArquivosTemp(filePath);
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendFile
					});
				} catch (error) {
					//
					var erroStatus = {
						"erro": true,
						"status": 404,
						"message": "Erro ao enviar menssagem"
					};
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(400).json({
						"Status": erroStatus
					});
				}
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendFile
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar arquivo/documento
router.post("/sendFileBase64", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.body.base64 || !req.body.originalname || !req.body.caption) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.body.originalname);
					fs.writeFileSync(filePath, req.body.base64, 'base64');
					console.log("- File", filePath);
					//
					var checkNumberStatus = await Sessions.checkNumberStatus(
						removeWithspace(req.body.SessionName),
						soNumeros(req.body.phonefull).trim() + '@c.us'
					);
					//
					if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
						//
						var sendFileBase64 = await Sessions.sendFile(
							removeWithspace(req.body.SessionName),
							checkNumberStatus.number + '@c.us',
							filePath,
							req.body.originalname,
							req.body.caption
						);
						//
					} else {
						var sendFileBase64 = checkNumberStatus;
					}
					//
					await deletaArquivosTemp(filePath);
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendFileBase64
					});
				} catch (error) {
					//
					var erroStatus = {
						"erro": true,
						"status": 404,
						"message": "Erro ao enviar menssagem"
					};
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(400).json({
						"Status": erroStatus
					});
				}
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendFileBase64
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar arquivo/documento
router.post("/sendFileToBase64", upload.single('file'), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.file || !req.body.caption) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var sendFileFromBase64 = await Sessions.sendFileFromBase64(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						req.file.buffer.toString('base64'),
						req.file.mimetype,
						req.file.originalname,
						req.body.msg
					);
					//
				} else {
					var sendFileFromBase64 = checkNumberStatus;
				}
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sendFileFromBase64
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendFileBase64
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar arquivo/documento
router.post("/sendFileFromBase64", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.body.base64 || !req.body.mimetype || !req.body.originalname || !req.body.caption) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var sendFileFromBase64 = await Sessions.sendFileFromBase64(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						req.body.base64,
						req.body.mimetype,
						req.body.originalname,
						req.body.caption
					);
					//
				} else {
					var sendFileFromBase64 = checkNumberStatus;
				}
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sendFileFromBase64
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendFileFromBase64
//
// ------------------------------------------------------------------------------------------------//
//
/*
╦═╗┌─┐┌┬┐┬─┐┬┌─┐┬  ┬┬┌┐┌┌─┐  ╔╦╗┌─┐┌┬┐┌─┐                
╠╦╝├┤  │ ├┬┘│├┤ └┐┌┘│││││ ┬   ║║├─┤ │ ├─┤                
╩╚═└─┘ ┴ ┴└─┴└─┘ └┘ ┴┘└┘└─┘  ═╩╝┴ ┴ ┴ ┴ ┴                
*/
//
// Recuperar contatos
router.post("/getAllContacts", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getAllContacts = await Sessions.getAllContacts(
					req.body.SessionName
				);
				//
				res.json({
					"Status": getAllContacts
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getAllContacts
//
// ------------------------------------------------------------------------------------------------------- //
//
// Recuperar grupos
router.post("/getAllGroups", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getAllGroups = await Sessions.getAllGroups(
					req.body.SessionName
				);
				//
				res.json({
					"Status": getAllGroups
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getAllGroups
//
// ------------------------------------------------------------------------------------------------------- //
//
// Returns browser session token
router.post("/getSessionTokenBrowser", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getSessionTokenBrowser = await Sessions.getSessionTokenBrowser(
					req.body.SessionName
				);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getSessionTokenBrowser
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getSessionTokenBrowser
//
// ------------------------------------------------------------------------------------------------------- //
//
// Chama sua lista de contatos bloqueados
router.post("/getBlockList", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getBlockList = await Sessions.getBlockList(
					req.body.SessionName
				);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getBlockList
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getBlockList
//
// ------------------------------------------------------------------------------------------------//
//
// Recuperar status de contato
router.post("/getStatus", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var getStatus = await Sessions.getStatus(
						removeWithspace(req.body.SessionName),
						soNumeros(req.body.phonefull).trim() + '@c.us'
					);
					//
				} else {
					var getStatus = checkNumberStatus;
				}
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getStatus
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getStatus
//
// ------------------------------------------------------------------------------------------------------- //
//
// Obter o perfil do número
router.post("/getNumberProfile", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var getNumberProfile = await Sessions.getNumberProfile(
						removeWithspace(req.body.SessionName),
						soNumeros(req.body.phonefull).trim() + '@c.us'
					);
					//
				} else {
					var getNumberProfile = checkNumberStatus;
				}
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getNumberProfile
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getNumberProfile
//
// ------------------------------------------------------------------------------------------------------- //
//
// Obter o perfil do número
router.post("/getProfilePicFromServer", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var getProfilePicFromServer = await Sessions.getProfilePicFromServer(
						removeWithspace(req.body.SessionName),
						soNumeros(req.body.phonefull).trim() + '@c.us'
					);
					//
				} else {
					var getProfilePicFromServer = checkNumberStatus;
				}
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getProfilePicFromServer
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getProfilePicFromServer
//
// ------------------------------------------------------------------------------------------------------- //
//
// Verificar o status do número
router.post("/checkNumberStatus", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": checkNumberStatus
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //checkNumberStatus
//
// ------------------------------------------------------------------------------------------------------- //
//
// Verificar o status do número em massa
router.post("/checkNumberStatusMassa", upload.single('file'), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.file) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
				var filePath = path.join(folderName, req.file.originalname);
				fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
				console.log("- File:", filePath);
				//
				var checkNumberStatusMassa = [];
				//
				var arrayNumbers = fs.readFileSync(filePath, 'utf-8').toString().split(/\r?\n/);
				for (var i in arrayNumbers) {
					//console.log(soNumeros(arrayNumbers[i]));
					var numero = soNumeros(arrayNumbers[i]);
					//
					if (numero.length !== 0) {
						//
						var checkNumberStatus = await Sessions.checkNumberStatus(
							removeWithspace(req.body.SessionName),
							soNumeros(numero) + '@c.us'
						);
						//
						if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
							//
							checkNumberStatusMassa.push(checkNumberStatus);
							//
						} else {
							var checkNumberStatusMassa = checkNumberStatus;
						}
					}
					await sleep(1000);
				}
				//
				await deletaArquivosTemp(filePath);
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": checkNumberStatusMassa
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //checkNumberStatusMassa
//
// ------------------------------------------------------------------------------------------------------- //
//
/*
╔═╗┬─┐┌─┐┬ ┬┌─┐  ╔═╗┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐               
║ ╦├┬┘│ ││ │├─┘  ╠╣ │ │││││   │ ││ ││││└─┐               
╚═╝┴└─└─┘└─┘┴    ╚  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘└─┘               
*/
//
//Enviar Texto em Grupo
router.post("/sendTextGrupo", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.groupId || !req.body.msg) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var sendTextGrupo = await Sessions.sendText(
					removeWithspace(req.body.SessionName),
					req.body.groupId.trim() + '@g.us',
					req.body.msg
				);
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sendTextGrupo
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendTextGrupo
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar localização no grupo
router.post("/sendLocationGroup", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.groupId || !req.body.lat || !req.body.long || !req.body.local) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var sendLocationGroup = await Sessions.sendLocation(
					removeWithspace(req.body.SessionName),
					req.body.groupId.trim() + '@g.us',
					req.body.lat,
					req.body.long,
					req.body.local
				);
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sendLocationGroup
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendLocationGroup
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar imagen no grupo
router.post("/sendImageGroup", upload.single('file'), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.groupId || !req.file || !req.body.caption) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.file.originalname);
					fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
					console.log("- File", filePath);
					//
					var sendImageGroup = await Sessions.sendImage(
						removeWithspace(req.body.SessionName),
						req.body.groupId.trim() + '@g.us',
						filePath,
						req.file.originalname,
						req.body.caption
					);
					//
					//
					await deletaArquivosTemp(filePath);
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendImageGroup
					});
				} catch (error) {
					//
					var erroStatus = {
						"erro": true,
						"status": 404,
						"message": "Erro ao enviar menssagem"
					};
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(400).json({
						"Status": erroStatus
					});
				}
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendImageGroup
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar arquivo/documento
router.post("/sendFileGroup", upload.single('file'), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.groupId || !req.file || !req.body.caption) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.file.originalname);
					fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
					console.log("- File", filePath);
					//
					var sendFileGroup = await Sessions.sendFile(
						removeWithspace(req.body.SessionName),
						req.body.groupId.trim() + '@g.us',
						filePath,
						req.file.originalname,
						req.body.caption
					);
					//
					await deletaArquivosTemp(filePath);
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendFileGroup
					});
				} catch (error) {
					//
					var erroStatus = {
						"erro": true,
						"status": 404,
						"message": "Erro ao enviar menssagem"
					};
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(400).json({
						"Status": erroStatus
					});
				}
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendFileGroup
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar arquivo/documento
router.post("/sendFileBase64Group", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.groupId || !req.body.base64 || !req.body.originalname || !req.body.caption) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.body.originalname);
					fs.writeFileSync(filePath, req.body.base64, 'base64');
					console.log("- File", filePath);
					//
					var sendFileBase64 = await Sessions.sendFile(
						removeWithspace(req.body.SessionName),
						req.body.groupId + '@g.us',
						filePath,
						req.body.originalname,
						req.body.caption
					);
					//
					await deletaArquivosTemp(filePath);
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendFileBase64
					});
				} catch (error) {
					//
					var erroStatus = {
						"erro": true,
						"status": 404,
						"message": "Erro ao enviar menssagem"
					};
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(400).json({
						"Status": erroStatus
					});
				}
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendFileBase64Group
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar arquivo/documento
router.post("/sendFileToBase64Group", upload.single('file'), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.groupId || !req.file || !req.body.caption) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var sendFileToBase64 = await Sessions.sendFileFromBase64(
					removeWithspace(req.body.SessionName),
					req.body.groupId.trim() + '@g.us',
					req.file.buffer.toString('base64'),
					req.file.mimetype,
					req.file.originalname,
					req.body.msg
				);
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sendFileToBase64
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendFileToBase64Group
//
// ------------------------------------------------------------------------------------------------------- //
//
// Enviar arquivo/documento
router.post("/sendFileFromBase64Group", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.groupId || !req.body.base64 || !req.body.mimetype || !req.body.originalname || !req.body.caption) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var sendFileFromBase64 = await Sessions.sendFileFromBase64(
					removeWithspace(req.body.SessionName),
					req.body.groupId.trim() + '@g.us',
					req.body.base64,
					req.body.mimetype,
					req.body.originalname,
					req.body.msg
				);
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sendFileFromBase64
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendFileFromBase64Group
//
// ------------------------------------------------------------------------------------------------------- //
//
//Deixar o grupo
router.post("/leaveGroup", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.groupId) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var leaveGroup = await Sessions.leaveGroup(
					removeWithspace(req.body.SessionName),
					req.body.groupId + '@g.us'
				);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": leaveGroup
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //leaveGroup
//
// ------------------------------------------------------------------------------------------------------- //
//
// Criar grupo (título, participantes a adicionar)
router.post("/createGroup", upload.single('file'), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.title || !req.file) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		if (req.body.title.length >= 25) {
			var validate = {
				result: "info",
				state: 'FAILURE',
				status: 'notProvided',
				message: 'O nome do grupo não pode exceder 25 caracter.'
			};
			//
			res.setHeader('Content-Type', 'application/json');
			res.status(400).json({
				"Status": validate
			});
			//
		}
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.file.originalname);
					fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
					console.log("- File:", filePath);
					//
					var arrayNumbers = fs.readFileSync(filePath, 'utf-8').toString().split(/\r?\n/);
					//
					var contactlistValid = [];
					var contactlistInvalid = [];
					//
					for (var i in arrayNumbers) {
						//console.log(arrayNumbers[i]);
						var numero = soNumeros(arrayNumbers[i]);
						//
						if (numero.length !== 0) {
							//
							var checkNumberStatus = await Sessions.checkNumberStatus(
								removeWithspace(req.body.SessionName),
								soNumeros(numero) + '@c.us'
							);
							//
							if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
								//
								contactlistValid.push(checkNumberStatus.number + '@c.us');
							} else {
								contactlistInvalid.push(numero + '@c.us');
							}
							//
						}
						//
						await sleep(1000);
					}
					//
					var createGroup = await Sessions.createGroup(
						removeWithspace(req.body.SessionName),
						req.body.title,
						contactlistValid,
						contactlistInvalid
					);
					//
					await deletaArquivosTemp(filePath);
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": createGroup
					});
				} catch (error) {
					//
					var erroStatus = {
						"erro": true,
						"status": 404,
						"message": "Erro ao criar grupo"
					};
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(400).json({
						"Status": erroStatus
					});
				}
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //createGroup
//
// ------------------------------------------------------------------------------------------------//
//
// Obtenha membros do grupo
router.post("/getGroupMembers", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.groupId) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getGroupMembers = await Sessions.getGroupMembers(
					removeWithspace(req.body.SessionName),
					req.body.groupId + '@g.us'
				);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getGroupMembers
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getGroupMembers
//
// ------------------------------------------------------------------------------------------------//
//
// Obter IDs de membros do grupo 
router.post("/getGroupMembersIds", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.groupId) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getGroupMembersIds = await Sessions.getGroupMembersIds(
					removeWithspace(req.body.SessionName),
					req.body.groupId + '@g.us'
				);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getGroupMembersIds
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getGroupMembersIds
//
// ------------------------------------------------------------------------------------------------//
//
// Gerar link de url de convite de grupo
router.post("/getGroupInviteLink", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.groupId) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var GroupInviteLink = await Sessions.getGroupInviteLink(
					removeWithspace(req.body.SessionName),
					req.body.groupId + '@g.us'
				);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": GroupInviteLink
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getGroupInviteLink
//
// ------------------------------------------------------------------------------------------------//
//
// Criar grupo (título, participantes a adicionar)
router.post("/createGroupSetAdminMembers", upload.single('file'), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.title || !req.file) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		if (req.body.title.length >= 25) {
			var validate = {
				result: "info",
				state: 'FAILURE',
				status: 'notProvided',
				message: 'O nome do grupo não pode exceder 25 caracter.'
			};
			//
			res.setHeader('Content-Type', 'application/json');
			res.status(400).json({
				"Status": validate
			});
			//
		}
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var createGroupSetAdminMembers = [];
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.file.originalname);
					fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
					console.log("- File:", filePath);
					//
					var arrayNumbers = fs.readFileSync(filePath, 'utf-8').toString().split(/\r?\n/);
					//
					var contactlistValid = [];
					var contactlistInvalid = [];
					//
					for (var i in arrayNumbers) {
						//console.log(arrayNumbers[i]);
						var numero = soNumeros(arrayNumbers[i]);
						//
						if (numero.length !== 0) {
							//
							var checkNumberStatus = await Sessions.checkNumberStatus(
								removeWithspace(req.body.SessionName),
								soNumeros(numero) + '@c.us'
							);
							//
							if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
								//
								contactlistValid.push(checkNumberStatus.number + "@c.us");
							} else {
								contactlistInvalid.push(numero + "@c.us");
							}
							//
						}
						//
						await sleep(1000);
					}
					//
					var createGroup = await Sessions.createGroup(
						removeWithspace(req.body.SessionName),
						req.body.title,
						contactlistValid,
						contactlistInvalid
					);
					//
					await sleep(5000);
					//
					createGroupSetAdminMembers.push(createGroup);
					//
					if (createGroup.erro !== true && createGroup.status !== 404) {
						//
						await forEach(contactlistValid, async (resultfile) => {
							//
							var promoteParticipant = await Sessions.promoteParticipant(
								removeWithspace(req.body.SessionName),
								createGroup.gid + '@g.us',
								resultfile
							);
							//
							createGroupSetAdminMembers.push(promoteParticipant);
							//
							await sleep(1000);
						});
						//
					} else {
						var createGroupSetAdminMembers = createGroup;
					}
					//
					await deletaArquivosTemp(filePath);
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": createGroupSetAdminMembers
					});
				} catch (error) {
					//
					var erroStatus = {
						"erro": true,
						"status": 404,
						"message": "Erro ao criar grupo"
					};
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(400).json({
						"Status": erroStatus
					});
				}
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //createGroupSetAdminMembers
//
// ------------------------------------------------------------------------------------------------//
//
// Criar grupo (título, participantes a adicionar)
router.post("/createCountGroupSetAdminMembers", upload.single('file'), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.title || !req.file) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		if (req.body.title.length >= 22) {
			var validate = {
				result: "info",
				state: 'FAILURE',
				status: 'notProvided',
				message: 'O nome do grupo não pode exceder 25 caracter.'
			};
			//
			res.setHeader('Content-Type', 'application/json');
			res.status(400).json({
				"Status": validate
			});
			//
		}
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var createCountGroupSetAdminMembers = [];
				var createGroup = [];
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.file.originalname);
					fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
					console.log("- File:", filePath);
					//
					var arrayNumbers = fs.readFileSync(filePath, 'utf-8').toString().split(/\r?\n/);
					//
					var contactlistValid = [];
					var contactlistInvalid = [];
					//
					for (var i in arrayNumbers) {
						//console.log(arrayNumbers[i]);
						var numero = soNumeros(arrayNumbers[i]);
						//
						if (numero.length !== 0) {
							//
							var checkNumberStatus = await Sessions.checkNumberStatus(
								removeWithspace(req.body.SessionName),
								soNumeros(numero) + '@c.us'
							);
							//
							if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
								//
								contactlistValid.push(checkNumberStatus.number + "@c.us");
							} else {
								contactlistInvalid.push(numero + "@c.us");
							}
							//
						}
						//
						await sleep(1000);
					}
					//
					for (count = 1; count <= req.body.count; count++) {
						var resCreateGroup = await Sessions.createGroup(
							removeWithspace(req.body.SessionName),
							req.body.title + "-" + count,
							contactlistValid,
							contactlistInvalid
						);
						//
						await sleep(5000);
						//
						createCountGroupSetAdminMembers.push(resCreateGroup);
						//
						if (resCreateGroup.erro !== true && resCreateGroup.status !== 404) {
							//
							await forEach(contactlistValid, async (resultfile) => {
								//
								var promoteParticipant = await Sessions.promoteParticipant(
									removeWithspace(req.body.SessionName),
									resCreateGroup.gid + '@g.us',
									resultfile
								);
								//
								createCountGroupSetAdminMembers.push(promoteParticipant);
								//
								await sleep(1000);
							});
							//
						} else {
							var createCountGroupSetAdminMembers = resCreateGroup;
						}
						//
						createGroup.push({
							"createGroup": createCountGroupSetAdminMembers
						});
						//
					}
					//
					await deletaArquivosTemp(filePath);
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": createGroup
					});
				} catch (error) {
					//
					var erroStatus = {
						"erro": true,
						"status": 404,
						"message": "Erro ao criar grupo"
					};
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(400).json({
						"Status": erroStatus
					});
				}
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //createCountGroupSetAdminMembers
//
// ------------------------------------------------------------------------------------------------//
//
router.post("/removeParticipant", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.groupId || !req.body.phonefull) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		// Remove participante
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var removeParticipant = await Sessions.removeParticipant(
						removeWithspace(req.body.SessionName),
						req.body.groupId.trim() + '@g.us',
						checkNumberStatus.number + '@c.us'
					);
					//
				} else {
					var removeParticipant = checkNumberStatus;
				}
				//
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": removeParticipant
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //removeParticipant
//
// ------------------------------------------------------------------------------------------------//
//
// Adicionar participante
router.post("/addParticipant", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.groupId || !req.body.phonefull) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var addParticipant = await Sessions.addParticipant(
						removeWithspace(req.body.SessionName),
						req.body.groupId.trim() + '@g.us',
						checkNumberStatus.number + '@c.us'
					);
					//
				} else {
					var addParticipant = checkNumberStatus;
				}
				//
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": addParticipant
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //addParticipant
//
// ------------------------------------------------------------------------------------------------//
//
// Promote participant (Give admin privileges)
router.post("/promoteParticipant", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.groupId || !req.body.phonefull) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var promoteParticipant = await Sessions.promoteParticipant(
						removeWithspace(req.body.SessionName),
						req.body.groupId.trim() + '@g.us',
						checkNumberStatus.number + '@c.us'
					);
					//
				} else {
					var promoteParticipant = checkNumberStatus;
				}
				//
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": promoteParticipant
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //promoteParticipant
//
// ------------------------------------------------------------------------------------------------//
//
// Depromote participant (Give admin privileges)
router.post("/demoteParticipant", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.groupId || !req.body.phonefull) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var demoteParticipant = await Sessions.demoteParticipant(
						removeWithspace(req.body.SessionName),
						req.body.groupId.trim() + '@g.us',
						soNumeros(req.body.phonefull).trim() + '@c.us'
					);
					//
				} else {
					var demoteParticipant = checkNumberStatus;
				}
				//
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": demoteParticipant
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //demoteParticipant
//
// ------------------------------------------------------------------------------------------------//
//
// Retorna o status do grupo, jid, descrição do link de convite
router.post("/getGroupInfoFromInviteLink", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.InviteLink) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		if (!validUrl.isUri(req.body.link)) {
			var validate = {
				result: "error",
				state: 'FAILURE',
				status: 'notProvided',
				message: 'O link informado é invalido, corrija e tente novamente.'
			};
			//
			res.setHeader('Content-Type', 'application/json');
			res.status(400).json({
				"Status": validate
			});
			//
		}
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getGroupInfoFromInviteLink = await Sessions.getGroupInfoFromInviteLink(
					removeWithspace(req.body.SessionName),
					req.body.InviteCode
				);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getGroupInfoFromInviteLink
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getGroupInfoFromInviteLink
//
// ------------------------------------------------------------------------------------------------//
//
// Junte-se a um grupo usando o código de convite do grupo
router.post("/joinGroup", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.InviteLink) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		if (!validUrl.isUri(req.body.link)) {
			var validate = {
				result: "error",
				state: 'FAILURE',
				status: 'notProvided',
				message: 'O link informado é invalido, corrija e tente novamente.'
			};
			//
			res.setHeader('Content-Type', 'application/json');
			res.status(400).json({
				"Status": validate
			});
			//
		}
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var joinGroup = await Sessions.joinGroup(
					removeWithspace(req.body.SessionName),
					req.body.InviteCode
				);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": joinGroup
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //joinGroup
//
// ------------------------------------------------------------------------------------------------//
//
/*
╔═╗┬─┐┌─┐┌─┐┬┬  ┌─┐  ╔═╗┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐           
╠═╝├┬┘│ │├┤ ││  ├┤   ╠╣ │ │││││   │ ││ ││││└─┐           
╩  ┴└─└─┘└  ┴┴─┘└─┘  ╚  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘└─┘           
*/
//
// Set client status
router.post("/setProfileStatus", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.ProfileStatus) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var setProfileStatus = await Sessions.setProfileStatus(
					removeWithspace(req.body.SessionName),
					req.body.ProfileStatus
				);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": setProfileStatus
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //setProfileStatus
//
// ------------------------------------------------------------------------------------------------//
//
// Set client profile name
router.post("/setProfileName", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.ProfileName) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var setProfileName = await Sessions.setProfileName(
					removeWithspace(req.body.SessionName),
					req.body.ProfileName
				);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": setProfileName
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //setProfileName
//
// ------------------------------------------------------------------------------------------------//
//
router.post("/setProfilePic", upload.single('file'), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.file) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				//
				var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'wppconnect-' + removeWithspace(req.body.SessionName) + '-'));
				var filePath = path.join(folderName, req.file.originalname);
				fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
				console.log("- File", filePath);
				//
				var setProfilePic = await Sessions.setProfilePic(
					removeWithspace(req.body.SessionName),
					filePath
				);
				//
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": setProfilePic
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //setProfilePic
//
// ------------------------------------------------------------------------------------------------//
//
/*
╔╦╗┌─┐┬  ┬┬┌─┐┌─┐  ╔═╗┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐             
 ║║├┤ └┐┌┘││  ├┤   ╠╣ │ │││││   │ ││ ││││└─┐             
═╩╝└─┘ └┘ ┴└─┘└─┘  ╚  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘└─┘             
*/
//
// Delete the Service Worker
router.post("/killServiceWorker", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var killServiceWorker = await Sessions.killServiceWorker(removeWithspace(req.body.SessionName));
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": killServiceWorker
				});
				//
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //killServiceWorker
//
// ------------------------------------------------------------------------------------------------//
//
// Load the service again
router.post("/restartService", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var restartService = await Sessions.restartService(removeWithspace(req.body.SessionName));
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": restartService
				});
				//
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //restartService
//
// ------------------------------------------------------------------------------------------------//
//
// Reload do whatsapp web
router.post("/reloadService", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
			case 'notLogged':
			case 'deviceNotConnected':
			case 'desconnectedMobile':
			case 'qrReadFail':
			case 'deleteToken':
			case 'DISCONNECTED':
				//
				try {
					var killServiceWorker = await Sessions.killServiceWorker(removeWithspace(req.body.SessionName));
					//
					if (killServiceWorker.erro === false && killServiceWorker.status === 200) {
						//
						var restartService = await Sessions.restartService(removeWithspace(req.body.SessionName));
						//
						if (restartService.erro === false && restartService.status === 200) {
							//
							var reload = restartService;
							//
							//await deletaToken(session.tokenPatch + "/" + req.body.SessionName + ".data.json");
							//
							res.setHeader('Content-Type', 'application/json');
							res.status(200).json({
								"Status": reload
							});
							//
						} else {
							//
							var reload = restartService;
							//
							res.setHeader('Content-Type', 'application/json');
							res.status(400).json({
								"Status": reload
							});
							//
						}
						//
					} else {
						//
						var reload = killServiceWorker;
						//
						res.setHeader('Content-Type', 'application/json');
						res.status(400).json({
							"Status": reload
						});
						//
					}
				} catch (error) {
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(404).json({
						"Status": {
							"erro": true,
							"status": 404,
							"message": "Sessão não iniciada.",
							"restartService": false
						}
					});
					//
				}
				//
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //reloadService
//
// ------------------------------------------------------------------------------------------------//
//
// Get device info
router.post("/getHostDevice", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getHostDevice = await Sessions.getHostDevice(removeWithspace(req.body.SessionName));
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getHostDevice
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getHostDevice
//
// ------------------------------------------------------------------------------------------------//
//
// Get is multi device info
router.post("/isMultiDevice", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var isMultiDevice = await Sessions.isMultiDevice(removeWithspace(req.body.SessionName));
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": isMultiDevice
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //isMultiDevice
//
// ------------------------------------------------------------------------------------------------//
//
// Get connection state
router.post("/getConnectionState", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getConnectionState = await Sessions.getConnectionState(removeWithspace(req.body.SessionName));
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getConnectionState
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getConnectionState
//
// ------------------------------------------------------------------------------------------------//
//
// Get battery level
router.post("/getBatteryLevel", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getBatteryLevel = await Sessions.getBatteryLevel(removeWithspace(req.body.SessionName));
				//
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getBatteryLevel
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getBatteryLevel
//
// ------------------------------------------------------------------------------------------------//
//
// Is Connected
router.post("/isConnected", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
	switch (sessionStatus.status) {
		case 'inChat':
		case 'qrReadSuccess':
		case 'isLogged':
		case 'chatsAvailable':
			//
			var isConnected = await Sessions.isConnected(removeWithspace(req.body.SessionName));
			res.setHeader('Content-Type', 'application/json');
			res.status(200).json({
				"Status": isConnected
			});
			break;
		default:
			res.setHeader('Content-Type', 'application/json');
			res.status(400).json({
				"Status": sessionStatus
			});
	}
}); //isConnected
//
// ------------------------------------------------------------------------------------------------//
//
// Obter versão da web do Whatsapp
router.post("/getWAVersion", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getWAVersion = await Sessions.getWAVersion(removeWithspace(req.body.SessionName));
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getWAVersion
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getWAVersion
//
// ------------------------------------------------------------------------------------------------//
//
// Obter versão da web do Whatsapp
router.post("/getWAVersion", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getWAVersion = await Sessions.getWAVersion(removeWithspace(req.body.SessionName));
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getWAVersion
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getWAVersion
//
// ------------------------------------------------------------------------------------------------//
//
// Inicia a verificação de conexão do telefone
router.post("/startPhoneWatchdog", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.interval) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var startPhoneWatchdog = await Sessions.startPhoneWatchdog(
					removeWithspace(req.body.SessionName),
					req.body.interval
				);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": startPhoneWatchdog
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //startPhoneWatchdog
//
// ------------------------------------------------------------------------------------------------//
//
// Para a verificação de conexão do telefone
router.post("/stopPhoneWatchdog", upload.none(''), verifyJson.verify, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName)) {
		var validate = {
			result: "info",
			state: 'FAILURE',
			status: 'notProvided',
			message: 'Todos os valores deverem ser preenchidos, corrija e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": validate
		});
		//
	} else {
		//
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var stopPhoneWatchdog = await Sessions.stopPhoneWatchdog(removeWithspace(req.body.SessionName));
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": stopPhoneWatchdog
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //stopPhoneWatchdog
//
// ------------------------------------------------------------------------------------------------//
//
/*
╔╦╗┌─┐┌─┐┌┬┐┌─┐┌─┐  ┌┬┐┌─┐  ╦═╗┌─┐┌┬┐┌─┐┌─┐
 ║ ├┤ └─┐ │ ├┤ └─┐   ││├┤   ╠╦╝│ │ │ ├─┤└─┐
 ╩ └─┘└─┘ ┴ └─┘└─┘  ─┴┘└─┘  ╩╚═└─┘ ┴ ┴ ┴└─┘
 */
//
// ------------------------------------------------------------------------------------------------//
//
router.post("/RotaTeste", verifyJson.verify, verifyToken.verify, upload.single('file'), async (req, res, next) => {
	//
	res.setHeader('Content-Type', 'application/json');
	res.status(200).json({
		auth: true,
		token: req.userToken,
		message: 'Token validate'
	});
	//
});
//
// ------------------------------------------------------------------------------------------------//
//
module.exports = router;