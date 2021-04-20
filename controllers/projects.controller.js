const express = require("express");
const bcrypt = require("bcryptjs");
const authMiddlewares = require("../middlewares/auth");
const authConfig = require("../config/auth.config");
const User = require("../models/user.model");

const router = express.Router();

router.use(authMiddlewares);

router.post("/", async (req, res, next) => {

  res.status(200).send({
    success: true,
    user: req.userID
  });
});
//
router.post("/create_token", async (req, res, next) => {
  const {
    id
  } = req.userID;
  try {
    //
    const user = await User.findOne({
      id
    });

    if (!user)
      return res.status(400).send({
        message: "User not found."
      });
    const accessToken = await bcrypt.hash(authConfig.secret, authConfig.saltRounds);
    //
    await User.findByIdAndUpdate(user.id, {
      $set: {
        token: accessToken
      }
      //
    });
    //
    return res.status(200).send({
      token: accessToken,
      message: "Createde token."
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      message: "Create token faild."
    });
  }
});
//
//module.exports = app => app.use("/projects", router);
module.exports = router;