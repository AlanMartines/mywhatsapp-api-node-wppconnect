const fs = require('fs-extra');
const rimraf = require("rimraf");
const mime = require('mime-types');
const webhooks = require('./webhooks.js');
const config = require('../config.global');
const Sessions = require('../controllers/sessions.js');
//
// ------------------------------------------------------------------------------------------------------- //
//
async function updateStateDb(state, status, AuthorizationToken) {
	//
	const date_now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	console.log("- Date:", date_now);
	//
	//
	const sql = "UPDATE tokens SET state=?, status=?, lastactivit=? WHERE token=?";
	const values = [state, status, date_now, AuthorizationToken];
	//
	if (parseInt(config.VALIDATE_MYSQL) == true) {
		console.log('- Atualizando status');
		const conn = require('./config/dbConnection').promise();
		const resUpdate = await conn.execute(sql, values);
		//conn.end();
		//conn.release();
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
async function deletaToken(filePath, filename) {
	//
	fs.unlink(`${filePath}/${filename}`, function (err) {
		if (err && err.code == 'ENOENT') {
			// file doens't exist
			console.log(`- Arquivo "${filePath}/${filename}" não existe`);
		} else if (err) {
			// other errors, e.g. maybe we don't have enough permission
			console.log(`- Erro ao remover arquivo "${filePath}/${filename}"`);
		} else {
			console.log(`- Arquivo json "${filePath}/${filename}" removido com sucesso`);
		}
	});
}
//
// ------------------------------------------------------------------------------------------------------- //
//
module.exports = class Events {

	static async receiveMessage(SessionName, client, socket) {
		//
		try {
			//
			await client.onMessage(async (message) => {
				let type = message.type
				if (type == 'chat' && message.subtype == 'url') {
					type = 'link'
				} else if (type == 'chat' && !message.subtype) {
					type = 'text'
				}
				/*
				let contact = await client?.getContact(message?.sender?.id);
				console.log(`- getContact: \n ${JSON.stringify(message, null, 2)}`);
				*/
				//
				let response = [];
				if (message.isMedia === true || message.isMMS === true || message.type == 'document' || message.type == 'ptt' || message.type == 'sticker') {
					var buffer = await client.decryptFile(message);
					var telefone = ((String(`${message.from}`).split('@')[0]).substr(2));
					let date_ob = new Date();
					let date = ("0" + date_ob.getDate()).slice(-2);
					let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
					let year = date_ob.getFullYear();
					let miliseconds = date_ob.getMilliseconds();
					var fileName = `${telefone}-${year}${month}${date}-${miliseconds}.${mime.extension(message.mimetype)}`;
				}
				//
				switch (type) {

					case 'text':
						response = {
							"wook": 'RECEIVE_MESSAGE',
							"type": 'text',
							"id": message.id,
							"session": SessionName,
							//
							"name": message?.sender?.name ? message?.sender?.name : "",
							"realName": message?.sender?.pushname ? message?.sender?.pushname : "",
							"shortName": message?.sender?.shortName ? message?.sender?.shortName : "",
							"formattedName": message?.sender?.formattedName ? message?.sender?.formattedName : "",
							"business": message?.sender?.isBusiness,
							"isMyContact": message?.sender?.isMyContact,
							//
							"isGroupMsg": message.isGroupMsg,
							"author": message.author ? message.author : null,
							"sender": message.to.split('@')[0],
							"phone": message.from.split('@')[0],
							"content": message.body,
							"status": "RECEIVED",
							"timestamp": message.timestamp,
						}

						break;

					case 'image':

						response = {
							"wook": 'RECEIVE_MESSAGE',
							"type": 'image',
							"id": message.id,
							"session": SessionName,
							//
							"name": message?.sender?.name ? message?.sender?.name : "",
							"realName": message?.sender?.pushname ? message?.sender?.pushname : "",
							"shortName": message?.sender?.shortName ? message?.sender?.shortName : "",
							"formattedName": message?.sender?.formattedName ? message?.sender?.formattedName : "",
							"business": message?.sender?.isBusiness,
							"isMyContact": message?.sender?.isMyContact,
							//
							"isGroupMsg": message.isGroupMsg,
							"author": message.author ? message.author : null,
							"sender": message.to.split('@')[0],
							"phone": message.from.split('@')[0],
							"content": message.body,
							"caption": message.caption != undefined ? message.caption : "",
							"file": fileName,
							"base64": await client?.downloadMedia(message?.id),
							"status": "RECEIVED",
							"timestamp": message.timestamp,
						}

						break;
					case 'sticker':
						fs.writeFileSync(`files-received/${fileName}`, buffer, (err) => {
							console.log('arquivo baixado!')
						});
						response = {
							"wook": 'RECEIVE_MESSAGE',
							"type": 'sticker',
							"id": message.id,
							"session": session,
							//
							"name": message?.sender?.name ? message?.sender?.name : "",
							"realName": message?.sender?.pushname ? message?.sender?.pushname : "",
							"shortName": message?.sender?.shortName ? message?.sender?.shortName : "",
							"formattedName": message?.sender?.formattedName ? message?.sender?.formattedName : "",
							"business": message?.sender?.isBusiness,
							"isMyContact": message?.sender?.isMyContact,
							//
							"isGroupMsg": message.isGroupMsg,
							"author": message.author ? message.author : null,
							"sender": message.to.split('@')[0],
							"phone": message.from.split('@')[0],
							"content": message.body,
							"caption": message.caption != undefined ? message.caption : "",
							"file": fileName,
							"base64": await client?.downloadMedia(message?.id),
							"status": "RECEIVED",
							"timestamp": message.timestamp,
						}

						break;

					case 'audio':

						response = {
							"wook": 'RECEIVE_MESSAGE',
							"type": 'audio',
							"id": message.id,
							"session": SessionName,
							//
							"name": message?.sender?.name ? message?.sender?.name : "",
							"realName": message?.sender?.pushname ? message?.sender?.pushname : "",
							"shortName": message?.sender?.shortName ? message?.sender?.shortName : "",
							"formattedName": message?.sender?.formattedName ? message?.sender?.formattedName : "",
							"business": message?.sender?.isBusiness,
							"isMyContact": message?.sender?.isMyContact,
							//
							"isGroupMsg": message.isGroupMsg,
							"author": message.author ? message.author : null,
							"sender": message.to.split('@')[0],
							"phone": message.from.split('@')[0],
							"mimetype": message.mimetype,
							"file": fileName,
							"base64": await client?.downloadMedia(message?.id),
							"status": "RECEIVED",
							"timestamp": message.timestamp,
						}
						break;

					case 'ptt':

						response = {
							"wook": 'RECEIVE_MESSAGE',
							"type": 'ptt',
							"id": message.id,
							"session": SessionName,
							//
							"name": message?.sender?.name ? message?.sender?.name : "",
							"realName": message?.sender?.pushname ? message?.sender?.pushname : "",
							"shortName": message?.sender?.shortName ? message?.sender?.shortName : "",
							"formattedName": message?.sender?.formattedName ? message?.sender?.formattedName : "",
							"business": message?.sender?.isBusiness,
							"isMyContact": message?.sender?.isMyContact,
							//
							"isGroupMsg": message.isGroupMsg,
							"author": message.author ? message.author : null,
							"sender": message.to.split('@')[0],
							"phone": message.from.split('@')[0],
							"mimetype": message.mimetype,
							"file": fileName,
							"base64": await client?.downloadMedia(message?.id),
							"status": "RECEIVED",
							"timestamp": message.timestamp,
						}
						break;

					case 'video':

						response = {
							"wook": 'RECEIVE_MESSAGE',
							"type": 'video',
							"id": message.id,
							"session": SessionName,
							//
							"name": message?.sender?.name ? message?.sender?.name : "",
							"realName": message?.sender?.pushname ? message?.sender?.pushname : "",
							"shortName": message?.sender?.shortName ? message?.sender?.shortName : "",
							"formattedName": message?.sender?.formattedName ? message?.sender?.formattedName : "",
							"business": message?.sender?.isBusiness,
							"isMyContact": message?.sender?.isMyContact,
							//
							"isGroupMsg": message.isGroupMsg,
							"author": message.author ? message.author : null,
							"sender": message.to.split('@')[0],
							"phone": message.from.split('@')[0],
							"content": message.body,
							"caption": message.caption != undefined ? message.caption : "",
							"file": fileName,
							"base64": await client?.downloadMedia(message?.id),
							"status": "RECEIVED",
							"timestamp": message.timestamp,
						}

						break;

					case 'location':
						response = {
							"wook": 'RECEIVE_MESSAGE',
							"type": 'location',
							"id": message.id,
							"session": SessionName,
							//
							"name": message?.sender?.name ? message?.sender?.name : "",
							"realName": message?.sender?.pushname ? message?.sender?.pushname : "",
							"shortName": message?.sender?.shortName ? message?.sender?.shortName : "",
							"formattedName": message?.sender?.formattedName ? message?.sender?.formattedName : "",
							"business": message?.sender?.isBusiness,
							"isMyContact": message?.sender?.isMyContact,
							//
							"isGroupMsg": message.isGroupMsg,
							"author": message.author ? message.author : null,
							"sender": message.to.split('@')[0],
							"phone": message.from.split('@')[0],
							"content": message.body,
							"loc": message.loc,
							"lat": message.lat,
							"lng": message.lng,
							"status": "RECEIVED",
							"timestamp": message.timestamp,
						}

						break;

					case 'document':

						response = {
							"wook": 'RECEIVE_MESSAGE',
							"type": 'document',
							"id": message.id,
							"session": session,
							//
							"name": message?.sender?.name ? message?.sender?.name : "",
							"realName": message?.sender?.pushname ? message?.sender?.pushname : "",
							"shortName": message?.sender?.shortName ? message?.sender?.shortName : "",
							"formattedName": message?.sender?.formattedName ? message?.sender?.formattedName : "",
							"business": message?.sender?.isBusiness,
							"isMyContact": message?.sender?.isMyContact,
							//
							"isGroupMsg": message.isGroupMsg,
							"author": message.author ? message.author : null,
							"sender": message.to.split('@')[0],
							"phone": message.from.split('@')[0],
							"mimetype": message.mimetype,
							"caption": message.caption != undefined ? message.caption : "",
							"file": fileName,
							"base64": await client?.downloadMedia(message?.id),
							"status": "RECEIVED",
							"timestamp": message.timestamp,
						}

						break;

					case 'link':
						response = {
							"wook": 'RECEIVE_MESSAGE',
							"type": 'link',
							"id": message.id,
							"session": SessionName,
							//
							"name": message?.sender?.name ? message?.sender?.name : "",
							"realName": message?.sender?.pushname ? message?.sender?.pushname : "",
							"shortName": message?.sender?.shortName ? message?.sender?.shortName : "",
							"formattedName": message?.sender?.formattedName ? message?.sender?.formattedName : "",
							"business": message?.sender?.isBusiness,
							"isMyContact": message?.sender?.isMyContact,
							//
							"isGroupMsg": message.isGroupMsg,
							"author": message.author ? message.author : null,
							"sender": message.to.split('@')[0],
							"phone": message.from.split('@')[0],
							"thumbnail": message.thumbnail,
							"title": message.title,
							"description": message.description,
							"url": message.body,
							"status": "RECEIVED",
							"timestamp": message.timestamp,
						}
						break;

					case 'vcard':
						response = {
							"wook": 'RECEIVE_MESSAGE',
							"type": 'vcard',
							"id": message.id,
							"session": SessionName,
							//
							"name": message?.sender?.name ? message?.sender?.name : "",
							"realName": message?.sender?.pushname ? message?.sender?.pushname : "",
							"shortName": message?.sender?.shortName ? message?.sender?.shortName : "",
							"formattedName": message?.sender?.formattedName ? message?.sender?.formattedName : "",
							"business": message?.sender?.isBusiness,
							"isMyContact": message?.sender?.isMyContact,
							//
							"isGroupMsg": message.isGroupMsg,
							"author": message.author ? message.author : null,
							"sender": message.to.split('@')[0],
							"phone": message.from.split('@')[0],
							"contactName": message.vcardFormattedName,
							"contactVcard": message.body,
							"status": "RECEIVED",
							"timestamp": message.timestamp,
						}

						break;

					case 'order':

						response = {
							"wook": 'RECEIVE_MESSAGE',
							"type": 'order',
							"id": message.id,
							"session": SessionName,
							//
							"name": message?.sender?.name ? message?.sender?.name : "",
							"realName": message?.sender?.pushname ? message?.sender?.pushname : "",
							"shortName": message?.sender?.shortName ? message?.sender?.shortName : "",
							"formattedName": message?.sender?.formattedName ? message?.sender?.formattedName : "",
							"business": message?.sender?.isBusiness,
							"isMyContact": message?.sender?.isMyContact,
							//
							"isGroupMsg": message.isGroupMsg,
							"author": message.author ? message.author : null,
							"sender": message.to.split('@')[0],
							"phone": message.from.split('@')[0],
							"content": '',
							"status": "RECEIVED",
							"timestamp": message.timestamp,
						}

						break;
				}

				await webhooks.wh_messages(SessionName, response);

			});

		} catch (error) {
			console.log("- Error onMessage:", error);
		}

	}

	static statusMessage(SessionName, client, socket) {
		//
		try {
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
				let type = ack.type
				if (type == 'chat' && ack.subtype == 'url') {
					type = 'link'
				} else if (type == 'chat' && !ack.subtype) {
					type = 'text'
				}
				let status;
				switch (ack.ack) {
					case 0:
						status = 'CLOCK'

						break;

					case -3:
						status = 'CONTENT_GONE'

						break;
					case -4:
						status = 'CONTENT_TOO_BIG'

						break;

					case -5:

						status = 'CONTENT_UNUPLOADABLE'

						break;

					case -2:

						status = 'EXPIRED'

						break;
					case -1:

						status = 'FAILED'

						break;
					case -6:

						status = 'INACTIVE'

						break;
					case -7:

						status = 'MD_DOWNGRADE'

						break;
					case 4:

						status = 'PLAYED'

						break;
					case 3:

						status = 'READ'

						break;
					case 2:

						status = 'RECEIVED'

						break;
					case 1:

						status = 'SENT'

						break;
				}
				//
				//let contact = await client?.getContact(ack.id._serialized);
				console.log(`- getContact: \n ${JSON.stringify(ack, null, 2)}`);
				//
				let timestamp = Math.round(new Date().getTime() / 1000)
				let response = {
					"wook": 'MESSAGE_STATUS',
					"status": status,
					"id": ack.id._serialized,
					"session": SessionName,
					//
					"name": contact.name ? contact.name : "",
					"realName": contact.pushname ? contact.pushname : "",
					"formattedName": contact.formattedName ? contact.formattedName : "",
					"business": contact.isBusiness,
					"verifiedName": contact.verifiedName ? contact.verifiedName : "",
					"isMyContact": contact.isMyContact,
					//
					"phone": ack.id.remote.split("@")[0],
					"content": ack.body,
					"timestamp": timestamp,
					"type": type
				}

				await webhooks.wh_status(SessionName, response);

			});

		} catch (error) {
			console.log("- Error onAck:", error);
		}

	}

	static statusConnection(SessionName, client, socket) {
		try {
			// State change
			let time = 0;
			client.onStateChange(async (state) => {
				//
				console.log('- Connection status: ', state);
				//
				webhooks.wh_status(SessionName, state);
				//
				socket.emit('state',
					{
						status: state,
						SessionName: SessionName
					});
				//
				session.state = state;
				clearTimeout(time);
				if (state == "CONNECTED") {
					session.state = state;
					session.status = 'isLogged';
					session.qrCode = null;
					//
				} else if (state == "OPENING") {
					session.state = state;
					session.status = 'notLogged';
					session.qrCode = null;
					//
					//await deletaToken(`${tokenPatch}`, `${SessionName}.data.json`);
					//await deletaCache(`${tokenPatch}`, `WPP-${SessionName}`);
					//
				} else if (state == "UNPAIRED") {
					session.state = state;
					session.status = 'notLogged';
					session.qrCode = null;
					//
					await deletaToken(`${tokenPatch}`, `${SessionName}.data.json`);
					await deletaCache(`${tokenPatch}`, `WPP-${SessionName}`);
					//
				} else if (state === 'DISCONNECTED' || state === 'SYNCING') {
					session.state = state;
					session.qrCode = null;
					//
					await deletaToken(`${tokenPatch}`, `${SessionName}.data.json`);
					await deletaCache(`${tokenPatch}`, `WPP-${SessionName}`);
					//
					time = setTimeout(async () => {
						await client.close();
						// process.exit(); //optional function if you work with only one session
					}, 80000);
				}
				//
				await updateStateDb(session.state, session.status, SessionName);
				//
				// force whatsapp take over
				if ('CONFLICT'.includes(state)) client.useHere();
				// detect disconnect on whatsapp
				if ('UNPAIRED'.includes(state)) webhooks.wh_connect(session, 'disconnectedMobile');
			});
		} catch (error) {
			session.state = "NOTFOUND";
			session.qrCode = null;
			session.attempts = 0;
			session.message = 'Sistema desconectado';
			console.log("- Instância não iniciada:", error);
		}
		//
	}
	//
	static extraEvents(session, client) {
		//
		// function to detect incoming call
		try {
			client.onIncomingCall(async (call) => {
				await client.rejectCall();
				await client.sendText(call.peerJid, await saudacao() + ",\nDesculpe-me mas não consigo atender sua chamada, se for urgente manda msg de texto, grato.");
			});
		} catch (error) {
			console.log("- Error onIncomingCall:", error);
		}
		//
		try {
			// Listen when client has been added to a group
			client.onAddedToGroup(async (chatEvent) => {
				console.log('- Listen when client has been added to a group:', chatEvent.name);
			});
		} catch (error) {
			console.log("- Error onAddedToGroup:", error);
		}
		//
	}
}