var dataController = require('./dataController');
var server = require('http').createServer();
let io = require('socket.io')(server);
io.on('connection', function(client){
    console.log("startConnection");

    client.on('firstData', function(data){
        console.log("firstData");
        //console.log(data);
        firstDataSocket(data, client)
    });

    client.on('data', function(data){
        console.log("data");
    });

    client.on('wayEnd', function(data){
        console.log("wayEnd");
        wayEnd(data, client);
    });

    client.on('onPlace', function(data){
        console.log("onPlace");
        onPlace(data, client);
    });

    client.on('disconnect', function(data){
        console.log("disconnect");
        closeSocket(data, client)
    });
});
console.log("startSocketServer");
server.listen(5000);

// Пример джейсончика, который должен прийти от клиента при соединении
// {"pass": "123", "name":"kuk"}

var onPlace = function(data, client){

    dataController.onPlace(data, client);
};

var wayEnd = function(data, client){

    dataController.wayEnd(data, client);
};

var firstDataSocket = function(buffer, socket){
    console.log(buffer.toString());

    let json = JSON.parse(buffer.toString());

    // Проверяем пароль
    if(json.pass != "123"){
        socket.emit('firstData', "{\"error\": \"Wrong Password\"}\n");
        console.log("Wrong Password " + socket.localAddress);
        return;
    }

    // Имя - наш уникальный идентификатор, поэтому оно не должно повторяться
    if(json.name === "undefined"){
        socket.emit('firstData', "{\"error\": \"Name undefined\"}");
        console.log("Name Already Used " + json.name);
        return;
    }

    dataController.registerTruck(json, socket);

    console.log("register complete");
}

var closeSocket = function(buffer, socket){

    console.log("close " + socket.localAddress + " | " + buffer.toString() + " | "  + " | " + socket.name);

}

// Функция отправки сообщения по сокету
var sendMessage = function(message, name) {
    console.log(message + " | " + name);
   // socket.write( message + ' Echo server\r\n');
};

// Функция отправки нодов тележке
var sendNodes = function(nodes, truck) {
    console.log(nodes);

    truck.emit("nodes", JSON.stringify(answer));
};

// Добавляем маршрут (передаем в другой скрипт) функцию отправки ообщений
module.exports = {
    sendMessage: sendMessage,
    sendNodes:sendNodes
};