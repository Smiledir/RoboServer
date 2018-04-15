var dataController = require('./dataController');
var server = require('http').createServer();
let io = require('socket.io')(server);
io.on('connection', function(client){
    console.log("startConnection");

    client.on('firstData', function(data){
        console.log("firstData");
        console.log(data);
        connectSocket(data, client);
    });

    client.on('data', function(data){
        console.log("data");
        console.log(data);
        dataSocket(data, client);
    });

    client.on('startWay', function(data){
        console.log("startWay");
        startWay(data, client);
    });

    client.on('cancel', function(data){
        console.log("cancel");
        cancel(data, client);
    });

    client.on('disconnect', function(){
        console.log("disconnect");
    });
});
console.log("startSocketServerFromDevice");
server.listen(4000);

var deviceIdToSocket = [];

var cancel = function(buffer, socket) {
    dataController.cancelDevice(buffer, socket)
}

var connectSocket = function(buffer, socket) {

    let json = buffer;

    //let json = JSON.parse(buffer.toString());

    if(json.deviceId == undefined){
        console.log("strange device ");
        return;
    }

    if(deviceIdToSocket[json.deviceId] != undefined){
        console.log("Device Already Connect " + socket.localAddress);
    }

    deviceIdToSocket[json.deviceId] = socket;

    let answer = {
        status: "OK"
    };

    socket.emit("firstData", JSON.stringify(answer))
};

var dataSocket = function(buffer, socket) {

    //let json = JSON.parse(buffer.toString());

    let json = buffer;

    if(json.searchText === undefined){
        console.log("Search Text Error ");
        socket.emit("cancel", "{\"error\": \"Wrong search text\"}")
    }

    if(json.coords === undefined){
        console.log("Position Error " + socket.localAddress);
    }

    dataController.takeDeviceData(json.coords, socket);
};

var startWay = function(data, device) {
    console.log("startway");
    dataController.startWay(data, device);
};
