// Тут все константы
const consts         = require("./consts.json");

// Константы базы
const MongoClient    = require('mongodb').MongoClient;
const url            = consts.database.url;
const dbName         = consts.database.name;
const dbCollectionNode2Node   = "Node2Node";
const dbCollectionNode   = "Node";

var fullNodes = [];
// Функция для параноиков, позволяет обновить кэш из базы
var refreshNodes = function() {

    console.log("refreshNodes");

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);

        dbo.collection(dbCollectionNode).find().toArray(function(err, result) {
            if (err) throw err;

            makeFullNodes(result);


        });
    });
};

var makeFullNodes = function(nodes){

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);

        dbo.collection(dbCollectionNode2Node).find().toArray(function(err, result) {
            if (err) throw err;

            for (let n of nodes) {

                let n2nTo = [];
                let n2nFrom = [];

                for (let n2n of result) {
                    if (n2n.node_id_to == n._id){
                        n2nTo.push(n2n);
                    }

                    if (n2n.node_id_from == n._id){
                        n2nFrom.push(n2n);
                    }
                }

                let item = {
                    node: n,
                    n2nTo: n2nTo,
                    n2nFrom: n2nFrom
                };

                fullNodes.push(item);
            }
        });
    });
};

// Вызываем при движении к человеку
var buildRouteTo = function(start, end) {

    // Гранд костыль
    // Копируем ноды, чтобы в случае параллельности не пересеклись
    // Добавляем флаг посещенности

    let allNodes = [];

    for (n of fullNodes){

        let arr = [];
        let item = {
            node: n.node,
            n2nTo: n.n2nTo,
            n2nFrom: n.n2nFrom,
            path: arr,
            vis: false
        };

        allNodes.push(item);
    }


    let startNode;
    let endNode;

    for(let n of allNodes) {

        if(n.node._id == start){
            startNode = n;
        }

        if(n.node._id == end){
            endNode = n;
        }
    }

    if(startNode == undefined || endNode == undefined){
        console.log("Wrong points");
        startNode = allNodes[0];
        endNode = allNodes[3];
    }

    // Обход в ширину
    let queue = [];

    queue.push(startNode);
    startNode.vis = true;
    startNode.path.push(startNode);

    console.log(startNode.node._id);
    console.log(endNode.node._id);

    while (queue.length > 0){

        let curNode = queue.shift();

        if(curNode.node._id == endNode.node._id){

            let path = [];

            for (i = 1; i < curNode.path.length; i++) {

                let nodel = curNode.path[i - 1];
                let noder = curNode.path[i];
                for(let n of nodel.n2nFrom){

                    if(n.node_id_from == nodel.node._id && n.node_id_to == noder.node._id){

                        let item ={
                            node: noder.node,
                            n2n: n
                        };
                        path.push(item);
                        break;
                    }
                }
            }

            return JSON.stringify(path);
        }

        for (n of curNode.n2nFrom){

            let picked;
            for (let p of allNodes){
                if(n.node_id_to == p.node._id){
                    picked = p;
                    break;
                }
            }

            if(picked.vis) continue;

            let p = [];

            for (let el of curNode.path){
                p.push(el);
            }

            p.push(picked);
            picked.path = p;

            queue.push(picked);
            picked.vis = true;
        }
    }

    return undefined;
};



// Вызываем при движении к месту
var buildRouteFrom = function(coords) {

    return buildRouteTo();
};

module.exports = {
    buildRouteTo: buildRouteTo,
    buildRouteFrom: buildRouteFrom
};

// Чтобы не было ничего лишнего
// Выписываем все ноды заранее при загрузке сервера
console.log("routeBuilder");
refreshNodes();