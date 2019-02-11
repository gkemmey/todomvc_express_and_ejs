var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express();

app.set('port', (process.env.PORT || 5000));

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

// hang app root path
app.locals.root = path.join(__dirname);

// tell express where it can serve assets from
app.use(express.static(path.join(__dirname, '/public')));

// views is directory for all our template files
app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'ejs');

// controllers is a directory for all our routes
app.use(require(path.join(__dirname, '/app/controllers'))(app))

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
  console.log('Running in '+ app.settings.env)
});
