const MongoClient    = require('mongodb').MongoClient;
const consts         = require("../consts.json");


const url            = consts.database.url;
const dbName         = consts.database.name;
const dbCollection   = "Users";

var express = require('express');
var router = express.Router();

var passport = require('passport');

router.get('/', function(req, res) {

     if (req.session.token) {
        res.cookie('token', req.session.token);
        res.render('admins', { title: 'Main', login: true, isAdmin: req.session.isAdmin});
    } else {
        res.cookie('token', '')
        res.render('admins', { title: 'Main', login: false, isAdmin: req.session.isAdmin});
    }
});

router.get('/auth/google', passport.authenticate('google', {
    scope : ['profile', 'email']
}));

router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login'
    }),
    (req, res) => {
        req.session.token = req.user.token;
        req.session.clientEmail = req.user.profile.emails[0].value;
        req.session.isAdmin = false;

        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            let dbo = db.db(dbName);

            let query = { "eMail": req.user.profile.emails[0].value };

            dbo.collection(dbCollection).find(query).toArray(function(err, result) {
                if (err) throw err;
                if(result.length === 0) {
                    let user = {
                        name: req.user.profile.displayName,
                        eMail: req.user.profile.emails[0].value,
                        admin: "No"
                    };

                    dbo.collection(dbCollection).insertOne(user, function(err, result) {
                        if (err) throw err;
                        res.redirect('/admins');
                        db.close();
                    });

                    return;
                }
console.log("Ress " + result[0].admin);
                if(result[0].admin === "Yes"){
                    console.log("admin true ");
                    req.session.isAdmin = true;
                }

                res.redirect('/admins');
                db.close();
            });
        });
    }
);

router.get('/logout', (req, res) => {
    req.logout();
    req.session = null;
    res.redirect('/admins');
});

module.exports = router;
