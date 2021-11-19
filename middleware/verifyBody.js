const config = require('../config.global');
const yup = require("./validator");
//
exports.Start = async (req, res, next) => {
  //
  let schema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required()
  });
  //
  return schema.validate(req.body, {
    abortEarly: false
  }).then(_ => {
    next();
  }).catch(err => {
    var erro = err.inner.map(item => {
      return {
        path: item.path,
        message: item.message,
        label: item.params.label
      };
    });
    res.send(erro);
  });
  //
}