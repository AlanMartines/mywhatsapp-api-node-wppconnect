/*
 * @Author: Eduardo Policarpo
 * @contact: +55 43996611437
 * @Date: 2021-05-10 18:09:49
 * @LastEditTime: 2021-06-07 03:18:01
 */
const Sessions = require('../controllers/sessions');
const superagent = require('superagent');
require('superagent-queue');
require('dotenv').config();

module.exports = class Webhooks {

    static async wh_messages(session, response) {
        let data = Sessions?.getSession(session)
        try {
            if (data?.wh_message != undefined) {
                await superagent
                    .post(data?.wh_message)
                    .send(response)
                    .set('Accept', 'application/json')
                    .queue('messages')
                    .end(function () {
                        console?.log('webhooks receive message....')
                    });
                if (data?.wh_message == '') {
                    console?.log('Webhook no defined')
                }
            }
        } catch (error) {
            console?.log(error)
        }
    }

    static async wh_connect(session, response, phone = null) {
        let data = Sessions?.getSession(session)
        try {
            var object = {
                "wook": 'STATUS_CONNECT',
                'result': 200,
                'session': session,
                'state': response,
                'status': data.status,
                'number': phone
            }

            if (data?.wh_connect != undefined) {
                await superagent
                    .post(data?.wh_connect)
                    .send(object)
                    .queue('connection')
                    .end(function () {
                        console?.log('webhooks connect status....')
                    });
                if (data?.wh_connect == '') {
                    console?.log('Webhook no defined')
                }
            }

        } catch (error) {
            console?.log(error)
        }

    }

    static async wh_status(session, response) {
        let data = Sessions?.getSession(session)
        try {
            if (data?.wh_status != undefined) {
                await superagent
                    .post(data?.wh_status)
                    .send(response)
                    .queue('status')
                    .end(function () {
                        console?.log('webhooks status message....')
                    });
                if (data?.wh_status == '') {
                    console?.log('Webhook no defined')
                }
            }

        } catch (error) {
            console?.log(error)
        }
    }

    static async wh_qrcode(session, response, urlCode) {
        let data = Sessions?.getSession(session)
        try {
            let object = {
                "wook": 'QRCODE',
                'result': 200,
                'session': session,
                'qrcode': response,
                'urlCode': urlCode
            }
            if (data?.wh_qrcode != undefined) {
                await superagent
                    .post(data?.wh_qrcode)
                    .send(object)
                    .queue('qrcode')
                    .end(function () {
                        console?.log('webhooks status message....')
                    });
                if (data?.wh_qrcode == '') {
                    console?.log('Webhook no defined')
                }
            }

        } catch (error) {
            console?.log(error)
        }
    }
}