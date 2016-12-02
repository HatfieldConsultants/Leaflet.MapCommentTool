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
var updateComment = function(db, id, layers, zoomLevel, callback) {
  db.collection('comments').updateOne({
      "id": id
    }, {
      $set: {
        "layers": layers,
        "zoomLevel": zoomLevel,
      }
    },
    function(err, results) {
      callback();
    });
};

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
        editList = editListArray.map(function(a) {
          return a.id;
        });
        callback();
      });
    });
  }

  var loadSocket = function(comments, editList) {
    socket.emit('load comments', {
      comments: comments,
      editList: editList
    });
  }

  var loadSocketEdit = function(editList) {
    io.emit('editList update', {
      editList: editList,
    });
  }

  console.log('a user connected');
  prepareCommentsForLoad(function() {
    prepareEditCommentsForLoad(function() {
      loadSocket(comments, editList);
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

    // update the comment
    let index = comments.map((el) => el.id).indexOf(msg.payload.id);
    comments[index] = msg.payload;

    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      updateComment(db, msg.payload.id, msg.payload.layers, msg.payload.zoomLevel, function() {
        removeEditComment(db, msg.payload.id, function() {
          db.close();
          prepareEditCommentsForLoad(function() {
            socket.broadcast.emit('comment edited', msg.payload);
            loadSocketEdit(editList);
          });
        });
      });
    });
  });

  socket.on('start edit', function(msg) {
    // add to beingEdited
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      insertEditComment(db, msg.payload, function() {
        db.close();
        prepareEditCommentsForLoad(function() {
          loadSocketEdit(editList);
        });
      });
    });
  });

  socket.on('cancel edit', function(msg) {
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);

      removeEditComment(db, msg.payload.id, function() {
        prepareEditCommentsForLoad(function() {
          loadSocketEdit(editList);
        });
      });
    });
  });

});

http.listen(3000, "0.0.0.0", function() {
  console.log('listening on 0.0.0.0:3000');
});
