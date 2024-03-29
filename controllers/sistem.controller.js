'use strict';
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
const validUrl = require('valid-url');
const mime = require('mime-types');
const exec = require('await-exec');
const ffmpeg = require('fluent-ffmpeg');
// https://stackoverflow.com/questions/60408575/how-to-validate-file-extension-with-multer-middleware
// https://www.edivaldobrito.com.br/como-instalar-o-ffmpeg-4-4-via-ppa-no-ubuntu-20-04-18-04-e-21-04/
const upload = multer({});
const router = express.Router();
const Sessions = require("../sessions.js");
const config = require('../config.global');
const verifyToken = require("../middleware/verifyToken");
//
// ------------------------------------------------------------------------------------------------//
//
async function deletaArquivosTemp(filePath) {
	//
	const cacheExists = await fs.pathExists(filePath);
	if (cacheExists) {
		fs.remove(filePath);
		console.log(`- O arquivo "${filePath}" removido`);
	}
	//
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

	const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

	if (i == 0) {
		return bytes + " " + sizes[i]
	}

	return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i]
}
//
// ------------------------------------------------------------------------------------------------//
//
async function converAudioToOgg(filePath) {
	const ext = path.parse(filePath).ext;
	const outputfilename = filePath.replace(ext, '.ogg');
	//
	const cacheExists = await fs.pathExists(filePath);
	if (cacheExists) {
		try {
			//
			//const { stdout, stderr } = await exec(`ffmpeg -y -i ${filePath} -c:a libvorbis -q:a 4 ${outputfilename}`);
			//const { stdout, stderr } = await exec(`ffmpeg -y -i ${filePath} -c:v libtheora -q:v 10 -c:a libvorbis ${outputfilename}`);
			const { stdout, stderr } = await exec(`ffmpeg -y -i ${filePath} -c:a libopus -b 19.1k -ac 1 -r 16k ${outputfilename}`);
			return outputfilename;
			//
		} catch (err) {
			console.log("- Error:", err);
		}
	}
	//
}
//
//
// ------------------------------------------------------------------------------------------------//
//
/*
╔═╗┌─┐┌┬┐┌┬┐┬┌┐┌┌─┐  ┌─┐┌┬┐┌─┐┬─┐┌┬┐┌─┐┌┬┐
║ ╦├┤  │  │ │││││ ┬  └─┐ │ ├─┤├┬┘ │ ├┤  ││
╚═╝└─┘ ┴  ┴ ┴┘└┘└─┘  └─┘ ┴ ┴ ┴┴└─ ┴ └─┘─┴┘
*/
//
router.post("/Start", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
				//
				await Sessions.Start(req.io, removeWithspace(req.body.SessionName), req.body.whatsappVersion);
				var session = await Sessions.getSession(removeWithspace(req.body.SessionName));
				console.log("- SessionName:", removeWithspace(req.body.SessionName));
				//
				session.wh_status = req.body.wh_status;
				session.wh_message = req.body.wh_message;
				session.wh_qrcode = req.body.wh_qrcode;
				session.wh_connect = req.body.wh_connect;
				//
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
router.post("/restartToken", verifyToken.verify, upload.none(''), async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));
		//
		var resetToken = await Sessions.restartToken(req.io, session.name, session.AuthorizationToken, session.whatsappVersion);
		res.setHeader('Content-Type', 'application/json');
		res.status(200).json({
			"Status": resetToken
		});
		//
	}
	//
});
//
// ------------------------------------------------------------------------------------------------//
//
router.post("/Status", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
router.post("/getSession", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var Status = await Sessions.getSession(removeWithspace(req.body.SessionName));
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
router.post("/Close", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
			case 'qrRead':
			case 'notLogged':
				//
				var closeSession = await session.process.add(async () => await Sessions.closeSession(removeWithspace(req.body.SessionName)));
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
router.post("/Logout", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var LogoutSession = await session.process.add(async () => await Sessions.logoutSession(removeWithspace(req.body.SessionName)));
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
router.post("/QRCode", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));
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
router.post("/getSessions", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
router.post("/getHardWare", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
// Enviar Contato
router.post("/sendContactVcard", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));
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
					var sendContactVcard = await session.process.add(async () => await Sessions.sendContactVcard(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						soNumeros(req.body.contact) + '@c.us',
						req.body.namecontact
					));
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
router.post("/sendContactVcardList", upload.single('file'), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));
		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.file.originalname);
					fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
					console.log("- File:", filePath);
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
							//await sleep(1000);
						}
						//
						var sendContactVcardList = await session.process.add(async () => await Sessions.sendContactVcardList(
							removeWithspace(req.body.SessionName),
							checkNumberStatus.number + '@c.us',
							contactlistValid,
							contactlistInvalid
						));
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
					console.log("Erro on sendContactVcardList\n", error);
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
// Enviar audio
// https://www.mpi.nl/corpus/html/lamus2/apa.html
//
router.post("/sendVoice", upload.single('file'), verifyToken.verify, async (req, res, next) => {
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
		//let ext = path.extname(file.originalname);
		//if (ext !== '.wav' || ext !== '.aifc' || ext !== '.aiff' || ext !== '.mp3' || ext !== '.m4a' || ext !== '.mp2' || ext !== '.ogg') {
		//let ext = path.parse(req.file.originalname).ext;
		console.log("- acceptedTypes:", req.file.mimetype);
		let acceptedTypes = req.file.mimetype.split('/')[0];
		if (acceptedTypes !== "audio") {
			//
			var validate = {
				result: "info",
				state: 'FAILURE',
				status: 'notProvided',
				message: 'Arquivo selecionado não permitido, apenas arquivo de audio'
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
			var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

			switch (sessionStatus.status) {
				case 'inChat':
				case 'qrReadSuccess':
				case 'isLogged':
				case 'chatsAvailable':
					//
					try {
						var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
						var filePath = path.join(folderName, req.file.originalname);
						fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
						//
						console.log("- File", filePath);
						if (req.file.mimetype === 'application/ogg' || req.file.mimetype === 'audio/ogg') {
							var filePathOgg = filePath;
						} else {
							var filePathOgg = await converAudioToOgg(filePath);
							console.log("- File converted", filePathOgg);
						}
						//
						var checkNumberStatus = await Sessions.checkNumberStatus(
							removeWithspace(req.body.SessionName),
							soNumeros(req.body.phonefull).trim() + '@c.us'
						);
						//
						if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
							//
							var sendPtt = await session.process.add(async () => await Sessions.sendPtt(
								removeWithspace(req.body.SessionName),
								checkNumberStatus.number + '@c.us',
								filePathOgg
							));
							//
						} else {
							var sendPtt = checkNumberStatus;
						}
						//
						//
						await deletaArquivosTemp(filePath);
						await deletaArquivosTemp(filePathOgg);
						//
						//console.log(result);
						res.setHeader('Content-Type', 'application/json');
						res.status(200).json({
							"Status": sendPtt
						});
					} catch (error) {
						console.log("Erro on sendVoice\n", error);
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
	}
}); //sendVoice
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar audio
router.post("/sendVoiceBase64", upload.none(''), verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.body.base64 || !req.body.originalname) {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.body.originalname);
					fs.writeFileSync(filePath, req.body.base64, 'base64');
					//
					console.log("- File", filePath);
					//
					console.log("- acceptedTypes:", mime.lookup(filePath));
					let acceptedTypes = mime.lookup(filePath).split('/')[0];
					if (acceptedTypes !== "audio") {
						//
						var validate = {
							result: "info",
							state: 'FAILURE',
							status: 'notProvided',
							message: 'Arquivo selecionado não permitido, apenas arquivo de audio'
						};
						//
						res.setHeader('Content-Type', 'application/json');
						res.status(400).json({
							"Status": validate
						});
						//
					}
					//
					if (mime.lookup(filePath) === 'application/ogg' || mime.lookup(filePath) === 'audio/ogg') {
						var filePathOgg = filePath;
					} else {
						var filePathOgg = await converAudioToOgg(filePath);
						console.log("- File converted", filePathOgg);
					}
					//
					var checkNumberStatus = await Sessions.checkNumberStatus(
						removeWithspace(req.body.SessionName),
						soNumeros(req.body.phonefull).trim() + '@c.us'
					);
					//
					if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
						//
						var sendPtt = await session.process.add(async () => await Sessions.sendPtt(
							removeWithspace(req.body.SessionName),
							checkNumberStatus.number + '@c.us',
							filePathOgg
						));
						//
					} else {
						var sendPtt = checkNumberStatus;
					}
					//
					//
					await deletaArquivosTemp(filePath);
					await deletaArquivosTemp(filePathOgg);
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendPtt
					});
				} catch (error) {
					console.log("Erro on sendVoice\n", error);
					//
					var erroStatus = {
						"erro": true,
						"status": 404,
						"message": "Erro ao enviar audio"
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
}); //sendVoiceBase64
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar audio
router.post("/sendVoiceToBase64", upload.single('file'), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

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
					var sendPttFromBase64 = await session.process.add(async () => await Sessions.sendPttFromBase64(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						req.file.buffer.toString('base64'),
						req.file.originalname,
						req.file.mimetype
					));
					//
				} else {
					var sendPttFromBase64 = checkNumberStatus;
				}
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": sendPttFromBase64
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //sendPttFromBase64
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar audio
router.post("/sendVoiceFromBase64", upload.none(''), verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.body.base64 || !req.body.originalname) {
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
		//
		console.log("- acceptedTypes:", mime.lookup(req.body.originalname));
		let acceptedTypes = mime.lookup(req.body.originalname).split('/')[0];
		if (acceptedTypes !== "audio") {
			//
			var validate = {
				result: "info",
				state: 'FAILURE',
				status: 'notProvided',
				message: 'Arquivo selecionado não permitido, apenas arquivo de audio'
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
			var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

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
						var sendPttFromBase64 = await session.process.add(async () => await Sessions.sendPttFromBase64(
							removeWithspace(req.body.SessionName),
							checkNumberStatus.number + '@c.us',
							req.body.base64,
							req.body.originalname,
						));
						//
					} else {
						var sendPttFromBase64 = checkNumberStatus;
					}
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendPttFromBase64
					});
					break;
				default:
					res.setHeader('Content-Type', 'application/json');
					res.status(400).json({
						"Status": sessionStatus
					});
			}
		}
	}
}); //sendPttFromBase64
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar Texto
router.post("/sendText", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));
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
					var sendText = await session.process.add(async () => await Sessions.sendText(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						req.body.msg
					));

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
router.post("/sendTextMassa", upload.single('file'), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var sendTextMassa = [];
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
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
								soNumeros(req.body.phonefull).trim() + '@c.us'
							);
							//
							if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
								//
								var sendTextMassaRes = await session.process.add(async () => await Sessions.sendText(
									removeWithspace(req.body.SessionName),
									checkNumberStatus.number + '@c.us',
									req.body.msg
								));
								//
							} else {
								var sendTextMassaRes = checkNumberStatus;
							}
							//
							sendTextMassa.push(sendTextMassaRes);
							//
						}
						//await sleep(1000);
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
					console.log("Erro on sendText\n", error);
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
router.post("/sendLocation", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

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
					var sendLocation = await session.process.add(async () => await Sessions.sendLocation(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						req.body.lat,
						req.body.long,
						req.body.local
					));
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
router.post("/sendLinkPreview", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
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
				var checkNumberStatus = await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				);
				//
				if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
					//
					var sendLinkPreview = await session.process.add(async () => await Sessions.sendLinkPreview(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						req.body.link,
						req.body.descricao
					));
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
router.post("/sendImage", upload.single('file'), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
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
						var sendImage = await session.process.add(async () => await Sessions.sendImage(
							removeWithspace(req.body.SessionName),
							checkNumberStatus.number + '@c.us',
							filePath,
							req.file.originalname,
							req.body.caption
						));
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
					console.log("Erro on sendImage\n", error);
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
	name: 'file',
	maxCount: 1
}]);
//
router.post("/sendImageMassa", sendImageMassa, verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.phonefull[0] || !req.file[0] || !req.body.caption) {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
					var filePathContato = path.join(folderName, req.files['phonefull'][0].originalname);
					fs.writeFileSync(filePathContato, req.files['phonefull'][0].buffer.toString('base64'), 'base64');
					console.log("- File:", filePathContato);
					//
					//
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
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
								soNumeros(req.body.phonefull).trim() + '@c.us'
							);
							//
							if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
								//
								var sendImageMassaRes = await session.process.add(async () => await Sessions.sendImage(
									removeWithspace(req.body.SessionName),
									checkNumberStatus.number + '@c.us',
									filePathImagem,
									req.files['fileimg'][0].originalname,
									req.body.caption
								));
								//
							} else {
								var sendImageMassaRes = checkNumberStatus;
							}
							//
							//return sendResult;
							//
							sendImageMassa.push(sendImageMassaRes);
						}
						//await sleep(1000);
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
					console.log("Erro on sendImage\n", error);
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
router.post("/sendMultImage", upload.array('file', 50), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

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
							var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
							var filePathImagem = path.join(folderName, resultfile.originalname);
							fs.writeFileSync(filePathImagem, resultfile.buffer.toString('base64'), 'base64');
							console.log("- File:", filePathImagem);
							//
							var sendMultImageRes = await session.process.add(async () => await Sessions.sendImage(
								removeWithspace(req.body.SessionName),
								checkNumberStatus.number + '@c.us',
								filePathImagem,
								resultfile.originalname,
								req.body.caption
							));
							//
							sendMultImage.push(sendMultImageRes);
							//
							//await sleep(1000);
							//
							await deletaArquivosTemp(filePathImagem);
							//
						} catch (error) {
							console.log("Erro on sendImage\n", error);
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
							//await sleep(1000);
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
router.post("/sendMultImageMassa", sendMultImageMassa, verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

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
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
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
										var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
										var filePathImagem = path.join(folderName, resultfile.originalname);
										fs.writeFileSync(filePathImagem, resultfile.buffer.toString('base64'), 'base64');
										console.log("- File Imagem:", filePathImagem);
										//
										var sendMultImageMassaRes = await session.process.add(async () => await Sessions.sendImage(
											removeWithspace(req.body.SessionName),
											checkNumberStatus.number + '@c.us',
											filePathImagem,
											resultfile.originalname,
											req.body.caption
										));
										//
										sendMultImageMassa.push(sendMultImageMassaRes);
										//
										//await sleep(1000);
										//
										//
										await deletaArquivosTemp(filePathImagem);
										//
									} catch (error) {
										console.log("Erro on sendImage\n", error);
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
										//await sleep(1000);
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
						//await sleep(1000);
					}
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendMultImageMassa
					});
				} catch (error) {
					console.log("Erro on sendImage\n", error);
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
router.post("/sendFile", upload.single('file'), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
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
						var sendFile = await session.process.add(async () => await Sessions.sendFile(
							removeWithspace(req.body.SessionName),
							checkNumberStatus.number + '@c.us',
							filePath,
							req.file.originalname,
							req.body.caption
						));
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
					console.log("Erro on sendFile\n", error);
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
router.post("/sendFileBase64", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					//var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
					//var filePath = path.join(folderName, req.body.originalname);
					//var base64Data = req.body.base64.replace(/^data:([A-Za-z-+/]+);base64,/,'');
					var mimeType = mime.lookup(req.body.originalname);
					//fs.writeFileSync(filePath, base64Data,  {encoding: 'base64'});
					//console.log("- File", filePath);
					//
					var checkNumberStatus = await Sessions.checkNumberStatus(
						removeWithspace(req.body.SessionName),
						soNumeros(req.body.phonefull).trim() + '@c.us'
					);
					//
					if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
						//
						var sendFileBase64 = await session.process.add(async () => await Sessions.sendFileFromBase64(
							removeWithspace(req.body.SessionName),
							checkNumberStatus.number + '@c.us',
							req.body.base64,
							mimeType,
							req.body.originalname,
							req.body.caption
						));
						//
					} else {
						var sendFileBase64 = checkNumberStatus;
					}
					//
					//await deletaArquivosTemp(filePath);
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendFileBase64
					});
				} catch (error) {
					console.log("Erro on sendFile\n", error);
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
router.post("/sendFileToBase64", upload.single('file'), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

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
					var sendFileFromBase64 = await session.process.add(async () => await Sessions.sendFileFromBase64(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						req.file.buffer.toString('base64'),
						req.file.mimetype,
						req.file.originalname,
						req.body.msg
					));
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
router.post("/sendFileFromBase64", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

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
					var sendFileFromBase64 = await session.process.add(async () => await Sessions.sendFileFromBase64(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						req.body.base64,
						req.body.mimetype,
						req.body.originalname,
						req.body.caption
					));
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
//Enviar button
router.post("/sendButton", upload.none(''), verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.body.msg || !req.body.options) {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));
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
					var sendText = await session.process.add(async () => await Sessions.sendButton(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						req.body.msg,
						req.body.options,
					));

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
}); //sendButton
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar button
router.post("/sendMessageOptions", upload.none(''), verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.phonefull || !req.body.msg || !req.body.options) {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));
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
					var sendText = await session.process.add(async () => await Sessions.sendMessageOptions(
						removeWithspace(req.body.SessionName),
						checkNumberStatus.number + '@c.us',
						req.body.msg,
						req.body.options,
					));

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
}); //sendMessageOptions
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
router.post("/getAllContacts", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getAllContacts = await session.process.add(async () => await Sessions.getAllContacts(
					req.body.SessionName
				));
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
router.post("/getAllGroups", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getAllGroups = await session.process.add(async () => await Sessions.getAllGroups(
					req.body.SessionName
				));
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
router.post("/getSessionTokenBrowser", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getSessionTokenBrowser = await session.process.add(async () => await Sessions.getSessionTokenBrowser(
					req.body.SessionName
				));
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
router.post("/getBlockList", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getBlockList = await session.process.add(async () => await Sessions.getBlockList(
					req.body.SessionName
				));
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
router.post("/getStatus", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

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
					var getStatus = await session.process.add(async () => await Sessions.getStatus(
						removeWithspace(req.body.SessionName),
						soNumeros(req.body.phonefull).trim() + '@c.us'
					));
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
router.post("/getNumberProfile", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

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
					var getNumberProfile = await session.process.add(async () => await Sessions.getNumberProfile(
						removeWithspace(req.body.SessionName),
						soNumeros(req.body.phonefull).trim() + '@c.us'
					));
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
router.post("/getProfilePicFromServer", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

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
					var getProfilePicFromServer = await session.process.add(async () => await Sessions.getProfilePicFromServer(
						removeWithspace(req.body.SessionName),
						soNumeros(req.body.phonefull).trim() + '@c.us'
					));
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
router.post("/checkNumberStatus", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var checkNumberStatus = await session.process.add(async () => await Sessions.checkNumberStatus(
					removeWithspace(req.body.SessionName),
					soNumeros(req.body.phonefull).trim() + '@c.us'
				));
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
router.post("/checkNumberStatusMassa", upload.single('file'), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
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
						var checkNumberStatus = await session.process.add(async () => await Sessions.checkNumberStatus(
							removeWithspace(req.body.SessionName),
							soNumeros(numero) + '@c.us'
						));
						//
						if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
							//
							checkNumberStatusMassa.push(checkNumberStatus);
							//
						} else {
							var checkNumberStatusMassa = checkNumberStatus;
						}
					}
					//await sleep(1000);
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
router.post("/sendTextGrupo", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var sendTextGrupo = await session.process.add(async () => await Sessions.sendText(
					removeWithspace(req.body.SessionName),
					req.body.groupId.trim() + '@g.us',
					req.body.msg
				));
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
router.post("/sendLocationGroup", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var sendLocationGroup = await session.process.add(async () => await Sessions.sendLocation(
					removeWithspace(req.body.SessionName),
					req.body.groupId.trim() + '@g.us',
					req.body.lat,
					req.body.long,
					req.body.local
				));
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
router.post("/sendImageGroup", upload.single('file'), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.file.originalname);
					fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
					console.log("- File", filePath);
					//
					var sendImageGroup = await session.process.add(async () => await Sessions.sendImage(
						removeWithspace(req.body.SessionName),
						req.body.groupId.trim() + '@g.us',
						filePath,
						req.file.originalname,
						req.body.caption
					));
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
					console.log("Erro on sendImage\n", error);
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
router.post("/sendFileGroup", upload.single('file'), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.file.originalname);
					fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
					console.log("- File", filePath);
					//
					var sendFileGroup = await session.process.add(async () => await Sessions.sendFile(
						removeWithspace(req.body.SessionName),
						req.body.groupId.trim() + '@g.us',
						filePath,
						req.file.originalname,
						req.body.caption
					));
					//
					await deletaArquivosTemp(filePath);
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendFileGroup
					});
				} catch (error) {
					console.log("Erro on sendFile\n", error);
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
router.post("/sendFileBase64Group", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
					var filePath = path.join(folderName, req.body.originalname);
					fs.writeFileSync(filePath, req.body.base64, 'base64');
					console.log("- File", filePath);
					//
					var sendFileBase64 = await session.process.add(async () => await Sessions.sendFile(
						removeWithspace(req.body.SessionName),
						req.body.groupId + '@g.us',
						filePath,
						req.body.originalname,
						req.body.caption
					));
					//
					await deletaArquivosTemp(filePath);
					//
					//console.log(result);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": sendFileBase64
					});
				} catch (error) {
					console.log("Erro on sendFile\n", error);
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
router.post("/sendFileToBase64Group", upload.single('file'), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var sendFileToBase64 = await session.process.add(async () => await Sessions.sendFileFromBase64(
					removeWithspace(req.body.SessionName),
					req.body.groupId.trim() + '@g.us',
					req.file.buffer.toString('base64'),
					req.file.mimetype,
					req.file.originalname,
					req.body.msg
				));
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
router.post("/sendFileFromBase64Group", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var sendFileFromBase64 = await session.process.add(async () => await Sessions.sendFileFromBase64(
					removeWithspace(req.body.SessionName),
					req.body.groupId.trim() + '@g.us',
					req.body.base64,
					req.body.mimetype,
					req.body.originalname,
					req.body.msg
				));
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
router.post("/leaveGroup", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var leaveGroup = await session.process.add(async () => await Sessions.leaveGroup(
					removeWithspace(req.body.SessionName),
					req.body.groupId + '@g.us'
				));
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
router.post("/createGroup", upload.single('file'), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
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
						//await sleep(1000);
					}
					//
					var createGroup = await session.process.add(async () => await Sessions.createGroup(
						removeWithspace(req.body.SessionName),
						req.body.title,
						contactlistValid,
						contactlistInvalid
					));
					//
					await deletaArquivosTemp(filePath);
					//
					res.setHeader('Content-Type', 'application/json');
					res.status(200).json({
						"Status": createGroup
					});
				} catch (error) {
					console.log("Erro on createGroup\n", error);
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
router.post("/getGroupMembers", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getGroupMembers = await session.process.add(async () => await Sessions.getGroupMembers(
					removeWithspace(req.body.SessionName),
					req.body.groupId + '@g.us'
				));
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
router.post("/getGroupMembersIds", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getGroupMembersIds = await session.process.add(async () => await Sessions.getGroupMembersIds(
					removeWithspace(req.body.SessionName),
					req.body.groupId + '@g.us'
				));
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
router.post("/getGroupInviteLink", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var GroupInviteLink = await session.process.add(async () => await Sessions.getGroupInviteLink(
					removeWithspace(req.body.SessionName),
					req.body.groupId + '@g.us'
				));
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
router.post("/createGroupSetAdminMembers", upload.single('file'), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var createGroupSetAdminMembers = [];
				//
				try {
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
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
						//await sleep(1000);
					}
					//
					var createGroup = await session.process.add(async () => await Sessions.createGroup(
						removeWithspace(req.body.SessionName),
						req.body.title,
						contactlistValid,
						contactlistInvalid
					));
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
							//await sleep(1000);
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
					console.log("Erro on createGroup\n", error);
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
router.post("/createCountGroupSetAdminMembers", upload.single('file'), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

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
					var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
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
						//await sleep(1000);
					}
					//
					for (count = 1; count <= req.body.count; count++) {
						var resCreateGroup = await session.process.add(async () => await Sessions.createGroup(
							removeWithspace(req.body.SessionName),
							req.body.title + "-" + count,
							contactlistValid,
							contactlistInvalid
						));
						//
						await sleep(5000);
						//
						createCountGroupSetAdminMembers.push(resCreateGroup);
						//
						if (resCreateGroup.erro !== true && resCreateGroup.status !== 404) {
							//
							await forEach(contactlistValid, async (resultfile) => {
								//
								var promoteParticipant = await session.process.add(async () => await Sessions.promoteParticipant(
									removeWithspace(req.body.SessionName),
									resCreateGroup.gid + '@g.us',
									resultfile
								));
								//
								createCountGroupSetAdminMembers.push(promoteParticipant);
								//
								//await sleep(1000);
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
					console.log("Erro on createGroup\n", error);
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
router.post("/removeParticipant", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

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
					var removeParticipant = await session.process.add(async () => await Sessions.removeParticipant(
						removeWithspace(req.body.SessionName),
						req.body.groupId.trim() + '@g.us',
						checkNumberStatus.number + '@c.us'
					));
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
router.post("/addParticipant", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

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
					var addParticipant = await session.process.add(async () => await Sessions.addParticipant(
						removeWithspace(req.body.SessionName),
						req.body.groupId.trim() + '@g.us',
						checkNumberStatus.number + '@c.us'
					));
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
router.post("/promoteParticipant", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

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
					var promoteParticipant = await session.process.add(async () => await Sessions.promoteParticipant(
						removeWithspace(req.body.SessionName),
						req.body.groupId.trim() + '@g.us',
						checkNumberStatus.number + '@c.us'
					));
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
router.post("/demoteParticipant", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

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
					var demoteParticipant = await session.process.add(async () => await Sessions.demoteParticipant(
						removeWithspace(req.body.SessionName),
						req.body.groupId.trim() + '@g.us',
						soNumeros(req.body.phonefull).trim() + '@c.us'
					));
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
router.post("/getGroupInfoFromInviteLink", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
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

				var getGroupInfoFromInviteLink = await session.process.add(async () => await Sessions.getGroupInfoFromInviteLink(
					removeWithspace(req.body.SessionName),
					req.body.InviteCode
				));
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
router.post("/joinGroup", upload.none(''), verifyToken.verify, async (req, res, next) => {
	//
	if (!removeWithspace(req.body.SessionName) || !req.body.link) {
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
		var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
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

				var joinGroup = await session.process.add(async () => await Sessions.joinGroup(
					removeWithspace(req.body.SessionName),
					req.body.InviteCode
				));
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
router.post("/setProfileStatus", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var setProfileStatus = await session.process.add(async () => await Sessions.setProfileStatus(
					removeWithspace(req.body.SessionName),
					req.body.ProfileStatus
				));
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
router.post("/setProfileName", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var setProfileName = await session.process.add(async () => await Sessions.setProfileName(
					removeWithspace(req.body.SessionName),
					req.body.ProfileName
				));
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
router.post("/setProfilePic", upload.single('file'), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				//
				var folderName = fs.mkdtempSync(path.join(os.tmpdir(), 'WPP-' + removeWithspace(req.body.SessionName) + '-'));
				var filePath = path.join(folderName, req.file.originalname);
				fs.writeFileSync(filePath, req.file.buffer.toString('base64'), 'base64');
				console.log("- File", filePath);
				//
				var setProfilePic = await session.process.add(async () => await Sessions.setProfilePic(
					removeWithspace(req.body.SessionName),
					filePath
				));
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
router.post("/killServiceWorker", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));
		//
		var killServiceWorker = await session.process.add(async () => await Sessions.killServiceWorker(removeWithspace(req.body.SessionName)));
		res.setHeader('Content-Type', 'application/json');
		res.status(200).json({
			"Status": killServiceWorker
		});
		//
	}
}); //killServiceWorker
//
// ------------------------------------------------------------------------------------------------//
//
// Load the service again
router.post("/restartService", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));
		//
		var restartService = await session.process.add(async () => await Sessions.restartService(removeWithspace(req.body.SessionName)));
		res.setHeader('Content-Type', 'application/json');
		res.status(200).json({
			"Status": restartService
		});
		//
	}
}); //restartService
//
// ------------------------------------------------------------------------------------------------//
//
// Reload do whatsapp web
router.post("/reloadService", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));
		//
		try {
			var killServiceWorker = await session.process.add(async () => await Sessions.killServiceWorker(removeWithspace(req.body.SessionName)));
			//
			if (killServiceWorker.erro === false && killServiceWorker.status === 200) {
				//
				var restartService = await session.process.add(async () => await Sessions.restartService(removeWithspace(req.body.SessionName)));
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
			console.log("Erro on killServiceWorker\n", error);
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
	}
}); //reloadService
//
// ------------------------------------------------------------------------------------------------//
//
// Get device info
router.post("/getMe", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getMe = await session.process.add(async () => await Sessions.getMe(removeWithspace(req.body.SessionName)));
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getMe
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getMe
//
// ------------------------------------------------------------------------------------------------//
//
// Get device info
router.post("/getWid", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getWid = await session.process.add(async () => await Sessions.getWid(removeWithspace(req.body.SessionName)));
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getWid
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getWid
//
// ------------------------------------------------------------------------------------------------//
//
// Get device info
router.post("/getHost", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getHost = await session.process.add(async () => await Sessions.getHost(removeWithspace(req.body.SessionName)));
				//
				//console.log(result);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).json({
					"Status": getHost
				});
				break;
			default:
				res.setHeader('Content-Type', 'application/json');
				res.status(400).json({
					"Status": sessionStatus
				});
		}
	}
}); //getHost
//
// ------------------------------------------------------------------------------------------------//
//
// Get device info
router.post("/getHostDevice", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getHostDevice = await session.process.add(async () => await Sessions.getHostDevice(removeWithspace(req.body.SessionName)));
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
router.post("/isMultiDevice", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var isMultiDevice = await session.process.add(async () => await Sessions.isMultiDevice(removeWithspace(req.body.SessionName)));
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
router.post("/getConnectionState", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getConnectionState = await session.process.add(async () => await Sessions.getConnectionState(removeWithspace(req.body.SessionName)));
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
router.post("/getBatteryLevel", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getBatteryLevel = await session.process.add(async () => await Sessions.getBatteryLevel(removeWithspace(req.body.SessionName)));
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
router.post("/isConnected", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var isConnected = await session.process.add(async () => await Sessions.isConnected(removeWithspace(req.body.SessionName)));
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
	}
}); //isConnected
//
// ------------------------------------------------------------------------------------------------//
//
// Obter versão da web do Whatsapp
router.post("/getWAVersion", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var getWAVersion = await session.process.add(async () => await Sessions.getWAVersion(removeWithspace(req.body.SessionName)));
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
router.post("/startPhoneWatchdog", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var startPhoneWatchdog = await session.process.add(async () => await Sessions.startPhoneWatchdog(
					removeWithspace(req.body.SessionName),
					req.body.interval
				));
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
router.post("/stopPhoneWatchdog", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
		var session = await Sessions.getSession(removeWithspace(req.body.SessionName));

		switch (sessionStatus.status) {
			case 'inChat':
			case 'qrReadSuccess':
			case 'isLogged':
			case 'chatsAvailable':
				//
				var stopPhoneWatchdog = await session.process.add(async () => await Sessions.stopPhoneWatchdog(removeWithspace(req.body.SessionName)));
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
module.exports = router;