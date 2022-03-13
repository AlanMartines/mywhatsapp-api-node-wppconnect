const Sessions = require('../controllers/sessions.js');
const superagent = require('superagent');
require('superagent-queue');
const dotenv = require('dotenv');
dotenv.config();
//
module.exports = class Webhooks {

    static async wh_messages(session, response) {
			console.log('- Webhook messages');
        let data = Sessions.getSession(session);
        try {
            if (data.wh_message != undefined) {
                await superagent
                    .post(data.wh_message)
                    .send(response)
                    .queue('messages')
                    .end(function () {
                        console.log('- Webhooks receive message')
                    });
                if (data.wh_message == '') {
                    console.log('- Webhook no defined')
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    static async wh_connect(session, response, number = null, browserless = null, tokens = []) {
			console.log('- Webhook connect');
        let data = Sessions.getSession(session);
        if (response == 'autocloseCalled' || response == 'desconnectedMobile' || response == 'qrReadError') {
            Sessions.deleteSession(session);
        }
        try {
            if (response == 'qrReadSuccess' || response == 'isLogged' || response == 'inChat' || response == 'chatsAvailable' || response == 'connected') {
                var object = {
                    "wook": 'STATUS_CONNECT',
                    'result': 200,
                    'session': session,
                    'status': response,
                    'number': number,
                    'browserless': browserless,
                    'tokens': tokens
                }
            } else {

                var object = {
                    "wook": 'STATUS_CONNECT',
                    'result': 200,
                    'session': session,
                    'status': response
                }
            }
            if (data.wh_connect != undefined) {
                await superagent
                    .post(data.wh_connect)
                    .send(object)
                    .queue('connection')
                    .end(function () {
                        console.log('- Webhooks connect status')
                    });
                if (data.wh_connect == '') {
                    console.log('- Webhook no defined');
                }
            }

        } catch (error) {
            console.log(error);
        }

    }

    static async wh_status(session, response) {
			console.log('- Webhook status');
        let data = Sessions.getSession(session)
        try {
            if (data.wh_status != undefined) {
                await superagent
                    .post(data.wh_status)
                    .send(response)
                    .queue('status')
                    .end(function () {
                        console.log('- Webhooks status message')
                    });
                if (data.wh_status == '') {
                    console.log('- Webhook no defined')
                }
            }

        } catch (error) {
            console.log(error);
        }
    }

    static async wh_qrcode(session, response) {
			console.log('- Webhook qrcode');
        let data = await Sessions.getSession(session);
        try {
            let object = {
                "wook": 'QRCODE',
                'result': 200,
                'session': session,
                'qrcode': response
            }
            if (data.wh_qrcode != undefined) {
                await superagent
                    .post(data.wh_qrcode)
                    .send(object)
                    .queue('qrcode')
                    .end(function () {
                        console.log('- Webhooks status message')
                    });
                if (data.wh_qrcode == '') {
                    console.log('- Webhook no defined');
                }
            }

        } catch (error) {
            console.log(error)
        }
    }
}