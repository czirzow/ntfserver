var express = require('express')
  , fs = require('fs')
  , path = require('path')
  , swig = require('swig')
  , routes = require('./routes')
  , shared = require('./shared')
  , utils = require('./utils')

var rootPath = path.resolve(path.join(__dirname, '..'))

exports.createServer = function(options) {
  var app = express.createServer()

  process.chdir(rootPath)

  var setDefault = function(section, option, value) {
    if (!options.hasOwnProperty(section)) {
      options[section] = {}
    }
    if (!options[section].hasOwnProperty(option)) {
      options[section][option] = value
    }
  }

  setDefault('http', 'access_log', '')
  setDefault('http', 'host', '127.0.0.1')
  setDefault('http', 'port', 8000)
  setDefault('http', 'url', 'http://' + options.http.host + ':' + options.http.port)
  setDefault('http', 'secret', 'secret')
  setDefault('http', 'static_path', path.join(rootPath, 'static'))
  setDefault('http', 'template_path', path.join(rootPath, 'templates'))
  setDefault('mysql', 'host', '127.0.0.1')
  setDefault('mysql', 'port', 3306)
  setDefault('mysql', 'database', 'ntf')
  setDefault('mysql', 'user', 'root')
  setDefault('mysql', 'password', 'root')
  setDefault('redis', 'host', '127.0.0.1')
  setDefault('redis', 'port', 6379)
  setDefault('redis', 'database', 0)

  app.configure(function() {
    if (options.http.access_log) app.use(express.logger())
    app.use(express['static'](options.http.static_path))
    app.use(express.cookieParser())
    app.use(express.bodyParser())
    app.set('jsonp callback', true)
    app.register('.html', swig)
    app.set('view engine', 'html')
    app.set('views', options.http.template_path)
    app.set('view options', { layout: false })
  })

  app.configure('dev', 'development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
    swig.init({ root: options.http.template_path, allowErrors: true, filters: utils.filters })
  })

  app.configure('prod', 'production', function() {
    app.use(express.errorHandler())
    swig.init({ root: options.http.template_path, allowErrors: false, filters: utils.filters })
  })

  shared.setup(options)
  shared.io.listen(app)
  routes.setup(app)

  return app
}

exports.run = function(options) {
  exports.createServer(options).listen(options.http.port)
}