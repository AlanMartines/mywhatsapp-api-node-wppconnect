const webhooks = require('./webhooks');
const Sessions = require('./sessions');
const moment = require('moment');
moment()?.format('DD-MM-YYYY hh:mm:ss');
moment?.locale('pt-br');
//
// ------------------------------------------------------------------------------------------------------- //
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
module.exports = class Events {

	static async receiveMessage(session, client, socket) {
try{
		await client?.onAnyMessage(async message => {
			if (message.from != 'status@broadcast') {
				let type = message?.type

				if (type == 'chat' && message?.subtype == 'url') {
					type = 'link'
				} else if (type == 'chat' && !message?.subtype) {
					type = 'text'
				}

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
							"wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
							"type": 'text',
							"fromMe": message?.fromMe,
							"id": message?.id,
							"session": session,
							"isGroupMsg": message?.isGroupMsg,
							"author": message?.author ? message?.author : null,
							"name": message?.sender?.pushname || message?.sender?.verifiedName || message?.sender?.shortName || message?.sender?.name || "",
							"to": message?.to?.split('@')[0],
							"from": message?.from?.split('@')[0],
							"content": message?.body,
							"quotedMsg": message?.quotedMsg || '',
							"quotedMsgId": message?.quotedMsgId || '',
							"status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
							"datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss'),
						}

						break;

					case 'image':
						response = {
							"wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
							"type": 'image',
							"fromMe": message?.fromMe,
							"id": message?.id,
							"session": session,
							"isGroupMsg": message?.isGroupMsg,
							"author": message?.author ? message?.author : null,
							"name": message?.sender?.pushname || message?.sender?.verifiedName || message?.sender?.shortName || message?.sender?.name || "",
							"to": message?.to?.split('@')[0],
							"from": message?.from?.split('@')[0],
							"caption": message?.caption != undefined ? message?.caption : "",
							"mimetype": message?.mimetype != undefined ? message?.mimetype : "",
							"base64": await client?.downloadMedia(message?.id),
							"file": fileName || '',
							"quotedMsg": message?.quotedMsg || '',
							"quotedMsgId": message?.quotedMsgId || '',
							"status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
							"datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
						}

						break;
					case 'sticker':
						response = {
							"wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
							"type": 'sticker',
							"fromMe": message?.fromMe,
							"id": message?.id,
							"session": session,
							"isGroupMsg": message?.isGroupMsg,
							"author": message?.author ? message?.author : null,
							"name": message?.sender?.pushname || message?.sender?.verifiedName || message?.sender?.shortName || message?.sender?.name || "",
							"to": message?.to?.split('@')[0],
							"from": message?.from?.split('@')[0],
							"content": message?.body,
							"caption": message?.caption != undefined ? message?.caption : "",
							"mimetype": message?.mimetype != undefined ? message?.mimetype : "",
							"base64": await client?.downloadMedia(message?.id),
							"file": fileName || '',
							"quotedMsg": message?.quotedMsg || '',
							"quotedMsgId": message?.quotedMsgId || '',
							"status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
							"datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
						}

						break;

					case 'audio':
						response = {
							"wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
							"type": 'audio',
							"fromMe": message?.fromMe,
							"id": message?.id,
							"session": session,
							"isGroupMsg": message?.isGroupMsg,
							"author": message?.author ? message?.author : null,
							"name": message?.sender?.pushname || message?.sender?.verifiedName || message?.sender?.shortName || message?.sender?.name || "",
							"to": message?.to?.split('@')[0],
							"from": message?.from?.split('@')[0],
							"mimetype": message?.mimetype != undefined ? message?.mimetype : "",
							"base64": await client?.downloadMedia(message?.id),
							"file": fileName || '',
							"quotedMsg": message?.quotedMsg || '',
							"quotedMsgId": message?.quotedMsgId || '',
							"status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
							"datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
						}
						break;

					case 'ptt':

						response = {
							"wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
							"type": 'ptt',
							"fromMe": message?.fromMe,
							"id": message?.id,
							"session": session,
							"isGroupMsg": message?.isGroupMsg,
							"author": message?.author ? message?.author : null,
							"name": message?.sender?.pushname || message?.sender?.verifiedName || message?.sender?.shortName || message?.sender?.name || "",
							"to": message?.to?.split('@')[0],
							"from": message?.from?.split('@')[0],
							"mimetype": message?.mimetype != undefined ? message?.mimetype : "",
							"base64": await client?.downloadMedia(message?.id),
							"file": fileName || '',
							"quotedMsg": message?.quotedMsg || '',
							"quotedMsgId": message?.quotedMsgId || '',
							"status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
							"datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
						}
						break;

					case 'video':
						response = {
							"wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
							"type": 'video',
							"fromMe": message?.fromMe,
							"id": message?.id,
							"session": session,
							"isGroupMsg": message?.isGroupMsg,
							"author": message?.author ? message?.author : null,
							"name": message?.sender?.pushname || message?.sender?.verifiedName || message?.sender?.shortName || message?.sender?.name || "",
							"to": message?.to?.split('@')[0],
							"from": message?.from?.split('@')[0],
							"content": message?.body,
							"caption": message?.caption != undefined ? message?.caption : "",
							"mimetype": message?.mimetype != undefined ? message?.mimetype : "",
							"base64": await client?.downloadMedia(message?.id),
							"quotedMsg": message?.quotedMsg || '',
							"quotedMsgId": message?.quotedMsgId || '',
							"status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
							"datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
						}

						break;

					case 'location':
						response = {
							"wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
							"type": 'location',
							"fromMe": message?.fromMe,
							"id": message?.id,
							"session": session,
							"isGroupMsg": message?.isGroupMsg,
							"author": message?.author ? message?.author : null,
							"name": message?.sender?.pushname || message?.sender?.verifiedName || message?.sender?.shortName || message?.sender?.name || "",
							"to": message?.to?.split('@')[0],
							"from": message?.from?.split('@')[0],
							"content": message?.body,
							"loc": message?.loc,
							"lat": message?.lat,
							"lng": message?.lng,
							"quotedMsg": message?.quotedMsg || '',
							"quotedMsgId": message?.quotedMsgId || '',
							"status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
							"datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
						}

						break;

					case 'document':
						response = {
							"wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
							"type": 'document',
							"fromMe": message?.fromMe,
							"id": message?.id,
							"session": session,
							"isGroupMsg": message?.isGroupMsg,
							"author": message?.author ? message?.author : null,
							"name": message?.sender?.pushname || message?.sender?.verifiedName || message?.sender?.shortName || message?.sender?.name || "",
							"to": message?.to?.split('@')[0],
							"from": message?.from?.split('@')[0],
							"mimetype": message?.mimetype != undefined ? message?.mimetype : "",
							"base64": await client?.downloadMedia(message?.id),
							"file": fileName || '',
							"caption": message?.caption != undefined ? message?.caption : "",
							"quotedMsg": message?.quotedMsg || '',
							"quotedMsgId": message?.quotedMsgId || '',
							"status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
							"datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
						}

						break;

					case 'link':
						response = {
							"wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
							"type": 'link',
							"fromMe": message?.fromMe,
							"id": message?.id,
							"session": session,
							"isGroupMsg": message?.isGroupMsg,
							"author": message?.author ? message?.author : null,
							"name": message?.sender?.pushname || message?.sender?.verifiedName || message?.sender?.shortName || message?.sender?.name || "",
							"to": message?.to?.split('@')[0],
							"from": message?.from?.split('@')[0],
							"thumbnail": message?.thumbnail,
							"title": message?.title,
							"description": message?.description,
							"url": message?.body,
							"quotedMsg": message?.quotedMsg || '',
							"quotedMsgId": message?.quotedMsgId || '',
							"status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
							"datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')

						}
						break;

					case 'vcard':
						response = {
							"wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
							"type": 'vcard',
							"fromMe": message?.fromMe,
							"id": message?.id,
							"session": session,
							"isGroupMsg": message?.isGroupMsg,
							"author": message?.author ? message?.author : null,
							"name": message?.sender?.pushname || message?.sender?.verifiedName || message?.sender?.shortName || message?.sender?.name || "",
							"to": message?.to?.split('@')[0],
							"from": message?.from?.split('@')[0],
							"contactName": message?.vcardFormattedName,
							"contactVcard": message?.body,
							"quotedMsg": message?.quotedMsg || '',
							"quotedMsgId": message?.quotedMsgId || '',
							"status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
							"datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
						}

						break;

					case 'order':
						let result = await client.getOrderbyMsg(message?.id)
						response = {
							"wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
							"type": 'order',
							"fromMe": message?.fromMe,
							"id": message?.id,
							"session": session,
							"isGroupMsg": message?.isGroupMsg,
							"author": message?.author ? message?.author : null,
							"name": message?.sender?.pushname || message?.sender?.verifiedName || message?.sender?.shortName || message?.sender?.name || "",
							"to": message?.to?.split('@')[0],
							"from": message?.from?.split('@')[0],
							"content": '',
							"quotedMsg": message?.quotedMsg || '',
							"quotedMsgId": message?.quotedMsgId || '',
							"status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
							"datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss'),
							"order": result
						}

						break;
					case 'list':
						response = {
							"wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
							"type": 'list',
							"fromMe": message?.fromMe,
							"id": message?.id,
							"session": session,
							"isGroupMsg": message?.isGroupMsg,
							"author": message?.author ? message?.author : null,
							"name": message?.sender?.pushname || message?.sender?.verifiedName || message?.sender?.shortName || message?.sender?.name || "",
							"to": message?.to?.split('@')[0],
							"from": message?.from?.split('@')[0],
							"content": message.list,
							"status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
							"datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
						}

						break;
					case 'buttons_response':
						response = {
							"wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
							"type": message?.type,
							"fromMe": message?.fromMe,
							"id": message?.id,
							"session": session,
							"isGroupMsg": message?.isGroupMsg,
							"author": message?.author ? message?.author : null,
							"name": message?.sender?.pushname || message?.sender?.verifiedName || message?.sender?.shortName || message?.sender?.name || "",
							"to": message?.to?.split('@')[0],
							"from": message?.from?.split('@')[0],
							"selectedButtonId": message?.selectedButtonId,
							"content": message?.body,
							"status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
							"datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
						}

						break;
					case 'list_response':
						response = {
							"wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
							"type": message?.type,
							"fromMe": message?.fromMe,
							"id": message?.id,
							"session": session,
							"isGroupMsg": message?.isGroupMsg,
							"author": message?.author ? message?.author : null,
							"name": message?.sender?.pushname || message?.sender?.verifiedName || message?.sender?.shortName || message?.sender?.name || "",
							"to": message?.to?.split('@')[0],
							"from": message?.from?.split('@')[0],
							"listResponse": message?.listResponse,
							"content": message?.content,
							"status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
							"datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
						}

						break;
				}
				message?.fromMe == true ? socket?.emit('send-message', await response, true) : socket?.emit('received-message', await response, true);
				webhooks?.wh_messages(session, response);

			}
		});
	} catch (error) {
		console.log("- Error onAnyMessage:", error.message);
	}
	}

	static statusMessage(session, client, socket) {
		let data = Sessions.getSession(session);
try{
		client?.onAck(async ack => {
			let type = ack?.type
			if (type == 'chat' && ack?.subtype == 'url') {
				type = 'link'
			} else if (type == 'chat' && !ack?.subtype) {
				type = 'text'
			}
			let status
			switch (ack?.ack) {
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

			let response = {
				"wook": 'MESSAGE_STATUS',
				"status": status,
				"id": ack?.id?._serialized,
				"session": session,
				"to": ack?.to?.split('@')[0],
				"from": ack?.from?.split('@')[0],
				"type": type,
				"dateTime": moment?.unix(ack?.t)?.format('DD-MM-YYYY hh:mm:ss')
			}
			data.funcoesSocket.ack(session, response)
			await webhooks?.wh_status(session, response)

		});
	} catch (error) {
		console.log("- Error onAck:", error.message);
	}
	}

	static statusConnection(session, client, socket) {
try{
		client?.onStateChange(async (state) => {
			console?.log('State changed: ', state);
			// force whatsapp take over
			if ('CONFLICT'?.includes(state)) client?.useHere();
			// detect disconnect on whatsapp
			if ('UNPAIRED'?.includes(state)) webhooks?.wh_connect(session, 'disconnectedMobile');
			if (state === 'TIMEOUT') {
				client?.starttoWatchdog(15000); // 15s
				client?.stoptoWatchdog(15000); // 15s
			}

		});
	} catch (error) {
		console.log("- Error onStateChange:", error.message);
	}
	}

	static extraEvents(session, client, socket) {
		//
		// function to detect incoming call
		try {
			client.onIncomingCall(async (call) => {
				await client?.rejectCall();
				await client?.sendText(call.peerJid, await saudacao() + ",\nDesculpe-me mas não consigo atender sua chamada, se for urgente manda msg de texto, grato.");
			});
		} catch (error) {
			console.log("- Error onIncomingCall:", error);
		}
		//
		try {
			// Listen when client has been added to a group
			client?.onAddedToGroup(async (chatEvent) => {
				console.log('- Listen when client has been added to a group:', chatEvent.name);
			});
		} catch (error) {
			console.log("- Error onAddedToGroup:", error);
		}
		//
	}
}