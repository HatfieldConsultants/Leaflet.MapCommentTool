var assert = chai.assert;

describe('Map Loaded Properly', function() {

	it('getCenter().lat should return proper lat', function() {
		assert.equal(map.getCenter().lat, 49.2827 );
	});
	it('getCenter().lng should return proper lng', function() {
		assert.equal(map.getCenter().lng, -123.1207 );
	});
});

describe('Plugin Loaded Properly', function() {

	it('getMessage() should return "Map Comment Tool"', function() {
		assert.equal(map.MapCommentTool.getMessage(), 'Map Comment Tool' );
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


describe('Comment Creation', function() {
	it('initially there are no canvas layers', function() {
		assert.equal(document.getElementsByTagName('canvas').length, 0, 'There are 0 canvas elements present on the page');
	});

	it('initially there are no comments in Comments.list', function() {
		assert.equal(map.MapCommentTool.Comments.list.length, 0, 'There are 0 comments')
	});

	it('"startNewComment()" creates a comment and appends it to Comments.list', function() {
		var comment = map.MapCommentTool.ControlBar.startNewComment();
		assert.isOk(comment, 'startNewComment() successfully returned');
		assert.equal(map.MapCommentTool.Comments.list.length, 1, 'There is now 1 new comment');
		assert.isNotOk(map.MapCommentTool.Comments.saved(comment), 'comment has not yet been saved');
	});

	

	
});