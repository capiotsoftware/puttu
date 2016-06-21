var zookeeper = require('node-zookeeper-client'),
  os = require('os'),
  uuid = require('uuid'),
  assert = require('assert')

var client = null
var basePath = null

function getIPAddress(){
  // 1. first check env variable PUTTU_PORT - process.env.PUTTU_INT
  // 2. then check the interface
  // 3. NOne of the above, fall back to eth0
  return 'localhost'
} 

function connect(_connectionString, _basepath){
  assert.notEqual(_connectionString, undefined, 'Empty connection string')
  client = zookeeper.createClient(_connectionString)
  client.connect()
  create(_basepath)
  basePath = _basepath
}

function register(_path, _data, _interface){
  return new Promise((resolve, reject) => {
    if(!_path) reject('Missing config path.')
    if(!_data) reject('Missing config value')
    var path = basePath + '/' + _path
    create(path).then(
      () => {
        var index = uuid.v4()
        var data = _data.protocol.toLowerCase() + '://' + getIPAddress(_interface) + ':' + _data.port + _data.api
        client.create(path + '/' + index, new Buffer(data), zookeeper.CreateMode.EPHEMERAL, _e => {
          if (_e) reject(_e)
          resolve();
        })
      },
      _e => reject(_e)
    );
  });
}

function create(_path) {
  return new Promise((resolve, reject) => {
    client.mkdirp(_path, function (_e) {
      if(_e) reject(_e)
      resolve()
    })
  });
}

function get(_path){
  var path = basePath + '/' + _path
  return new Promise((resolve, reject) => {
    client.getChildren(path,(_e, _d) => {
      if(_e) reject()
      if(_d.length < 1) reject()
      client.getData(path + '/' + _d[Math.floor(Math.random() * 100) % _d.length], (_e, _d) => {
        if(_e) reject()
        resolve(_d.toString('utf8'))
      })
    })
  });
}


exports.connect = connect
exports.register = register
exports.get = get