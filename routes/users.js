var express = require("express");
var router = express.Router();
const Validator = require("fastest-validator");
const { Users } = require("../models");

const v = new Validator();

// GET ALL USERS
router.get("/", async (req, res, next) => {
  const todo_list = await Users.findAll();

  res.status(200).json({
    status: 200,
    msg: "Get all users.",
    data: todo_list,
    errors: [],
  });
});

module.exports = router;
