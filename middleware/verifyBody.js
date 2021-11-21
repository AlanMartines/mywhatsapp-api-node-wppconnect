const config = require('../config.global');
const yup = require("./validator");
//
// ------------------------------------------------------------------------------------------------//
//
async function validateBody(validationSchema, req, res, next) {
  return validationSchema.validate(req.body, {
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
    res.setHeader('Content-Type', 'application/json');
    res.status(400).json({
      "Status": {
        "erro": true,
        "status": 404,
        "message": "Preencha o(s) campo(s) obrigatório(s)"
      },
      "validate": erro
    });
  });
}
//
// ------------------------------------------------------------------------------------------------//
//
async function checkIfFilesAreTooBig(file) {
  let valid = true
  if (file) {
    files.map(file => {
      const size = file.size / 1024 / 1024
      if (size > 0) {
        valid = false
      }
    })
  }
  return valid
}
//
// ------------------------------------------------------------------------------------------------//
//
/*
╔═╗┌─┐┌┬┐┌┬┐┬┌┐┌┌─┐  ┌─┐┌┬┐┌─┐┬─┐┌┬┐┌─┐┌┬┐
║ ╦├┤  │  │ │││││ ┬  └─┐ │ ├─┤├┬┘ │ ├┤  ││
╚═╝└─┘ ┴  ┴ ┴┘└┘└─┘  └─┘ ┴ ┴ ┴┴└─ ┴ └─┘─┴┘
*/
//
exports.Started = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string().trim(),
    SessionName: yup.string().required().trim()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.QrCode = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string().trim(),
    SessionName: yup.string().required().trim(),
    View: yup.mixed().required().oneOf([true, false])
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
/*
╔╗ ┌─┐┌─┐┬┌─┐  ╔═╗┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐  ┬ ┬┌─┐┌─┐┌─┐┌─┐
╠╩╗├─┤└─┐││    ╠╣ │ │││││   │ ││ ││││└─┐  │ │└─┐├─┤│ ┬├┤ 
╚═╝┴ ┴└─┘┴└─┘  ╚  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘└─┘  └─┘└─┘┴ ┴└─┘└─┘
*/
//
exports.Usage = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    phonefull: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.sendVoice = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    phonefull: yup.string().required(),
    file: yup.mixed().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.Group = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    phonefull: yup.string().required(),
    audio_data: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//