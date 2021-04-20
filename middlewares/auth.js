const jwt = require('jsonwebtoken');
const authConfig = require("../config/auth.config.json");

module.exports = (req, res, next) => {
  const authHeader = req.headers['x-access-token'] || req.headers['authorization'];

  if (!authHeader)
    return res.status(401).send({
      auth: false,
      message: "No token provider."
    });

  const parts = authHeader.split(" ");

  if (!parts.length === 2)
    return res.status(401).send({
      auth: false,
      message: "Token error."
    });

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme))
    return res.status(401).send({
      auth: false,
      message: "Token malformatted."
    });

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err)
      return res.status(401).send({
        auth: false,
        message: "Failed to authenticate token."
      });

    if (decoded.exp * 1000 <= Date.now())
      return res.status(400).send({
        auth: false,
        error: 'Access expired, try again.'
      });

    req.userID = decoded.id;
    return next();
  });
};