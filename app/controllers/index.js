var express = require('express')

module.exports = function(app) {
  var router = express.Router()
  var models = require("../models")


  router.get('/turbolinks', function(req, res) {
    var query = { where: { sessionUserId: req.session.userId } }
    var filtering = !(req.query.completed === null || req.query.completed === undefined)

    if (filtering) {
      query.where.completed = req.query.completed === "true"
    }

    models.Todo.
      findAll(query).
      then(function(todos) {
        res.render('turbolinks', {
          todos: todos,
          url: req.originalUrl,
          filtering: filtering,
          flash: req.flash('error')
        })
      })
  })

  router.get('/', function(req, res) {
    var query = { where: { sessionUserId: req.session.userId } }
    var filtering = !(req.query.completed === null || req.query.completed === undefined)

    if (filtering) {
      query.where.completed = req.query.completed === "true"
    }

    models.Todo.
      findAll(query).
      then(function(todos) {
        res.render('index', {
          todos: todos,
          url: req.originalUrl,
          filtering: filtering,
          flash: req.flash('error')
        })
      })
  })

  router.post('/', function(req, res) {
    models.Todo.
      create({ title: req.body.todo.title, sessionUserId: req.session.userId }).
      then(function() {
        res.redirect('/');
      }).
      catch((error) => {
        req.flash('error', `You already have a todo called '${req.body.todo.title}'`)
        res.redirect('/');
      });
  })

  router.patch('/update_many', function(req, res) {
    models.Todo.
      update(
        { completed: Array.from(req.body.todo.completed).slice(-1)[0] === "1" },
        { where: { id: req.body.ids, sessionUserId: req.session.userId } }
      ).
      then(function() {
        res.redirect('/');
      })
  })

  router.delete('/destroy_many', function(req, res) {
    models.Todo.
      destroy({ where: { id: req.body.ids, sessionUserId: req.session.userId } }).
      then(function() {
        res.redirect('/');
      })
  })

  router.patch('/:id', function(req, res) {
    models.Todo.
      findOne({ where: { id: req.params.id, sessionUserId: req.session.userId } }).
      then((todo) => {
        var { title, completed } = req.body.todo
        if (title) { todo.title = title }
        if (completed) { todo.completed = Array.from(completed).slice(-1)[0] === "1" }

        todo.save().then(() => {
          res.redirect('/');
        })
      })
  })

  router.delete('/:id', function(req, res) {
    models.Todo.
      destroy({ where: { id: req.params.id, sessionUserId: req.session.userId } }).
      then(function() {
        res.redirect('/');
      })
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
