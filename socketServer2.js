
var dataController = require('./dataController');

var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(3500, function() {
    console.log(' Server is listening on port 3500');
});

wsServer = new WebSocketServer({
    httpServer: server
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log(' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept(null, request.origin);
    console.log(' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);

            try {
                let json = JSON.parse(message.utf8Data.toString());

                if(json.event === 'firstData'){
                    firstDataSocket(json, connection);
                    return;
                }

                if(json.event === 'onPlace'){
                    onPlace(json, connection);
                    return;
                }

                if(json.event === 'point'){
                    point(json, connection);
                    return;
                }


            }catch (ex) {
                console.log("Parse Error: " + message.utf8Data.toString());
            }

            //connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            //connection.sendBytes(message.binaryData);
        }
    });

    connection.on('close', function(reasonCode, description) {
        console.log(' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

var firstDataSocket = function(buffer, socket){

    let json = buffer;

    //let json = JSON.parse(buffer.toString());

    // Проверяем пароль
    if(json.pass != "123"){
        socket.sendUTF("{\"event\": \"firstData\", \"error\": \"Wrong Password\"}\n");
        console.log("Wrong Password " + socket.localAddress);
        return;
    }

    // Имя - наш уникальный идентификатор, поэтому оно не должно повторяться
    if(json.name === "undefined"){
        socket.sendUTF("{\"event\": \"firstData\", \"error\": \"Name undefined\"}");
        console.log("Name Already Used " + json.name);
        return;
    }

    dataController.registerTruck(json, socket);

    console.log("register complete");
};

var onPlace = function(data, client){

    dataController.onPlace(data, client);
};

var point = function(data, client){

    dataController.point(data, client);
};
