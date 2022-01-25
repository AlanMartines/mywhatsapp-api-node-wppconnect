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

	console.log((result) ? true : false);
	//
	} catch (error) {
	//
	console.log("- Validator error:", error);
	//
	}
//
}