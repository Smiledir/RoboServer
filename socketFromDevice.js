var dataController = require('./dataController');
var server = require('http').createServer();
var io = require('socket.io')(server);
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

    client.on('disconnect', function(){
        console.log("disconnect");
    });
});
console.log("startSocketServerFromDevice");
server.listen(5000);

var deviceIdToSocket = [];

var connectSocket = function(buffer, socket) {

    if(deviceIdToSocket[buffer.deviceId] != undefined){
        console.log("Device Already Connect " + socket.localAddress);
    }

    deviceIdToSocket[buffer.deviceId] = socket;

    var answer = {
        status: "OK"
    };

    socket.emit("firstData", JSON.stringify(answer))
};

var dataSocket = function(buffer, socket) {

    if(buffer.text == undefined){
        console.log("Search Text Error " + socket.localAddress);
    }

    if(buffer.coords == undefined){
        console.log("Position Error " + socket.localAddress);
    }

    dataController.takeDeviceData(buffer.coords, socket);
};
