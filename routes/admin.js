const MongoClient    = require('mongodb').MongoClient;
const ObjectID       = require('mongodb').ObjectID;

const url            = "mongodb://admin:GyJ67Pzz@ds141028.mlab.com:41028/robotsdb";
const dbName         = "robotsdb";
const dbCollection   = "notes";

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);

        dbo.collection(dbCollection).find().toArray(function(err, result) {
            if (err) throw err;
            var  dataIndexes = [];
            for (var key in result[0]) {
                dataIndexes.push(key);
            }
            res.render('admin', { title: 'Admins', data: result, dataIndexes: dataIndexes });
            db.close();
        });
    });
});

router.put("/",function(req, res, next){
    var data = req.body;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);

        var myquery = { _id: ObjectID(data._id) };
        delete data._id;
        var newvalues = { $set: data };
        dbo.collection(dbCollection).updateOne(myquery, newvalues, function(err, result) {
            if (err) throw err;
            res.send("OK");
            db.close();
        });
    });
});

router.delete("/",function(req, res, next){
    var data = req.body;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);

        var myquery = { _id: ObjectID(data._id)};

        dbo.collection(dbCollection).deleteOne(myquery, function(err, result) {
            if (err) throw err;
            res.send("OK");
            db.close();
        });
    });
});

router.post("/",function(req, res, next){
    var data = req.body;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);

        dbo.collection(dbCollection).insertOne(data, function(err, result) {
            if (err) throw err;
            res.send(result.ops[0]);
            db.close();
        });
    });
});

module.exports = router;