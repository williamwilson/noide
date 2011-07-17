var connect = require('./node_modules/connect');
var socketio = require('./node_modules/socket.io');
var fs = require('fs');
var noide = require('./noide.js');

/* connect builds up layers of handlers which are each given a crack at handling a request, and then the response flows back out through the layers */
var server = connect.createServer(
    /* log requests / responses */
    connect.logger(),
    /* serve static content if the request was not already handled */
    connect.static(__dirname + '/public')
);
server.listen(8000);

var io = socketio.listen(server);
noide.initialize(io);