var puttu = require('./index.js')

puttu.connect('localhost:2181', '/sk/config')

puttu.register('test', {
  protocol: 'http',
  port: '10001',
  api: '/brand/v1'
}).then(
  () => console.log('Registered self'),
  e => console.log(e)
);

puttu.get('test').then(
  d => console.log(d),
  e => console.log(e)
)