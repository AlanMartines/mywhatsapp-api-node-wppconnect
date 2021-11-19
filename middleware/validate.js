const yup = require("./validator");

const schema = yup.object().shape({
  name: yup
    .string()
    .email()
    .required(),
  password: yup.string().required()
});

const validate = (schema, data, res, next) => {
  return schema
    .validate(data, {
      abortEarly: false
    })
    .then(_ => {
      next();
    })
    .catch(err => {
      var erro = err.inner.map(item => {
        return {
          path: item.path,
          message: item.message,
          label: item.params.label
        };
      });
      res.send(erro);
    });
};

module.exports = validate;