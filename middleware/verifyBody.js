const config = require('../config.global');
const yup = require("./validator");
//
//
async function validateBody(schema, req, res, next) {
  return schema.validate(req.body, {
    abortEarly: false
  }).then(_ => {
    next();
  }).catch((err) => {
    var erro = err.inner.map(item => {
      return {
        campo: item.path,
        message: item.message
      };
    });
    res.status(400).json({
      "Status": {
        "erro": true,
        "status": 404,
        "message": "Preencha os campos obrigatório(s)"
      },
      "validate": erro
    });
  });
}
//
//
exports.Started = async (req, res, next) => {
  //
  let schema = yup.object().shape({
    AuthorizationToken: yup.string().required(),
    SessionName: yup.string().required()
  });
  //
  await validateBody(schema, req, res, next);
}
//
//
exports.QrCode = async (req, res, next) => {
  //
  let schema = yup.object().shape({
    AuthorizationToken: yup.string().required(),
    SessionName: yup.string().required(),
    View: yup.string().required()
  });
  //
  await validateBody(schema, req, res, next);
}
//
exports.Usage = async (req, res, next) => {
  //
  let schema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required()
  });
  //
  await validateBody(schema, req, res, next);
}
//
exports.Group = async (req, res, next) => {
  //
  let schema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required()
  });
  //
  await validateBody(schema, req, res, next);
}
//
exports.Data = async (req, res, next) => {
  //
  let schema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required()
  });
  //
  await validateBody(schema, req, res, next);
}
//
exports.Phone = async (req, res, next) => {
  //
  let schema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required()
  });
  //
  await validateBody(schema, req, res, next);
}