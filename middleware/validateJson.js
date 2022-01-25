//
const Validator = require('joi');
//
exports.verify = async (req, res, next) => {
	//
	try {
		const value = await schema.validateAsync(req);
	//
	console.log("Validator", value);
	//
	} catch (error) {
	//
	console.log("- Validator error:", error);
	//
	}
//
}