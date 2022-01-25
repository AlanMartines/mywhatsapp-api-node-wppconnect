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
	let resultFull = content.match(validatorFull);
	let resultBasic = validatorBasic.test(content);
	//
	console.log("- resultFull:", resultFull);
	console.log("- resultBasic:", resultBasic);
	//
	} catch (error) {
	//
	console.log("- Validator error:", error);
	//
	}
//
}