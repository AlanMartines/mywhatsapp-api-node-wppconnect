const config = require('../config.global');
const yup = require("./validator");
//
//
async function validateBody(schema, req, res, next) {
  return schema.validate(req.body, {
    abortEarly: false
  }).then(_ => {
    next();
  }).catch(err => {
    var erro = err.inner.map(item => {
      return {
        "erro": true,
        "status": 404,
        path: item.path,
        message: item.message
      };
    });
    res.status(400).json({
      "Status": erro
    });
  });
}
//
//
exports.Start = async (req, res, next) => {
  //
  let schema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required()
  });
  //
  await validateBody(schema, req, res, next);
}
//
exports.Body = async (req, res, next) => {
  //
  let schema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required()
  });
  //
  await validateBody(schema, req, res, next);
}