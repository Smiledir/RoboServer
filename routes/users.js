var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/azaz', function(req, res, next) {
  console.log("azaza");
  res.send('respond with a resource');
});

module.exports = router;
