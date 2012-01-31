var async = require('async')
  , fs = require('fs')
  , path = require('path')
  , helper = require('./assets/helper')
  , global = require('../lib/ntfserver/global')
  , store = require('../lib/ntfserver/store')

exports.setUp = helper.setUpSql
exports.tearDown = helper.tearDownSql

var suite = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets',
  'suite.json')).toString())

exports.handleSuite = function(test) {
  var work = []

  work.push(function(cb) {
    global.sql.query('SELECT * FROM agent', [], function(err, results) {
      if (err) return cb(err)
      test.equal(results.length, 1)
      test.equal(results[0].name, 'agent')
      cb()
    })
  })

  work.push(function(cb) {
    global.sql.query('SELECT * FROM suite', [], function(err, results) {
      if (err) return cb(err)
      test.equal(results.length, 1)
      test.equal(results[0].name, 'www.example.org')
      cb()
    })
  })

  work.push(function(cb) {
    global.sql.query('SELECT * FROM suite_result', [],
    function(err, results) {
      if (err) return cb(err)
      test.equal(results.length, 1)
      test.equal(results[0].duration, 36)
      test.equal(results[0].pass_count, 7)
      test.equal(results[0].fail_count, 1)
      test.equal(results[0].time, 1327609606)
      cb()
    })
  })

  work.push(function(cb) {
    global.sql.query('SELECT * FROM test ORDER BY name', [], function(err, results) {
      if (err) return cb(err)
      test.equal(results.length, 3)
      test.equal(results[0].name, 'healthcheck')
      test.equal(results[1].name, 'robots')
      test.equal(results[2].name, 'stats')
      cb()
    })
  })

  work.push(function(cb) {
    global.sql.query(
      'SELECT t.name AS name, tr.duration AS duration,' +
      '  tr.pass_count AS pass_count, tr.fail_count AS fail_count' +
      '  FROM test_result tr' +
      '  LEFT JOIN test t ON ' +
      '  t.test_id = tr.test_id ORDER BY t.name', [],
    function(err, results) {
      if (err) return cb(err)
      test.equal(results.length, 3)
      test.equal(results[0].duration, 10)
      test.equal(results[0].pass_count, 3)
      test.equal(results[0].fail_count, 0)
      test.equal(results[1].duration, 15)
      test.equal(results[1].pass_count, 2)
      test.equal(results[1].fail_count, 0)
      test.equal(results[2].duration, 11)
      test.equal(results[2].pass_count, 2)
      test.equal(results[2].fail_count, 1)
      cb()
    })
  })

  work.push(function(cb) {
    global.sql.query('SELECT * FROM assertion ORDER BY name', [], function(err, results) {
      if (err) return cb(err)
      test.equal(results.length, 5)
      test.equal(results[0].name, 'Content contains "User-agent"')
      test.equal(results[1].name, 'Content is JSON')
      test.equal(results[2].name, 'Healthcheck is active')
      test.equal(results[3].name, 'Stats includes version')
      test.equal(results[4].name, 'Status code is 200')
      cb()
    })
  })

  work.push(function(cb) {
    global.sql.query(
      'SELECT a.name AS name, ar.ok AS ok' +
      '  FROM ' +
      '    assertion_result ar' +
      '  LEFT JOIN assertion a ON ' +
      '    a.assertion_id = ar.assertion_id' +
      '  LEFT JOIN test_result tr ON ' +
      '    ar.test_result_id = tr.test_result_id' +
      '  LEFT JOIN test t ON ' +
      '    t.test_id = tr.test_id' +
      '  ORDER BY t.name, a.name', [],
    function(err, results) {
      if (err) return cb(err)
      test.equal(results.length, 8)
      test.equal(results[0].name, 'Content is JSON')
      test.equal(results[0].ok, 1)
      test.equal(results[1].name, 'Healthcheck is active')
      test.equal(results[1].ok, 1)
      test.equal(results[2].name, 'Status code is 200')
      test.equal(results[2].ok, 1)
      test.equal(results[3].name, 'Content contains "User-agent"')
      test.equal(results[3].ok, 1)
      test.equal(results[4].name, 'Status code is 200')
      test.equal(results[4].ok, 1)
      test.equal(results[5].name, 'Content is JSON')
      test.equal(results[5].ok, 1)
      test.equal(results[6].name, 'Stats includes version')
      test.equal(results[6].ok, 0)
      test.equal(results[7].name, 'Status code is 200')
      test.equal(results[7].ok, 1)
      cb()
    })
  })

  store.handleSuite(suite, function(err) {
    async.parallel(work, function(err) {
      test.ok(!err, err)
      test.done()
    })
  })
}