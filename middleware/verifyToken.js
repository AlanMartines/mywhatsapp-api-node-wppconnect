const config = require('../config.global');
//
exports.verify = async (req, res, next) => {
	//
	if (!req.body.AuthorizationToken) {
		res.setHeader('Content-Type', 'application/json');
		res.status(400).json({
			"Status": {
				"result": "info",
				"state": "FAILURE",
				"status": "notProvided",
				"message": "AuthorizationToken não informado, verifique e tente novamente"
			}
		});
	} else {
		//
		const theTokenAuth = req.body.AuthorizationToken;
		//
		if (theTokenAuth == config.SECRET_KEY) {
			next();
		} else {
			let socket = req.io;
				//
				socket.emit('status',
					{
						state: "FAILURE",
						status: 'notProvided',
						SessionName: req.body.SessionName,
						message: "Secret key não autorizada, verifique e tente novamente"
					}
				);
				//
			res.setHeader('Content-Type', 'application/json');
			return res.status(400).json({
				"Status": {
					"result": "info",
					"state": "FAILURE",
					"status": "notProvided",
					"message": "Secret key não autorizada, verifique e tente novamente"
				}
			});
		}
	}
}