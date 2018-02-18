var express = require('express');
var router = express.Router();

var socket = require('../socketServer');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });

  // req.query GET params
  console.log(req.query.q);
  socket.sendMessage(req.query.q);
});



module.exports = router;
