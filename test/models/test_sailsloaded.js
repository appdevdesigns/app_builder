var assert = require('chai').assert;

describe('did sails load?', function() {

 it('should be there', function() {

    assert.isDefined(sails, ' --> Sails should be defined!');

 });
});

