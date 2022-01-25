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
	var instance = 4;
	const result = Validate.validate(instance, req.body);
	console.log("- Validator:", result);
	//
	} catch (error) {
	//
	console.log("- Validator error:", error);
	//
	}
//
}