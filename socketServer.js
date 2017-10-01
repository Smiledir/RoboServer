var express = require('express');
var net = require('net');

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

// Пример джейсончика, который должен прийти от клиента при соединении
// {"pass":123, "name":"kuk"}

var server = net.createServer(function(socket) {
    console.log(a++);

    // Ловим ивент о принятии сообщений
    socket.on('data', function(buffer){
        dataSocket(buffer, socket)
    });

    // Ловим ивент о закрытии соединения
    socket.on('close', function(buffer){
        closeSocket(buffer, socket)
    });

    // Отправляем сообщение о соединении
    // Не несет за собой никакой информации,
    // просто наглядный способ узнать, что сообщение установленно
    socket.write("connect\n\r");
});

var dataSocket = function(buffer, socket){
    console.log(buffer.toString());

    // Превращаем буффер в строку, потом парсим из него джейсон
    // Трай - катч не самый лучший способ для валидации джейсона, но пока и так сойдет
    // TODO В будущем лучше заменить на регулярку
    try {
        var json = JSON.parse(buffer.toString());
    }catch (e){
        console.log("Wrong JSON");
        return;
    }

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
}

// Добавляем маршрут (передаем в другой скрипт) функцию отправки ообщений
module.exports = {
    sendMessage: sendMessage
};


server.listen(1337);