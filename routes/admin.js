const MongoClient    = require('mongodb').MongoClient;
const ObjectID       = require('mongodb').ObjectID;
const bodyParser     = require('body-parser');

var express = require('express');
var router = express.Router();
var url = "mongodb://admin:GyJ67Pzz@ds141028.mlab.com:41028/robotsdb";
var path = require('path');



/* GET users listing. */
router.get('/', function(req, res, next) {
    console.log("azaza");
    MongoClient.connect(url, function(err, db) {
        console.log("db connect");

        if (err) throw err;
        var dbo = db.db("robotsdb");

        dbo.collection("notes").find().toArray(function(err, result) {
            if (err) throw err;
           // console.log(result);
            var  dataIndexes = [];
            for (var key in result[0]) {
                //console.log(key);
                dataIndexes.push(key);
            }
            //console.log(result.length);
            res.render('admin', { title: 'Admins', data: result, dataIndexes: dataIndexes });
            db.close();
        });
    });

    //res.sendFile(path.resolve('views/index.html'));
});

router.post("/update",function(req, res, next){
    console.log(req.body);
    var data = req.body;

    MongoClient.connect(url, function(err, db) {
        console.log("db connect");
        if (err) throw err;
        var dbo = db.db("robotsdb");

        console.log("startupdate");

        var myquery = { _id: ObjectID(data._id) };
        delete data._id;
        var newvalues = { $set: data };
        console.log(data);
        dbo.collection("notes").updateOne(myquery, newvalues, function(err, result) {
            if (err) throw err;
            console.log("1 document updated ");
            res.send("OK");
            db.close();
        });
    });
});

router.post("/delete",function(req, res, next){
    console.log(req.body);
    var data = req.body;

    MongoClient.connect(url, function(err, db) {
        console.log("db connect");
        if (err) throw err;
        var dbo = db.db("robotsdb");

        console.log("startupdate");

        var myquery = { _id: ObjectID(data._id)};

        dbo.collection("notes").deleteOne(myquery, function(err, result) {
            if (err) throw err;
            console.log("1 document deleted ");
            res.send("OK");
            db.close();
        });
    });
});

router.post("/notes",function(req, res, next){
    //your code
    MongoClient.connect(url, function(err, db) {
        console.log("db connect");
        //var notes = db.collection("notes");

        if (err) throw err;
        var dbo = db.db("robotsdb");
        var myobj = { name: req.body.name, address: req.body.address };
        dbo.collection("notes").insertOne(myobj, function(err, result) {
            if (err) throw err;
            res.send(result.ops[0]);
            db.close();
        });
    });
});

module.exports = router;