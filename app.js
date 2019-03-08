var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var path = require('path');
var fs = require('fs');
var flash = require('connect-flash');

var app = express();

app.set('port', (process.env.PORT || 5000));

var hex = (n) => {
  n = n || 32;
  var result = '';

  while (n--) {
    result += Math.floor(Math.random() * 16).toString(16).toUpperCase();
  }

  return result;
};

// set the session.userId
app.use(session({
  secret: 'secret_key_base', // TODO - should be better in a real app
  resave: false,
  saveUninitialized: true
}))

app.use(function (req, res, next) {
  if (!req.session.userId) {
    req.session.userId = hex()
  }

  next()
})

// flash messages
app.use(flash());

// load our asset manifest
if (app.settings.env === 'development') {
  app.use(function (req, res, next) {
    res.locals = {
      manifest: JSON.parse(fs.readFileSync(path.join(__dirname, '/public/packs/manifest.json')))
    };

    next();
  });
}
else {
  app.locals.manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '/public/packs/manifest.json')))
}

// tell it how to parse body contents
app.use(bodyParser.urlencoded({ extended: true }));

// override with POST having _method=delete
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method.toUpperCase();
  }
}));

app.use(function(req, res, next) {
  const _original_redirect = res.redirect

  res.redirect = function(path, options = {}) {
    if (req.accepts('text/javascript') && !req.accepts('text/html')) {
      res.header('Content-Type', 'text/javascript');
      res.send([
        "Turbolinks.clearCache();",
        // TODO - 👇 you wouldn't _normally_ change the path like this, but cheating to let both
        //         versions (turbolinks and non) be served together
        `Turbolinks.visit("${path == "/" ? "/turbolinks" : path}", "${options.mode || "replace"}");`
      ].join("\n"));
    }
    else {
      _original_redirect.apply(this, arguments)
    }
  };

  next();
})

// hang app root path
app.locals.root = path.join(__dirname);

// tell express where it can serve assets from
app.use(express.static(path.join(__dirname, '/public')));

// views is directory for all our template files
app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'ejs');

// controllers is a directory for all our routes
app.use(require(path.join(__dirname, '/app/controllers'))(app))

// sync() will create all table if they doesn't exist in database
var models = require(path.join(__dirname, '/app/models'));
models.sequelize.sync().then(function() {
  app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
    console.log('Running in '+ app.settings.env)
  });
});
