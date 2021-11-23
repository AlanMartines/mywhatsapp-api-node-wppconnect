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
        result: 'error',
        state: 'STARTING',
        status: 'valueRequired',
        message: "Preencha o(s) campo(s) obrigatório(s)"
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
    View: yup.mixed().oneOf([true, false])
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
exports.sendTextMassa = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    msg: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.sendVoiceBase64 = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    phonefull: yup.string().required(),
    base64: yup.string().required(),
    mimetype: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.sendContactVcard = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    phonefull: yup.string().required(),
    contact: yup.string().required(),
    namecontact: yup.string().required().matches(/^[A-Za-z0-9 ]*$/, 'Por favor insira um nome válido')
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.sendText = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    phonefull: yup.string().required(),
    msg: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.sendLocation = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    phonefull: yup.string().required(),
    lat: yup.string().required().matches(/^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,15}/g, 'Por favor insira uma lat válido Ex.: -00.00000'),
    long: yup.string().required().matches(/^-?(([-+]?)([\d]{1,3})((\.)(\d+))?)/g, 'Por favor insira uma long válido Ex.: -00.00000'),
    local: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.sendLinkPreview = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    phonefull: yup.string().required(),
    link: yup.string().required().matches(/^((http|https):\/\/)?(www.)?(?!.*(http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+(\/)?.([\w\?[a-zA-Z-_%\/@?]+)*([^\/\w\?[a-zA-Z0-9_-]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/, "Informe um endereço válido!"),
    descricao: yup.string().required()

    // 
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.sendFileBase64 = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    phonefull: yup.string().required(),
    base64: yup.string().required(),
    originalname: yup.string().required(),
    caption: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.sendFileToBase64 = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    phonefull: yup.string().required(),
    caption: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.sendFileFromBase64 = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    phonefull: yup.string().required(),
    base64: yup.string().required(),
    mimetype: yup.string().required(),
    originalname: yup.string().required(),
    caption: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.sendTextGrupo = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    groupId: yup.string().required(),
    msg: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.sendLocationGroup = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    groupId: yup.string().required(),
    lat: yup.string().required().matches(/^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,15}/g, 'Por favor insira uma lat válido Ex.: -00.00000'),
    long: yup.string().required().matches(/^-?(([-+]?)([\d]{1,3})((\.)(\d+))?)/g, 'Por favor insira uma long válido Ex.: -00.00000'),
    local: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.sendFileGroup = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    groupId: yup.string().required(),
    caption: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.sendFileBase64Group = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    groupId: yup.string().required(),
    base64: yup.string().required(),
    originalname: yup.string().required(),
    caption: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.sendFileFromBase64Group = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    groupId: yup.string().required(),
    base64: yup.string().required(),
    mimetype: yup.string().required(),
    originalname: yup.string().required(),
    caption: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.setGroup = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    groupId: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.createGroup = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    title: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.createGroupCount = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    title: yup.string().required(),
    count: yup.number().required().integer()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.partGroup = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    groupId: yup.string().required(),
    phonefull: yup.string().required()
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.linkGroup = async (req, res, next) => {
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    InviteCode: yup.string().required().matches(/^((http|https):\/\/)?(www.)?(?!.*(http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+(\/)?.([\w\?[a-zA-Z-_%\/@?]+)*([^\/\w\?[a-zA-Z0-9_-]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/, "Informe um endereço válido!")
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//
exports.Imagen = async (req, res, next) => {
  //
  const FILE_SIZE = 1 * 1024;
  const SUPPORTED_FORMATS = [
    "image/jpg",
    "image/jpeg",
    "image/gif",
    "image/png"
  ];
  //
  let validationSchema = yup.object().shape({
    AuthorizationToken: yup.string(),
    SessionName: yup.string().required(),
    file: yup.mixed().required()
      .test("fileSize", "Seu arquivo é muito grande", (value) => {
        if (value.size > 0) {
          return false;
        }
      })
      .test('fileType', "Your Error Message", (value) => value && SUPPORTED_FORMATS.includes(value.type))
  });
  //
  await validateBody(validationSchema, req, res, next);
}
//
// ------------------------------------------------------------------------------------------------//
//