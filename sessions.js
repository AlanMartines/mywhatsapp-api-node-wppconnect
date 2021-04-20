//
// Configuração dos módulos
const {
  forEach
} = require('p-iteration');
const axios = require('axios');
const wppconnect = require('@wppconnect-team/wppconnect');
const serverConfig = require("./config/server.config.json");
//
// ------------------------------------------------------------------------------------------------------- //
//
function DataHora() {
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
  //
  return date + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds;
}
//
function saudacao() {
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
  } else {
    var saudacao = "Boa noite";
    //
  }
  return saudacao;
}
//
// ------------------------------------------------------------------------------------------------------- //
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
  static async Status(SessionName) {
    console.log("- Status");
    var session = Sessions.getSession(SessionName);
    if (session) { //só adiciona se não existir
      if (session.state == "STARTING") {
        return {
          result: "info",
          state: session.state,
          status: session.status,
          message: "Sistema iniciando"
        };
      } else if (session.state == "QRCODE") {
        return {
          result: "warning",
          state: session.state,
          status: session.status,
          message: "Sistema aguardando leitura do QR-Code"
        };
      } else if (session.state == "CONNECTED") {
        return {
          result: "success",
          state: session.state,
          status: session.status,
          message: "Sistema iniciado"
        };
      } else if (session.state == "CLOSED") {
        return {
          result: "info",
          state: session.state,
          status: session.status,
          message: "Sistema encerrado"
        };
      } else if (session.state == "DISCONNECTED") {
        return {
          result: "info",
          state: session.state,
          status: session.status,
          message: "Sistema não desconectado"
        };
      } else {
        return {
          result: 'error',
          state: 'NOTFOUND',
          status: 'notLogged',
          message: 'Sistema Off-line'
        };
      }
    } else {
      return {
        result: 'error',
        state: 'NOTFOUND',
        status: 'notLogged',
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
      session = await Sessions.addSesssion(SessionName);
    } else if (["CLOSED"].includes(session.state)) {
      //restart session
      console.log("- State: CLOSED");
      session.state = "STARTING";
      session.status = "notLogged";
      session.attempts = 0;
      //session.socketio = null;
      session.prossesid = null;
      session.client = Sessions.initSession(SessionName);
      Sessions.setup(SessionName);
    } else if (["CONFLICT", "UNPAIRED", "UNLAUNCHED", "UNPAIRED_IDLE"].includes(session.state)) {
      session.status = 'notLogged';
      console.log('- Status do sistema:', session.state);
      console.log('- Status da sessão:', session.status);
      console.log("- Client UseHere");
      session.client.then(client => {
        client.useHere();
      });
      session.client = Sessions.initSession(SessionName);
    } else {
      console.log('- Nome da sessão:', session.name);
      console.log('- State do sistema:', session.state);
      console.log('- Status da sessão:', session.status);
    }
    return session;
  } //start
  //
  // ------------------------------------------------------------------------------------------------------- //
  //
  static async addSesssion(SessionName) {
    console.log("- Adicionando sessão");
    var newSession = {
      name: SessionName,
      hook: null,
      process: null,
      qrcode: false,
      client: false,
      status: 'notLogged',
      state: 'STARTING',
      message: null,
      attempts: 0
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
    if (Sessions.options.jsonbinio_secret_key !== undefined) {
      console.log("- Checando JSONBin");
      //se informou secret key pra salvar na nuvem
      //busca token da session na nuvem
      var config = {
        method: 'get',
        url: 'https://api.jsonbin.io/b/' + Sessions.options.jsonbinio_bin_id,
        headers: {
          'secret-key': Sessions.options.jsonbinio_secret_key
        }
      };
      const response = await axios(config);
      if (response.data.WAToken1 !== undefined) {
        session.browserSessionToken = response.data;
        //console.log("- Browser Session Token: " + JSON.stringify(session.browserSessionToken));
      } else {
        console.log("- Sem token na nuvem.");
      }
    } //if jsonbinio_secret_key
    /*
      ╔═╗┌─┐┌┬┐┬┌─┐┌┐┌┌─┐┬    ╔═╗┬─┐┌─┐┌─┐┌┬┐┌─┐  ╔═╗┌─┐┬─┐┌─┐┌┬┐┌─┐┌┬┐┌─┐┬─┐┌─┐
      ║ ║├─┘ │ ││ ││││├─┤│    ║  ├┬┘├┤ ├─┤ │ ├┤   ╠═╝├─┤├┬┘├─┤│││├┤  │ ├┤ ├┬┘└─┐
      ╚═╝┴   ┴ ┴└─┘┘└┘┴ ┴┴─┘  ╚═╝┴└─└─┘┴ ┴ ┴ └─┘  ╩  ┴ ┴┴└─┴ ┴┴ ┴└─┘ ┴ └─┘┴└─└─┘
   */
    //
    if (serverConfig.engine === 'VENOM') {
      console.log("- Engine Venom\n\n\n");
      const client = await venom.create(session.name, (base64Qrimg, asciiQR, attempts, urlCode) => {
          //
          console.log("- Saudação:", saudacao());
          //
          console.log('- Nome da sessão:', session.name);
          //
          session.state = "QRCODE";
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
        (statusSession, session_venom) => {
          console.log('- Status da sessão:', statusSession);
          //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
          //Create session wss return "serverClose" case server for close
          console.log('- Session name: ', session_venom);
          //
          switch (statusSession) {
            case 'isLogged':
            case 'qrReadSuccess':
            case 'inChat':
            case 'chatsAvailable':
              session.state = "CONNECTED";
              session.status = statusSession
              session.qrcode = null;
              session.CodeasciiQR = null;
              session.CodeurlCode = null;
              break;
            case 'autocloseCalled':
            case 'browserClose':
            case 'serverClose':
            case 'autocloseCalled':
              session.state = "CLOSED";
              session.status = statusSession;
              session.qrcode = null;
              session.CodeasciiQR = null;
              session.CodeurlCode = null;
              break;
            case 'qrReadFail':
            case 'notLogged':
            case 'deviceNotConnected':
            case 'desconnectedMobile':
            case 'deleteToken':
              session.state = "DISCONNECTED";
              session.status = statusSession;
              break;
            default:
              session.state = "DISCONNECTED";
              session.status = statusSession;
          }
        },
        // options
        {
          folderNameToken: 'tokens', //folder name when saving tokens
          mkdirFolderToken: '', //folder directory tokens, just inside the venom folder, example:  { mkdirFolderToken: '/node_modules', } //will save the tokens folder in the node_modules directory
          headless: true, // Headless chrome
          devtools: false, // Open devtools by default
          useChrome: false, // If false will use Chromium instance
          debug: false, // Opens a debug session
          logQR: false, // Logs QR automatically in terminal
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
            '--safebrowsing-disable-auto-update'
          ],
          puppeteerOptions: {}, // Will be passed to puppeteer.launch
          //executablePath: '/usr/bin/chromium-browser',
          disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
          disableWelcome: false, // Will disable the welcoming message which appears in the beginning
          updatesLog: true, // Logs info updates automatically in terminal
          autoClose: false, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
          createPathFileToken: true, //creates a folder when inserting an object in the client's browser, to work it is necessary to pass the parameters in the function create browserSessionToken
        },
        session.browserSessionToken,
        // BrowserInstance
        (browser, waPage) => {
          console.log("Browser PID:", browser.process().pid);
          session.process = browser.process().pid;
          waPage.screenshot({
            path: './screenshot/screenshot.png'
          });
        }
      );
      var browserSessionToken = await client.getSessionTokenBrowser();
      console.log("- Token venom:\n", JSON.parse(JSON.stringify(browserSessionToken)));
      session.state = "CONNECTED";
      return client;
    }
    //
    if (serverConfig.engine === 'WPPCONNECT') {
      console.log("- Engine WPPConnect\n\n\n");
      const client = await wppconnect.create(session.name, (base64Qrimg, asciiQR, attempts, urlCode) => {
          //
          console.log("- Saudação:", saudacao());
          //
          console.log('- Nome da sessão:', session.name);
          //
          session.state = "QRCODE";
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
          //
          if (matches.length !== 3) {
              return new Error('- Invalid input string');
          }
          //
          response.type = matches[1];
          response.data = new Buffer.from(matches[2], 'base64');
          //
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
        (statusSession, session_wppconnect) => {
          console.log('- Status da sessão:', statusSession);
          //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
          //Create session wss return "serverClose" case server for close
          console.log('- Session name: ', session_wppconnect);
          //
          switch (statusSession) {
            case 'isLogged':
            case 'qrReadSuccess':
            case 'inChat':
            case 'chatsAvailable':
              session.state = "CONNECTED";
              session.status = statusSession
              session.qrcode = null;
              session.CodeasciiQR = null;
              session.CodeurlCode = null;
              break;
            case 'autocloseCalled':
            case 'browserClose':
            case 'serverClose':
            case 'autocloseCalled':
              session.state = "CLOSED";
              session.status = statusSession;
              session.qrcode = null;
              session.CodeasciiQR = null;
              session.CodeurlCode = null;
              break;
            case 'qrReadFail':
            case 'notLogged':
            case 'deviceNotConnected':
            case 'desconnectedMobile':
            case 'deleteToken':
              session.state = "DISCONNECTED";
              session.status = statusSession;
              break;
            default:
              session.state = "DISCONNECTED";
              session.status = statusSession;
          }
        },
        // options
        {
          folderNameToken: 'tokens', //folder name when saving tokens
          mkdirFolderToken: '', //folder directory tokens, just inside the venom folder, example:  { mkdirFolderToken: '/node_modules', } //will save the tokens folder in the node_modules directory
          headless: true, // Headless chrome
          devtools: false, // Open devtools by default
          useChrome: false, // If false will use Chromium instance
          debug: false, // Opens a debug session
          logQR: false, // Logs QR automatically in terminal
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
            // Outros
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
            '--safebrowsing-disable-auto-update'
          ],
          puppeteerOptions: {}, // Will be passed to puppeteer.launch
          //executablePath: '/usr/bin/chromium-browser',
          disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
          disableWelcome: false, // Will disable the welcoming message which appears in the beginning
          updatesLog: true, // Logs info updates automatically in terminal
          autoClose: false, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
          createPathFileToken: true, //creates a folder when inserting an object in the client's browser, to work it is necessary to pass the parameters in the function create browserSessionToken
        });
      wppconnect.defaultLogger.level = 'silly';
      var browserSessionToken = await client.getSessionTokenBrowser();
      console.log("- Token WPPConnect:\n", JSON.parse(JSON.stringify(browserSessionToken)));
      session.state = "CONNECTED";
      return client;
    }
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
    console.log("- Sinstema iniciando\n\n\n");
    var session = Sessions.getSession(SessionName);
    await session.client.then(client => {
      // State change
      let time = 0;
      client.onStateChange(async (state) => {
        session.state = state;
        console.log('- Connection status: ', state);
        clearTimeout(time);
        if (state == "CONNECTED") {
          if (Sessions.options.jsonbinio_secret_key !== undefined && session.browserSessionToken == undefined) { //se informou secret key pra salvar na nuvem
            setTimeout(async () => {
              console.log("gravando token na nuvem...");
              //salva dados do token da sessão na nuvem
              const browserSessionToken = await client.getSessionTokenBrowser();
              var data = JSON.stringify(browserSessionToken);
              var config = {
                method: 'put',
                url: 'https://api.jsonbin.io/b/' + Sessions.options.jsonbinio_bin_id,
                headers: {
                  'Content-Type': 'application/json',
                  'secret-key': Sessions.options.jsonbinio_secret_key,
                  'versioning': 'false'
                },
                data: data
              };
              await axios(config)
                .then(function(response) {
                  console.log(JSON.stringify(response.data));
                })
                .catch(function(error) {
                  console.log(error);
                });
            }, 2000);
          } //if jsonbinio_secret_key
        } //if CONNECTED
        //
        //  DISCONNECTED when the mobile device is disconnected
        if (state === 'DISCONNECTED' || state === 'SYNCING') {
          session.state = state;
          time = setTimeout(() => {
            client.close();
            // process.exit(); //optional function if you work with only one session
          }, 80000);
        }
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
        var session = Sessions.getSession(SessionName);
        if (session.hook != null) {
          var config = {
            method: 'post',
            url: session.hook,
            headers: {
              'Content-Type': 'application/json'
            },
            data: message
          };
          await axios(config)
            .then(function(response) {
              console.log(JSON.stringify(response.data));
            })
            .catch(function(error) {
              console.log(error);
            });
        } else if (message.body === 'Hi' && message.isGroupMsg === false) {
          client
            .sendText(message.from, saudacao() + ",\nWelcome Venom 🕷")
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
        client.sendText(call.peerJid, saudacao() + ",\nDesculpe-me mas não consigo atender sua chamada, se for urgente manda msg de texto, grato.");
      });
      // Listen when client has been added to a group
      client.onAddedToGroup(async (chatEvent) => {
        console.log('- Listen when client has been added to a group:', chatEvent.name);
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
    await session.client.then(async client => {
      try {
        await client.close();
        session.state = "CLOSED";
        session.status = "notLogged";
        session.client = false;
        console.log("- Sessão fechada");
        //
        return {
          result: "success",
          state: session.state,
          status: session.status,
          message: "Sessão fechada"
        };
        //
      } catch (error) {
        console.log("- Erro ao fechar sessão:", error.message);
        //
        return {
          result: "error",
          state: session.state,
          status: session.status,
          message: "Erro ao fechar sessão"
        };
        //
      }
    });
  } //closeSession
  //
  // ------------------------------------------------------------------------------------------------//
  //
  static async LogoutSession(SessionName) {
    console.log("- Fechando sessão");
    var session = Sessions.getSession(SessionName);
    await session.client.then(async client => {
      try {
        await client.logout();
        session.state = "CLOSED";
        session.status = "notLogged";
        session.client = false;
        console.log("- Sessão fechada");
        //
        return {
          result: "success",
          state: session.state,
          status: session.status,
          message: "Sessão fechada"
        };
        //
      } catch (error) {
        console.log("- Erro ao fechar sessão:", error.message);
        //
        return {
          result: "error",
          state: session.state,
          status: session.status,
          message: "Erro ao fechar sessão"
        };
        //
      }
    });
  } //LogoutSession
  //
  // ------------------------------------------------------------------------------------------------------- //
  //
  static async saveHook(
    sessionName,
    hook
  ) {
    var sessionName = sessionName;
    var foundSession = false;
    var foundSessionId = null;
    if (Sessions.sessions)
      Sessions.sessions.forEach((session, id) => {
        if (sessionName == session.name) {
          foundSession = session;
          foundSessionId = id;
        }
      });
    // Se não encontrar retorna erro
    if (!foundSession) {
      return {
        result: "error",
        message: 'Session not found'
      };
    } else {
      // Se encontrar cria variáveis
      var hook = hook;
      foundSession.hook = hook;
      Sessions.sessions[foundSessionId] = foundSession;
      return {
        result: "success",
        message: 'Hook Atualizado'
      };
    }
  }
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
        //return { result: "success", state: session.state, message: "Sucesso ao enviar menssagem" };
        //return (result);
        //
        return {
          "erro": false,
          "status": 200,
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
          "canReceiveMessage": false,
          "text": erro.text,
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
  //Enviar Texto no stores
  static async sendTextToStorie(
    SessionName,
    text
  ) {
    var session = Sessions.getSession(SessionName);
    var sendResult = await session.client.then(async client => {
      return await client.sendText(
        'status@broadcast',
        text
      ).then((result) => {
        //
        return {
          "erro": false,
          "status": 200,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Texto envido com sucesso."
        };
        //
      }).catch((erro) => {
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar texto"
        };
        //
      });
    });
    return sendResult;
  } //sendTextToStorie
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
  //Enviar Imagem no store
  static async sendImageToStorie(
    SessionName,
    filePath,
    fileName,
    caption
  ) {
    console.log("- Enviando imagem.");
    var session = Sessions.getSession(SessionName);
    var sendResult = await session.client.then(async (client) => {
      return await client.sendFile(
          'status@broadcast',
          filePath,
          fileName,
          caption
        )
        .then((result) => {
          //console.log('Result: ', result); //return object success
          //return (result);
          //
          return {
            "erro": false,
            "status": 200,
            "canReceiveMessage": true,
            "text": "success",
            "message": "Imagem envida com sucesso."
          };
          //
        })
        .catch((erro) => {
          //console.error('Error when sending: ', erro); //return object error
          //return (erro);
          //
          return {
            "erro": true,
            "status": 404,
            "canReceiveMessage": false,
            "text": erro.text,
            "message": "Erro ao enviar imagem"
          };
          //
        });
    });
    return sendResult;
  } //sendImageToStorie
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
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar arquivo",
          "erro": erro
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
  //Enviar opções de mensagem
  static async sendMessageOptions(
    SessionName,
    number,
    quotedMessage,
    msg
  ) {
    console.log("- Enviando responder.");
    var session = Sessions.getSession(SessionName);
    var resultsendImage = await session.client.then(async (client) => {
      return await client.sendImageAsSticker(
        number,
        msg, {
          quotedMessageId: quotedMessage,
        }
      ).then((result) => {
        //console.log('Result: ', result); //return object success
        //return (result);
        //
        return {
          "erro": false,
          "status": 200,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Responder envida com sucesso."
        };
        //
      }).catch((erro) => {
        //console.error('Error when sending: ', erro); //return object error
        //return (erro);
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar responder"
        };
        //
      });
    });
    return resultsendImage;
  } //sendImageAsSticker
  //
  // ------------------------------------------------------------------------------------------------//
  //
  //Enviar mp4 to gif
  static async sendVideoAsGif(
    SessionName,
    number,
    filePath,
    fileName,
    caption
  ) {
    console.log("- Enviando gig.");
    var session = Sessions.getSession(SessionName);
    var resultsendImage = await session.client.then(async (client) => {
      try {
        await client.sendVideoAsGif(
          number,
          filePath,
          fileName.split(".")[0] + ".gif",
          caption
        );
        //console.log('Result: ', result); //return object success
        //return (result);
        //
        return {
          "erro": false,
          "status": 200,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Mp4 para gif envida com sucesso."
        };
        //
      } catch (erro) {
        //console.error('Error when sending: ', erro); //return object error
        //return (erro);
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar mp4 para gif"
        };
        //
      }
    });
    return resultsendImage;
  } //sendVideoAsGif
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Verifica e retorna se uma mensagem ou uma resposta
  static async returnReply(
    SessionName,
    message
  ) {
    console.log("- Enviando mensagem replicada");
    var session = Sessions.getSession(SessionName);
    var resultreturnReply = await session.client.then(async (client) => {
      //
      // Exemple: 
      // await client.onMessage(async (message) => {
      //     console.log(await client.returnReply(message)); // replicated message
      //     console.log(message.body ); //customer message
      //   });
      //
      try {
        await client.returnReply(message);
        //console.log('Result: ', result); //return object success
        //return (result);
        //
        return {
          "erro": false,
          "status": 200,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Mensagem replicada com sucesso."
        };
        //
      } catch (erro) {
        //console.error('Error when sending: ', erro); //return object error
        //return (erro);
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao replicada mensagem"
        };
        //
      }
    });
    return resultreturnReply;
  } //returnReply
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Enviar visto ✔️✔️
  static async sendSeen(
    SessionName,
    number
  ) {
    console.log("- Enviando ✔️✔️.");
    var session = Sessions.getSession(SessionName);
    var resultsendSeen = await session.client.then(async (client) => {
      try {
        await client.sendSeen(number + chatIdorgroupId);
        //
        return {
          "erro": false,
          "status": 200,
          "canReceiveMessage": true,
          "text": "success",
          "message": "✔️✔️ envida com sucesso."
        };
        //
      } catch (error) {
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar ✔️✔️"
        };
        //
      }
    });
    return resultsendSeen;
  } //sendSeen
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Enviar digitando
  static async startTyping(
    SessionName,
    number,
    chatIdorgroupId
  ) {
    console.log("- Enviando digitando");
    var session = Sessions.getSession(SessionName);
    var resultsendImage = await session.client.then(async (client) => {
      try {
        await client.startTyping(number + chatIdorgroupId);
        //
        return {
          "erro": false,
          "status": 200,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Digitando envida com sucesso."
        };
        //
      } catch (error) {
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar digitando"
        };
        //
      }
    });
    return resultsendImage;
  } //startTyping
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Enviar parar digitando
  static async stopTyping(
    SessionName,
    number,
    chatIdorgroupId
  ) {
    console.log("- Enviando stop digitando");
    var session = Sessions.getSession(SessionName);
    var resultsendImage = await session.client.then(async (client) => {
      try {
        await client.stopTyping(number + chatIdorgroupId);
        //
        return {
          "erro": false,
          "status": 200,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Stop digitando envida com sucesso."
        };
        //
      } catch (error) {
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar stop digitando"
        };
        //
      }
    });
    return resultsendImage;
  } //stopTyping
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Enviar status do chat (0: Typing, 1: Recording, 2: Paused)
  static async setChatState(
    SessionName,
    number,
    chatIdorgroupId,
    state
  ) {
    console.log("- Enviando stop digitando");
    var session = Sessions.getSession(SessionName);
    var resultsetChatState = await session.client.then(async (client) => {
      try {
        await client.setChatState(number + chatIdorgroupId, state);
        //
        return {
          "erro": false,
          "status": 200,
          "canReceiveMessage": true,
          "text": "success",
          "message": "Status envido com sucesso."
        };
        //
      } catch (error) {
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": erro.text,
          "message": "Erro ao enviar status"
        };
        //
      }
    });
    return resultsetChatState;
  } //stopTyping
  //
  // ------------------------------------------------------------------------------------------------//
  //
  /*
  ╦═╗┌─┐┌┬┐┬─┐┬┌─┐┬  ┬┬┌┐┌┌─┐  ╔╦╗┌─┐┌┬┐┌─┐                
  ╠╦╝├┤  │ ├┬┘│├┤ └┐┌┘│││││ ┬   ║║├─┤ │ ├─┤                
  ╩╚═└─┘ ┴ ┴└─┴└─┘ └┘ ┴┘└┘└─┘  ═╩╝┴ ┴ ┴ ┴ ┴                
  */
  //
  // Recuperar todos os bate-papos
  static async getAllChats(SessionName) {
    console.log("- Recuperar todos os bate-papos");
    var session = Sessions.getSession(SessionName);
    var resultgetAllChats = await session.client.then(async client => {
      //
      try {
        const chats = await client.getAllChats();
        //console.log('Result: ', chats); //return object success
        //
        var AllChats = [];
        //
        await forEach(chats, async (resultChat) => {
          //
          if (resultChat.isGroup === false) {
            //
            AllChats.push({
              "user": resultChat.contact.id.user,
              "lastReceivedKey": resultChat.lastReceivedKey.id,
              "formattedName": resultChat.contact.name,
              "pendingMsgs": resultChat.pendingMsgs,
              "isBusiness:": resultChat.contact.isBusiness,
              "isBusiness:": resultChat.contact.isMyContact
            });
          }
          //
        });
        //
        return AllChats;
        //
      } catch (erro) {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar bate-papos"
        };
        //
      }
      //
    });
    //
    return resultgetAllChats;
  } //getAllChats
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Recupera todas as novas mensagens de bate-papo
  static async getAllChatsNewMsg(SessionName) {
    console.log("- Recupera todas as novas mensagens de bate-papo");
    var session = Sessions.getSession(SessionName);
    var resultgetAllChatsNewMsg = await session.client.then(async client => {
      //
      try {
        const chatsAllNew = getAllChatsNewMsg();
        //console.log('Result: ', chats); //return object success
        //
        var getAllChatsNewMsg = [];
        //
        await forEach(chatsAllNew, async (resultChat) => {
          //
          if (resultChat.isGroup === false) {
            //
            getAllChatsNewMsg.push({
              "user": resultChat.contact.id.user,
              "lastReceivedKey": resultChat.lastReceivedKey.id,
              "formattedName": resultChat.contact.name,
              "pendingMsgs": resultChat.pendingMsgs,
              "isBusiness:": resultChat.contact.isBusiness,
              "isBusiness:": resultChat.contact.isMyContact
            });
          }
          //
        });
        //
        return getAllChatsNewMsg;
        //
      } catch (erro) {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar bate-papos"
        };
        //
      }
      //
    });
    //
    return resultgetAllChatsNewMsg;
  } //getAllChatsNewMsg
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Recupera todos os contatos do bate-papo
  static async getAllChatsContacts(SessionName) {
    console.log("- Recupera todas as novas mensagens de bate-papo");
    var session = Sessions.getSession(SessionName);
    var resultgetAllChatsContacts = await session.client.then(async client => {
      //
      try {
        const contacts = await client.getAllChatsContacts();
        //console.log('Result: ', chats); //return object success
        //
        var getAllChatsContacts = [];
        //
        await forEach(contacts, async (resultChat) => {
          //
          if (resultChat.isGroup === false) {
            //
            getAllChatsContacts.push({
              "user": resultChat.contact.id.user,
              "lastReceivedKey": resultChat.lastReceivedKey.id,
              "formattedName": resultChat.contact.name,
              "pendingMsgs": resultChat.pendingMsgs,
              "isBusiness:": resultChat.contact.isBusiness,
              "isMyContact:": resultChat.contact.isMyContact
            });
          }
          //
        });
        //
        return getAllChatsContacts;
        //
      } catch (erro) {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar bate-papos"
        };
        //
      }
      //
    });
    //
    return resultgetAllChatsContacts;
  } //getAllChatsContacts
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Recuperar novas mensagens de todos os contatos
  static async getChatContactNewMsg(
    SessionName
  ) {
    console.log("- getChatContactNewMsg");
    var session = Sessions.getSession(SessionName);
    var resultgetChatContactNewMsg = await session.client.then(async client => {
      //
      try {
        const contactNewMsg = await client.getChatContactNewMsg();
        //console.log('Result: ', chats); //return object success
        //
        /*
        var getChatContactNewMsg = [];
        //
        await forEach(contactNewMsg, async (resultChat) => {
          //
          if (resultChat.isGroup === true) {
            //
            getChatContactNewMsg.push({
              "user": resultChat.id.user,
              "name": resultChat.contact.name,
              "formattedName": resultChat.contact.formattedName,
              "pendingMsgs": resultChat.pendingMsgs,
              "isBusiness:": resultChat.contact.isBusiness
            });
          }
          //
        });
        //
        */
        return contactNewMsg;
        //
      } catch (erro) {
        console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar bate-papos"
        };
        //
      }
      //
    });
    //
    return resultgetChatContactNewMsg;
  } //getChatContactNewMsg
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Recuperar todos os grupos
  static async getAllChatsGroups(
    SessionName
  ) {
    console.log("- Obtendo todos os grupos!");
    var session = Sessions.getSession(SessionName);
    var resultgetAllChatsGroups = await session.client.then(async client => {
      //
      try {
        const chats = await client.getAllChatsGroups();
        //console.log('Result: ', chats); //return object success
        //
        var getAllChatsGroups = [];
        //
        await forEach(chats, async (resultChat) => {
          //
          if (resultChat.isGroup === true) {
            //
            getAllChatsGroups.push({
              "user": resultChat.id.user,
              "name": resultChat.contact.name,
              "formattedName": resultChat.contact.formattedName,
              "pendingMsgs": resultChat.pendingMsgs,
              "isBusiness:": resultChat.contact.isBusiness
            });
          }
          //
        });
        //
        return getAllChatsGroups;
        //
      } catch (erro) {
        console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar bate-papos"
        };
        //
      }
      //
    });
    //
    return resultgetAllChatsGroups;
  } //getAllChatsGroups
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Recupera novas messagens de todos os contatos dos grupos
  static async getChatGroupNewMsg(
    SessionName
  ) {
    console.log("- getChatGroupNewMsg");
    var session = Sessions.getSession(SessionName);
    var resultgetAllChatsGroups = await session.client.then(async client => {
      //
      try {
        const chats = await client.getChatGroupNewMsg();
        //console.log('Result: ', chats); //return object success
        //
        /*
        var getChatGroupNewMsg = [];
        //
        await forEach(chats, async (resultChat) => {
          //
          if (resultChat.isGroup === true) {
            //
            getChatGroupNewMsg.push({
              "user": resultChat.id.user,
              "name": resultChat.contact.name,
              "formattedName": resultChat.contact.formattedName,
              "pendingMsgs": resultChat.pendingMsgs,
              "isBusiness:": resultChat.contact.isBusiness
            });
          }
          //
        });
        */
        //
        return chats;
        //
      } catch (erro) {
        console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar novas menssagens dos bate-papos"
        };
        //
      }
      //
    });
    //
    return resultgetAllChatsGroups;
  } //getChatGroupNewMsg
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Recupera novas messagens de todos os contatos dos grupos
  static async getAllChatsTransmission(
    SessionName
  ) {
    console.log("- getAllChatsTransmission");
    var session = Sessions.getSession(SessionName);
    var resultgetAllChatsGroups = await session.client.then(async client => {
      //
      try {
        const chats = await client.getAllChatsTransmission();
        //console.log('Result: ', chats); //return object success
        //
        /*
        var getAllChatsTransmission = [];
        //
        await forEach(chats, async (resultChat) => {
          //
          if (resultChat.isGroup === true) {
            //
            getAllChatsTransmission.push({
              "user": resultChat.id.user,
              "name": resultChat.contact.name,
              "formattedName": resultChat.contact.formattedName,
              "pendingMsgs": resultChat.pendingMsgs,
              "isBusiness:": resultChat.contact.isBusiness
            });
          }
          //
        });
        */
        //
        return chats;
        //
      } catch (erro) {
        console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar novas menssagens dos bate-papos"
        };
        //
      }
      //
    });
    //
    return resultgetAllChatsGroups;
  } //getChatGroupNewMsg
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Recuperar contatos
  static async getAllContacts(
    SessionName
  ) {
    console.log("- Obtendo todos os contatos!");
    //
    var session = Sessions.getSession(SessionName);
    var resultgetAllContacts = await session.client.then(async client => {
      //
      try {
        const AllContacts = await client.getAllContacts();
        //console.log('Result: ', result); //return object success
        //
        var getChatGroupNewMsg = [];
        //
        await forEach(AllContacts, async (resultAllContacts) => {
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
      } catch (erro) {
        console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar contatos"
        };
        //
      }
      //
    });
    //
    return resultgetAllContacts;
  } //getAllContacts
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Lista os contatos em mudo
  // Returns a list of mute and non-mute users
  // "all" List all mutes
  // "toMute" List all silent chats
  // "noMute" List all chats without silence
  static async getListMute(
    SessionName,
    list
  ) {
    console.log("- Obtendo lista de mudos.");
    var session = Sessions.getSession(SessionName);
    var resultgetListMute = await session.client.then(async client => {
      try {
        const listMute = await client.getListMute(list);
        //console.log('Result: ', result); //return object success
        return listMute;
      } catch (erro) {
        //console.error('Error when sending: ', erro); //return object error
        console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar lista"
        };
        //
      };
    });
    return resultgetListMute;
  } //getListMute
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Returns browser session token
  static async getSessionTokenBrowser(SessionName) {
    console.log("- Obtendo  Session Token Browser.");
    var session = Sessions.getSession(SessionName);
    var resultgetSessionTokenBrowser = await session.client.then(async client => {
      try {
        const browserSessionToken = await client.getSessionTokenBrowser();
        //console.log('Result: ', result); //return object success
        return browserSessionToken;
      } catch (erro) {
        console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar token browser"
        };
        //
      };
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
      try {
        const getBlockList = await client.getBlockList();
        //console.log('Result: ', result); //return object success
        return getBlockList;
      } catch (erro) {
        console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar lista de contatos bloqueados"
        };
        //
      };
    });
    return resultgetBlockList;
  } //getBlockList
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Recuperar mensagens no bate-papo
  static async getAllMessagesInChat(
    SessionName,
    number,
    includeMe,
    includeNotifications
  ) {
    console.log("- getAllMessagesInChat");
    var session = Sessions.getSession(SessionName);
    var resultgetAllMessagesInChat = await session.client.then(async client => {
      try {
        const Messages = await client.getAllMessagesInChat(number, includeMe, includeNotifications);
        //console.log('Result: ', result); //return object success
        return Messages;
      } catch (erro) {
        console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar mensagens"
        };
        //
      };
    });
    return resultgetAllMessagesInChat;
  } // getAllMessagesInChat
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Carregar mensagens anteriores
  static async loadEarlierMessages(
    SessionName,
    number
  ) {
    console.log("- loadEarlierMessages");
    var session = Sessions.getSession(SessionName);
    var resultloadEarlierMessages = await session.client.then(async client => {
      try {
        const moreMessages = await client.loadEarlierMessages(number);
        //
        return moreMessages;
      } catch (erro) {
        console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao carregar mensagens anteriores"
        };
        //
      };
    });
    return resultloadEarlierMessages;
  } //loadEarlierMessages
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Carregar e obter todas as mensagens no bate-papo
  static async loadAndGetAllMessagesInChat(
    SessionName,
    number
  ) {
    console.log("- loadAndGetAllMessagesInChat");
    var session = Sessions.getSession(SessionName);
    var resultloadAndGetAllMessagesInChat = await session.client.then(async client => {
      try {
        const allMessages = await client.loadAndGetAllMessagesInChat(number);
        //console.log('Result: ', result); //return object success
        return allMessages;
      } catch (erro) {
        console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao obter todas as mensagens no bate-papo"
        };
        //
      };
    });
    return resultloadAndGetAllMessagesInChat;
  } //loadAndGetAllMessagesInChat
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
      try {
        const status = await client.getStatus(number);
        //console.log('Result: ', result); //return object success
        return status;
      } catch (erro) {
        console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar status de contato"
        };
        //
      };
    });
    return resultgetStatus;
  } //getStatus
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Obter o perfil do número
  static async getNumberProfile(
    SessionName,
    number
  ) {
    console.log("- Obtendo o perfil do número!");
    var session = Sessions.getSession(SessionName);
    var getNumberProfile = await session.client.then(async client => {
      try {
        const status = await client.getStatus(number);
        //console.log('Result: ', result); //return object success
        return status;
      } catch (erro) {
        console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao obter perfil do número"
        };
        //
      };
    });
    return getNumberProfile;
  } //getNumberProfile
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Obter todas as mensagens não lidas
  static async getAllUnreadMessages(SessionName) {
    console.log("- Obtendo todas as mensagens não lidas!");
    var session = Sessions.getSession(SessionName);
    var resultgetAllUnreadMessages = await session.client.then(async client => {
      try {
        const messages = await client.getAllUnreadMessages();
        //console.log('Result: ', messages); //return object success
        return messages;
      } catch (erro) {
        console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao obter todas as mensagens não lidas"
        };
        //
      };
    });
    return resultgetAllUnreadMessages;
    //return { result: "success" };
  } //getAllUnreadMessages
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
        console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao obtendo a foto do perfil do servidor"
        };
        //
      };
    });
    return resultgetProfilePicFromServer;
  } //getProfilePicFromServer
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Recuperar bate-papo / conversa
  static async getChat(
    SessionName,
    number
  ) {
    console.log("- Obtendo chats!");
    var session = Sessions.getSession(SessionName);
    var resultgetChat = await session.client.then(async client => {
      try {
        const chat = await client.getChat(number);
        //console.log('Result: ', result); //return object success
        return chat;
      } catch (erro) {
        console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "text": "Error",
          "message": "Erro ao recuperar bate-papo / conversa"
        };
        //
      };
    });
    return resultgetChat;
  } //getChat
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
      try {
        const chat = await client.checkNumberStatus(number);
        //console.log('Result: ', chat); //return object success
        //
        if (chat.status === 200 && chat.canReceiveMessage === true) {
          //
          return {
            "erro": false,
            "status": chat.status,
            "canReceiveMessage": chat.canReceiveMessage,
            "number": chat.id.user,
            "message": "O número informado pode receber mensagens via whatsapp"
          };
          //
        } else if (chat.status === 404 && chat.canReceiveMessage === false) {
          //
          return {
            "erro": true,
            "status": chat.status,
            "canReceiveMessage": chat.canReceiveMessage,
            "number": chat.id.user,
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
      } catch (erro) {
        console.error('Error when sending:\n', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": null,
          "number": number,
          "message": "Erro ao verificar número informado"
        };
        //
      };
    });
    return resultcheckNumberStatus;
  } //checkNumberStatus
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
      try {
        await client.leaveGroup(groupId);
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
      } catch (erro) {
        console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "canReceiveMessage": false,
          "groupId": groupId,
          "message": "Erro ao deixar o grupo"
        };
        //
      };
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
      try {
        const GroupMembers = await client.getGroupMembers(groupId);
        //console.log('Result: ', result); //return object success
        //
        var getGroupMembers = [];
        //
        await forEach(GroupMembers, async (resultAllContacts) => {
          //
          if (resultAllContacts.isMyContact === true || resultAllContacts.isMyContact === false) {
            //
            getGroupMembers.push({
              "user": resultAllContacts.id.user,
              "name": resultAllContacts.name,
              "shortName": resultAllContacts.shortName,
              "pushname": resultAllContacts.pushname,
              "formattedName": resultAllContacts.formattedName
            });
          }
          //
        });
        //
        return getGroupMembers;
        //
      } catch (erro) {
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
      };
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
      try {
        const GroupMembersIds = await client.getGroupMembersIds(groupId);
        //console.log('Result: ', result); //return object success
        return GroupMembersIds;
      } catch (erro) {
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
      };
    });
    return resultgetGroupMembersIds;
  } //getGroupMembersIds
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // -> Continua aqui ->
  //
  // Gerar link de url de convite de grupo
  static async getGroupInviteLink(
    SessionName,
    groupId,
    chatIdorgroupId
  ) {
    console.log("- getGroupInviteLink");
    var session = Sessions.getSession(SessionName);
    var resultgetGroupInviteLink = await session.client.then(async client => {
      try {
        var result = await client.getGroupInviteLink(groupId);
        //console.log('Result: ', result); //return object success
        return result;
      } catch (erro) {
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
      };
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
      try {
        var result = await client.createGroup(title, contactlistValid);
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
      } catch (erro) {
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
      };
    });
    return {
      createGroup: resultgetGroupInviteLink
    };
    //return { result: "success" };
  } //createGroup
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Remove participante
  static async removeParticipant(
    SessionName,
    group,
    groupId,
    phonefull,
    chatIdorgroupId
  ) {
    console.log("- removeParticipant");
    var session = Sessions.getSession(SessionName);
    var resultremoveParticipant = await session.client.then(async client => {
      try {
        const removeParticipant = await client.removeParticipant(group + groupId, phonefull + chatIdorgroupId);
        //console.log('Result: ', result); //return object success
        //
        if (removeParticipant === true) {
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
      } catch (erro) {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "number": phonefull,
          "message": "Erro ao remover participante"
        };
        //
      };
    });
    return {
      "removeParticipant": resultremoveParticipant
    };
  } //removeParticipant
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Adicionar participante
  static async addParticipant(
    SessionName,
    group,
    groupId,
    phonefull,
    chatId
  ) {
    console.log("- addParticipant");
    var session = Sessions.getSession(SessionName);
    var resultaddParticipant = await session.client.then(async client => {
      try {
        var addParticipant = await client.addParticipant(group + groupId, phonefull + chatId);
        //console.log('Result: ', addParticipant); //return object success
        //
        if (addParticipant === true) {
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
      } catch (erro) {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "number": phonefull,
          "message": "Erro ao adicionar participante"
        };
        //
      };
    });
    return {
      "addParticipant": resultaddParticipant
    };
  } //addParticipant
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Promote participant (Give admin privileges)
  static async promoteParticipant(
    SessionName,
    group,
    groupId,
    phonefull,
    chatId
  ) {
    console.log("- promoteParticipant");
    var session = Sessions.getSession(SessionName);
    var resultpromoteParticipant = await session.client.then(async client => {
      try {
        //await client.promoteParticipant('00000000-000000@g.us', '111111111111@c.us');
        var promoteParticipant = await client.promoteParticipant(group + groupId, phonefull + chatId);
        //console.log('Result: ', promoteParticipant); //return object success
        //
        if (promoteParticipant === true) {
          return {
            "erro": false,
            "status": 200,
            "number": phonefull,
            "message": "Participante promovido a administrador"
          };
        } else {
          //
          return {
            "erro": true,
            "status": 404,
            "number": phonefull,
            "message": "Erro ao promover participante a administrador"
          };
          //
        }
        //
      } catch (erro) {
        console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "number": phonefull,
          "message": "Erro ao promover participante a administrador"
        };
        //
      };
    });
    return {
      "promoteParticipant": resultpromoteParticipant
    };
  } //promoteParticipant
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Depromote participant (Give admin privileges)
  static async demoteParticipant(
    SessionName,
    group,
    groupId,
    phonefull,
    chatId
  ) {
    console.log("- demoteParticipant");
    var session = Sessions.getSession(SessionName);
    var resultdemoteParticipant = await session.client.then(async client => {
      try {
        var demoteParticipant = await client.demoteParticipant(group + groupId, phonefull + chatId);
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
      } catch (erro) {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "number": phonefull,
          "message": "Erro ao remover participante de administrador"
        };
        //
      };
    });
    return {
      "demoteParticipant": resultdemoteParticipant
    };
  } //demoteParticipant
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Get group admins
  static async getGroupAdmins(
    SessionName,
    number,
    chatIdorgroupId
  ) {
    console.log("- getGroupAdmins");
    var session = Sessions.getSession(SessionName);
    var resultgetGroupAdmins = await session.client.then(async client => {
      try {
        var getGroupAdmins = await client.getGroupAdmins(number + chatIdorgroupId);
        //console.log('Result: ', result); //return object success
        return getGroupAdmins;
      } catch (erro) {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "number": phonefull,
          "message": "Erro ao obter administradores"
        };
        //
      };
    });
    return {
      "GroupAdmins": resultgetGroupAdmins
    };
    //return { result: "success" };
  } //getGroupAdmins
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
      try {
        var grtInviteCode = await client.getGroupInfoFromInviteLink(InviteCode);
        //console.log('Result: ', result); //return object success
        return grtInviteCode;
      } catch (erro) {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "message": "Erro ao obter link de convite"
        };
        //
      };
    });
    return {
      "GroupInfoFromInviteLink": resultgetGroupInfoFromInviteLink
    };
    //return { result: "success" };
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
      try {
        var joinGroup = await client.joinGroup(InviteCode);
        //console.log('Result: ', result); //return object success
        //
        if (joinGroup.status === 200) {
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
            "message": "erro ao aceitar convite para grupo"
          };
          //
        }
        //
      } catch (erro) {
        //console.error('Error when sending: ', erro); //return object error
        //
        return {
          "erro": true,
          "status": 404,
          "message": "Erro ao entra no grupo via convite"
        };
        //
      };
    });
    return {
      "joinGroup": resultjoinGroup
    };
    //return { result: "success" };
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
      try {
        await client.setProfileStatus(ProfileStatus);
        return {
          "erro": false,
          "status": 200,
          "message": "Profile status alterado com sucesso."
        };
        //
      } catch (error) {
        //console.error('Error when sending: ', erro); //return object error
        //return erro;
        return {
          "erro": true,
          "status": 404,
          "message": "Erro ao alterar profile status."
        };
        //
      }
    });
    return {
      "ProfileStatus": resultsetProfileStatus
    };
    //return { result: "success" };
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
      try {
        await client.setProfileName(ProfileName);
        return {
          "erro": false,
          "status": 200,
          "message": "Profile name alterado com sucesso."
        };
        //
      } catch (error) {
        //console.error('Error when sending: ', erro); //return object error
        //return erro;
        return {
          "erro": true,
          "status": 404,
          "message": "Erro ao alterar profile name."
        };
        //
      }
    });
    return {
      "setProfileName": resultsetProfileName
    };
    //return { result: "success" };
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
      try {
        await client.setProfilePic(path);
        return {
          "erro": false,
          "status": 200,
          "message": "Profile pic alterado com sucesso."
        };
        //
      } catch (error) {
        //console.error('Error when sending: ', erro); //return object error
        //return erro;
        return {
          "erro": true,
          "status": 404,
          "message": "Erro ao alterar profile pic."
        };
        //
      }
    });
    return {
      "setProfilePic": resultsetProfilePic
    };
    //return { result: "success" };
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
      return await client.killServiceWorker();
    });
    return {
      "killServiceWorker": resultkillServiceWorker
    };
  } //killServiceWorker
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Load the service again
  static async restartService(SessionName) {
    console.log("- restartService");
    var session = Sessions.getSession(SessionName);
    var resultrestartService = await session.client.then(async client => {
      return await client.restartService();
    });
    return {
      "restartService": resultrestartService
    };
  } //restartService
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Get device info
  static async getHostDevice(SessionName) {
    console.log("- getHostDevice");
    var session = Sessions.getSession(SessionName);
    var resultgetHostDevice = await session.client.then(async client => {
      return await client.getHostDevice();
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
      return await client.getConnectionState();
    });
    return {
      "getConnectionState": resultisConnected
    };
  } //getConnectionState
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Get battery level
  static async getBatteryLevel(SessionName) {
    console.log("- getBatteryLevel");
    var session = Sessions.getSession(SessionName);
    var resultgetBatteryLevel = await session.client.then(async client => {
      return await client.getBatteryLevel();
    });
    return {
      "getBatteryLevel": resultgetBatteryLevel
    };
  } //getBatteryLevel
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Is Connected
  static async isConnected(SessionName) {
    console.log("- isConnected");
    var session = Sessions.getSession(SessionName);
    var resultisConnected = await session.client.then(async client => {
      return await client.isConnected();
    });
    return {
      "isConnected": resultisConnected
    };
  } //isConnected
  //
  // ------------------------------------------------------------------------------------------------//
  //
  // Get whatsapp web version
  static async getWAVersion(SessionName) {
    console.log("- getWAVersion");
    var session = Sessions.getSession(SessionName);
    var resultgetWAVersion = await session.client.then(async client => {
      return await client.getWAVersion();
    });
    return {
      "WAVersion": resultgetWAVersion
    };
  } //getWAVersion
  //
  // ------------------------------------------------------------------------------------------------//
  //
  /*
  ╔═╗┌┬┐┬ ┬┌─┐┬─┐                                          
  ║ ║ │ ├─┤├┤ ├┬┘                                          
  ╚═╝ ┴ ┴ ┴└─┘┴└─                                          
  */
  //






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