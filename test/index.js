var admin  = require('..');
var assert = require('assert');
var Zombie = require('zombie');
var port   = 5666;

describe('admin', function() {

  before(function() {
    this.server = admin().listen(port);
  });

  beforeEach(function() {
    this.browser = new Zombie();
  })

  it('should be listening', function() {

  });

});