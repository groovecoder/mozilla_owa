#!/usr/bin/env node
 
var WebSocketServer = require('websocket/lib/WebSocketServer');
var http = require('http');
var url = require('url');
var fs = require('fs');
var connectionArray = new Array();
var superConnectionID = null;
var nextID = Date.now();
var appendToMakeUnique = 1;
 
var server = http.createServer(function(request, response) {
    console.log((new Date()) + " Received request for " + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + " Server is listening on port 8080");
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: true
});
 
function getConnectionForID(id) {
  var connect = null;
 
  for (i=0; i<connectionArray.length; i++) {
    if (connectionArray[i].clientID == id) {
      connect = connectionArray[i];
      break;
    }
  }
 
  return connect;
}
 
wsServer.on('connect', function(connection) {
    console.log((new Date()) + " Connection accepted.");     
    console.log("connectionArray.length: " + connectionArray.length);
    if (connectionArray.length == 0){
        superConnectionID = nextID;
        console.log("superConnectionID: " + superConnectionID);
    }
    connectionArray.push(connection);
   
    // Send the new client its token; it will
    // respond with its login username.
   
    connection.clientID = nextID;
    nextID++;
   
    var msg = {
      type: "id",
      id: connection.clientID
    };
    connection.sendUTF(JSON.stringify(msg));
   
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received Message: " + message.utf8Data);
           
            // Process messages
            var sendToClients = false;
            var msg = JSON.parse(message.utf8Data);
            if (msg.id == superConnectionID)
                sendToClients = true;
            var connect = getConnectionForID(msg.id);
           
            // Convert the message back to JSON and send it.
            if (sendToClients) {
              var msgString = JSON.stringify(msg);
             
              for (i=0; i<connectionArray.length; i++) {
                connectionArray[i].sendUTF(msgString);
              }
            }
        }
    });
    connection.on('close', function(connection) {
      connectionArray = connectionArray.filter(function(el, idx, ar) {
              return el.connected;
      });
      console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
    });
}); 
