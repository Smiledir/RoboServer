const MongoClient    = require('mongodb').MongoClient;
const ObjectID       = require('mongodb').ObjectID;
const consts         = require("./consts.json");


const url            = consts.database.url;
const dbName         = consts.database.name;
const dbTrucks       = "Robot";

var routeBuilder = require('./routeBuilder');
var socketServer = require('./socketServer');

// Надо подумать о первом подключении и вс с этим свзанное
var trucksToDevices = new Map();
var devicesToTrucks = new Map();

// Используем сет, чтобы значение не дублировалось
var trucks = new Set();

/*MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db(dbName);

    let query = { "name": "piRobot" };

    dbo.collection(dbTrucks).find(query).toArray(function(err, result) {
        if (err) throw err;

        if(result.length == 0) {
            console.log("Nothing Found");
            db.close();
            return;
        }

        console.log(result);
        db.close();
    });
});*/

// Получаем информацию с утройства и обрабатываем её
var takeDeviceData = function(coords, device) {

    // получаем маршрут по нашим координатам
    let nodes = routeBuilder.buildRoute(coords);

    // Получаем ближайшую свободную тележку
    let truck = findNearestFreeTruck(nodes[0]);

    // Нужно не забыть проверку на то, что тележек свободных сейчаc нет
    // Обработать этот случай отдельно

    // связываем тележку и устройство
    trucksToDevices.set(device, truck);
    devicesToTrucks.set(truck, device);

    socketServer.sendNodes(nodes, truck);
};

var findNearestFreeTruck = function(node) {

    //Поиск на незанятость
    set.forEach((truck, valueAgain, set) => {
        if(!truck.isBusy) return truck;
    });

    // Нужен поиск по координатам

    return undefined;
};

var registerTruck = function(data, truckSocket) {

    if(data.name === undefined) {
        console.log("ERROR NAME");
        return;
    }

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db(dbName);

        let query = { "name": data.name };

        dbo.collection(dbTrucks).find(query).toArray(function(err, result) {
            if (err) throw err;

            for (let key in result[0]) {
                dataIndexes.push(key);
            }

            let truck = {
                socket: truckSocket,
                isBusy: false
            };

            db.close();
        });
    });


    trucks.add(truck)
};


module.exports = {
    takeDeviceData: takeDeviceData,
    registerTruck: registerTruck
};