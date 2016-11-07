var assert = chai.assert;

describe('Hello Test', function() {
	it('respond with hello wold', function() {
		assert.equal(L.MapCommentTool.sayHello(), 'hello world');
	});
});