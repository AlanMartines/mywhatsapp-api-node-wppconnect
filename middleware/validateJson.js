//
const Validator = require('jpv');
//
exports.verify = async (req, res, next) => {
	//
	const json = {
		status : "OK",
		data : {
			url : "http://example.com"
		}
	}
	//
	try {
		const value = Validator.validate(json) // true
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