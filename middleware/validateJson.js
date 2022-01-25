//
const validatorFull = require('json-file-validator').full;
const validatorBasic = require('json-file-validator').basic;
//
exports.verify = async (req, res, next) => {
	//
	try {
	//
	console.log("Validator:\n", req.body);
	//
	let content = req.body;
	let teste = {
		"name": "John",
		"lastname": "Doe",
		"age": 35
	};
	//let resultFull = content.match(validatorFull);
	let resultBasic = validatorBasic.test(content);
	let resultTeste = validatorBasic.test(teste);
	//
	//console.log("- resultFull:", resultFull);
	console.log("- resultBasic:", resultBasic);
	console.log("- resultTeste:", resultTeste);
	//
	} catch (error) {
	//
	console.log("- Validator error:", error);
	//
	}
//
}