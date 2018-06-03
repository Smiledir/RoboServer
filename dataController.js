const MongoClient    = require('mongodb').MongoClient;
const ObjectID       = require('mongodb').ObjectID;
const consts         = require("./consts.json");


const url            = consts.database.url;
const dbName         = consts.database.name;
const dbTrucks       = "Robot";

var routeBuilder = require('./routeBuilder');

// Надо подумать о первом подключении и вс с этим свзанное
var trucksToDevices = new Map();
var devicesToTrucks = new Map();

// Так тупо проще
var truckSocketToTruck = new Map();

// Используем сет, чтобы значение не дублировалось
// а лучше на какой нибудь
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
var takeDeviceData = function(json, device) {

    // Получаем ближайшую свободную тележку
    let truck = findNearestFreeTruck();

    // получаем маршрут по нашим координатам
    let nodes = routeBuilder.buildRouteTo();

    //console.log(json.placeText + " | " + json.searchText);

   // console.log(truck.name);

    // Нужно не забыть проверку на то, что тележек свободных сейчаc нет
    // Обработать этот случай отдельно

    if(truck === undefined || truck.isBusy){
        console.log("cancel, no trucks");
        device.emit("cancel", "{\"error\": \"Нет свободных мобильных устройств, попробуйте позже\"}");
        return;
    }

    truck.isBusy = true;

    // связываем тележку и устройство
    trucksToDevices.set(truck.socket, device);
    devicesToTrucks.set(device, truck);

    truck.way = "place";

    sendNodes(nodes, truck, device);

    device.emit("data", "{\"trackName\": \"" + truck.name + "\"}");
};

// Функция отправки нодов тележке
var sendNodes = function(nodes, truck, device) {
    console.log(JSON.stringify(nodes));

    nodes.event = "nodes";

    truck.socket.sendUTF(JSON.stringify(nodes));
};

var findNearestFreeTruck = function(node) {

    //Поиск на незанятость
    for (let item of trucks) if(!item.isBusy) return item;

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

            let truck = {
                name: data.name,
                socket: truckSocket,
                isBusy: false,
                way: "start",
                pos: undefined
                // way:
                // start - при регистрации
                // place - около человека
                // end - конец пути
            };

            console.log("truck add");

            // Проверка на добавленность
            for (let item of trucks) if(item.name === data.name) {
                truckSocket.sendUTF("{\"event\": \"firstData\", \"error\": \"Name Already Used\"}");
                db.close();
                return;
            }

            truckSocketToTruck.set(truckSocket, truck);
            truckSocket.sendUTF("{\"event\": \"firstData\", \"status\": \"OK\"}");
            trucks.add(truck);

            db.close();
        });
    });
};

var startWay = function(data, device) {
    let truck = devicesToTrucks.get(device);

    if(truck === undefined){
        console.log("wrong truck");
        device.emit('cancel', "{\"error\": \"startWay wrong truck\"}")
        return;
    }

    // получаем маршрут по нашим координатам
    let nodes = routeBuilder.buildRouteFrom(data.coords);
    truck.way = "end";

    sendNodes(nodes, truck, device);
};

var wayEnd = function(data, truck) {
    let device = trucksToDevices.get(truck);

    if(device === undefined){
        console.log("wrong device");
        truck.sendUTF("{\"event\": \"cancel\", \"error\": \"wayEnd wrong device\"}")
        return;
    }

    devicesToTrucks.delete(device);
    trucksToDevices.delete(truck);

    truck.way = "start";

    // Тут можно передавать девайс id
    // Но пока несущественно, так как есть словари
    device.emit("wayEnd", "{\"status\" : \"OK\"}");
};

var place = function(data, truckSocket) {
    let device = trucksToDevices.get(truckSocket);

    if(device === undefined){
        console.log("wrong device");
        truckSocket.sendUTF("{\"event\": \"cancel\", \"error\": \"onPlace wrong device\"}")
        return;
    }

    // Тут можно передавать девайс id
    // Но пока несущественно, так как есть словари
    device.emit("onPlace", "{\"status\" : \"OK\"}");
};


var onPlace = function(data, truckSocket) {

    var truck = truckSocketToTruck.get(truckSocket);

    if(truck.way === "place"){
        place(data, truckSocket);
        return;
    }

    if(truck.way === "end"){
        wayEnd(data, truckSocket);
        return;
    }

};

var point = function(data, truckSocket) {

    var truck = truckSocketToTruck.get(truckSocket);

    truck.pos = data.pos;
    // задать точку тележке

};

var cancelDevice = function(data, device) {
    let truck = devicesToTrucks.get(device);

    if(truck === undefined){
        console.log("wrong truck");
        return;
    }

    truck.isBusy = false;
    devicesToTrucks.delete(device);
    trucksToDevices.delete(truck);

    // Тут можно передавать девайс id
    // Но пока несущественно, так как есть словари
    truck.socket.sendUTF("\"event\": \"cancel\", {\"status\" : \"OK\"}");
};


module.exports = {
    takeDeviceData: takeDeviceData,
    registerTruck: registerTruck,
    startWay: startWay,
    wayEnd: wayEnd,
    onPlace: onPlace,
    cancelDevice: cancelDevice,
    point: point
};