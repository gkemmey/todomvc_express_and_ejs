var express = require('express')

module.exports = function(app) {
  var router = express.Router()

  // one day we could load a more modular set of routes with something like
  // router.use('/comments', require('./comments'))

  router.get('/', function(req, res) {
    res.render('home')
  })

  // cribbing webpacker expects source maps to be served at the top level. this takes
  // a request for a source amp and pulls it out of /public/packs/
  //
  // TODO - is this needed? i don't even know...
  //
  router.get(/\/application.*\.js\.map$/, function(req, res, next) {
    var options = {
      root: app.locals.root + '/public/packs/',
      dotfiles: 'deny',
      headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
      }
    };

    var fileName = req.path;
    res.sendFile(fileName, options, function(error) {
      if (error) {
        next(error);
      }
      else {
        console.log('Sent:', fileName);
      }
    });
  })

  return router;
}
