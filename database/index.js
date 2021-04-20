const mongoose = require('mongoose');
const serverConfig = require("../config/server.config.json");
//
mongoose.Promise = global.Promise;
mongoose.connect(serverConfig.local_mongo_conn_url + serverConfig.mongo_db_name, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

module.exports = mongoose;