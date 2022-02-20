require('dotenv').config();

var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { Users } = require('../models');

const v = new Validator();

// Register
router.post('/register', async (req, res, next) => {
  const { name, email, password, confirmPassword} = req.body;
  
  const schema = {
    name: 'string|min:6',
    email: 'string|email',
    password: 'string|min:6',
    confirmPassword: { type: "equal", field: "password" }
  };

  const validate = v.validate(req.body, schema);

  if(validate.length){
    return res.status(400).json({
      status: 400,
      msg: 'Invalid body.',
      errors: validate,
    });
  }

  // Check Email
  const checkEmail = Users.findOne({
    where: { email: email }
  });

  if(checkEmail){
    return res.status(409).json({
      status: 409,
      msg: 'Email address already registered.',
      errors: [{
        message: `${email} already registered`
      }],
    });
  }

  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);
  try {
    const user = await Users.create({
        name: name,
        email: email,
        password: hashPassword,
    });

    res.status(200).json({
        status: 200,
        msg: 'Registered.',
        data: user,
        errors: [],
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      msg: 'An Error Occured.',
      errors: error,
    });
  }
})

router.post('/login', async (req, res, next) => {
  const { email, password} = req.body;
  
  const schema = {
    email: 'string|email',
    password: 'string|min:6',
  };

  const validate = v.validate(req.body, schema);

  if(validate.length){
    return res.status(400).json({
      status: 400,
      msg: 'Invalid body.',
      errors: validate,
    });
  }
  
  try {
    const user = await Users.findOne({
      where: { email: email }
    });

    if(!user){
      return res.status(404).json({
        status: 404,
        msg: 'User not found.',
        errors: [{
          message: `User with ${email} not found.`
        }],
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if(!match){
      return res.status(403).json({
        status: 403,
        msg: 'Password did not match.',
        errors: [],
      });
    }

    try {
      const access_token = jwt.sign({
        userId: user.id, 
        name: user.name, 
        email: user.email 
      }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '60s'
      });

      const refresh_token = jwt.sign({
        userId: user.id, 
        name: user.name, 
        email: user.email 
      }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '1d'
      });

      // Update Refresh Token 
      await user.update({
        refresh_token: refresh_token,
      });

      res.cookie('refreshToken', refresh_token, {
        // httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        // secure: true
      })
      
      return res.status(200).json({
        status: 200,
        msg: 'You has been logged in.',
        data: {
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        access_token: access_token,
        refresh_token: refresh_token,
        errors: [],
      });
    } catch (error) {
      console.error(error);
    }


  } catch (error) {
    return res.status(500).json({
      status: 500,
      msg: 'An Error Occured.',
      errors: error,
    });
  }
});

router.post('/logout', async (req, res, next) => {
  const refresh_token = req.cookies.refreshToken;

  if(!refresh_token){
    return res.status(204).json({
      status: 204,
      msg: 'You has been logged out.',
    });
  }

  const user = await Users.findOne({
    refresh_token: refresh_token
  });

  if(!user){
    return res.status(204).json({
      status: 204,
      msg: 'You has been logged out.',
    });
  }

  await user.update({
    refresh_token: null,
  });
  res.clearCookie('refreshToken');
  return res.status(204).json({
    status: 204,
    msg: 'You has been logged out.',
  });
});

module.exports = router;
