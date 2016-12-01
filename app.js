var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var comments;
var editList;

// Database functions....
var url = 'mongodb://localhost:27017/MapCommentToolGlobal';

// Insert New Comment
var insertComment = function(db, comment, callback) {
  db.collection('comments').insertOne(comment, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a new comment into the comment collection.");
    callback();
  });
};

// Get a Comment

// Get all Comments (for load)
var getComments = function(db, callback) {
  var commentsArray = [];
  var cursor = db.collection('comments').find();
  cursor.each(function(err, doc) {
    assert.equal(err, null);
    if (doc != null) {
      commentsArray.push(doc);
    } else {
      callback(commentsArray);
    }
  });
};
// Update Comment (from edit)

// Delete Comment

// get all beingEdited Comments
var getBeingEdited = function(db, callback) {
  var editListArray = [];
  var cursor = db.collection('beingEdited').find();
  cursor.each(function(err, doc) {
    assert.equal(err, null);
    if (doc != null) {
      editListArray.push(doc);
    } else {
      callback(editListArray);
    }
  });
};

// Add Comment to beingEdited
var insertEditComment = function(db, comment, callback) {
  db.collection('beingEdited').insertOne(comment, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a new comment into the beingEdited collection.");
    callback();
  });
};

// Remove Comment from beingEdited
var removeEditComment = function(db, id, callback) {
  db.collection('beingEdited').deleteMany({
      "id": id
    },
    function(err, results) {
      callback();
    }
  );
};

/// .......... ///



// ....... ///

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {

  // utility //

  var prepareCommentsForLoad = function(callback) {
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      getComments(db, function(commentsArray, self) {
        db.close();
        comments = commentsArray;
        callback();
      });
    });
  }

  var prepareEditCommentsForLoad = function(callback, self) {
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      getBeingEdited(db, function(editListArray, self) {
        db.close();
        editList = editListArray;
        callback();
      });
    });
  }

  var loadSocket = function() {
    socket.emit('load comments', {
      comments: comments,
      editList: editList
    });
  }

  var loadSocketEdit = function() {
    socket.broadcast.emit('start edit', {
      editList: editList,
    });
  }

  console.log('a user connected');
  prepareCommentsForLoad(function() {
    prepareEditCommentsForLoad(function() {
      loadSocket();
    });
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
  socket.on('new drawing', function(msg) {
    var newDrawing = msg.payload;

    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      insertComment(db, newDrawing, function() {
        db.close();
      });
    });

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
    var editList;
    // add to beingEdited
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      insertEditComment(db, msg.payload, function() {
        db.close();
      });
    });

    prepareEditCommentsForLoad(function() {
      loadSocket();
    });
  });

  socket.on('cancel edit', function(msg) {
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);

      removeRestaurants(db, msg.payload.id, function() {
        db.close();
      });
    });

    socket.broadcast.emit('cancel edit', beingEdited);
  });

});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
