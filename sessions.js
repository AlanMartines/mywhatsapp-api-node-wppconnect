//
// Configuração dos módulos
const config = require('./config.global');
const os = require("os");
const fs = require('fs-extra');
const {
  forEach
} = require('p-iteration');
const axios = require('axios');
const wppconnect = require('./wppconnect/dist/index');
const io = require("socket.io-client"),
  ioClient = io.connect("http://localhost:" + config.PORT);
const {
  cache
} = require('sharp');
const con = require("./config/dbConnection");
//require('dotenv/config');
/*
require("dotenv").config({
  path: "./.env"
});
*/
//
// ------------------------------------------------------------------------------------------------------- //
//
async function DataHora() {
  //
  let date_ob = new Date();

  // Data atual
  // Ajuste 0 antes da data de um dígito
  let date = ("0" + date_ob.getDate()).slice(-2);

  // Mês atual
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

  // Ano atual
  let year = date_ob.getFullYear();

  // Hora atual
  let hours = date_ob.getHours();

  // Minuto atual
  let minutes = date_ob.getMinutes();

  // Segundo atual
  let seconds = date_ob.getSeconds();
  /*
  // Imprime a data no formato AAAA-MM-DD
  console.log(year + "-" + month + "-" + date);

  // Imprime a data no formato DD/MM/YYYY
  console.log(date + "/" + month + "/" + year);

  // Imprime data e hora no formato AAAA-MM-DD HH:MM:SS
  console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);

  // Imprime data e hora no formato DD/MM/YYYY HH:MM:SS
  console.log(date + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds);

  // Imprime a hora no formato HH:MM:SS
  console.log(hours + ":" + minutes + ":" + seconds);
	*/
  //
  // Imprime data e hora no formato AAAA-MM-DD HH:MM:SS
  return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
}
//
async function saudacao() {
  //
  var data = new Date();
  var hr = data.getHours();
  //
  if (hr >= 0 && hr < 12) {
    var saudacao = "Bom dia";
    //
  } else if (hr >= 12 && hr < 18) {
    var saudacao = "Boa tarde";
    //
  } else if (hr >= 18 && hr < 23) {
    var saudacao = "Boa noite";
    //
  } else {
    var saudacao = "---";
    //
  }
  return saudacao;
}
//
async function osplatform() {
  //
  var opsys = process.platform;
  if (opsys == "darwin") {
    opsys = "MacOS";
  } else if (opsys == "win32" || opsys == "win64") {
    opsys = "Windows";
  } else if (opsys == "linux") {
    opsys = "Linux";
  }
  console.log("- Sistema operacional", opsys) // I don't know what linux is.
  //console.log("-", os.type());
  //console.log("-", os.release());
  //console.log("-", os.platform());
  //
  return opsys;
}
//
// ------------------------------------------------------------------------------------------------------- //
//
async function updateStateDb(state, status, SessionName) {
  //
  const date_now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log("- Date:", date_now);
  //
  //
  const sql = "UPDATE tokens SET state=?, status=?, lastactivit=? WHERE token=?";
  const values = [state, status, date_now, SessionName];
  //
  if (Boolean(config.VALIDATE_MYSQL) == true) {
    console.log('- Atualizando status');
    const conn = require('./config/dbConnection').promise();
    const resUpdate = await conn.execute(sql, values);
    if (resUpdate) {
      console.log('- Status atualizado');
    } else {
      console.log('- Status não atualizado');
    }
  }
  //
}
//
// ------------------------------------------------------------------------------------------------------- //
//
async function deletaToken(filePath) {
  //
  const cacheExists = await fs.pathExists(filePath);
  console.log('- O arquivo é: ' + cacheExists);
  if (cacheExists) {
    fs.remove(filePath);
    console.log('- O arquivo removido: ' + cacheExists);
  }
}
//
module.exports = class Sessions {
  //
  static async getStatusApi(sessionName, options = []) {
    Sessions.options = Sessions.options || options;
    Sessions.sessions = Sessions.sessions || [];

    var session = Sessions.getSession(sessionName);
    return session;
  } //getStatus
  //
  static async ApiStatus(SessionName) {
    console.log("- Status");
    var session = Sessions.getSession(SessionName);

    if (session) { //só adiciona se não existir
      if (session.state == "CONNECTED") {
        return {
          result: "info",
          SessionName: SessionName,
          state: session.state,
          status: session.status,
          qrcode: session.qrcode,
          message: "Sistema iniciado e disponivel para uso"
        };
      } else if (session.state == "STARTING") {
        return {
          result: "info",
          SessionName: SessionName,
          state: session.state,
          status: session.status,
          qrcode: session.qrcode,
          message: "Sistema iniciando e indisponivel para uso"
        };
      } else if (session.state == "QRCODE") {
        return {
          result: "warning",
          SessionName: SessionName,
          state: session.state,
          status: session.status,
          qrcode: session.qrcode,
          message: "Sistema aguardando leitura do QR-Code"
        };
      } else {
        switch (session.status) {
          case 'isLogged':
            return {
              result: "success",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "Sistema iniciado e disponivel para uso"
            };
            break;
          case 'notLogged':
            return {
              result: "error",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "Sistema indisponivel para uso"
            };
            break;
          case 'browserClose':
            return {
              result: "info",
                state: session.state,
                SessionName: SessionName,
                status: session.status,
                qrcode: session.qrcode,
                message: "Navegador interno fechado"
            };
            break;
          case 'qrReadSuccess':
            return {
              result: "success",
                state: session.state,
                SessionName: SessionName,
                status: session.status,
                qrcode: session.qrcode,
                message: "Verificação do QR-Code feita com sucesso"
            };
            break;
          case 'qrReadFail':
            return {
              result: "warning",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "Falha na verificação do QR-Code"
            };
            break;
          case 'qrRead':
            return {
              result: "warning",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "Sistema aguardando leitura do QR-Code"
            };
            break;
          case 'autocloseCalled':
            return {
              result: "info",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "Navegador interno fechado"
            };
            break;
          case 'desconnectedMobile':
            return {
              result: "info",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "Dispositivo desconectado"
            };
            break;
          case 'deleteToken':
            return {
              result: "info",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "Token de sessão removido"
            };
            break;
          case 'chatsAvailable':
            return {
              result: "success",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "Sistema iniciado e disponivel para uso"
            };
            break;
          case 'deviceNotConnected':
            return {
              result: "info",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "Dispositivo desconectado"
            };
            break;
          case 'serverWssNotConnected':
            return {
              result: "info",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "O endereço wss não foi encontrado"
            };
            break;
          case 'noOpenBrowser':
            return {
              result: "error",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "Não foi encontrado o navegador ou falta algum comando no args"
            };
            break;
          case 'serverClose':
            return {
              result: "info",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "O cliente se desconectou do wss"
            };
            break;
          case 'OPENING':
            return {
              result: "warning",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "'Sistema iniciando e indisponivel para uso'"
            };
            break;
          case 'CONFLICT':
            return {
              result: "info",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "Dispositivo conectado em outra sessão, reconectando"
            };
            break;
          case 'UNPAIRED':
          case 'UNLAUNCHED':
          case 'UNPAIRED_IDLE':
            return {
              result: "warning",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "Dispositivo desconectado"
            };
            break;
          case 'DISCONNECTED':
            return {
              result: "info",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "Dispositivo desconectado"
            };
            break;
          case 'SYNCING':
            return {
              result: "warning",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "Dispositivo sincronizando"
            };
            break;
          case 'CLOSED':
            return {
              result: "info",
                SessionName: SessionName,
                state: session.state,
                status: session.status,
                qrcode: session.qrcode,
                message: "O cliente fechou a sessão ativa"
            };
            break;
          default:
            //
            return {
              result: 'error',
                SessionName: SessionName,
                state: 'NOTFOUND',
                status: 'notLogged',
                qrcode: null,
                message: 'Sistema Off-line'
            };
            //
        }
      }
    } else {
      return {
        result: 'error',
        SessionName: SessionName,
        state: 'NOTFOUND',
        status: 'notLogged',
        qrcode: null,
        message: 'Sistema Off-line'
      };
    }
  } //status
  //
  // ------------------------------------------------------------------------------------------------------- //
  //
  static async Start(SessionName, options = []) {
    Sessions.options = Sessions.options || options; //start object
    Sessions.sessions = Sessions.sessions || []; //start array

    var session = Sessions.getSession(SessionName);

    if (session == false) {
      //create new session
      //
      console.log('- Nome da sessão:', session.name);
      console.log('- State do sistema:', session.state);
      console.log('- Status da sessão:', session.status);
      //
      session = await Sessions.addSesssion(SessionName);
    } else if (["CLOSED"].includes(session.state)) {
      //restart session
      console.log("- State: CLOSED");
      session.state = "CLOSED";
      session.status = "notLogged";
      session.qrcode = null;
      session.attempts = 0;
      session.message = "Sistema iniciando e indisponivel para uso";
      session.prossesid = null;
      //
      console.log('- Nome da sessão:', session.name);
      console.log('- State do sistema:', session.state);
      console.log('- Status da sessão:', session.status);
      //
      session.client = Sessions.initSession(SessionName);
      Sessions.setup(SessionName);
    } else if (["CONFLICT", "UNPAIRED", "UNLAUNCHED", "UNPAIRED_IDLE"].includes(session.state)) {
      session.state = "CLOSED";
      session.status = 'notLogged';
      session.qrcode = null;
      session.message = 'Sistema desconectado';
      //
      console.log('- Nome da sessão:', session.name);
      console.log('- State do sistema:', session.state);
      console.log('- Status da sessão:', session.status);
      //
      session.client.then(client => {
        console.log("- Client UseHere");
        client.useHere();
      });
      session.client = Sessions.initSession(SessionName);
    } else if (["DISCONNECTED"].includes(session.state)) {
      //restart session
      session.state = "CLOSE";
      session.status = "notLogged";
      session.qrcode = null;
      session.attempts = 0;
      session.message = 'Sistema desconectado';
      session.prossesid = null;
      //
      console.log('- Nome da sessão:', session.name);
      console.log('- State do sistema:', session.state);
      console.log('- Status da sessão:', session.status);
      //
      session.client = Sessions.initSession(SessionName);
      Sessions.setup(SessionName);
    } else {
      console.log('- Nome da sessão:', session.name);
      console.log('- State do sistema:', session.state);
      console.log('- Status da sessão:', session.status);
    }
    //
    await updateStateDb(session.state, session.status, SessionName);
    //
    return session;
  } //start
  //
  // ------------------------------------------------------------------------------------------------------- //
  //
  static async addSesssion(SessionName) {
    console.log("- Adicionando sessão");
    var newSession = {
      name: SessionName,
      process: null,
      qrcode: null,
      client: false,
      result: null,
      tokenPatch: null,
      state: 'STARTING',
      status: 'notLogged',
      message: 'Sistema iniciando e indisponivel para uso',
      attempts: 0,
      browserSessionToken: null
    }
    Sessions.sessions.push(newSession);
    console.log("- Nova sessão: " + newSession.state);

    //setup session
    newSession.client = Sessions.initSession(SessionName);
    Sessions.setup(SessionName);

    return newSession;
  } //addSession
  //
  // ------------------------------------------------------------------------------------------------//
  //
  static getSession(SessionName) {
    var foundSession = false;
    if (Sessions.sessions)
      Sessions.sessions.forEach(session => {
        if (SessionName == session.name) {
          foundSession = session;
        }
      });
    return foundSession;
  } //getSession
  //
  // ------------------------------------------------------------------------------------------------//
  //
  static getSessions() {
    if (Sessions.sessions) {
      return Sessions.sessions;
    } else {
      return [];
    }
  } //getSessions
  //
  // ------------------------------------------------------------------------------------------------------- //
  //
  static async initSession(SessionName) {
    console.log("- Iniciando sessão");
    var session = Sessions.getSession(SessionName);
    session.browserSessionToken = null;
    //
    /*
      ╔═╗┌─┐┌┬┐┬┌─┐┌┐┌┌─┐┬    ╔═╗┬─┐┌─┐┌─┐┌┬┐┌─┐  ╔═╗┌─┐┬─┐┌─┐┌┬┐┌─┐┌┬┐┌─┐┬─┐┌─┐
      ║ ║├─┘ │ ││ ││││├─┤│    ║  ├┬┘├┤ ├─┤ │ ├┤   ╠═╝├─┤├┬┘├─┤│││├┤  │ ├┤ ├┬┘└─┐
      ╚═╝┴   ┴ ┴└─┘┘└┘┴ ┴┴─┘  ╚═╝┴└─└─┘┴ ┴ ┴ └─┘  ╩  ┴ ┴┴└─┴ ┴┴ ┴└─┘ ┴ └─┘┴└─└─┘
   */
    //
    const osnow = await osplatform();
    //
    if (osnow == 'linux' || osnow == 'Linux') {
      console.log("- Sistema operacional:", osnow);
      var folderToken = config.TOKENSPATCH_LINUX;
      session.tokenPatch = folderToken;
    } else if (osnow == 'win32' || osnow == 'win64' || osnow == 'Windows') {
      console.log("- Sistema operacional:", osnow);
      var folderToken = config.TOKENSPATCH_WIN;
      session.tokenPatch = folderToken;
    } else {
      var folderToken = './tokens';
      session.tokenPatch = folderToken;
    }
    //
    const client = await wppconnect.create({
      session: session.name,
      catchQR: async (base64Qrimg, asciiQR, attempts, urlCode) => {
        //
        console.log("- Saudação:", await saudacao());
        //
        console.log('- Nome da sessão:', session.name);
        //
        session.state = "QRCODE";
        session.status = "qrRead";
        session.message = 'Sistema iniciando e indisponivel para uso';
        //
        console.log('- Número de tentativas de ler o qr-code:', attempts);
        session.attempts = attempts;
        //
        console.log("- Captura do QR-Code");
        //console.log(base64Qrimg);
        session.qrcode = base64Qrimg;
        //
        console.log("- Captura do asciiQR");
        // Registrar o QR no terminal
        //console.log(asciiQR);
        session.CodeasciiQR = asciiQR;
        //
        console.log("- Captura do urlCode");
        // Registrar o QR no terminal
        //console.log(urlCode);
        session.CodeurlCode = urlCode;
        //
        var qrCode = base64Qrimg.replace('data:image/png;base64,', '');
        const imageBuffer = Buffer.from(qrCode, 'base64');
        //
        /*
        // Para escrevê-lo em outro lugar em um arquivo
        //exportQR(base64Qrimg, './public/images/marketing-qr.png');
        var matches = base64Qrimg.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};

        if (matches.length !== 3) {
            return new Error('- Invalid input string');
        }
        response.type = matches[1];
        response.data = new Buffer.from(matches[2], 'base64');
        
        // Gerar o arquivo png
        var imageBuffer = response;
        require('fs').writeFile('./public/images/marketing-qr.png',
            imageBuffer['data'],
            'binary',
            function(err) {
                if (err != null) {
                    console.log(err);
                }
            }
        );
        */
      },
      // statusFind
      statusFind: async (statusSession, session_wppconnect) => {
        console.log('- Status da sessão:', statusSession);
        //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
        //Create session wss return "serverClose" case server for close
        console.log('- Session name: ', session_wppconnect);
        //
        //
        switch (statusSession) {
          case 'isLogged':
          case 'qrReadSuccess':
          case 'inChat':
          case 'chatsAvailable':
            session.result = "success";
            session.state = "CONNECTED";
            session.status = statusSession
            session.qrcode = null;
            session.CodeasciiQR = null;
            session.CodeurlCode = null;
            session.message = "Sistema iniciado e disponivel para uso";
            //
            await updateStateDb(session.state, session.status, SessionName);
            //
            break;
          case 'autocloseCalled':
          case 'browserClose':
          case 'serverClose':
          case 'autocloseCalled':
            session.result = "info";
            session.state = "CLOSED";
            session.status = statusSession;
            session.qrcode = null;
            session.CodeasciiQR = null;
            session.CodeurlCode = null;
            session.message = "Sistema fechado";
            //
            await updateStateDb(session.state, session.status, SessionName);
            //
            break;
          case 'qrReadFail':
          case 'notLogged':
          case 'deviceNotConnected':
          case 'desconnectedMobile':
          case 'deleteToken':
            //session.client = false;
            session.result = "info";
            session.state = "DISCONNECTED";
            session.status = statusSession;
            session.qrcode = null;
            session.message = "Dispositivo desconetado";
            //
            await updateStateDb(session.state, session.status, SessionName);
            //
            break;
          default:
            //session.client = false;
            session.result = "info";
            session.state = "DISCONNECTED";
            session.status = statusSession;
            session.qrcode = null;
            session.message = "Dispositivo desconetado";
            //
            await updateStateDb(session.state, session.status, SessionName);
            //
        }
      },
      // options
      deviceName: "My Whatsapp",
      headless: true, // Headless chrome
      devtools: false, // Open devtools by default
      useChrome: true, // If false will use Chromium instance
      debug: false, // Opens a debug session
      logQR: Boolean(config.VIEW_QRCODE_TERMINAL), // Logs QR automatically in terminal
      browserWS: '', // If u want to use browserWSEndpoint
      browserArgs: [
        '--log-level=3',
        '--no-default-browser-check',
        '--disable-site-isolation-trials',
        '--no-experiments',
        '--ignore-gpu-blacklist',
        '--ignore-ssl-errors',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-default-apps',
        '--enable-features=NetworkService',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        // Extras
        '--disable-webgl',
        '--disable-threaded-animation',
        '--disable-threaded-scrolling',
        '--disable-in-process-stack-traces',
        '--disable-histogram-customizer',
        '--disable-gl-extensions',
        '--disable-composited-antialiasing',
        '--disable-canvas-aa',
        '--disable-3d-apis',
        '--disable-accelerated-2d-canvas',
        '--disable-accelerated-jpeg-decoding',
        '--disable-accelerated-mjpeg-decode',
        '--disable-app-list-dismiss-on-blur',
        '--disable-accelerated-video-decode',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--disable-dev-shm-usage',
        '--disable-gl-drawing-for-tests',
        '--incognito',
        '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36',
        //Outros
        '--disable-web-security',
        '--disable-web-security',
        '--aggressive-cache-discard',
        '--disable-cache',
        '--disable-application-cache',
        '--disable-offline-load-stale-cache',
        '--disk-cache-size=0',
        '--disable-background-networking',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
      ],
      puppeteerOptions: {}, // Will be passed to puppeteer.launch
      //executablePath: '/usr/bin/chromium-browser',
      disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
      disableWelcome: false, // Will disable the welcoming message which appears in the beginning
      updatesLog: true, // Logs info updates automatically in terminal
      autoClose: false, // Automatically closes the WPPConnect only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
      tokenStore: 'file', // Define how work with tokens, that can be a custom interface
      folderNameToken: session.tokenPatch //folder name when saving tokens
      //createPathFileToken: true, //creates a folder when inserting an object in the client's browser, to work it is necessary to pass the parameters in the function create browserSessionToken
    });
    // Levels: 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'
    // All logs: 'silly'
    wppconnect.defaultLogger.level = 'silly';
    //
    var browserSessionToken = await client.getSessionTokenBrowser();
    console.log("- Token WPPConnect:\n", JSON.parse(JSON.stringify(browserSessionToken)));
    session.state = "CONNECTED";
    session.browserSessionToken = browserSessionToken;
    //
    return client;
  } //initSession
  //
  // ------------------------------------------------------------------------------------------------//
  //
  /*
    ╔═╗┌─┐┌┬┐┌┬┐┬┌┐┌┌─┐  ┌─┐┌┬┐┌─┐┬─┐┌┬┐┌─┐┌┬┐
    ║ ╦├┤  │  │ │││││ ┬  └─┐ │ ├─┤├┬┘ │ ├┤  ││
    ╚═╝└─┘ ┴  ┴ ┴┘└┘└─┘  └─┘ ┴ ┴ ┴┴└─ ┴ └─┘─┴┘
  */
  //
  static async setup(SessionName) {
    console.log("- Sinstema iniciando");
    var session = Sessions.getSession(SessionName);
    await session.client.then(client => {
      // State change
      let time = 0;
      client.onStateChange(async (state) => {
        session.state = state;
        console.log('- Connection status: ', state);
        clearTimeout(time);
        if (state == "CONNECTED") {
          session.state = state;
          session.status = 'isLogged';
          session.qrcode = null;
          //
        } else if (state == "OPENING") {
          session.state = state;
          session.status = 'notLogged';
          session.qrcode = null;
          //
          //await deletaToken(session.tokenPatch + "/" + SessionName + ".data.json");
          //
        } else if (state == "UNPAIRED") {
          session.state = state;
          session.status = 'notLogged';
          session.qrcode = null;
          //
          await deletaToken(session.tokenPatch + "/" + SessionName + ".data.json");
          //
        } else if (state === 'DISCONNECTED' || state === 'SYNCING') {
          session.state = state;
          session.qrcode = null;
          //
          await deletaToken(session.tokenPatch + "/" + SessionName + ".data.json");
          //
          time = setTimeout(() => {
            client.close();
            // process.exit(); //optional function if you work with only one session
          }, 80000);
        }
        //
        await updateStateDb(session.state, session.status, SessionName);
        //
        // force whatsapp take over
        if ('CONFLICT'.includes(state)) client.useHere();
        // detect disconnect on whatsapp
        if ('UNPAIRED'.includes(state)) console.log('- Logout');
      });
      //
      // Listen to messages
      client.onMessage(async (message) => {
        console.log("- onMessage")
        //
        /*
        console.log("- Type.....:", message.type);
        console.log("- Body.....:", message.body);
        console.log("- From.....:", message.from);
        console.log("- To.......:", message.to);
        console.log("- Push Name:", message.chat.contact.pushname);
        console.log("- Is Group.:", message.isGroupMsg);
        */
        //
        if (message.body === 'Hi' && message.isGroupMsg === false) {
          client
            .sendText(message.from, await saudacao() + ",\nWelcome Venom 🕷")
            .then((result) => {
              //console.log('- Result: ', result); //retorna um objeto de successo
            })
            .catch((erro) => {
              //console.error('- Error: ', erro); //return um objeto de erro
            });
        }
      });
      //
      // function to detect incoming call
      client.onIncomingCall(async (call) => {
        client.sendText(call.peerJid, await saudacao() + ",\nDesculpe-me mas não consigo atender sua chamada, se for urgente manda msg de texto, grato.");
      });
      // Listen when client has been added to a group
      client.onAddedToGroup(async (chatEvent) => {
        //console.log('- Listen when client has been added to a group:', chatEvent.name);
      });
      // Listen to ack's
      // See the status of the message when sent.
      // When receiving the confirmation object, "ack" may return a number, look {@link AckType} for details:
      // -7 = MD_DOWNGRADE,
      // -6 = INACTIVE,
      // -5 = CONTENT_UNUPLOADABLE,
      // -4 = CONTENT_TOO_BIG,
      // -3 = CONTENT_GONE,
      // -2 = EXPIRED,
      // -1 = FAILED,
      //  0 = CLOCK,
      //  1 = SENT,
      //  2 = RECEIVED,
      //  3 = READ,
      //  4 = PLAYED =
      //
      client.onAck(async (ack) => {
        console.log("- Listen to ack", ack.ack);
        switch (ack.ack) {
          case -7:
            console.log("- MD_DOWNGRADE");;
            break;
          case -6:
            console.log("- INACTIVE");;
            break;
          case -5:
            console.log("- CONTENT_UNUPLOADABLE");;
            break;
          case -4:
            console.log("- CONTENT_TOO_BIG");;
            break;
          case -3:
            console.log("- CONTENT_GONE");;
            break;
          case -2:
            console.log("- EXPIRED");;
            break;
          case -1:
            console.log("- FAILED");;
            break;
          case 0:
            console.log("- CLOCK");;
            break;
          case 1:
            console.log("- SENT");;
            break;
          case 2:
            console.log("- RECEIVED");;
            break;
          case 3:
            console.log("- READ");;
            break;
          case 4:
            console.log("- PLAYED");;
            break;
          default:
            console.log("- Listen to ack: N/D");
        }
      });
    });
  } //setup
  //
  // ------------------------------------------------------------------------------------------------//
  //
  static async closeSession(SessionName) {
    console.log("- Fechando sessão");
    var session = Sessions.getSession(SessionName);
    var closeSession = await session.client.then(async client => {
      try {
        const strClosed = await client.close();
        //
        console.log("- Close:", strClosed);
        //
        if (strClosed) {
          //
          session.state = "CLOSED";
          session.status = "CLOSED";
          session.client = false;
          session.qrcode = null;
          console.log("- Sessão fechada");
          //
          var returnClosed = {
            result: "success",
            state: session.state,
            status: session.status,
            qrcode: session.qrcode,
            message: "Sessão fechada com sucesso"
          };
          //
          await updateStateDb(session.state, session.status, SessionName);
          //
        } else {
          //
          var returnClosed = {
            result: "error",
            state: session.state,
            status: session.status,
            qrcode: session.qrcode,
            message: "Erro ao fechar sessão"
          };
          //
        }
        //
        return returnClosed;
        //
      } catch (error) {
        console.log("- Erro ao fechar sessão");
        //
        return {
          result: "error",
          state: session.state,
          status: session.status,
          qrcode: session.qrcode,
          message: "Erro ao fechar sessão"
        };
        //
      }
    });
    //
    return closeSession;
  } //closeSession
  //
  // ------------------------------------------------------------------------------------------------//
  //
  static async logoutSession(SessionName) {
    console.log("- Fechando sessão");
    var session = Sessions.getSession(SessionName);
    var LogoutSession = await session.client.then(async client => {
      try {
        const strLogout = await client.logout();
        if (strLogout) {
          //
          const strClosed = await client.close();
          //
          session.state = "DISCONNECTED";
          session.status = "DISCONNECTED";
          session.client = false;
          session.qrcode = null;
          console.log("- Sessão desconetada");
          //
          var returnLogout = {
            result: "success",
            state: session.state,
            status: session.status,
            qrcode: session.qrcode,
            message: "Sessão desconetada"
          };
          //
        } else {
          //
          var returnLogout = {
            result: "error",
            state: session.state,
            status: session.status,
            message: "Erro ao desconetar sessão"
          };
          //
        }
        //
        await deletaToken(session.tokenPatch + "/" + SessionName + ".data.json");
        //
        await updateStateDb(session.state, session.status, SessionName);
        //
        return returnLogout;
        //
      } catch (error) {
        console.log("- Erro ao desconetar sessão:", error.message);
        //
        return {
          result: "error",
          state: session.state,
          status: session.status,
          message: "Erro ao desconetar sessão"
        };
        //
      }
    });
    //
    await updateStateDb(session.state, session.status, SessionName);
    //
    return LogoutSession;
  } //LogoutSession
  //
  // ------------------------------------------------------------------------------------------------------- //
  //
  /*
  ╔╗ ┌─┐┌─┐┬┌─┐  ╔═╗┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐  ┬ ┬┌─┐┌─┐┌─┐┌─┐
  ╠╩╗├─┤└─┐││    ╠╣ │ │││││   │ ││ ││││└─┐  │ │└─┐├─┤│ ┬├┤ 
  ╚═╝┴ ┴└─┘┴└─┘  ╚  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘└─┘  └─┘└─┘┴ ┴└─┘└─┘
  */
  //
  //Eviar menssagem de voz
  static async sendVoice(
    SessionName,
    number,
    filePath
  ) {
    console.log("- Enviando menssagem de voz.");
    var session = Sessions.getSession(SessionName);
    var sendResult = await session.client.then(async client => {
      // Send basic text
      return await client.sendVoice(
        number,
        filePath
      ).then((result) => {
        //console.log("Result: ", result); //return object success
        //return { result: "success", state: session.state, message: "Sucesso ao enviar menssagem" };
        //return (result);
        //
        return {
          "erro": false,
          "status": 200,
          "number": number,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Menssagem envida com sucesso."
        };
        //
      }).catch((erro) => {
        //console.error("Error when sending: ", erro); //return object error
        //return { result: 'error', state: session.state, message: "Erro ao enviar menssagem" };
        //return (erro);
        //
        return {
          "erro": true,
          "status": 404,
          "number": number,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar menssagem"
        };
        //
      });
    });
    return sendResult;
  } //sendVoice
  //
  // ------------------------------------------------------------------------------------------------//
  //
  //Eviar menssagem de voz
  static async sendVoiceBase64(
    SessionName,
    number,
    base64MP3,
    mimetype
  ) {
    console.log("- Enviando menssagem de voz.");
    var session = Sessions.getSession(SessionName);
    var sendResult = await session.client.then(async client => {
      return await client.sendVoiceBase64(
        number,
        "data:" + mimetype + ";base64," + base64MP3
      ).then((result) => {
        //console.log("Result: ", result); //return object success
        //return { result: "success", state: session.state, message: "Sucesso ao enviar menssagem" };
        //return (result);
        //
        return {
          "erro": false,
          "status": 200,
          "number": number,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Menssagem envida com sucesso."
        };
        //
      }).catch((erro) => {
        //console.error("Error when sending: ", erro); //return object error
        //return { result: 'error', state: session.state, message: "Erro ao enviar menssagem" };
        //return (erro);
        //
        return {
          "erro": true,
          "status": 404,
          "number": number,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar menssagem"
        };
        //
      });
    });
    return sendResult;
  } //sendVoiceBase64
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Enviar Contato
  static async sendContactVcard(
    SessionName,
    number,
    contact,
    namecontact
  ) {
    console.log("- Enviando contato.");
    //
    var session = Sessions.getSession(SessionName);
    var sendResult = await session.client.then(async client => {
      // Send contact
      return await client.sendContactVcard(
          number,
          contact,
          namecontact)
        .then((result) => {
          //console.log('Result: ', result); //return object success
          //
          return {
            "erro": false,
            "status": 200,
            "number": number,
            "canReceiveMessage": true,
            "text": "success",
            "message": "Contato envido com sucesso."
          };
          //
        })
        .catch((erro) => {
          //console.error('Error when sending: ', erro); //return object error
          //
          return {
            "erro": true,
            "status": 404,
            "number": number,
            "canReceiveMessage": false,
            "text": erro.text,
            "message": "Erro ao enviar contato"
          };
          //
        });
    });
    return sendResult;
  } //sendContactVcard
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Enviar Lista Contato
  static async sendContactVcardList(
    SessionName,
    number,
    contactlistValid,
    contactlistInvalid

  ) {
    console.log("- Enviando lista de contato.");
    var session = Sessions.getSession(SessionName);
    var sendResult = await session.client.then(async client => {
      // Send contact
      return await client.sendContactVcardList(
          number,
          contactlistValid,
          contactlistInvalid
        ).then((result) => {
          //console.log('Result: ', result); //return object success
          //
          return {
            "erro": false,
            "status": 200,
            "canReceiveMessage": true,
            "contactlistValid": contactlistValid,
            "contactlistInvalid": contactlistInvalid,
            "text": "success",
            "message": "Lista de contatos validos envida com sucesso."
          };
          //
        })
        .catch((erro) => {
          //console.error('Error when sending: ', erro); //return object error
          //
          return {
            "erro": true,
            "status": 404,
            "canReceiveMessage": false,
            "contactlistValid": contactlistValid,
            "contactlistInvalid": contactlistInvalid,
            "text": erro.text,
            "message": "Erro ao enviar lista de contatos validos"
          };
          //
        });
    });
    return sendResult;
  } //sendContactVcardList
  //
  // ------------------------------------------------------------------------------------------------//
  //
  //Enviar Texto
  static async sendText(
    SessionName,
    number,
    msg
  ) {
    console.log("- Enviando menssagem de texto.");
    var session = Sessions.getSession(SessionName);
    var sendResult = await session.client.then(async client => {
      // Send basic text
      return await client.sendText(
        number,
        msg
      ).then((result) => {
        //console.log("Result: ", result); //return object success
        //
        return {
          "erro": false,
          "status": 200,
          "number": number,
          "canReceiveMessage": true,
          "message": "Menssagem envida com sucesso."
        };
        //
      }).catch((erro) => {
        //console.error("Error when sending: ", erro); //return object error
        //return { result: 'error', state: session.state, message: "Erro ao enviar menssagem" };
        //return (erro);
        //
        return {
          "erro": true,
          "status": 404,
          "number": number,
          "canReceiveMessage": false,
          "message": "Erro ao enviar menssagem"
        };
        //
      });
    });
    return sendResult;
  } //sendText
  //
  // ------------------------------------------------------------------------------------------------//
  //
  //Enviar localização
  static async sendLocation(
    SessionName,
    number,
    lat,
    long,
    local
  ) {
    console.log("- Enviando localização.");
    var session = Sessions.getSession(SessionName);
    var sendResult = await session.client.then(async client => {
      // Send basic text
      return await client.sendLocation(
        number,
        lat,
        long,
        local
      ).then((result) => {
        //console.log("Result: ", result); //return object success
        //return { result: "success", state: session.state, message: "Sucesso ao enviar menssagem" };
        //return (result);
        //
        return {
          "erro": false,
          "status": 200,
          "number": number,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Localização envida com sucesso."
        };
        //
      }).catch((erro) => {
        //console.error("Error when sending: ", erro); //return object error
        //return { result: 'error', state: session.state, message: "Erro ao enviar menssagem" };
        //return (erro);
        //
        return {
          "erro": true,
          "status": 404,
          "number": number,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar localização."
        };
        //
      });
    });
    return sendResult;
  } //sendLocation
  //
  // ------------------------------------------------------------------------------------------------//
  //
  //Enviar links com preview
  static async sendLinkPreview(
    SessionName,
    number,
    link,
    detail
  ) {
    console.log("- Enviando link.");
    var session = Sessions.getSession(SessionName);
    var sendResult = await session.client.then(async client => {
      // Send basic text
      return await client.sendLinkPreview(
        number,
        link,
        detail
      ).then((result) => {
        //console.log("Result: ", result); //return object success
        //return { result: "success", state: session.state, message: "Sucesso ao enviar menssagem" };
        //return (result);
        //
        return {
          "erro": false,
          "status": 200,
          "number": number,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Link envida com sucesso."
        };
        //
      }).catch((erro) => {
        //console.error("Error when sending: ", erro); //return object error
        //return { result: 'error', state: session.state, message: "Erro ao enviar menssagem" };
        //return (erro);
        //
        return {
          "erro": true,
          "status": 404,
          "number": number,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar link."
        };
        //
      });
    });
    return sendResult;
  } //sendLinkPreview
  //
  // ------------------------------------------------------------------------------------------------//
  //
  //Enviar Imagem
  static async sendImage(
    SessionName,
    number,
    filePath,
    fileName,
    caption
  ) {
    console.log("- Enviando menssagem com imagem.");
    var session = Sessions.getSession(SessionName);
    var resultsendImage = await session.client.then(async (client) => {
      return await client.sendImage(
        number,
        filePath,
        fileName,
        caption
      ).then((result) => {
        //console.log('Result: ', result); //return object success
        //return (result);
        //
        return {
          "erro": false,
          "status": 200,
          "number": number,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Menssagem envida com sucesso."
        };
        //
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //return (erro);
        //
        return {
          "erro": true,
          "status": 404,
          "number": number,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar menssagem"
        };
        //
      });
    });
    return resultsendImage;
  } //sendImage
  //
  // ------------------------------------------------------------------------------------------------//
  //
  //Enviar arquivo
  static async sendFile(
    SessionName,
    number,
    filePath,
    originalname,
    caption
  ) {
    console.log("- Enviando arquivo.");
    var session = Sessions.getSession(SessionName);
    var resultsendImage = await session.client.then(async (client) => {
      return await client.sendFile(
        number,
        filePath,
        originalname,
        caption
      ).then((result) => {
        //console.log('Result: ', result); //return object success
        //return (result);
        //
        return {
          "erro": false,
          "status": 200,
          "number": number,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Arquivo envido com sucesso."
        };
        //
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //return (erro);
        //
        return {
          "erro": true,
          "status": 404,
          "number": number,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar arquivo"
        };
        //
      });
    });
    return resultsendImage;
  } //sendFile
  //
  // ------------------------------------------------------------------------------------------------//
  //
  //Enviar Arquivo em Base64
  static async sendFileFromBase64(
    SessionName,
    number,
    base64Data,
    mimetype,
    originalname,
    caption
  ) {
    console.log("- Enviando arquivo em Base64Data");
    var session = Sessions.getSession(SessionName);
    var resultSendFile = await session.client.then(async (client) => {
      return await client.sendFileFromBase64(
        number,
        "data:" + mimetype + ";base64," + base64Data,
        originalname,
        caption
      ).then((result) => {
        //console.log('Result: ', result); //return object success
        //return (result);
        //
        return {
          "erro": false,
          "status": 200,
          "number": number,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Arquivo envida com sucesso."
        };
        //
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //return (erro);
        //
        return {
          "erro": true,
          "status": 404,
          "number": number,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar arquivo"
        };
        //
      });
    });
    //
    return resultSendFile;
  } //sendFileFromBase64
  //
  // ------------------------------------------------------------------------------------------------//
  //
  //Enviar imagem em gif
  static async sendImageAsStickerGif(
    SessionName,
    number,
    filePath
  ) {
    console.log("- Enviando gif.");
    var session = Sessions.getSession(SessionName);
    var resultsendImage = await session.client.then(async (client) => {
      return await client.sendImageAsStickerGif(
        number,
        filePath
      ).then((result) => {
        //console.log('Result: ', result); //return object success
        //return (result);
        //
        return {
          "erro": false,
          "status": 200,
          "number": number,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Gif envida com sucesso."
        };
        //
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //return (erro);
        //
        return {
          "erro": true,
          "status": 404,
          "number": number,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar gif"
        };
        //
      });
    });
    return resultsendImage;
  } //sendImageAsStickerGif
  //
  // ------------------------------------------------------------------------------------------------//
  //
  //Enviar figura png ou jpg
  static async sendImageAsSticker(
    SessionName,
    number,
    filePath
  ) {
    console.log("- Enviando figura.");
    var session = Sessions.getSession(SessionName);
    var resultsendImage = await session.client.then(async (client) => {
      return await client.sendImageAsSticker(
        number,
        filePath
      ).then((result) => {
        //console.log('Result: ', result); //return object success
        //return (result);
        //
        return {
          "erro": false,
          "status": 200,
          "number": number,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Figura envida com sucesso."
        };
        //
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //return (erro);
        //
        return {
          "erro": true,
          "status": 404,
          "number": number,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar figura"
        };
        //
      });
    });
    return resultsendImage;
  } //sendImageAsSticker
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
  static async getAllContacts(
    SessionName
  ) {
    console.log("- Obtendo todos os contatos!");
    //
    var session = Sessions.getSession(SessionName);
    var resultgetAllContacts = await session.client.then(async client => {
      return await client.getAllContacts().then(async (result) => {
        //console.log('Result: ', result); //return object success
        //
        var getChatGroupNewMsg = [];
        //
        await forEach(result, async (resultAllContacts) => {
          //
          if (resultAllContacts.isMyContact === true || resultAllContacts.isMyContact === false) {
            //
            getChatGroupNewMsg.push({
              "user": resultAllContacts.id.user,
              "name": resultAllContacts.name,
              "shortName": resultAllContacts.shortName,
              "pushname": resultAllContacts.pushname,
              "formattedName": resultAllContacts.formattedName,
              "isMyContact": resultAllContacts.isMyContact,
              "isWAContact": resultAllContacts.isWAContact
            });
          }
          //
        });
        //
        return getChatGroupNewMsg;
        //
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar contatos"
        };
        //
      });
      //
    });
    //
    return resultgetAllContacts;
  } //getAllContacts
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Recuperar grupos
  static async getAllGroups(
    SessionName
  ) {
    console.log("- Obtendo todos os grupos!");
    //
    var session = Sessions.getSession(SessionName);
    var resultgetAllGroups = await session.client.then(async client => {
      return await client.getAllGroups().then(async (result) => {
        //console.log('Result: ', result); //return object success
        //
        var getAllGroups = [];
        //
        await forEach(result, async (resultAllContacts) => {
          //
          if (resultAllContacts.isGroup === true) {
            //
            getAllGroups.push({
              "user": resultAllContacts.id.user,
              "name": resultAllContacts.name,
              "formattedName": resultAllContacts.contact.formattedName
            });
          }
          //
        });
        //
        return getAllGroups;
        //
      }).catch((erro) => {
        console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar grupos"
        };
        //
      });
      //
    });
    //
    return resultgetAllGroups;
  } //getAllGroups
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Returns browser session token
  static async getSessionTokenBrowser(SessionName) {
    console.log("- Obtendo  Session Token Browser.");
    var session = Sessions.getSession(SessionName);
    var resultgetSessionTokenBrowser = await session.client.then(async client => {
      return await client.getSessionTokenBrowser().then((result) => {
        //console.log('Result: ', result); //return object success
        return result;
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar token browser"
        };
        //
      });
    });
    return resultgetSessionTokenBrowser;
  } //getSessionTokenBrowser
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Chama sua lista de contatos bloqueados
  static async getBlockList(SessionName) {
    console.log("- getBlockList");
    var session = Sessions.getSession(SessionName);
    var resultgetBlockList = await session.client.then(async client => {
      return await client.getBlockList().then((result) => {
        //console.log('Result: ', result); //return object success
        return result;
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar lista de contatos bloqueados"
        };
        //
      });
    });
    return resultgetBlockList;
  } //getBlockList
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Recuperar status de contato
  static async getStatus(
    SessionName,
    number
  ) {
    console.log("- Obtendo status!");
    var session = Sessions.getSession(SessionName);
    var resultgetStatus = await session.client.then(async client => {
      return await client.getStatus(number).then((result) => {
        //console.log('Result: ', result); //return object success
        return result;
      }).catch((erro) => {
        //console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar status de contato"
        };
        //
      });
    });
    return resultgetStatus;
  } //getStatus
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Recuperar status de contato
  static async getNumberProfile(
    SessionName,
    number
  ) {
    console.log("- Obtendo status!");
    var session = Sessions.getSession(SessionName);
    var resultgetNumberProfile = await session.client.then(async client => {
      return await client.getNumberProfile(number).then((result) => {
        //console.log('Result: ', result); //return object success
        return result;
      }).catch((erro) => {
        //console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar profile"
        };
        //
      });
    });
    return resultgetNumberProfile;
  } //getStatus
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Verificar o status do número
  static async checkNumberStatus(
    SessionName,
    number
  ) {
    console.log("- canReceiveMessage");
    var session = Sessions.getSession(SessionName);
    var resultcheckNumberStatus = await session.client.then(async client => {
      return await client.checkNumberStatus(number).then((result) => {
        //console.log('Result: ', chat); //return object success
        //
        if (result.status === 200 && result.canReceiveMessage === true) {
          //
          return {
            "erro": false,
            "status": result.status,
            "canReceiveMessage": result.canReceiveMessage,
            "number": result.id.user,
            "message": "O número informado pode receber mensagens via whatsapp"
          };
          //
        } else if (result.status === 404 && result.canReceiveMessage === false) {
          //
          return {
            "erro": true,
            "status": result.status,
            "canReceiveMessage": result.canReceiveMessage,
            "number": result.id.user,
            "message": "O número informado não pode receber mensagens via whatsapp"
          };
          //
        } else {
          //
          return {
            "erro": true,
            "status": 404,
            "canReceiveMessage": null,
            "number": number,
            "message": "Erro ao verificar número informado"
          };
          //
        }
      }).catch((erro) => {
        //console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": null,
          "number": number,
          "message": "Erro ao verificar número informado"
        };
        //
      });
    });
    return resultcheckNumberStatus;
  } //checkNumberStatus
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Obter a foto do perfil do servidor
  static async getProfilePicFromServer(
    SessionName,
    number
  ) {
    console.log("- Obtendo a foto do perfil do servidor!");
    var session = Sessions.getSession(SessionName);
    var resultgetProfilePicFromServer = await session.client.then(async client => {
      try {
        const url = await client.getProfilePicFromServer(number);
        //console.log('Result: ', result); //return object success
        return url;
      } catch (erro) {
        //console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao obtendo a foto do perfil no servidor"
        };
        //
      };
    });
    return resultgetProfilePicFromServer;
  } //getProfilePicFromServer
  //
  // ------------------------------------------------------------------------------------------------//
  //
  /*
  ╔═╗┬─┐┌─┐┬ ┬┌─┐  ╔═╗┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐               
  ║ ╦├┬┘│ ││ │├─┘  ╠╣ │ │││││   │ ││ ││││└─┐               
  ╚═╝┴└─└─┘└─┘┴    ╚  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘└─┘               
  */
  //
  // Deixar o grupo
  static async leaveGroup(
    SessionName,
    groupId
  ) {
    console.log("- leaveGroup");
    var session = Sessions.getSession(SessionName);
    var resultleaveGroup = await session.client.then(async client => {
      return await client.leaveGroup(groupId).then((result) => {
        //console.log('Result: ', result); //return object success
        //
        return {
          "erro": false,
          "status": 200,
          "canReceiveMessage": true,
          "groupId": groupId,
          "message": "Grupo deixado com sucesso"
        };
        //
      }).catch((erro) => {
        // console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "groupId": groupId,
          "message": "Erro ao deixar o grupo"
        };
        //
      });
    });
    return resultleaveGroup;
  } //leaveGroup
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Obtenha membros do grupo
  static async getGroupMembers(
    SessionName,
    groupId
  ) {
    console.log("- getGroupMembers");
    var session = Sessions.getSession(SessionName);
    var resultgetGroupMembers = await session.client.then(async client => {
      return await client.getGroupMembers(groupId).then(async (result) => {
        //console.log('Result: ', result); //return object success
        //
        var getGroupMembers = [];
        //
        await forEach(result, async (resultGroupMembers) => {
          //
          if (resultGroupMembers.isMyContact === true || resultGroupMembers.isMyContact === false) {
            //
            getGroupMembers.push({
              "user": resultGroupMembers.id.user,
              "name": resultGroupMembers.name,
              "shortName": resultGroupMembers.shortName,
              "pushname": resultGroupMembers.pushname,
              "formattedName": resultGroupMembers.formattedName
            });
          }
          //
        });
        //
        return getGroupMembers;
        //
      }).catch((erro) => {
        //console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "groupId": groupId,
          "message": "Erro ao obter membros do grupo"
        };
        //
      });
    });
    return resultgetGroupMembers;
  } //getGroupMembers
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Obter IDs de membros do grupo
  static async getGroupMembersIds(
    SessionName,
    groupId
  ) {
    console.log("- getGroupMembersIds");
    var session = Sessions.getSession(SessionName);
    var resultgetGroupMembersIds = await session.client.then(async client => {
      return await client.getGroupMembersIds(groupId).then((result) => {
        //console.log('Result: ', result); //return object success
        return result;
      }).catch((erro) => {
        console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "groupId": groupId,
          "message": "Erro ao obter membros do grupo"
        };
        //
      });
    });
    return resultgetGroupMembersIds;
  } //getGroupMembersIds
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Gerar link de url de convite de grupo
  static async getGroupInviteLink(
    SessionName,
    groupId
  ) {
    console.log("- getGroupInviteLink");
    var session = Sessions.getSession(SessionName);
    var resultgetGroupInviteLink = await session.client.then(async client => {
      return await client.getGroupInviteLink(groupId).then((result) => {
        //console.log('Result: ', result); //return object success
        return result;
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "groupId": groupId,
          "message": "Erro ao obter link de convite de grupo"
        };
        //
      });
    });
    return resultgetGroupInviteLink;
  } //getGroupInviteLink
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Criar grupo (título, participantes a adicionar)
  static async createGroup(
    SessionName,
    title,
    contactlistValid,
    contactlistInvalid
  ) {
    console.log("- createGroup");
    var session = Sessions.getSession(SessionName);
    var resultgetGroupInviteLink = await session.client.then(async client => {
      return await client.createGroup(title, contactlistValid).then((result) => {
        //console.log('Result: ', result); //return object success
        //
        if (result.status === 200) {
          return {
            "erro": false,
            "status": 200,
            "gid": result.gid.user,
            "contactlistValid": contactlistValid,
            "contactlistInvalid": contactlistInvalid,
            "message": "Grupo criado com a lista de contatos validos"
          };
        } else {
          //
          return {
            "erro": true,
            "status": 404,
            "gid": null,
            "contactlistValid": contactlistValid,
            "contactlistInvalid": contactlistInvalid,
            "message": "Erro ao criar grupo"
          };
          //
        }
        //
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "gid": null,
          "contactlistValid": contactlistValid,
          "contactlistInvalid": contactlistInvalid,
          "message": "Erro ao criar grupo"
        };
        //
      });
    });
    return resultgetGroupInviteLink;
  } //createGroup
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Remove participante
  static async removeParticipant(
    SessionName,
    groupId,
    phonefull
  ) {
    console.log("- removeParticipant");
    var session = Sessions.getSession(SessionName);
    var resultremoveParticipant = await session.client.then(async client => {
      return await await client.removeParticipant(groupId, phonefull).then((result) => {
        //console.log('Result: ', result); //return object success
        //
        if (result === true) {
          return {
            "erro": false,
            "status": 200,
            "number": phonefull,
            "message": "Participante removido com sucesso"
          };
        } else {
          //
          return {
            "erro": true,
            "status": 404,
            "number": phonefull,
            "message": "Erro ao remover participante"
          };
          //
        }
        //
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "number": phonefull,
          "message": "Erro ao remover participante"
        };
        //
      });
    });
    return resultremoveParticipant;
  } //removeParticipant
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Adicionar participante
  static async addParticipant(
    SessionName,
    groupId,
    phonefull
  ) {
    console.log("- addParticipant");
    var session = Sessions.getSession(SessionName);
    var resultaddParticipant = await session.client.then(async client => {
      return await client.addParticipant(groupId, phonefull).then((result) => {
        //console.log('Result: ', addParticipant); //return object success
        //
        if (result === true) {
          return {
            "erro": false,
            "status": 200,
            "number": phonefull,
            "message": "Participante adicionado com sucesso"
          };
        } else {
          //
          return {
            "erro": true,
            "status": 404,
            "number": phonefull,
            "message": "Erro ao adicionar participante"
          };
          //
        }
        //
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "number": phonefull,
          "message": "Erro ao adicionar participante"
        };
        //
      });
    });
    return resultaddParticipant;
  } //addParticipant
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Promote participant (Give admin privileges)
  static async promoteParticipant(
    SessionName,
    groupId,
    number
  ) {
    console.log("- promoteParticipant");
    var session = Sessions.getSession(SessionName);
    var resultpromoteParticipant = await session.client.then(async client => {
      return await client.promoteParticipant(groupId, number).then((result) => {
        //console.log('Result: ', promoteParticipant); //return object success
        //
        if (result === true) {
          return {
            "erro": false,
            "status": 200,
            "number": number,
            "message": "Participante promovido a administrador"
          };
        } else {
          //
          return {
            "erro": true,
            "status": 404,
            "number": number,
            "message": "Erro ao promover participante a administrador"
          };
          //
        }
        //
      }).catch((erro) => {
        console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "number": number,
          "message": "Erro ao promover participante a administrador"
        };
        //
      });
    });
    return resultpromoteParticipant;
  } //promoteParticipant
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Depromote participant (Give admin privileges)
  static async demoteParticipant(
    SessionName,
    groupId,
    phonefull
  ) {
    console.log("- demoteParticipant");
    var session = Sessions.getSession(SessionName);
    var resultdemoteParticipant = await session.client.then(async client => {
      return await client.demoteParticipant(groupId, phonefull).then((result) => {
        //console.log('Result: ', demoteParticipant); //return object success
        //
        if (demoteParticipant === true) {
          return {
            "erro": false,
            "status": 200,
            "number": phonefull,
            "message": "Participante removido de administrador"
          };
        } else {
          //
          return {
            "erro": true,
            "status": 404,
            "number": phonefull,
            "message": "Erro ao remover participante de administrador"
          };
          //
        }
        //
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "number": phonefull,
          "message": "Erro ao remover participante de administrador"
        };
        //
      });
    });
    return resultdemoteParticipant;
  } //demoteParticipant
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Retorna o status do grupo, jid, descrição do link de convite
  static async getGroupInfoFromInviteLink(
    SessionName,
    InviteCode
  ) {
    console.log("- Obtendo chats!");
    var session = Sessions.getSession(SessionName);
    var resultgetGroupInfoFromInviteLink = await session.client.then(async client => {
      return await client.getGroupInfoFromInviteLink(InviteCode).then((result) => {
        //console.log('Result: ', result); //return object success
        return result;
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        return {
          "erro": true,
          "status": 404,
          "message": "Erro ao obter link de convite"
        };
        //
      });
    });
    return resultgetGroupInfoFromInviteLink;
  } //getGroupInfoFromInviteLink
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Junte-se a um grupo usando o código de convite do grupo
  static async joinGroup(
    SessionName,
    InviteCode
  ) {
    console.log("- joinGroup");
    var session = Sessions.getSession(SessionName);
    var resultjoinGroup = await session.client.then(async client => {
      return await await client.joinGroup(InviteCode).then((result) => {
        //console.log('Result: ', result); //return object success
        //
        if (result.status === 200) {
          return {
            "erro": false,
            "status": 200,
            "message": "Convite para grupo aceito com suceso"
          };
        } else {
          //
          return {
            "erro": true,
            "status": 404,
            "message": "Erro ao aceitar convite para grupo"
          };
          //
        }
        //
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "message": "Erro ao entra no grupo via convite"
        };
        //
      });
    });
    return resultjoinGroup;
  } //joinGroup
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
  static async setProfileStatus(
    SessionName,
    ProfileStatus
  ) {
    console.log("- setProfileStatus");
    var session = Sessions.getSession(SessionName);
    var resultsetProfileStatus = await session.client.then(async client => {
      return await client.setProfileStatus(ProfileStatus).then((result) => {
        //console.log('Result: ', result); //return object success
        //
        return {
          "erro": false,
          "status": 200,
          "message": "Profile status alterado com sucesso."
        };
        //
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //return erro;
        return {
          "erro": true,
          "status": 404,
          "message": "Erro ao alterar profile status."
        };
        //
      });
    });
    return resultsetProfileStatus;
  } //setProfileStatus
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Set client profile name
  static async setProfileName(
    SessionName,
    ProfileName
  ) {
    console.log("- setProfileName");
    var session = Sessions.getSession(SessionName);
    var resultsetProfileName = await session.client.then(async client => {
      return await client.setProfileName(ProfileName).then((result) => {
        //console.log('Result: ', result); //return object success
        //
        return {
          "erro": false,
          "status": 200,
          "message": "Profile name alterado com sucesso."
        };
        //
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //return erro;
        return {
          "erro": true,
          "status": 404,
          "message": "Erro ao alterar profile name."
        };
        //
      });
    });
    return resultsetProfileName;
  } //setProfileName
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Set client profile photo
  static async setProfilePic(
    SessionName,
    path
  ) {
    console.log("- setProfilePic");
    var session = Sessions.getSession(SessionName);
    var resultsetProfilePic = await session.client.then(async client => {
      return await client.setProfilePic(path).then((result) => {
        //console.log('Result: ', result); //return object success
        //
        return {
          "erro": false,
          "status": 200,
          "message": "Profile pic alterado com sucesso."
        };
        //
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "message": "Erro ao alterar profile pic."
        };
        //
      });
    });
    return resultsetProfilePic;
  } //setProfilePic
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
  static async killServiceWorker(SessionName) {
    console.log("- killServiceWorker");
    var session = Sessions.getSession(SessionName);
    var resultkillServiceWorker = await session.client.then(async client => {
      return await client.killServiceWorker().then((result) => {
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
        //console.error('Error when sending: ', erro); //return object error
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
    console.log("- restartService");
    var session = Sessions.getSession(SessionName);
    var resultrestartService = await session.client.then(async client => {
      return await client.restartService().then((result) => {
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
        //console.error('Error when sending: ', erro); //return object error
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
    console.log("- getHostDevice");
    var session = Sessions.getSession(SessionName);
    var resultgetHostDevice = await session.client.then(async client => {
      return await client.getHostDevice().then((result) => {
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
        //console.error('Error when sending: ', erro); //return object error
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
  // Get connection state
  static async getConnectionState(SessionName) {
    console.log("- getConnectionState");
    var session = Sessions.getSession(SessionName);
    var resultisConnected = await session.client.then(async client => {
      return await client.getConnectionState().then((result) => {
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
        //console.error('Error when sending: ', erro); //return object error
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
    console.log("- getBatteryLevel");
    var session = Sessions.getSession(SessionName);
    var resultgetBatteryLevel = await session.client.then(async client => {
      return await client.getBatteryLevel().then((result) => {
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
        //console.error('Error when sending: ', erro); //return object error
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
    console.log("- isConnected");
    var session = Sessions.getSession(SessionName);
    var resultisConnected = await session.client.then(async client => {
      return await client.isConnected().then((result) => {
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
        //console.error('Error when sending: ', erro); //return object error
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
    console.log("- getWAVersion");
    var session = Sessions.getSession(SessionName);
    var resultgetWAVersion = await session.client.then(async client => {
      return await client.getWAVersion().then((result) => {
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
        //console.error('Error when sending: ', erro); //return object error
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
  // Obter versão do WhatsappWeb
  static async getWAVersion(SessionName) {
    console.log("- getWAVersion");
    var session = Sessions.getSession(SessionName);
    var resultgetWAVersion = await session.client.then(async client => {
      return await client.getWAVersion().then((result) => {
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
        //console.error('Error when sending: ', erro); //return object error
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
    console.log("- startPhoneWatchdog");
    var session = Sessions.getSession(SessionName);
    var resultstartPhoneWatchdog = await session.client.then(async client => {
      return await client.startPhoneWatchdog(interval).then((result) => {
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
        //console.error('Error when sending: ', erro); //return object error
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
    console.log("- stopPhoneWatchdog");
    var session = Sessions.getSession(SessionName);
    var resultstopPhoneWatchdog = await session.client.then(async client => {
      return await client.stopPhoneWatchdog().then((result) => {
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
        //console.error('Error when sending: ', erro); //return object error
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
  /*
  ╔╦╗┌─┐┌─┐┌┬┐┌─┐┌─┐  ┌┬┐┌─┐  ╦═╗┌─┐┌┬┐┌─┐┌─┐
   ║ ├┤ └─┐ │ ├┤ └─┐   ││├┤   ╠╦╝│ │ │ ├─┤└─┐
   ╩ └─┘└─┘ ┴ └─┘└─┘  ─┴┘└─┘  ╩╚═└─┘ ┴ ┴ ┴└─┘
   */
  //
  // ------------------------------------------------------------------------------------------------//
  //
  static async RotaTeste() {

  } //RotaTeste
  //
  // ------------------------------------------------------------------------------------------------//
  //
}