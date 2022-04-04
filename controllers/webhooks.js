const Sessions = require("../sessions.js");
const superagent = require('superagent');
require('superagent-queue');
require('dotenv').config();

module.exports = class Webhooks {

	static async wh_messages(data, response) {
		//let data = Sessions?.getSession(session);
		try {
			if (data?.wh_message != undefined && data?.wh_message != null && data?.wh_message != '') {
				await superagent
					.post(data?.wh_message)
					.send(response)
					.set('Accept', 'application/json')
					.queue('messages')
					.end(function () {
						console?.log('- Webhooks receive message')
					});
				if (data?.wh_message == '') {
					console?.log('- Webhook no defined');
				}
			} else {
				console?.log('- Webhook no defined');
			}
		} catch (error) {
			console?.log(error)
		}
	}

	static async wh_connect(data, response, phone = null) {
		//let data = Sessions?.getSession(session)
		try {
			var object = {
				"wook": 'STATUS_CONNECT',
				'result': 200,
				'session': data.name,
				'state': data.state,
				'status': data.status,
				'number': phone
			}

			if (data?.wh_connect != undefined && data?.wh_connect != null && data?.wh_connect != '') {
				await superagent
					.post(data?.wh_connect)
					.send(object)
					.queue('connection')
					.end(function () {
						console?.log('- Webhooks connect status')
					});
				if (data?.wh_connect == '') {
					console?.log('- Webhook no defined')
				}
			} else {
				console?.log('- Webhook no defined');
			}
		} catch (error) {
			console?.log(error)
		}

	}

	static async wh_status(data, response) {
		//let data = Sessions?.getSession(session)
		try {
			if (data?.wh_status != undefined && data?.wh_status != null && data?.wh_status != '') {
				await superagent
					.post(data?.wh_status)
					.send(response)
					.queue('status')
					.end(function () {
						console?.log('- Webhooks status message')
					});
				if (data?.wh_status == '') {
					console?.log('- Webhook no defined')
				}
			} else {
				console?.log('- Webhook no defined');
			}
		} catch (error) {
			console?.log(error)
		}
	}

	static async wh_qrcode(data, response, urlCode) {
		//let data = Sessions?.getSession(session)
		try {
			let object = {
				"wook": 'QRCODE',
				'result': 200,
				'session': data.name,
				'state': data.state,
				'status': data.status,
				'qrcode': response,
				'urlCode': urlCode
			}
			if (data?.wh_qrcode != undefined && data?.wh_qrcode != null && data?.wh_qrcode != '') {
				await superagent
					.post(data?.wh_qrcode)
					.send(object)
					.queue('qrcode')
					.end(function () {
						console?.log('- Webhooks status message')
					});
				if (data?.wh_qrcode == '') {
					console?.log('- Webhook no defined')
				}
			} else {
				console?.log('- Webhook no defined');
			}
		} catch (error) {
			console?.log(error);
		}
	}
}