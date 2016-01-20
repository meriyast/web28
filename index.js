// Import the Express module
var express = require('express');

// Import the 'path' module (packaged with Node.js)
var path = require('path');

// Create a new Express application
var app = express();
// Import the web 28 game file.
var game = require('./web28game');

// Create a simple Express application
app.configure(function() {
    // Turn down the logging activity
    app.use(express.logger('dev'));

    // Serve static html, js, css, and image files from the 'public' directory
    app.use(express.static(path.join(__dirname,'public')));
});


// Create an http server with Node's HTTP module.
// Pass it the Express application, and listen on port 8080.
var server = require('http').createServer(app).listen(8080);

// Instantiate Socket.IO hand have it listen on the Express/HTTP server
var io = require('socket.io').listen(server);
// Reduce the logging output of Socket.IO
io.set('log level',2);

var players = {};  
var start = false;  
var pack = game.shufflePack(game.createPack());  
var currentPlayer;

// Listen for Socket.IO Connections. Once connected, start the game logic.
io.sockets.on('connection', function (client) {
	game.initGame(io, client);
	client.on('addPlayer', function(player){
		player.clientId = client.id;
   		players[client.id] = player;
    	console.log("Player " + player + "with id: " + client.id + "has connected.");
     	console.log(Object.size(players));
     	if (Object.size(players) == 1) {
     		currentPlayer = client.id;
     		console.log("Current Player is " + client.id);
     	}
     	for(var key in players) {
      		console.log("Players: " + key + ": " + players[key]);
     	}
	});
	client.on('disconnect', function(){
    	console.log("Player with id: " + client.id + "has disconnected");
    	delete players[client.id];
    	for(var key in players) {
      		console.log("Remaining players: " + key + ": " + players[key]);
    	}
    //reset pack
    	pack = game.shufflePack(game.createPack());
  	});

	client.on('dealCards', function(){
    	var cards = game.draw(pack, 4, "", true);
    	client.emit('showCards', cards);
    	//io.sockets.emit("remainingCards", pack.length)
  	});

});

Object.size = function(obj) {  
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

