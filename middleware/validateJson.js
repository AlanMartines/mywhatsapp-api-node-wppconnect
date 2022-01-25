//
const validator = require('json-file-validator').full;
//
exports.verify = async (req, res, next) => {
	//
	try {
	//
	console.log("Validator", req.body);
	//
	let result = content.match(validator);
	let content = req.body;
	console.log((result) ? true : false);
	//
	} catch (error) {
	//
	console.log("- Validator error:", error);
	//
	}
//
}