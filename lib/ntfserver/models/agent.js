var global = require('../global')

var Agent = exports.Agent = function Agent(obj) {
  this.id = obj.id
  this.name = obj.name
}

Agent.cache = {}
Agent.prototype.className = 'agent'

Agent.setup = function(cb) {
  global.sql.query(
    'CREATE TABLE IF NOT EXISTS agent (' +
    '    `agent_id`             int unsigned auto_increment NOT NULL,' +
    '    `name`                 varchar(255) NOT NULL,' +
    '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '    PRIMARY KEY (`agent_id`),' +
    '    UNIQUE KEY (`name`),' +
    '    KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

Agent.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object') return cb(new Error('Requires object'))
  if (typeof(obj.name) !== 'string') return cb(new Error('Invalid name type'))
  if (Agent.cache.hasOwnProperty(obj.name)) return cb(null, Agent.cache[obj.name])

  global.sql.query(
    'INSERT INTO agent (name) VALUES (?)' +
    '  ON DUPLICATE KEY UPDATE agent_id = last_insert_id(agent_id)', [obj.name],
  function(err, info) {
    if (err) return cb(err)
    var agent = Agent.cache[obj.name] = new Agent({ id: info.insertId, name: obj.name })
    cb(null, agent)
  })
}