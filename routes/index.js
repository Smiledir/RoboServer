var express = require('express');
var router = express.Router();

var socket = require('../socketServer');

var passport = require('passport');
var auth = require('../auth');


router.get('/', function(req, res, next) {

    if (req.session.token) {
        res.cookie('token', req.session.token);
        res.json({
            status: 'session cookie set'
        });
    } else {
        res.cookie('token', '')
        res.json({
            status: 'session cookie not set'
        });
    }
 /* res.render('index', { title: 'Express' });

  // req.query GET params
  console.log(req.query.q);
  socket.sendMessage(req.query.q);*/
});
/*
router.get('/auth/google', passport.authenticate('google', {
    scope : ['profile', 'email']
}));

router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login'
    }),
    (req, res) => {
        console.log("token get: " + req.user.token);
        req.session.token = req.user.token;
        res.redirect('/');
    }
);

router.get('/logout', (req, res) => {
    console.log("logout")
    req.logout();
    req.session = null;
    res.redirect('/');
});*/

module.exports = router;
