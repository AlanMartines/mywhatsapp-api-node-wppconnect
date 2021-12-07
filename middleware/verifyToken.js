const config = require('../config.global');
//
var todayDate = new Date().toISOString().slice(0, 10);
//
exports.verify = async (req, res, next) => {
  //
  if (!req.body.SessionName) {
    res.setHeader('Content-Type', 'application/json');
    res.status(422).json({
      "Status": {
        "result": "info",
        "state": "FAILURE",
        "status": "notProvided",
        "message": "SessionName não informado, verifique e tente novamente"
      }
    });
  } else {
    //if (!req.body.AuthorizationToken) {
    if (!req.body.SessionName) {
      res.setHeader('Content-Type', 'application/json');
      res.status(422).json({
        "Status": {
          "result": "info",
          "state": "FAILURE",
          "status": "notProvided",
          "message": "Token não informado, verifique e tente novamente"
        }
      });
    } else {
      //
      if (parseInt(config.VALIDATE_MYSQL) == true) {
        try {
          //const theTokenAuth = req.body.AuthorizationToken.trim();
          const theTokenAuth = req.body.SessionName.replace(/\r?\n|\r|\s+/g, "");
          //
          if (theTokenAuth) {
            console.log("- AuthorizationToken:", theTokenAuth);
          } else {
            res.setHeader('Content-Type', 'application/json');
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
          const conn = require('../config/dbConnection');
          const sql = "SELECT * FROM tokens WHERE token=? LIMIT 1";
          const values = [theTokenAuth];
          const [row] = await conn.promise().execute(sql, values);
          //conn.end();
          //conn.release();
          //
          if (row.length > 0) {
            //
            const results = JSON.parse(JSON.stringify(row[0]));
            //
            const tokenToken = results.token.trim();
            const tokenEndDate = results.datafinal;
            const tokenActive = results.active;
            //
            req.userToken = tokenToken;
            //
            if (tokenActive !== 'true') {
              res.setHeader('Content-Type', 'application/json');
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
              res.setHeader('Content-Type', 'application/json');
              return res.status(408).json({
                "Status": {
                  "result": "info",
                  "state": "FAILURE",
                  "status": "notValid",
                  "message": "Token vencido, contate o administrador do sistema"
                }
              });
            }
            //
            next();
          } else {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({
              "Status": {
                "result": "info",
                "state": "FAILURE",
                "status": "notProvided",
                "message": "Token não encontrado, verifique e tente novamente"
              }
            });
          }
        } catch (err) {
          console.log("- Error:", err);
          res.setHeader('Content-Type', 'application/json');
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
  }
}