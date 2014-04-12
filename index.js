var express = require('express');
var Rollout = require('rollout');
var app     = express();
var rollout = null;

exports = module.exports = function(redis) {
  rollout = Rollout.create(redis);
  return app;
};

app.use(app.router);

app.get('/', function(req, res) {
  res.send('Hello World');
});