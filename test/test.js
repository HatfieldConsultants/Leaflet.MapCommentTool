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
		assert.isNotOk(window.L.MapCommentTool.ControlBar.isVisible());
	});

});

describe('Control Bar Show/Hide', function() {

	it('isVisible() should initially be "false"', function() {
		assert.isNotOk(window.L.MapCommentTool.ControlBar.isVisible());
	});

	it('show() should return "true" and change "visible" to true', function() {
		assert.isOk(window.L.MapCommentTool.ControlBar.show(), 'show() executed successfully');
		assert.isOk(window.L.MapCommentTool.ControlBar.isVisible());
	});
	
	it('hide() should return "true" and change "visible" to false', function() {
		assert.isOk(window.L.MapCommentTool.ControlBar.hide(), 'hide() executed successfully');
		assert.isNotOk(window.L.MapCommentTool.ControlBar.isVisible());
	});

	it('if not visible, 2 toggles should trigger show(), and then hide()', function() {
		assert.isNotOk(window.L.MapCommentTool.ControlBar.isVisible(), 'initial visibility state is hidden');
		assert.isOk(window.L.MapCommentTool.ControlBar.toggle(), 'toggle() executed successfully');
		assert.isOk(window.L.MapCommentTool.ControlBar.isVisible(), 'visibility state now hidden');
		assert.isOk(window.L.MapCommentTool.ControlBar.toggle(), 'toggle() executed successfully');
		assert.isNotOk(window.L.MapCommentTool.ControlBar.isVisible(), 'visibility state hidden once again');
	});

});