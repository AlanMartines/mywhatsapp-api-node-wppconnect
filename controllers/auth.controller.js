const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../modules/mailer");

const authConfig = require("../config/auth.config");

const User = require("../models/user.model");
const router = express.Router();
//
/*
function verifyJWT(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(401).json({
    auth: false,
    message: 'No token provided.'
  });
  //
  jwt.verify(token, authConfig.secret, function(err, decoded) {
    if (err) return res.status(500).json({
      auth: false,
      message: 'Failed to authenticate token.'
    });

    // se tudo estiver ok, salva no request para uso posterior
    req.userId = decoded.id;
    next();
  });
}
*/
//
//
function generateToken(params = {}) {
  //
  const payload = params;
  const secret = authConfig.secret;
  const options = {
    algorithm: "HS256",
    expiresIn: 86400,
  };
  //
  return jwt.sign(payload, secret, options);
}
//
router.post("/register", async (req, res, next) => {
  const {
    email,
    userName
  } = req.body;
  try {
    if (await User.findOne({
        userName
      }))
      return res.status(400).send({
        message: "User already exists."
      });
    //
    if (await User.findOne({
        email
      }))
      return res.status(400).send({
        message: "E-mail already exists."
      });
    const user = await User.create(req.body);
    user.password = undefined;
    return res.send({
      user,
      token: generateToken({
        iss: "API - Venom/WPPConnect",
        id: user.id,
        iss: user.userName,
        admin: user.admin,
      }),
    });
  } catch (err) {
    return res.status(400).send({
      message: "Registration faild."
    });
  }
});
//
router.post("/authenticate", async (req, res, next) => {
  const {
    email,
    password
  } = req.body;

  const user = await User.findOne({
    email
  }).select("+password");
  if (!user)
    return res.status(400).send({
      auth: false,
      message: "User not found"
    });

  if (!await bcrypt.compare(password, user.password))
    return res.status(400).send({
      auth: false,
      message: "Invalid password."
    });

  user.password = undefined;

  res.send({
    user,
    token: generateToken({
      id: user.id
    }),
  });
});
//
router.post("/forgot_password", async (req, res, next) => {
  const {
    email
  } = req.body;
  try {
    const user = await User.findOne({
      email
    });

    if (!user)
      return res.status(400).send({
        error: "User not found."
      });

    const token = crypto.randomBytes(20).toString("hex");

    const now = new Date();
    now.setHours(now.getHours() + 1);
    //
    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now
      }
      //
    });
    //
    mailer.sendMail({
      to: email,
      from: "alancpmartines@hotmail.com",
      template: '../resources/mail/auth/password-reset',
      context: {
        token
      },
    }, (err) => {

      if (err)
        return res.status(400).send({
          message: "Cannot send fotgot password email."
        });
      //
      res.status(200).send({
        message: "Forgotten password verification email sender."
      });
    });
    //
  } catch (err) {
    res.status(400).send({
      message: "Erro on forgot password, try again."
    });
  }
});
//
//module.exports = app => app.use("/auth", router);
module.exports = router;