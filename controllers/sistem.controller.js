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
const upload = multer({})
const router = express.Router();
const Sessions = require("../sessions.js");
const verifyToken = require("../middleware/verifyToken");
const verifyBody = require("../middleware/verifyBody");
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
String.prototype.toHHMMSS = function() {
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
const convertBytes = function(bytes) {
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
router.post("/Start", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
  //
});
//
// ------------------------------------------------------------------------------------------------//
//
router.post("/Status", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
  //
  var Status = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    Status
  });
}); //Status
//
// ------------------------------------------------------------------------------------------------//
//
// Fecha a sessão
router.post("/Close", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
}); //Close
//
// ------------------------------------------------------------------------------------------------//
//
// Desconecta do whatsapp web
router.post("/Logout", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        LogoutSession
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "LogoutSession": sessionStatus
      });
  }
}); //Logout
//
// ------------------------------------------------------------------------------------------------//
//
// Gera o QR-Code
router.post("/QRCode", upload.none(''), verifyBody.QrCode, verifyToken.verify, async (req, res, next) => {
  console.log("- getQRCode");
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
      } else if (req.body.View === false) {
        var getQRCode = {
          result: 'error',
          state: session.state,
          status: session.status,
          qrcode: session.qrcode,
          message: 'Sistema iniciao e indisponivel para uso!'
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
  //
});
//
// ------------------------------------------------------------------------------------------------//
//
router.post("/getSessions", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
  var getSessions = await Sessions.getSessions();
  //
  //console.log(result);
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    getSessions
  });
}); //getSessions
//
// ------------------------------------------------------------------------------------------------//
//
// Dados de memoria e uptime
router.post("/getHardWare", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
  console.log("- getHardWare");
  //
  var getHardWare = {
    "noformat": {
      uptime: os.uptime(),
      freemem: os.freemem(),
      memusage: (os.totalmem() - os.freemem()),
      totalmem: os.totalmem(),
      freeusagemem: `${Math.round((os.freemem()*100)/os.totalmem()).toFixed(0)}`,
      usagemem: `${Math.round(((os.totalmem()-os.freemem())*100)/os.totalmem()).toFixed(0)}`
    },
    "format": {
      uptime: (os.uptime() + "").toHHMMSS(),
      freemem: convertBytes(os.freemem()),
      memusage: convertBytes((os.totalmem() - os.freemem())),
      totalmem: convertBytes(os.totalmem()),
      freeusagemem: `${Math.round((os.freemem()*100)/os.totalmem()).toFixed(0)} %`,
      usagemem: `${Math.round(((os.totalmem()-os.freemem())*100)/os.totalmem()).toFixed(0)} %`
    }
  };
  //console.log(result);
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    getHardWare
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
router.post("/sendVoice", upload.single('file'), verifyBody.sendVoice, verifyToken.verify, async (req, res, next) => {
  //
  //Eviar menssagem de voz
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
        sendVoice
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendVoice": sessionStatus
      });
  }
}); //sendVoice
//
// ------------------------------------------------------------------------------------------------//
//
//Eviar menssagem de voz
router.post("/sendVoiceBase64", upload.single('audio_data'), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
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
        sendVoiceBase64
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendVoiceBase64": sessionStatus
      });
  }
}); //sendVoice
//
// ------------------------------------------------------------------------------------------------//
//
//Eviar menssagem de voz
router.post("/sendVoiceFileBase64", upload.single('audio_data'), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
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
        sendVoiceBase64
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendVoiceBase64": sessionStatus
      });
  }
}); //sendVoice
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar Contato
router.post("/sendContactVcard", upload.none(''), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
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
        sendContactVcard
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendContactVcard": sessionStatus
      });
  }
}); //sendContactVcard
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar Lista de Contato
router.post("/sendContactVcardList", upload.single('contactlist'), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
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
        sendContactVcardList
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendContactVcardList": sessionStatus
      });
  }
}); //sendContactVcardList
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar Texto
router.post("/sendText", upload.none(''), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
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
        sendText
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendText": sessionStatus
      });
  }
}); //sendText
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar Texto em Massa
router.post("/sendTextMassa", upload.single('phonefull'), verifyToken.verify, async (req, res, next) => {
  var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
  switch (sessionStatus.status) {
    case 'inChat':
    case 'qrReadSuccess':
    case 'isLogged':
    case 'chatsAvailable':
      //
      var sendTextMassa = [];
      //
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
        sendTextMassa
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendTextMassa": sessionStatus
      });
  }
}); //sendText
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar Texto em Grupo
router.post("/sendTextGrupo", upload.none(''), verifyBody.Group, verifyToken.verify, async (req, res, next) => {
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
        sendTextGrupo
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendTextGrupo": sessionStatus
      });
  }
}); //sendTextGrupo
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar localização
router.post("/sendLocation", upload.none(''), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
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
        sendLocation
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendLocation": sessionStatus
      });
  }
}); //sendLocation
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar localização no grupo
router.post("/sendLocationGroup", upload.none(''), verifyBody.Group, verifyToken.verify, async (req, res, next) => {
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
        sendLocationGroup
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendLocationGroup": sessionStatus
      });
  }
}); //sendLocationGroup
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar links com preview
router.post("/sendLinkPreview", upload.none(''), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
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
          req.body.detail
        );
        //
      } else {
        var sendLinkPreview = checkNumberStatus;
      }
      //
      //console.log(result);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        sendLinkPreview
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendLinkPreview": sessionStatus
      });
  }
}); //sendLinkPreview
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar Imagem
router.post("/sendImage", upload.single('fileimg'), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
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
        sendImage
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendImage": sessionStatus
      });
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
router.post("/sendImageMassa", sendImageMassa, verifyBody.Started, verifyToken.verify, async (req, res, next) => {
  var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
  switch (sessionStatus.status) {
    case 'inChat':
    case 'qrReadSuccess':
    case 'isLogged':
    case 'chatsAvailable':
      //
      //
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
        sendImageMassa
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendImageMassa": sessionStatus
      });
  }
}); //sendImageMassa
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar varia imagens
router.post("/sendMultImage", upload.array('fileimgs', 50), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        });
      } else {
        var sendMultImage = checkNumberStatus;
      }
      //
      //console.log(result);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        sendMultImage
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendMultImage": sessionStatus
      });
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
  name: 'fileimgs',
  maxCount: 30
}]);
//
router.post("/sendMultImageMassa", sendMultImageMassa, verifyBody.Started, verifyToken.verify, async (req, res, next) => {
  var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
  switch (sessionStatus.status) {
    case 'inChat':
    case 'qrReadSuccess':
    case 'isLogged':
    case 'chatsAvailable':
      //
      //
      var resultsFilesImg = req.files.fileimgs;
      //
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
        sendMultImageMassa
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendMultImageMassa": sessionStatus
      });
  }
}); //sendMultImageMassa
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar imagen no grupo
router.post("/sendImageGrupo", upload.single('file'), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
      console.log("- File", filePath);
      //
      var sendImageGrupo = await Sessions.sendImage(
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
        sendImageGrupo
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendImageGrupo": sessionStatus
      });
  }
}); //sendImageGrupo
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar arquivo/documento
router.post("/sendFile", upload.single('file'), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
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
        sendFile
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendFile": sessionStatus
      });
  }
}); //sendFile
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar arquivo/documento
router.post("/sendFileGroup", upload.single('file'), verifyBody.Group, verifyToken.verify, async (req, res, next) => {
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
      console.log("- File", filePath);
      //
      var sendFile = await Sessions.sendFile(
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
        sendFile
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendFile": sessionStatus
      });
  }
}); //sendFileGroup
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar arquivo/documento
router.post("/sendFileBase64", upload.none(''), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
  var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
  switch (sessionStatus.status) {
    case 'inChat':
    case 'qrReadSuccess':
    case 'isLogged':
    case 'chatsAvailable':
      //
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
        sendFileBase64
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendImageGrupo": sessionStatus
      });
  }
}); //sendFileBase64
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar arquivo/documento
router.post("/sendFileBase64Group", upload.none(''), verifyBody.Group, verifyToken.verify, async (req, res, next) => {
  var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
  switch (sessionStatus.status) {
    case 'inChat':
    case 'qrReadSuccess':
    case 'isLogged':
    case 'chatsAvailable':
      //
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
        sendFileBase64
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendFileBase64": sessionStatus
      });
  }
}); //sendFileBase64Group
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar arquivo/documento
router.post("/sendFileToBase64", upload.single('file'), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
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
        sendFileFromBase64
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendFileFromBase64": sessionStatus
      });
  }
}); //sendFileBase64
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar arquivo/documento
router.post("/sendFileToBase64Group", upload.single('file'), verifyBody.Group, verifyToken.verify, async (req, res, next) => {
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
        sendFileToBase64
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendFileToBase64": sessionStatus
      });
  }
}); //sendFileToBase64Group
//
// ------------------------------------------------------------------------------------------------------- //
//
// Enviar arquivo/documento
router.post("/sendFileFromBase64", upload.none(''), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
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
          req.body.base64Data,
          req.body.mimetype,
          req.body.originalname,
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
        sendFileFromBase64
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendFileFromBase64": sessionStatus
      });
  }
}); //sendFileFromBase64
//
// ------------------------------------------------------------------------------------------------//
//
// Enviar arquivo/documento
router.post("/sendFileFromBase64Group", upload.none(''), verifyBody.Group, verifyToken.verify, async (req, res, next) => {
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
        req.body.base64Data,
        req.body.mimetype,
        req.body.originalname,
        req.body.msg
      );
      //
      //console.log(result);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        sendFileFromBase64
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendFileFromBase64": sessionStatus
      });
  }
}); //sendFileFromBase64Group
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar imagem em gif
router.post("/sendImageAsStickerGif", upload.single('file'), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
  //
  // Generates sticker from the provided animated gif image and sends it (Send image as animated sticker)
  // image path imageBase64 A valid gif and webp image is required. 
  // You can also send via http/https (http://www.website.com/img.gif)
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
      console.log("- File", filePath);
      //
      var checkNumberStatus = await Sessions.checkNumberStatus(
        removeWithspace(req.body.SessionName),
        soNumeros(req.body.phonefull).trim() + '@c.us'
      );
      //
      if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
        //
        var sendImageAsStickerGif = await Sessions.sendImageAsStickerGif(
          removeWithspace(req.body.SessionName),
          checkNumberStatus.number + '@c.us',
          filePath
        );
        //
      } else {
        var sendImageAsStickerGif = checkNumberStatus;
      }
      //
      await deletaArquivosTemp(filePath);
      //
      //console.log(result);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        sendImageAsStickerGif
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendImageAsStickerGif": sessionStatus
      });
  }
}); //sendImageAsStickerGif
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar imagem em gif
router.post("/sendImageAsStickerGifUrl", upload.single('file'), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
  //
  // Generates sticker from the provided animated gif image and sends it (Send image as animated sticker)
  // image path imageBase64 A valid gif and webp image is required. 
  // You can also send via http/https (http://www.website.com/img.gif)
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
        var sendImageAsStickerGifUrl = await Sessions.sendImageAsStickerGif(
          removeWithspace(req.body.SessionName),
          checkNumberStatus.number + '@c.us',
          req.body.urlLink,
        );
        //
      } else {
        var sendImageAsStickerGifUrl = checkNumberStatus;
      }
      //
      //console.log(result);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        sendImageAsStickerGifUrl
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendImageAsStickerGifUrl": sessionStatus
      });
  }
}); //sendImageAsStickerGifUrl
//
// ------------------------------------------------------------------------------------------------//
//
//Enviar figura png ou jpg
router.post("/sendImageAsSticker", upload.single('file'), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
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
      var jsonStr = '{"sendResult":[]}';
      var obj = JSON.parse(jsonStr);
      //
      var checkNumberStatus = await Sessions.checkNumberStatus(
        removeWithspace(req.body.SessionName),
        soNumeros(req.body.phonefull).trim() + '@c.us'
      );
      //
      if (checkNumberStatus.status === 200 && checkNumberStatus.erro === false) {
        //
        var sendImageAsSticker = await Sessions.sendImageAsSticker(
          removeWithspace(req.body.SessionName),
          checkNumberStatus.number + '@c.us',
          filePath
        );
        //
      } else {
        var sendImageAsSticker = checkNumberStatus;
      }
      //
      await deletaArquivosTemp(filePath);
      //
      //console.log(result);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        sendImageAsSticker
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "sendImageAsSticker": sessionStatus
      });
  }
}); //sendImageAsSticker
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
router.post("/getAllContacts", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        getAllContacts
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "getAllContacts": sessionStatus
      });
  }
}); //getAllContacts
//
// ------------------------------------------------------------------------------------------------------- //
//
// Recuperar grupos
router.post("/getAllGroups", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        getAllGroups
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "getAllGroups": sessionStatus
      });
  }
}); //getAllGroups
//
// ------------------------------------------------------------------------------------------------------- //
//
// Returns browser session token
router.post("/getSessionTokenBrowser", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        getSessionTokenBrowser
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "getSessionTokenBrowser": sessionStatus
      });
  }
}); //getSessionTokenBrowser
//
// ------------------------------------------------------------------------------------------------------- //
//
// Chama sua lista de contatos bloqueados
router.post("/getBlockList", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        getBlockList
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "getBlockList": sessionStatus
      });
  }
}); //getBlockList
//
// ------------------------------------------------------------------------------------------------//
//
// Recuperar status de contato
router.post("/getStatus", upload.none(''), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
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
        getStatus
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "getStatus": sessionStatus
      });
  }
}); //getStatus
//
// ------------------------------------------------------------------------------------------------------- //
//
// Obter o perfil do número
router.post("/getNumberProfile", upload.none(''), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
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
        getNumberProfile
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "getNumberProfile": sessionStatus
      });
  }
}); //getNumberProfile
//
// ------------------------------------------------------------------------------------------------------- //
//
// Verificar o status do número
router.post("/checkNumberStatus", upload.none(''), verifyBody.Usage, verifyToken.verify, async (req, res, next) => {
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
        checkNumberStatus
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "checkNumberStatus": sessionStatus
      });
  }
}); //checkNumberStatus
//
// ------------------------------------------------------------------------------------------------------- //
//
// Verificar o status do número em massa
router.post("/checkNumberStatusMassa", upload.single('file'), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        checkNumberStatusMassa
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "checkNumberStatusMassa": sessionStatus
      });
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
//Deixar o grupo
router.post("/leaveGroup", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
        leaveGroup
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "leaveGroup": sessionStatus
      });
  }
}); //leaveGroup
//
// ------------------------------------------------------------------------------------------------------- //
//
// Obtenha membros do grupo
router.post("/getGroupMembers", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
        getGroupMembers
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "getGroupMembers": sessionStatus
      });
  }
}); //getGroupMembers
//
// ------------------------------------------------------------------------------------------------//
//
// Obter IDs de membros do grupo 
router.post("/getGroupMembersIds", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
        getGroupMembersIds
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "getGroupMembersIds": sessionStatus
      });
  }
}); //getGroupMembersIds
//
// ------------------------------------------------------------------------------------------------//
//
// Gerar link de url de convite de grupo
router.post("/getGroupInviteLink", upload.none(''), verifyToken.verify, async (req, res, next) => {
  //
  // Gerar link de url de convite de grupo
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
        GroupInviteLink
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "GroupInviteLink": sessionStatus
      });
  }
}); //getGroupInviteLink
//
// ------------------------------------------------------------------------------------------------//
//
router.post("/createGroup", upload.single('participants'), verifyToken.verify, async (req, res, next) => {
  //
  // Criar grupo (título, participantes a adicionar)
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
        createGroup
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "createGroup": sessionStatus
      });
  }
}); //createGroup
//
// ------------------------------------------------------------------------------------------------//
//
// Criar grupo (título, participantes a adicionar)
router.post("/createGroupSetAdminMembers", upload.single('participants'), verifyToken.verify, async (req, res, next) => {
  var sessionStatus = await Sessions.ApiStatus(removeWithspace(req.body.SessionName));
  switch (sessionStatus.status) {
    case 'inChat':
    case 'qrReadSuccess':
    case 'isLogged':
    case 'chatsAvailable':
      //
      var createGroupSetAdminMembers = [];
      //
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
        createGroupSetAdminMembers
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "createGroupSetAdminMembers": sessionStatus
      });
  }
}); //createGroupSetAdminMembers
//
// ------------------------------------------------------------------------------------------------//
//
// Criar grupo (título, participantes a adicionar)
router.post("/createCountGroupSetAdminMembers", upload.single('participants'), verifyToken.verify, async (req, res, next) => {
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
        "createCountGroupSetAdminMembers": createGroup
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "createCountGroupSetAdminMembers": sessionStatus
      });
  }
}); //createCountGroupSetAdminMembers
//
// ------------------------------------------------------------------------------------------------//
//
router.post("/removeParticipant", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
        removeParticipant
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "removeParticipant": sessionStatus
      });
  }
}); //removeParticipant
//
// ------------------------------------------------------------------------------------------------//
//
router.post("/addParticipant", upload.none(''), verifyToken.verify, async (req, res, next) => {
  //
  // Adicionar participante
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
        addParticipant
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "addParticipant": sessionStatus
      });
  }
}); //addParticipant
//
// ------------------------------------------------------------------------------------------------//
//
router.post("/promoteParticipant", upload.none(''), verifyToken.verify, async (req, res, next) => {
  //
  // Promote participant (Give admin privileges)
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
        promoteParticipant
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "promoteParticipant": sessionStatus
      });
  }
}); //promoteParticipant
//
// ------------------------------------------------------------------------------------------------//
//
// Depromote participant (Give admin privileges)
router.post("/demoteParticipant", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
        demoteParticipant
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "demoteParticipant": sessionStatus
      });
  }
}); //demoteParticipant
//
// ------------------------------------------------------------------------------------------------//
//
// Retorna o status do grupo, jid, descrição do link de convite
router.post("/getGroupInfoFromInviteLink", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
        getGroupInfoFromInviteLink
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "getGroupInfoFromInviteLink": sessionStatus
      });
  }
}); //getGroupInfoFromInviteLink
//
// ------------------------------------------------------------------------------------------------//
//
router.post("/joinGroup", upload.none(''), verifyToken.verify, async (req, res, next) => {
  //
  // Junte-se a um grupo usando o código de convite do grupo
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
        joinGroup
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "joinGroup": sessionStatus
      });
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
router.post("/setProfileStatus", upload.none(''), verifyToken.verify, async (req, res, next) => {
  //
  // Set client status
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
        setProfileStatus
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "setProfileStatus": sessionStatus
      });
  }
}); //setProfileStatus
//
// ------------------------------------------------------------------------------------------------//
//
router.post("/setProfileName", upload.none(''), verifyToken.verify, async (req, res, next) => {
  //
  // Set client profile name
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
        setProfileName
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "setProfileName": sessionStatus
      });
  }
}); //setProfileName
//
// ------------------------------------------------------------------------------------------------//
//
router.post("/setProfilePic", upload.single('file'), verifyToken.verify, async (req, res, next) => {
  //

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
        setProfilePic
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "setProfilePic": sessionStatus
      });
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
router.post("/killServiceWorker", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        killServiceWorker
      });
      //
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "killServiceWorker": sessionStatus
      });
  }
}); //killServiceWorker
//
// ------------------------------------------------------------------------------------------------//
//
// Load the service again
router.post("/restartService", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        restartService
      });
      //
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "restartService": sessionStatus
      });
  }
}); //restartService
//
// ------------------------------------------------------------------------------------------------//
//
// Reload do whatsapp web
router.post("/reloadService", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
              "reloadService": reload
            });
            //
          } else {
            //
            var reload = restartService;
            //
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({
              "reloadService": reload
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
            "reloadService": reload
          });
          //
        }
      } catch (error) {
        //
        res.setHeader('Content-Type', 'application/json');
        res.status(404).json({
          "reloadService": {
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
        "reloadService": sessionStatus
      });
  }
}); //reloadService
//
// ------------------------------------------------------------------------------------------------//
//
// Get device info
router.post("/getHostDevice", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        getHostDevice
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "getHostDevice": sessionStatus
      });
  }
}); //getHostDevice
//
// ------------------------------------------------------------------------------------------------//
//
// Get connection state
router.post("/getConnectionState", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        getConnectionState
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "getConnectionState": sessionStatus
      });
  }
}); //getConnectionState
//
// ------------------------------------------------------------------------------------------------//
//
// Get battery level
router.post("/getBatteryLevel", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        getBatteryLevel
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "getBatteryLevel": sessionStatus
      });
  }
}); //getBatteryLevel
//
// ------------------------------------------------------------------------------------------------//
//
// Is Connected
router.post("/isConnected", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        isConnected
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "isConnected": sessionStatus
      });
  }
}); //isConnected
//
// ------------------------------------------------------------------------------------------------//
//
// Obter versão da web do Whatsapp
router.post("/getWAVersion", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        getWAVersion
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "getWAVersion": sessionStatus
      });
  }
}); //getWAVersion
//
// ------------------------------------------------------------------------------------------------//
//
// Obter versão da web do Whatsapp
router.post("/getWAVersion", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        getWAVersion
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "getWAVersion": sessionStatus
      });
  }
}); //getWAVersion
//
// ------------------------------------------------------------------------------------------------//
//
// Inicia a verificação de conexão do telefone
router.post("/startPhoneWatchdog", upload.none(''), verifyToken.verify, async (req, res, next) => {
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
        startPhoneWatchdog
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "getWAVersion": sessionStatus
      });
  }
}); //startPhoneWatchdog
//
// ------------------------------------------------------------------------------------------------//
//
// Para a verificação de conexão do telefone
router.post("/stopPhoneWatchdog", upload.none(''), verifyBody.Started, verifyToken.verify, async (req, res, next) => {
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
        stopPhoneWatchdog
      });
      break;
    default:
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({
        "stopPhoneWatchdog": sessionStatus
      });
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
router.post("/RotaTeste", verifyToken.verify, upload.single('file'), verifyToken.verify, async (req, res, next) => {
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