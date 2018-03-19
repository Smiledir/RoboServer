const MongoClient    = require('mongodb').MongoClient;
const ObjectID       = require('mongodb').ObjectID;
const consts         = require("../consts.json");


const url            = consts.database.url;
const dbName         = consts.database.name;
const dbCollection   = "Users";

var express = require('express');
var router = express.Router();

var passport = require('passport');

router.get('/', function(req, res, next) {
    console.log(req.session.clientEmail );
    console.log(req.session.isAdmin);
    console.log(req.session.token);
    console.log("token: " + req.session.token);
     if (req.session.token) {
        res.cookie('token', req.session.token);
        res.render('admins', { title: 'Admins1', login: true});
    } else {
        res.cookie('token', '')
        res.render('admins', { title: 'Admins2', login: false});
    }
    /* res.render('index', { title: 'Express' });

     // req.query GET params
     console.log(req.query.q);
     socket.sendMessage(req.query.q);*/
});

router.get('/auth/google', passport.authenticate('google', {
    scope : ['profile', 'email']
}));

router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login'
    }),
    (req, res) => {

        console.log("tokeeen get1: " + req.user.profile.id);
        console.log("tokeeen get2: " + req.user.profile.emails[0].value);
        console.log("tokeeen get3: " + req.user.profile.displayName);
        console.log("tokeeen get4: " + req.user.token);

        req.session.token = req.user.token;
        req.session.clientEmail = req.user.profile.emails[0].value;
        req.session.isAdmin = false;

        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            let dbo = db.db(dbName);

            let query = { "eMail": req.user.profile.emails[0].value };

            dbo.collection(dbCollection).find(query).toArray(function(err, result) {
                if (err) throw err;
                console.log("connect: ");
                if(result.length === 0) {
                    console.log("add: ");
                    let user = {
                        name: req.user.profile.displayName,
                        eMail: req.user.profile.emails[0].value,
                        admin: "No"
                    };

                    dbo.collection(dbCollection).insertOne(user, function(err, result) {
                        if (err) throw err;
                        res.redirect('/admins');
                        console.log("insert: ");
                        db.close();
                    });

                    return;
                }
                console.log("is admin: " + result.length);
                console.log(result);
                if(result[0].admin === "Yes"){
                    req.session.isAdmin = true;
                }

                res.redirect('/admins');
                db.close();
            });
            console.log("connect omplete: ");
        });

        console.log("end: ");
    }
);

router.get('/logout', (req, res) => {
    console.log("logout")
    req.logout();
    req.session = null;
    res.redirect('/admins');
});

module.exports = router;
