var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var comments = [];
var beingEdited = [];

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.emit('load comments', {
    comments: comments,
    editList: beingEdited
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
  socket.on('new drawing', function(msg) {
    console.log('message: ' + msg.message);
    var newDrawing = msg.payload;
    comments.push(newDrawing);
    console.log(JSON.stringify(newDrawing, null, 2));
    socket.broadcast.emit('new comment added', newDrawing);
  });
  socket.on('save drawing', function(msg) {
    let index = comments.map((el) => el.id).indexOf(msg.payload.id);
    comments[index] = msg.payload;

    let editIndex = beingEdited.map((el) => el.id).indexOf(msg.payload.id);
    beingEdited.splice(editIndex, 1);

    msg.payload.editList = beingEdited;

    socket.broadcast.emit('comment edited', msg.payload);
  });
  socket.on('start edit', function(msg) {
    // add to beingEdited
    beingEdited.push(msg.payload.id);

    socket.broadcast.emit('start edit', beingEdited);
  });
  socket.on('cancel edit', function(msg) {
    // remove from beingEdited
    let index = beingEdited.map((el) => el.id).indexOf(msg.payload.id);
    beingEdited.splice(index, 1);

    socket.broadcast.emit('cancel edit', beingEdited);
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
