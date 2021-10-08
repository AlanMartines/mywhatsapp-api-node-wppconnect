//require('dotenv/config');
/*
require("dotenv").config({
  path: "./.env"
});
*/
const config = require('../config.global');
//
var todayDate = new Date().toISOString().slice(0, 10);
//
exports.verify = async (req, res, next) => {
  //
  //console.log(req.body);
  //
  if (config.VALIDATE_MYSQL == 'true') {
    const conn = require('../config/dbConnection').promise();
    try {
      if (!req.body.SessionName) {
        res.status(422).json({
          "Status": {
            "result": "info",
            "state": "FAILURE",
            "status": "notProvided",
            "message": "Nome da sessão não informado, verifique e tente novamente"
          }
        });
      } else {
        //
        const bearerHeader = req.headers['authorization'];
        const theTokenAuth = req.body.AuthorizationToken;
        const theTokenSess = req.body.SessionName;
        //
        if (bearerHeader) {
          const bearer = bearerHeader.split(' ');
          const bearerToken = bearer[1];
          var theToken = bearerToken;
          console.log("- Authorization Bearer:", bearerToken);
        } else if (theTokenAuth) {
          var theToken = theTokenAuth;
          console.log("- AuthorizationToken:", theTokenAuth);
        } else if (theTokenSess) {
          var theToken = theTokenSess;
          console.log("- SessionName:", theTokenSess);
        } else {
          res.status(422).json({
            "Status": {
              "result": "info",
              "state": "FAILURE",
              "status": "notProvided",
              "message": "Token não informado, verifique e tente novamente"
            }
          });
        }
        //
        //const conn = pool.getConnection();
        const sql = "SELECT * FROM tokens WHERE token=? LIMIT 1";
        const values = [theToken];
        const [row] = await conn.execute(sql, values);
        //conn.release();
        //
        if (row.length > 0) {
          //
          const results = JSON.parse(JSON.stringify(row[0]));
          //
          const tokenToken = results.token;
          const tokenEndDate = results.datafinal;
          const tokenActive = results.active;
          //
          req.userToken = tokenToken;
          //
          if (tokenActive !== 'true') {
            return res.status(401).json({
              "Status": {
                "result": "info",
                "state": "FAILURE",
                "status": "notUsage",
                "message": "Token não habilitado para uso, contate o administrador do sistema"
              }
            });
          }
          //
          if (todayDate > tokenEndDate) {
            return res.status(408).json({
              "Status": {
                "result": "info",
                "state": "FAILURE",
                "status": "notValid",
                "message": "Token vencido, efetue a renovação"
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
              "status": "notProvided",
              "message": "Token não encontrado, verifique e tente novamente"
            }
          });
        }
      }
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        "Status": {
          "result": "info",
          "state": "FAILURE",
          "status": "notChequed",
          "message": "Erro na verificação do token, contate o administrador do sistema"
        }
      });
    }
  } else {
    next();
  }
}