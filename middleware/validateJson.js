//
const Validator = require('json-schema-validator');
//
exports.verify = async (req, res, next) => {
  //
	Validator.simple('http://json-schema.org/geo', function (error, v) {
    assert.ifError(error);

    assert(v.validate(
        {latitude: 53.0, longitude: 43.0},
        'http://json-schema.org/geo'
    ).valid);

    done();
});
	//
	console.log();
	//
}