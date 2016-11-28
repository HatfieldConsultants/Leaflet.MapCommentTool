var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var comments = [];

app.use(express.static('public'));

app.get('/', function(req, res){
  	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  	console.log('a user connected');
  	
  	socket.emit('load comments', comments);

  	socket.on('disconnect', function(){
    	console.log('user disconnected');
 	});
	socket.on('new drawing', function(msg){
    	console.log('message: ' + msg.message);
    	var newDrawing = msg.payload;
    	comments.push(newDrawing);
		console.log(JSON.stringify(newDrawing, null, 2));
		socket.broadcast.emit('new comment added', newDrawing);
  	});
	socket.on('save drawing', function(msg){
    	let index = comments.map( (el) => el.id ).indexOf(msg.payload.id);
    	comments[index] = msg.payload;
		
		socket.broadcast.emit('comment edited', msg.payload);
  	});
	socket.on('start edit', function(msg){
		socket.broadcast.emit('start edit', msg.payload);
  	});
	socket.on('cancel edit', function(msg){
		socket.broadcast.emit('cancel edit', msg.payload);
  	});
});

http.listen(3000, function(){
  	console.log('listening on *:3000');
});