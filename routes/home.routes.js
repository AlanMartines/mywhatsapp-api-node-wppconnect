const express = require("express");
const router = express.Router();
//
// ------------------------------------------------------------------------------------------------------- //
//
router.get("/", async (req, res) => {
  res.render("home/index");
});
//
router.get("/politica-de-cookies", async (req, res) => {
  res.render("home/politica-de-cookies");
});
//
// ------------------------------------------------------------------------------------------------------- //
//
module.exports = router;