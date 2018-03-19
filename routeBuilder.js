// Тут все константы
const consts         = require("./consts.json");

// Константы базы
const MongoClient    = require('mongodb').MongoClient;
const url            = consts.database.url;
const dbName         = consts.database.name;
const dbCollection   = "Node2Node";

var nodes = [];

// Функция для параноиков, позволяет обновить кэш из базы
var refreshNodes = function() {

    console.log("refreshNodes");

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);

        dbo.collection(dbCollection).find().toArray(function(err, result) {
            if (err) throw err;
            nodes = result;
        });
    });
};


var buildRoute = function(coords) {

    if(coords == undefined || coords.x == undefined || coords.y == undefined ){
        console.log("Wrong Coords")
        return "Error";
    }

    // Тут по координатам ищем путь
    // НЕ ЗАБУДЬ вершины уже закешированны
    // Возвращаем вершины
    return nodes;
};

var buildRoute = function(coords) {

    if(coords == undefined || coords.x == undefined || coords.y == undefined ){
        console.log("Wrong Coords")
        return "Error";
    }

    // Тут по координатам ищем путь
    // НЕ ЗАБУДЬ вершины уже закешированны
    // Возвращаем вершины
    return nodes;
};

module.exports = {
    buildRoute: buildRoute
};

// Чтобы не было ничего лишнего
// Выписываем все ноды заранее при загрузке сервера
console.log("routeBuilder");
refreshNodes();