
/*
 * @Author: Eduardo Policarpo
 * @contact: +55 43996611437
 * @Date: 2021-05-10 18:09:49
 * @LastEditTime: 2021-06-07 03:18:01
 */

const webhooks = require('./webhooks');
const Sessions = require('./sessions');
const config = require('../config');
const { fromBuffer } = require('file-type');
const moment = require('moment');
moment()?.format('DD-MM-YYYY hh:mm:ss');
moment?.locale('pt-br')

module.exports = class Events {

    static async receiveMessage(session, client, req) {

        if (config?.engine === '1') {
            client.on('message_create', async (message) => {

                let type = message?.type
                let name = await message?.getContact();
                let chats = await client?.getChats();
                let info = client?.info;

                let response = []
                if (message?.hasMedia == true || message?.type == 'ptt' || message?.type == 'document' || message?.type == 'video' || message?.type == 'image' || message?.type == 'sticker') {
                    var buffer = await message?.downloadMedia();
                    var mimeInfo = await fromBuffer(Buffer?.from(message?.body, 'base64'))
                }
                switch (type) {

                    case 'chat':
                        response = {
                            "wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
                            "type": 'text',
                            "fromMe": message?.fromMe,
                            "id": message?.id?._serialized,
                            "session": session,
                            "isGroupMsg": message?.isGroupMsg,
                            "author": message?.author ? message?.author : null,
                            "name": name?.pushname || name?.verifiedName || name?.shortName || "",
                            "to": message?.to?.split('@')[0],
                            "from": message?.from?.split('@')[0],
                            "content": message?.body,
                            "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                            "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
                        }

                        break;

                    case 'image':
                        response = {
                            "wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
                            "type": 'image',
                            "fromMe": message?.fromMe,
                            "id": message?.id?._serialized,
                            "session": session,
                            "isGroupMsg": message?.isGroupMsg,
                            "author": message?.author ? message?.author : null,
                            "name": name?.pushname || name?.verifiedName || name?.shortName || "",
                            "to": message?.to?.split('@')[0],
                            "from": message?.from?.split('@')[0],
                            "caption": message?.caption != undefined ? message?.caption : "",
                            "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                            "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss'),
                            "base64": message?.fromMe == true ? `data:${mimeInfo?.mime};base64,${message?.body}` : `data:${buffer?.mimetype};base64,${buffer?.data}`
                        }

                        break;
                    case 'sticker':
                        response = {
                            "wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
                            "type": 'sticker',
                            "fromMe": message?.fromMe,
                            "id": message?.id?._serialized,
                            "session": session,
                            "isGroupMsg": message?.isGroupMsg,
                            "author": message?.author ? message?.author : null,
                            "name": name?.pushname || name?.verifiedName || name?.shortName || "",
                            "to": message?.to?.split('@')[0],
                            "from": message?.from?.split('@')[0],
                            "content": message?.body,
                            "caption": message?.caption != undefined ? message?.caption : "",
                            "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                            "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss'),
                            "base64": message?.fromMe == true ? `data:${mimeInfo?.mime};base64,${message?.body}` : `data:${buffer?.mimetype};base64,${buffer?.data}`
                        }

                        break;

                    case 'audio':
                        response = {
                            "wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
                            "type": 'audio',
                            "fromMe": message?.fromMe,
                            "id": message?.id?._serialized,
                            "session": session,
                            "isGroupMsg": message?.isGroupMsg,
                            "author": message?.author ? message?.author : null,
                            "name": name?.pushname || name?.verifiedName || name?.shortName || "",
                            "to": message?.to?.split('@')[0],
                            "from": message?.from?.split('@')[0],
                            "mimetype": message?.mimetype,
                            "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                            "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss'),
                            "base64": message?.fromMe == true ? `data:${mimeInfo?.mime};base64,${message?.body}` : `data:${buffer?.mimetype};base64,${buffer?.data}`
                        }
                        break;

                    case 'ptt':
                        response = {
                            "wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
                            "type": 'ptt',
                            "fromMe": message?.fromMe,
                            "id": message?.id?._serialized,
                            "session": session,
                            "isGroupMsg": message?.isGroupMsg,
                            "author": message?.author ? message?.author : null,
                            "name": name?.pushname || name?.verifiedName || name?.shortName || "",
                            "to": message?.to?.split('@')[0],
                            "from": message?.from?.split('@')[0],
                            "mimetype": message?.mimetype,
                            "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                            "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss'),
                            "base64": message?.fromMe == true ? `data:${mimeInfo?.mime};base64,${message?.body}` : `data:${buffer?.mimetype};base64,${buffer?.data}`
                        }
                        break;

                    case 'video':
                        response = {
                            "wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
                            "type": 'video',
                            "fromMe": message?.fromMe,
                            "id": message?.id?._serialized,
                            "session": session,
                            "isGroupMsg": message?.isGroupMsg,
                            "author": message?.author ? message?.author : null,
                            "name": name?.pushname || name?.verifiedName || name?.shortName || "",
                            "to": message?.to?.split('@')[0],
                            "from": message?.from?.split('@')[0],
                            "content": message?.body,
                            "caption": message?.caption != undefined ? message?.caption : "",
                            "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                            "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss'),
                            "base64": message?.fromMe == true ? `data:${mimeInfo?.mime};base64,${message?.body}` : `data:${buffer?.mimetype};base64,${buffer?.data}`
                        }

                        break;

                    case 'location':
                        response = {
                            "wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
                            "type": 'location',
                            "fromMe": message?.fromMe,
                            "id": message?.id?._serialized,
                            "session": session,
                            "isGroupMsg": message?.isGroupMsg,
                            "author": message?.author ? message?.author : null,
                            "name": name?.pushname || name?.verifiedName || name?.shortName || "",
                            "to": message?.to?.split('@')[0],
                            "from": message?.from?.split('@')[0],
                            "content": message?.body,
                            "loc": message?.loc,
                            "lat": message?.lat,
                            "lng": message?.lng,
                            "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                            "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
                        }

                        break;

                    case 'document':
                        response = {
                            "wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
                            "type": 'document',
                            "fromMe": message?.fromMe,
                            "id": message?.id?._serialized,
                            "session": session,
                            "isGroupMsg": message?.isGroupMsg,
                            "author": message?.author ? message?.author : null,
                            "name": name?.pushname || name?.verifiedName || name?.shortName || "",
                            "to": message?.to?.split('@')[0],
                            "from": message?.from?.split('@')[0],
                            "mimetype": message?.mimetype,
                            "caption": message?.caption != undefined ? message?.caption : "",
                            "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                            "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss'),
                            "base64": message?.fromMe == true ? `data:${mimeInfo?.mime};base64,${message?.body}` : `data:${buffer?.mimetype};base64,${buffer?.data}`
                        }

                        break;

                    case 'link':
                        response = {
                            "wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
                            "type": 'link',
                            "fromMe": message?.fromMe,
                            "id": message?.id?._serialized,
                            "session": session,
                            "isGroupMsg": message?.isGroupMsg,
                            "author": message?.author ? message?.author : null,
                            "name": name?.pushname || name?.verifiedName || name?.shortName || "",
                            "to": message?.to?.split('@')[0],
                            "from": message?.from?.split('@')[0],
                            "thumbnail": message?.thumbnail,
                            "title": message?.title,
                            "description": message?.description,
                            "url": message?.body,
                            "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                            "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
                        }
                        break;

                    case 'vcard':
                        response = {
                            "wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
                            "type": 'vcard',
                            "fromMe": message?.fromMe,
                            "id": message?.id?._serialized,
                            "session": session,
                            "isGroupMsg": message?.isGroupMsg,
                            "author": message?.author ? message?.author : null,
                            "name": name?.pushname || name?.verifiedName || name?.shortName || "",
                            "to": message?.to?.split('@')[0],
                            "from": message?.from?.split('@')[0],
                            "contactName": message?.vcardFormattedName,
                            "contactVcard": message?.body,
                            "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                            "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
                        }

                        break;

                    case 'order':
                        response = {
                            "wook": message?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
                            "type": 'order',
                            "fromMe": message?.fromMe,
                            "id": message?.id?._serialized,
                            "session": session,
                            "isGroupMsg": message?.isGroupMsg,
                            "author": message?.author ? message?.author : null,
                            "name": name?.pushname || name?.verifiedName || name?.shortName || "",
                            "to": message?.to?.split('@')[0],
                            "from": message?.from?.split('@')[0],
                            "content": '',
                            "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                            "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
                        }

                        break;
                }
                await webhooks?.wh_messages(session, response)
            });

        }
        else {
            await client?.onAnyMessage(async message => {
                if (message.from != 'status@broadcast') {
                    let type = message?.type

                    if (type == 'chat' && message?.subtype == 'url') {
                        type = 'link'
                    } else if (type == 'chat' && !message?.subtype) {
                        type = 'text'
                    }

                    let response = []
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
                                "mimetype": message?.mimetype,
                                "quotedMsg": message?.quotedMsg || '',
                                "quotedMsgId": message?.quotedMsgId || '',
                                "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                                "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss'),
                                "base64": await client?.downloadMedia(message?.id)
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
                                "mimetype": message?.mimetype,
                                "quotedMsg": message?.quotedMsg || '',
                                "quotedMsgId": message?.quotedMsgId || '',
                                "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                                "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss'),
                                "base64": await client?.downloadMedia(message?.id)
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
                                "mimetype": message?.mimetype,
                                "quotedMsg": message?.quotedMsg || '',
                                "quotedMsgId": message?.quotedMsgId || '',
                                "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                                "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss'),
                                "base64": await client?.downloadMedia(message?.id)
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
                                "mimetype": message?.mimetype,
                                "quotedMsg": message?.quotedMsg || '',
                                "quotedMsgId": message?.quotedMsgId || '',
                                "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                                "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss'),
                                "base64": await client?.downloadMedia(message?.id)
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
                                "quotedMsg": message?.quotedMsg || '',
                                "quotedMsgId": message?.quotedMsgId || '',
                                "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                                "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss'),
                                "base64": await client?.downloadMedia(message?.id)
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
                                "mimetype": message?.mimetype,
                                "caption": message?.caption != undefined ? message?.caption : "",
                                "quotedMsg": message?.quotedMsg || '',
                                "quotedMsgId": message?.quotedMsgId || '',
                                "status": message?.fromMe == true ? 'SENT' : 'RECEIVED',
                                "datetime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss'),
                                "base64": await client?.downloadMedia(message?.id)
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
                    message?.fromMe == true ? req?.io?.emit('send-message', await response, true) : req?.io?.emit('received-message', await response, true)
                    webhooks?.wh_messages(session, response)

                }
            })
        }
    }

    static statusMessage(session, client) {
        let data = Sessions.getSession(session)
        if (config?.engine === '1') {
            client?.on('message_ack', async (message, ack) => {
                let type = message?.type
                let status
                switch (ack) {
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
                    "id": message?.id?._serialized,
                    "session": session,
                    "to": message?.to?.split("@")[0],
                    "from": message?.from?.split('@')[0],
                    "type": type,
                    "dateTime": moment?.unix(message?.timestamp)?.format('DD-MM-YYYY hh:mm:ss')
                }
                data.funcoesSocket.ack(session, response)
                await webhooks?.wh_status(session, response)
            });
        }
        else {
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
        }
    }

    static statusConnection(session, client) {

        client?.onStateChange((state) => {
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

    }

}