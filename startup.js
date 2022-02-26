const config = require('./config.global');
const Sessions = require("./sessions.js");
const tokenPatch = config.tokenPatch;
//
async function getAllSessions() {
	try {
		const SessionsArray = [];
		if (snapshot.empty) {
			return null;
		} else {
			snapshot.forEach(doc => {
				const Session = new SessionsDB(
					doc.id,
					doc.data().session,
					doc.data().apitoken,
					doc.data().sessionkey,
					doc.data().wh_status,
					doc.data().wh_message,
					doc.data().wh_qrcode,
					doc.data().wh_connect,
					doc.data().WABrowserId,
					doc.data().WASecretBundle,
					doc.data().WAToken1,
					doc.data().WAToken2,
					doc.data().Engine
				);
				SessionsArray.push(Session);
			});
			return (SessionsArray);
		}
	} catch (error) {
		return (error.message);
	}
}

async function startAllSessions() {
	let dados = await getAllSessions()
	if (dados != null) {
		dados.map((item) => {
			var options = {
				'method': 'POST',
				'json': true,
				'url': `http://127.0.0.1:${config.PORT}`,
				'body': {
					"session": item.session,
					"wh_connect": item.wh_connect,
					"wh_qrcode": item.wh_qrcode,
					"wh_status": item.wh_status,
					"wh_message": item.wh_message
				}

			};
			request(options).then(result => {
				console.log(result)
			}).catch(error => {
				console.log(error)
			})
		});

	}
}
export default { startAllSessions };