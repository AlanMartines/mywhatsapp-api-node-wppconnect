//
const validator = require('json-file-validator').full;
//
exports.verify = async (req, res, next) => {
	//
	try {
	//
	console.log("Validator", req.body);
	//
	console.log((validator.test(req.body)) ? 'Correct' : 'Wrong');
	//
	} catch (error) {
	//
	console.log("- Validator error:", error);
	//
	}
//
}