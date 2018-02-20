/**
 * Test dependencie(s)
 */

const test = require('tape')
const service = require('..')
const http = require('server-test')



test('should be a high order function', assert => {
  assert.plan(1)
  const api = service({})
  assert.equal(typeof api, 'function')
})

test('should call function as a service', assert => {
  assert.plan(1)
  const api = service({
    get() {
      return 'hello world'
    }
  })
  api.get('/').then(val => assert.equal(val, 'hello world'))
})


test('should call service a function service ', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/': () => 'hello world'
    }

  })
  api.get('/').then(val => assert.equal(val, 'hello world'))
})


test('should call service from a service object', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/': {
        service() {
          return 'hello world'
        }
      }
    }
  })
  api.get('/').then(val => assert.equal(val, 'hello world'))
})


test('should define multiple services', assert => {
  assert.plan(3)
  const api = service({
    get: {
      '/': {
        service() {
          return 'get hello world'
        }
      },
      '/john': () => 'get john'
    },
    post: () => 'post hello world'
  })
  api.get('/').then(val => assert.equal(val, 'get hello world'))
  api.get('/john').then(val => assert.equal(val, 'get john'))
  api.post('/').then(val => assert.equal(val, 'post hello world'))
})


test('should accept custom routes', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/:name': {
        service(data) {
          return 'hello ' + data.name
        }
      }
    }
  })
  api.get('/john').then(val => assert.equal(val, 'hello john'))
})


// test('should accept aliases', assert => {
//   assert.plan(1)
//   const api = service({
//     get: {
//       '/foo' : '/world',
//       '/:name': {
//         service(data) {
//           return 'hello ' + data.name
//         }
//       }
//     }
//   })
//   assert.equal(api.get('/foo'), 'hello world')
// })


test('should automatically generate options', assert => {
  assert.plan(2)
  const api = service({
    get: {
      '/': {
        service() {
          return 'hello world'
        }
      }
    }
  })
  api.options('/').then(val => {
    assert.equal(typeof val, 'object')
    assert.deepEqual(val['Access-Control-Allow-Methods'], 'GET, OPTIONS')
  })
})


test('should apply and resolve schema', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/': {
        data: {
          name: {
            default: 'john'
          }
        },
        service(data) {
          return 'hello ' + data.name
        }
      }
    }
  })
  api.get('/').then(val => assert.equal(val, 'hello john'))
})

test('should apply and reject schema', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/': {
        data: {
          name: {
            required: true
          }
        },
        service(data) {
          return 'hello ' + data.name
        }
      }
    }
  })
  api.get('/').then(null, reason => {
    assert.equal(reason.message, 'field name is missing')
  })
})


test('should call a service and pass manner core as its scope', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/': function () {
        return this.get('/hello')
      },
      '/hello': () => 'hello world'
    }
  })
  api.get('/').then(val => assert.equal(val, 'hello world'))
})
