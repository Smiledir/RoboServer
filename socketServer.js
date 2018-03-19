var dataController = require('./dataController');
var server = require('http').createServer();
var io = require('socket.io')(server);
io.on('connection', function(client){
    console.log("startConnection");

    client.on('firstData', function(data){
        console.log("firstData");
        console.log(data);
        firstDataSocket(data, client)
    });

    client.on('data', function(data){
        console.log("data");
        console.log(data);
        dataSocket(data, client);
    });

    client.on('disconnect', function(data){
        console.log("disconnect");
        closeSocket(data, client)
    });
});
console.log("startSocketServer");
server.listen(6000);
// Счетчик подключений
var a = 0;

// Зачем так много словарей ?
// Чтобы было проще и одновременно сложнее
// Дорогой программист, будь внимателен и не запутайся

// Словарь key - адрессб value - info
var trucksAddressToInfo = [];
// Словарь key - адрессб value - socket
var trucksAddressToSocket = [];
// Словарь key - имя value - address
var trucksNameToAddress = [];
// имена тележек из бызы
var trucksNames = [];

// Пример джейсончика, который должен прийти от клиента при соединении
// {"pass":123, "name":"kuk"}

// Читаем тележки из базы
// Связываем их с сокетами по имени
var readTracksFromBase = function(){

}

var firstDataSocket = function(buffer, socket){
    console.log(buffer.toString());

    dataController.registerTruck(buffer, socket);

    var json = buffer;

    // Служебный лог
    console.log(json.pass, json.name, socket.localAddress);

    // Проверяем пароль
    if(json.pass != "123"){
        socket.end("Wrong Password!\n");
        console.log("Wrong Password " + socket.localAddress);
        return;
    }

    // Не пускаем устройства, которые не указали свое имя
    // Или если по этому адресу у на уже есть соединение
    if(trucksAddressToSocket[socket.localAddress] != undefined){
        socket.end("Address Already Connect\n");
        console.log("Address Already Connect " + socket.localAddress);
        return;
    }

    // Имя - наш уникальный идентификатор, поэтому оно не должно повторяться
    if(json.name == "undefined" || trucksNameToAddress[json.name] != undefined){
        socket.end("Name Already Used\n");
        console.log("Name Already Used " + json.name);
        return;
    }

    if(!trucksNames.has(json.name)){
        socket.end("Truck no on base\n");
        console.log("Truck no on base " + json.name);
        rturn;
    }

    // Структура информации, пока включает в себя:
    // name - Имя устройства
    // localAddress - Адрес устройства
    var info = {
        name: json.name,
        localAddress: socket.localAddress
    }

    // Забиваем наши массивы
    trucksAddressToSocket[socket.localAddress] = socket;
    trucksAddressToInfo[socket.localAddress] = info;
    trucksNameToAddress[info.name] = socket.localAddress;
    socket.name = info.name;
    console.log("забили массивы");
}

var closeSocket = function(buffer, socket){

    console.log("close " + socket.localAddress + " | " + buffer.toString() + " | "  + " | " + socket.name);
    // При закрытии сокета, освобождаем соответствующую информацию из наших словарей
    var info = trucksAddressToInfo[socket.localAddress];
    if(info != undefined) delete trucksNameToAddress[info.name];
    delete trucksAddressToInfo[socket.localAddress];
    delete trucksAddressToSocket[socket.localAddress];
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


server.listen(1337);