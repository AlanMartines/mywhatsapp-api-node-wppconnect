// https://www.npmjs.com/package/json-file-validator
//
const validatorFull = require('json-file-validator').full;
const validatorBasic = require('json-file-validator').basic;
const { body, validationResult } = require('express-validator');
//
exports.verify = async (req, res, next) => {
	//
	console.log("- Validando syntax json");
	//
	try {
		//
		//let content = req.body;
		//let resultBasic = validatorBasic.test(content);
		const errors = validationResult(req);
		//
		if (!errors.isEmpty()) {
			next();
		} else {
			res.setHeader('Content-Type', 'application/json');
			return res.status(404).json({
				"Status": {
					"result": "error",
					"state": "FAILURE",
					"status": "notProvided",
					"message": "Json gerado de forma incorreta, efetue a correção e tente novamente"
				}
			});
		}
		//
	} catch (error) {
		console.log("- Validator error:", error);
		res.setHeader('Content-Type', 'application/json');
		res.status(404).json({
			"Status": {
				"result": "error",
				"state": "FAILURE",
				"status": "notProvided",
				"message": "Erro na validação do json gerado, verifique e tente novamente"
			}
		});
	}
	//
}