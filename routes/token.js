require("dotenv").config();

var express = require("express");
var router = express.Router();
const Validator = require("fastest-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { Users } = require("../models");

const v = new Validator();

router.post("/", async (req, res, next) => {
  try {
    const refresh_token = req.cookies.refreshToken;

    if (!refresh_token) {
      return res.status(401).json({
        status: 401,
        msg: "Unauthorized.",
        errors: [
          {
            message: "Unautorized Access.",
          },
        ],
      });
    }

    // Check User

    try {
      const user = await Users.findOne({
        where: {
          refresh_token: refresh_token,
        },
      });

      if (!user) {
        return res.status(401).json({
          status: 401,
          msg: "Unauthorized.",
          errors: [
            {
              message: "Unautorized Access.",
            },
          ],
        });
      }

      jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err) {
            return res.status(401).json({
              status: 401,
              msg: "Unauthorized.",
              errors: [
                {
                  message: `Unauthorized.`,
                },
              ],
            });
          }

          const access_token = jwt.sign(
            {
              userId: user.id,
              name: user.name,
              email: user.email,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "60s",
            }
          );

          return res.status(200).json({
            status: 200,
            msg: "Token Refreshed.",
            access_token: access_token,
            refresh_token: refresh_token,
            errors: [],
          });
        }
      );
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      msg: "An Error Occured.",
      errors: error,
    });
  }
});

module.exports = router;
