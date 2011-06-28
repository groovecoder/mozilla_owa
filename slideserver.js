#!/usr/bin/env node
var io = require('socket.io').listen(8080);
var socketArray = new Array();
var superConnectionID = null;
var nextID = Date.now();

io.sockets.on('connection', function(socket){
    if (socketArray.length == 0){
        superConnectionID = nextID;
    }
    socketArray.push(socket);
    socket.clientID = nextID;
    nextID++;

    var msg = {type:'id', id: socket.clientID};
    socket.send(JSON.stringify(msg));

    socket.on('message', function(message) {
        // Process messages
        var sendToClients = false;
        var msg = JSON.parse(message);
        if (msg.id == superConnectionID)
            sendToClients = true;
       
        // Convert the message back to JSON and send it.
        if (sendToClients) {
            msg = {keyCode: msg.keyCode};
            var msgString = JSON.stringify(msg);
            for(i=0;i<socketArray.length;i++){
                socketArray[i].send(msgString);
            }
        }
    });
}); 
