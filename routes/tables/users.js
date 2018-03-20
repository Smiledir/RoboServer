const MongoClient    = require('mongodb').MongoClient;
const ObjectID       = require('mongodb').ObjectID;
const consts         = require("../../consts.json");


const url            = consts.database.url;
const dbName         = consts.database.name;
const dbCollection   = "Users";

const pageName       = "users";

var express = require('express');
var router = express.Router();

var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {

    if(!req.session.token || !req.session.isAdmin) {
        res.redirect('/admins');
        return;
    }

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db(dbName);

        dbo.collection(dbCollection).find().toArray(function(err, result) {
            if (err) throw err;
            let  dataIndexes = [];
            for (let key in result[0]) {
                dataIndexes.push(key);
            }
            res.render(pageName, { title: dbCollection, data: result, dataIndexes: dataIndexes });
            db.close();
        });
    });
});

router.put("/",function(req, res, next){

    if(!req.session.token || !req.session.isAdmin) {
        res.send("Error");
        return;
    }

    let data = req.body;

    if(data.admin !== "Yes" && data.admin !== "No") {
        res.send("ERROR");
        return;
    }

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db(dbName);

        let myquery = { _id: ObjectID(data._id) };
        delete data._id;
        let newvalues = { $set: data };
        dbo.collection(dbCollection).updateOne(myquery, newvalues, function(err, result) {
            if (err) throw err;
            res.send("OK");
            db.close();
        });
    });
});

router.delete("/",function(req, res, next){

    if(!req.session.token || !req.session.isAdmin) {
        res.send("Error");
        return;
    }

    let data = req.body;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db(dbName);

        let myquery = { _id: ObjectID(data._id)};

        dbo.collection(dbCollection).stats(function(err, result) {
            if (err) throw err;

            if(result.count <= 1) {
                res.send("ERROR");
                db.close();
            }else{
                dbo.collection(dbCollection).deleteOne(myquery, function(err, result) {
                    if (err) throw err;
                    res.send("OK");
                    db.close();
                });
            }
        });
    });
});

router.post("/",function(req, res, next){

    if(!req.session.token || !req.session.isAdmin) {
        res.send("Error");
        return;
    }

    let data = req.body;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db(dbName);

        dbo.collection(dbCollection).insertOne(data, function(err, result) {
            if (err) throw err;
            res.send(result.ops[0]);
            db.close();
        });
    });
});

module.exports = router;