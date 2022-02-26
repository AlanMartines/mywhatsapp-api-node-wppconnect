const config = require('../config.global');
const tokenPatch = config.tokenPatch;
//
module.exports = class startAll {
  //
  static async getAllSessions() {
	try {
		const SessionsArray = [];
		//
		fs.readdir(dirname, function (err, files) {
			if (err) {
				// some sort of error
			} else {
				if (files.length) {
					//
					fs.readdirSync(tokenPatch).forEach(SessionName => {
						if (SessionName.split('.')[2] === 'json') {
							console.log(`- File json Session: ${SessionName.split('.')[0]}`);
							SessionsArray.push(SessionName.split('.')[0]);
						}
						//
					});
					//
				}
			}
		});
		//
		console.log(SessionsArray);
		return (SessionsArray);
	} catch (error) {
		return (error.message);
	}
}

static async startAllSessions() {
	let dados = await startAll.getAllSessions();
	if (dados != null) {
		dados.map((SessionName) => {
			var options = {
				'method': 'POST',
				'json': true,
				'url': `http://127.0.0.1:${config.PORT}`,
				'body': {
					"SessionName": SessionName,
					"MultiDevice": true,
					"whatsappVersion": null
				}

			};
			request(options).then(result => {
				console.log(result);
			}).catch(error => {
				console.log(error);
			})
		});

	}
}
}