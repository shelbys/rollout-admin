var bodyParser = require('body-parser');
var compression = require('compression');
var errorHandler = require('errorhandler');
var express = require('express');
var methodOverride = require('method-override');
var Rollout = require('rollout');
var app     = express();
var rollout = null;

exports = module.exports = function(redis) {
  rollout = Rollout.create(redis);
  topLevelApp = express();
  topLevelApp.use('/rollout', app)
  return topLevelApp;
};

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(errorHandler());
app.use('/public', express.static(__dirname + '/public'));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/groups', function(req, res) {
  rollout.client.smembers(rollout.name('rollout:groups'), function(err, groups) {
    if (err) {
      return res.send(500);
    }

    res.render('groups', {
      groups: groups
    });
  });
});

app.get('/groups/:id', function(req, res) {
  var name = req.params.id;

  rollout.client.smembers(rollout.name('rollout:groups:' + name), function(err, features) {
    if (err) {
      return res.send(500);
    }

    res.render('groups/show', {
      features: features,
      group: name
    });
  });
});

app.get('/groups/:id/features/add', function(req, res) {
  var name = req.params.id;

  res.render('groups/new', {
    group: name
  });
});

app.get('/groups/:id/features/:feature/remove', function(req, res) {
  var group = req.params.id;
  var feature = req.params.feature;

  rollout.client.srem(rollout.name('rollout:groups:' + group), feature, function(err) {
    res.redirect('/rollout/groups/' + group);
  });
});

app.post('/groups/:id/features', function(req, res) {
  var group = req.params.id;
  var name  = req.body.feature;

  if (!name) {
    return res.send(400, {
      status: 'error',
      message: 'Missing feature name.'
    });
  }
  rollout.group(group, function() { return true; });
  rollout.group(group).activate(name).then(function() {
    res.redirect('/rollout/groups/' + group);
  });

});

app.get('/users', function(req, res) {
  rollout.client.smembers(rollout.name('rollout:users'), function(err, users) {
    if (err) {
      return res.send(500);
    }

    res.render('users', {
      users: users
    });
  });
});

app.get('/users/:id', function(req, res) {
  var name = req.params.id;

  rollout.client.smembers(rollout.name('rollout:users:' + name), function(err, features) {
    if (err) {
      return res.send(500);
    }

    res.render('users/show', {
      features: features,
      user: name
    });
  });
});

app.get('/users/:id/features/add', function(req, res) {
  var name = req.params.id;

  res.render('users/new', {
    user: name
  });
});

app.get('/users/:id/features/:feature/remove', function(req, res) {
  var user = req.params.id;
  var feature = req.params.feature;

  rollout.client.srem(rollout.name('rollout:users:' + user), feature, function(err) {
    res.redirect('/rollout/users/' + user);
  });
});

app.post('/users/:id/features', function(req, res) {
  var user = req.params.id;
  var name  = req.body.feature;

  if (!name) {
    return res.send(400, {
      status: 'error',
      message: 'Missing feature name.'
    });
  }
  rollout.user(user).activate(name).then(function() {
    res.redirect('/rollout/users/' + user);
  });

});

app.get('/deactivate', function(req, res) {
  res.render('deactivate');
});

app.post('/deactivate', function(req, res) {
  var feature = req.body.feature;

  rollout.deactivate(feature).then(function() {
    res.redirect('/rollout');
  });
});