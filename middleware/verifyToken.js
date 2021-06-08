const conn = require('../config/dbConnection').promise();
const serverConfig = require("../config/server.config.json");

var todayDate = new Date().toISOString().slice(0, 10);

exports.verify = async (req, res, next) => {
  try {
    if (serverConfig.validate_mysql === true) {
      if (!req.body.AuthorizationToken) {
        res.status(422).json({
          auth: false,
          message: "Token não informado",
        });
      } else {
        //
        const theToken = req.body.AuthorizationToken;
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
          const tokenPay = results[0].pay;
          //
          req.userToken = tokenToken;
          //
          if (tokenPay !== 'true') {
            return res.status(400).json({
              auth: false,
              token: tokenToken,
              message: 'Token Bad Request'
            });
          }
          //
          if (tokenActive !== 'true') {
            return res.status(401).json({
              auth: false,
              token: tokenToken,
              message: 'Token Unauthorized'
            });
          }
          //
          if (tokenEndDate < todayDate) {
            return res.status(408).json({
              auth: false,
              token: tokenToken,
              message: 'Token Request Timeout'
            });
          }
          //
          next();
        } else {
          return res.status(404).json({
            auth: false,
            token: tokenToken,
            message: 'Token Not Found'
          });
        }
      }
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      auth: false,
      token: tokenToken,
      message: 'Bad Request'
    });
  }
}