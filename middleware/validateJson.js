//
const Validator = require('jsonschema').Validator;
const Validate = new Validator();
//
exports.verify = async (req, res, next) => {
	//
	try {
	//
	console.log("Validator", req.body);
	//
	const result = Validate.validate(req.body);
	console.log("- Validator:", result);
	//
	} catch (error) {
	//
	console.log("- Validator error:", error);
	//
	}
//
}