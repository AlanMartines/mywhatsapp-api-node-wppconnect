const config = require('../config.global');
//
exports.verify = async (req, res, next) => {
	//
	if (!req.body.AuthorizationToken) {
		res.setHeader('Content-Type', 'application/json');
		res.status(422).json({
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
			res.setHeader('Content-Type', 'application/json');
			return res.status(404).json({
				"Status": {
					"result": "info",
					"state": "FAILURE",
					"status": "notProvided",
					"message": "Key não autorizada, verifique e tente novamente"
				}
			});
		}
	}
}