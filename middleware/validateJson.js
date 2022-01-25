//
const Validator = require('jpv');
//
exports.verify = async (req, res, next) => {
	//
	try {
		const value = Validator.validate(req) // true
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