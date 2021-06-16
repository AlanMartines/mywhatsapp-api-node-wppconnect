const conn = require('../config/dbConnection').promise();
const serverConfig = require("../config/server.config.json");

var todayDate = new Date().toISOString().slice(0, 10);

exports.verify = async (req, res, next) => {
  try {
    if (serverConfig.validate_mysql === true) {
      if (!req.body.SessionName) {
        res.status(422).json({
          "Status": {
            "result": "info",
            "state": "FAILURE",
            "status": "notLogged",
            "message": "Token não informado, verifique e tente novamente"
          }
        });
      } else {
        //
        if (!req.body.AuthorizationToken) {
          var theToken = req.body.AuthorizationToken;
        } else {
          var theToken = req.body.SessionName;
        }
        //
        const sql = "SELECT * FROM tokens WHERE token=? LIMIT 1";
        const values = [theToken];
        const [rows] = await conn.execute(sql, values);
        //
        if (rows.length > 0) {
          //
          const results = JSON.parse(JSON.stringify(rows));
          //
          const tokenToken = results[0].token;
          const tokenEndDate = results[0].datafinal;
          const tokenActive = results[0].active;
          //
          req.userToken = tokenToken;
          //
          if (tokenActive !== 'true') {
            return res.status(401).json({
              "Status": {
                "result": "info",
                "state": "FAILURE",
                "status": "notLogged",
                "message": "Token não habilitado para uso, contate o administrador do sistema"
              }
            });
          }
          //
          if (tokenEndDate < todayDate) {
            return res.status(408).json({
              "Status": {
                "result": "info",
                "state": "FAILURE",
                "status": "notLogged",
                "message": "Token vencido, contate o administrador do sistema"
              }
            });
          }
          //
          next();
        } else {
          return res.status(404).json({
            "Status": {
              "result": "info",
              "state": "FAILURE",
              "status": "notLogged",
              "message": "Token não encontrado, verifique e tente novamente"
            }
          });
        }
      }
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      "Status": {
        "result": "info",
        "state": "FAILURE",
        "status": "notLogged",
        "message": "Erro na verificação do token, contate o administrador do sistema"
      }
    });
  }
}