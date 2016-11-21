var assert = chai.assert;
window.map.MapCommentTool.PHANTOMTEST = true;

describe('Map Loaded Properly', function() {

	it('getCenter().lat should return proper lat', function() {
		assert.equal(map.getCenter().lat, 49.2827 );
	});
	it('getCenter().lng should return proper lng', function() {
		assert.equal(map.getCenter().lng, -123.1207 );
	});
});

describe('Plugin Loaded Properly', function() {
	it('General Sanity Checks', function() {
		assert.equal(map.MapCommentTool.getMessage(), 'Map Comment Tool', 'getMessage() returns "Map Comment Tool"' );
		assert.equal(map.MapCommentTool.currentMode, 'map', 'Mode set to "map"');
	});
});

describe('Initial Control Bar Status', function() {

	it('isVisible() should be "false"', function() {
		assert.isNotOk(map.MapCommentTool.ControlBar.isVisible());
	});

	if (window.innerHeight == 987 && window.innerWidth == 1920) {
		it('if client width is 1920x987, control bar should be on the right', function() {
			assert.equal(map.MapCommentTool.ControlBar.options.position, 'right');
		});
	}
	else if (window.innerHeight == 640 && window.innerWidth == 360) {
		it('if client width is 360x640, control bar should be on the right', function() {
			assert.equal(map.MapCommentTool.ControlBar.options.position, 'bottom');
		});
	}


});

describe('Control Bar Show/Hide', function() {

	it('isVisible() should initially be "false"', function() {
		assert.isNotOk(map.MapCommentTool.ControlBar.isVisible());
	});

	it('show() should return "true" and change "visible" to true', function() {
		assert.isOk(map.MapCommentTool.ControlBar.show(), 'show() executed successfully');
		assert.isOk(map.MapCommentTool.ControlBar.isVisible());
	});
	
	it('hide() should return "true" and change "visible" to false', function() {
		assert.isOk(map.MapCommentTool.ControlBar.hide(), 'hide() executed successfully');
		assert.isNotOk(map.MapCommentTool.ControlBar.isVisible());
	});

	it('if not visible, 2 toggles should trigger show(), and then hide()', function() {
		assert.isNotOk(map.MapCommentTool.ControlBar.isVisible(), 'initial visibility state is hidden');
		assert.isOk(map.MapCommentTool.ControlBar.toggle(), 'toggle() executed successfully');
		assert.isOk(map.MapCommentTool.ControlBar.isVisible(), 'visibility state now hidden');
		assert.isOk(map.MapCommentTool.ControlBar.toggle(), 'toggle() executed successfully');
		assert.isNotOk(map.MapCommentTool.ControlBar.isVisible(), 'visibility state hidden once again');
	});

	it('if control bar is not visible, map controls should be enabled', function() {
		assert.isNotOk(map.MapCommentTool.ControlBar.isVisible(), 'initial visibility state is hidden');
		assert.isOk(map.dragging.enabled(), 'dragging is enabled');
		assert.isOk(map.touchZoom.enabled(), 'touchZoom is enabled');
		assert.isOk(map.doubleClickZoom.enabled(), 'doubleClickZoom is enabled');
		assert.isOk(map.scrollWheelZoom.enabled(), 'scrollWheelZoom is enabled');
		assert.isOk(map.boxZoom.enabled(), 'boxZoom is enabled');
		assert.isOk(map.keyboard.enabled(), 'keyboard is enabled');
	});

	it('if control bar is visible, map controls should be disabled', function() {
		assert.isOk(map.MapCommentTool.ControlBar.show(), 'show() executed successfully');
		assert.isOk(map.MapCommentTool.ControlBar.isVisible(), 'visibility state is visible');
		assert.isNotOk(map.dragging.enabled(), 'dragging is disabled');
		assert.isNotOk(map.touchZoom.enabled(), 'touchZoom is disabled');
		assert.isNotOk(map.doubleClickZoom.enabled(), 'doubleClickZoom is disabled');
		assert.isNotOk(map.scrollWheelZoom.enabled(), 'scrollWheelZoom is disabled');
		assert.isNotOk(map.boxZoom.enabled(), 'boxZoom is disabled');
		assert.isNotOk(map.keyboard.enabled(), 'keyboard is disabled');
		assert.isOk(map.MapCommentTool.ControlBar.hide(), 'hide() executed successfully');
		assert.isNotOk(map.MapCommentTool.ControlBar.isVisible(), 'visibility state hidden once again');
	});

});

describe('Tool Selection Combinations', function() {
	
	function hasClass(element, cls) {
	    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
	}

	it('in new comment, default tool selection is "pen"', function() {
		assert.isOk(map.MapCommentTool.ControlBar.show(), 'show() executed successfully');
		assert.isOk(map.MapCommentTool.ControlBar.isVisible(), 'visibility state is visible');

		comment = map.MapCommentTool.ControlBar.startNewComment();
		assert.isOk(comment, 'startNewComment() successfully returned');
		assert.equal(map.MapCommentTool.Tools.defaultTool, 'pen', 'default tool is set to pen');
		assert.equal(map.MapCommentTool.Tools.currentTool, 'pen', 'currentTool tool is set to pen');

		assert.isOk(hasClass(map.MapCommentTool.drawingCanvas._container, 'drawing-canvas-pen'), 'drawing canvas has pen class appended');
		assert.isNotOk(hasClass(map.MapCommentTool.drawingCanvas._container, 'drawing-canvas-eraser'), 'drawing canvas has no eraser class appended');
		assert.isNotOk(hasClass(map.MapCommentTool.drawingCanvas._container, 'drawing-canvas-text'), 'drawing canvas has no text class appended');		
	});

	it('setting tool to eraser', function() {
		assert.isOk(map.MapCommentTool.Tools.setCurrentTool('eraser'), 'tool set to eraser');
		assert.equal(map.MapCommentTool.Tools.currentTool, 'eraser', 'currentTool tool is set to eraser');
		assert.isOk(hasClass(map.MapCommentTool.drawingCanvas._container, 'drawing-canvas-eraser'), 'drawing canvas has eraser class appended');
		assert.isNotOk(hasClass(map.MapCommentTool.drawingCanvas._container, 'drawing-canvas-pen'), 'drawing canvas has no pen class appended');
		assert.isNotOk(hasClass(map.MapCommentTool.drawingCanvas._container, 'drawing-canvas-text'), 'drawing canvas has no text class appended');
	});

	it('setting tool to text and cancelling comment', function() {
		assert.isOk(map.MapCommentTool.Tools.setCurrentTool('text'), 'tool set to text');
		assert.equal(map.MapCommentTool.Tools.currentTool, 'text', 'currentTool tool is set to text');
		assert.isOk(hasClass(map.MapCommentTool.drawingCanvas._container, 'drawing-canvas-text'), 'drawing canvas has text class appended');
		assert.isNotOk(hasClass(map.MapCommentTool.drawingCanvas._container, 'drawing-canvas-pen'), 'drawing canvas has no pen class appended');
		assert.isNotOk(hasClass(map.MapCommentTool.drawingCanvas._container, 'drawing-canvas-eraser'), 'drawing canvas has no eraser class appended');

		assert.isOk(map.MapCommentTool.ControlBar.cancelDrawing(comment.id), 'cancelDrawing() returns true');
	});

});

describe('Empty Comment Creation, Cancellation, and Saving', function() {
	describe ('Empty Comment Creation w/ Cancel', function() {
		var comment;

		it('initially there are no canvas layers', function() {
			assert.equal(document.getElementsByTagName('canvas').length, 0, 'There are 0 canvas elements present on the page');
		});

		it('initially there are no comments in Comments.list nor on the control bar', function() {
			assert.equal(map.MapCommentTool.Comments.list.length, 0, 'There are 0 comments in Comments.list');
			
			var listComments = document.getElementsByClassName("comment-list-li");
			assert.equal(listComments.length, 0, 'There are 0 comments in the view');

		});

		it('"startNewComment()" creates a comment and appends it to Comments.list', function() {
			comment = map.MapCommentTool.ControlBar.startNewComment();
			assert.isOk(comment, 'startNewComment() successfully returned');
			assert.equal(map.MapCommentTool.Comments.list.length, 1, 'There is now 1 new comment');
			assert.isNotOk(map.MapCommentTool.Comments.saved(comment), 'comment has not yet been saved');
		});

		it('drawing mode has been successfully initiated', function() {
			assert.equal(map.MapCommentTool.currentMode, 'drawing', 'Mode set to "drawing"');
			assert.equal(document.getElementsByTagName('canvas').length, 1, 'There is 1 canvas element present on the page');
			assert.equal(map.MapCommentTool.ControlBar.currentView, 'drawing', 'View set to "drawing"');
		});

		it('comment successfully cancelled', function() {
			assert.isOk(map.MapCommentTool.ControlBar.cancelDrawing(comment.id), 'cancelDrawing() returns true');
			assert.equal(map.MapCommentTool.Comments.list.length, 0, 'There are still 0 comments');

			var listComments = document.getElementsByClassName("comment-list-li");
			assert.equal(listComments.length, 0, 'There are still 0 comments in the view');
			
			assert.equal(document.getElementsByTagName('canvas').length, 0, 'There are now 0 canvas elements present on the page');
			assert.equal(map.MapCommentTool.currentMode, 'controlBarHome', 'Mode is now set to "map"');
			assert.equal(map.MapCommentTool.ControlBar.currentView, 'home');
			
			var visibleComments = document.getElementsByClassName("leaflet-image-layer");
			assert.equal(visibleComments.length, 0, 'there are 0 image layers present on the map');

		});

	});

	describe('Empty Comment Creation w/ Save', function() {
		var comment;

		it('initially there are no canvas layers', function() {
			assert.equal(document.getElementsByTagName('canvas').length, 0, 'There are 0 canvas elements present on the page');
		});

		it('initially there are no comments in Comments.list nor on the control bar', function() {
			assert.equal(map.MapCommentTool.Comments.list.length, 0, 'There are 0 comments in Comments.list');
			
			var listComments = document.getElementsByClassName("comment-list-li");
			assert.equal(listComments.length, 0, 'There are 0 comments in the view');
		});

		it('"startNewComment()" creates a comment and appends it to Comments.list', function() {
			comment = map.MapCommentTool.ControlBar.startNewComment();
			assert.isOk(comment, 'startNewComment() successfully returned');
			assert.equal(map.MapCommentTool.Comments.list.length, 1, 'There is now 1 new comment');
			assert.isNotOk(map.MapCommentTool.Comments.saved(comment), 'comment has not yet been saved');
		});

		it('drawing mode has been successfully initiated', function() {
			assert.equal(map.MapCommentTool.currentMode, 'drawing', 'Mode set to "drawing"');
			assert.equal(document.getElementsByTagName('canvas').length, 1, 'There is 1 canvas element present on the page');
			assert.equal(map.MapCommentTool.ControlBar.currentView, 'drawing', 'View set to "drawing"');
		});

		it('comment successfully saved', function() {
			assert.isOk(map.MapCommentTool.ControlBar.saveDrawing(comment.id), 'saveDrawing() returns true');
			assert.equal(map.MapCommentTool.Comments.list.length, 1, 'There is now 1 comment');
			var listComments = document.getElementsByClassName("comment-list-li");
			assert.equal(listComments.length, 1, 'There is now 1 comment in the view');
			assert.equal(map.MapCommentTool.Comments.list[0].id, comment.id, 'The comment id has been saved successfully');
			assert.equal(document.getElementsByTagName('canvas').length, 0, 'There are now 0 canvas elements present on the page');
			assert.equal(map.MapCommentTool.currentMode, 'controlBarHome', 'Mode is now set to "map"');
			assert.equal(map.MapCommentTool.ControlBar.currentView, 'home');

			var visibleComments = document.getElementsByClassName("leaflet-image-layer");
			assert.equal(visibleComments.length, 1, 'there is 1 image layer present on the map');

		});
	});
});

describe('Drawn Comment Creation, Cancellation, and Saving', function() {
	describe('Drawn Comment Creation w/ Cancel', function() {
		var comment;

		it('initially there are no canvas layers', function() {
			assert.equal(document.getElementsByTagName('canvas').length, 0, 'There are 0 canvas elements present on the page');
		});

		it('initially there is 1 comment in Comments.list and on the control bar', function() {
			assert.equal(map.MapCommentTool.Comments.list.length, 1, 'There are 1 comments in Comments.list');
			
			var listComments = document.getElementsByClassName("comment-list-li");
			assert.equal(listComments.length, 1, 'There is 1 comment in the view');
		});

		it('"startNewComment()" creates a comment and appends it to Comments.list', function() {
			comment = map.MapCommentTool.ControlBar.startNewComment();
			assert.isOk(comment, 'startNewComment() successfully returned');
			assert.equal(map.MapCommentTool.Comments.list.length, 2, 'There are now 2 comments');
			assert.isNotOk(map.MapCommentTool.Comments.saved(comment), 'comment has not yet been saved');
		});

		it('drawing mode has been successfully initiated', function() {
			assert.equal(map.MapCommentTool.currentMode, 'drawing', 'Mode set to "drawing"');
			assert.equal(document.getElementsByTagName('canvas').length, 1, 'There is 1 element present on the page');
			assert.equal(map.MapCommentTool.ControlBar.currentView, 'drawing', 'View set to "drawing"');
		});

		it('check that pen tool is set by default', function() {
			assert.equal(map.MapCommentTool.Tools.currentTool, 'pen');
		});

		it('draw several strokes on the canvas', function() {
			var canvas = map.MapCommentTool.drawingCanvas._container;
			var ctx = map.MapCommentTool.drawingCanvas._ctx;
		 	ctx.rect(20,20,150,100);
			assert.equal(ctx.stroke(), undefined, 'Stroke successfully executed');
		});


		it('comment successfully cancelled', function() {
			assert.isOk(map.MapCommentTool.ControlBar.cancelDrawing(comment.id), 'cancelDrawing() returns true');
			assert.equal(map.MapCommentTool.Comments.list.length, 1, 'There is now 1 comment');
			var listComments = document.getElementsByClassName("comment-list-li");
			assert.equal(listComments.length, 1, 'There is now 1 comment in the view');
			assert.equal(document.getElementsByTagName('canvas').length, 0, 'There are now 0 canvas elements present on the page');
			assert.equal(map.MapCommentTool.currentMode, 'controlBarHome', 'Mode is now set to "map"');
			assert.equal(map.MapCommentTool.ControlBar.currentView, 'home');

			var visibleComments = document.getElementsByClassName("leaflet-image-layer");
			assert.equal(visibleComments.length, 1, 'there is 1 image layer present on the map');
		});
	});

	describe('Drawn Comment Creation w/ Save', function() {
		var comment;

		it('initially there are no canvas layers', function() {
			assert.equal(document.getElementsByTagName('canvas').length, 0, 'There are 0 canvas elements present on the page');
		});

		it('initially there is 1 comment in Comments.list and on the control bar', function() {
			assert.equal(map.MapCommentTool.Comments.list.length, 1, 'There are 1 comments in Comments.list');
			
			var listComments = document.getElementsByClassName("comment-list-li");
			assert.equal(listComments.length, 1, 'There is 1 comment in the view');
		});

		it('"startNewComment()" creates a comment and appends it to Comments.list', function() {
			comment = map.MapCommentTool.ControlBar.startNewComment();
			assert.isOk(comment, 'startNewComment() successfully returned');
			assert.equal(map.MapCommentTool.Comments.list.length, 2, 'There are now 2 comments');
			assert.isNotOk(map.MapCommentTool.Comments.saved(comment), 'comment has not yet been saved');
		});

		it('drawing mode has been successfully initiated', function() {
			assert.equal(map.MapCommentTool.currentMode, 'drawing', 'Mode set to "drawing"');
			assert.equal(document.getElementsByTagName('canvas').length, 1, 'There is 1 element present on the page');
			assert.equal(map.MapCommentTool.ControlBar.currentView, 'drawing', 'View set to "drawing"');
		});

		it('check that pen tool is set by default', function() {
			assert.equal(map.MapCommentTool.Tools.currentTool, 'pen');
		});

		it('draw several strokes on the canvas', function() {
			var canvas = map.MapCommentTool.drawingCanvas._container;
			var ctx = map.MapCommentTool.drawingCanvas._ctx;
		 	ctx.rect(20,20,150,100);
			assert.equal(ctx.stroke(), undefined, 'Stroke successfully executed');
		});


		it('comment successfully saved', function() {
			assert.isOk(map.MapCommentTool.ControlBar.saveDrawing(comment.id), 'saveDrawing() returns true');
			assert.equal(map.MapCommentTool.Comments.list.length, 2, 'There are now 2 comments');
			var listComments = document.getElementsByClassName("comment-list-li");
			assert.equal(listComments.length, 2, 'There are now 2 comments in the view');
			assert.equal(document.getElementsByTagName('canvas').length, 0, 'There are now 0 canvas elements present on the page');
			assert.equal(map.MapCommentTool.currentMode, 'controlBarHome', 'Mode is now set to "map"');
			assert.equal(map.MapCommentTool.ControlBar.currentView, 'home');

			var visibleComments = document.getElementsByClassName("leaflet-image-layer");
			assert.equal(visibleComments.length, 2, 'there are 2 image layers present on the map');
		});
	});
});

describe('Text Comment Creation, Saving and Editing', function() {
	describe('Text Comment Creation w/ Save', function() {
		var comment;

		it('initially there are no canvas layers', function() {
			assert.equal(document.getElementsByTagName('canvas').length, 0, 'There are 0 canvas elements present on the page');
		});

		it('initially there are 2 comments in Comments.list and on the control bar', function() {
			assert.equal(map.MapCommentTool.Comments.list.length, 2, 'There are 2 comments in Comments.list');
			
			var listComments = document.getElementsByClassName("comment-list-li");
			assert.equal(listComments.length, 2, 'There are 2 comment in the view');
		});

		it('"startNewComment()" creates a comment and appends it to Comments.list', function() {
			comment = map.MapCommentTool.ControlBar.startNewComment();
			assert.isOk(comment, 'startNewComment() successfully returned');
			assert.equal(map.MapCommentTool.Comments.list.length, 3, 'There are now 3 comments');
			assert.isNotOk(map.MapCommentTool.Comments.saved(comment), 'comment has not yet been saved');
		});

		it('drawing mode has been successfully initiated', function() {
			assert.equal(map.MapCommentTool.currentMode, 'drawing', 'Mode set to "drawing"');
			assert.equal(document.getElementsByTagName('canvas').length, 1, 'There is 1 canvas element present on the page');
			assert.equal(map.MapCommentTool.ControlBar.currentView, 'drawing', 'View set to "drawing"');
		});

		it('select text tool', function() {
			assert.isOk(map.MapCommentTool.Tools.setCurrentTool('text'), 'tool set to "text"');
			assert.equal(document.getElementsByTagName('textarea').length, 0, 'There are 0 textareas present on the page');
		});

		function click(el){
		    var ev = document.createEvent("MouseEvent");
		    ev.initMouseEvent(
		        "click",
		        true /* bubble */, true /* cancelable */,
		        window, null,
		        -1360, 326, 560, 264, /* coordinates */
		        false, false, false, false, /* modifier keys */
		        0 /*left*/, null
		    );
		    el.dispatchEvent(ev);
		}
	    
		it('select a point on the canvas', function() {
			click(map._container);
		});

		it('a text area has been added', function() {
			assert.equal(document.getElementsByTagName('textarea').length, 1, 'There is 1 textarea present on the page');
		});

		it('fill text area with sample text and save', function() {
		  	this.timeout(5000);
		  	var textId;
			document.getElementsByTagName('textarea')[0].value = "this is\nsome sample\nmultiline text";
            comment.getLayers().forEach(function(layer) {
	            if (layer.layerType == 'textArea') {
					textId = layer.textId;
				}
			});
			window.map.MapCommentTool.Tools.text.renderText(comment, textId, document.getElementsByTagName('textarea')[0].value);
			assert.isOk(map.MapCommentTool.ControlBar.saveDrawing(comment.id), 'comment successfully saved');
		});

		it('check that text image rendered and placed on map', function() {
			var visibleComments = document.getElementsByClassName("leaflet-image-layer");
			assert.equal(visibleComments.length, 4, 'there are 4 image layers present on the map (3 comments, 1 with a text image)');
		});

	});

	describe('Text Comment Edit w/ Cancel', function() {
	    it('to be implemented');
	});

	describe('Text Comment Edit w/ Save', function() {
		var comment;
		var image;
		var textLayer;

	    it('start edit mode on comment', function() {
	    	comment = map.MapCommentTool.Comments.list.slice(-1).pop();
		    comment.getLayers().forEach(function(layer) {
		        if (layer.layerType == 'drawing') {
		            image = layer;
		        }
		        if (layer.layerType == 'textArea') {
		            textLayer = layer;
		        }
		    });

			assert.isOk(map.MapCommentTool.ControlBar.editComment(comment, image), 'successfully started edit mode on comment');
			assert.isOk(map.MapCommentTool.Tools.setCurrentTool('text'), 'tool set to "text"');
	    });

	    it('text was saved and loaded correctly', function() {
	    	assert.equal(textLayer.textVal, "this is\nsome sample\nmultiline text", 'text was saved correctly');
	    	assert.equal(document.getElementsByTagName('textarea')[0].value, "this is\nsome sample\nmultiline text", 'text was loaded correctly');
	    });

		it('edit textArea and save', function() {
		  	this.timeout(5000);
			document.getElementsByTagName('textarea')[0].value += " wooo more text";
			comment = map.MapCommentTool.ControlBar.saveDrawing(comment.id);
			assert.isOk(comment, 'comment successfully saved');
		});
	    
	    it('was saved correctly', function() {
	    	assert.equal(map.MapCommentTool.Comments.list.slice(-1).pop().getLayers()[0].textVal, "this is\nsome sample\nmultiline text wooo more text", 'text was saved correctly');
	    });		

	});
});