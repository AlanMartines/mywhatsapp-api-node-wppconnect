const fs = require('fs');
const path = require('path');

module.exports = app => {
  fs
    .readdirSync(__dirname)
    .filter(file => ((file.indexOf(".")) !== 0 && (file.indexOf(".") !== "index.js")))
    .forEach(file => require(path.relative(__dirname, file))(app));
};