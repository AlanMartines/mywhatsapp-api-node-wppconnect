const yup = require("yup");
//
yup.setLocale({
  mixed: {
    default: "Valor informado é inválido",
    required: 'Preencha esse campo para continuar',
    oneOf: "Preencha com um dos seguintes valores: ${values}",
    notOneOf: "Não preencha com um dos seguintes valores: ${values}"
  },
  string: {
    length: "Valor deve ter exatamente ${length} caracteres",
    min: 'Valor muito curto (mínimo ${min} caracteres)',
    max: 'Valor muito longo (máximo ${max} caracteres)',
    email: 'Preencha um e-mail válido',
    url: "Preencha com um formato de URL válida",
    trim: "Valor não deve conter espaços no início ou no fim.",
    lowercase: "Valor deve estar em maiúsculo",
    uppercase: "Valor deve estar em minúsculo"
  },
  boolean: {
    oneOf: "Preencha com um dos seguintes valores: ${values}",
  },
  number: {
    min: 'Valor inválido (deve ser maior ou igual a ${min})',
    max: 'Valor inválido (deve ser menor ou igual a ${max})',
    lessThan: "Valor deve ser menor que ${less}",
    moreThan: "Valor deve ser maior que ${more}",
    notEqual: "Valor não pode ser igual à ${notEqual}",
    positive: "Valor deve ser um número posítivo",
    negative: "Valor deve ser um número negativo",
    integer: "Valor deve ser um número inteiro"
  },
  date: {
    min: "Data deve ser maior que a data ${min}",
    max: "Data deve ser menor que a data ${max}"
  },
  array: {
    min: "Valor ter no mínimo ${min} itens",
    max: "Valor ter no máximo ${max} itens"
  }
});
//
module.exports = yup;