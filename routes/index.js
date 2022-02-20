var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    app_name: process.env.APP_NAME,
  });
});

module.exports = router;