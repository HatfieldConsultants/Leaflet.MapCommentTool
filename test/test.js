var assert = chai.assert;

describe('Map Loaded Properly', function() {

	it('getCenter().lat should return proper lat', function() {
		assert.equal(map.getCenter().lat, 49.2827 );
	});

	it('getCenter().lng should return proper lng', function() {
		assert.equal(map.getCenter().lng, -123.1207 );
	});
});