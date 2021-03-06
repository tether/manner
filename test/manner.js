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


test('should accept aliases', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/foo' : '/world',
      '/:name': {
        service(data) {
          return 'hello ' + data.name
        }
      }
    }
  })
  api.get('/foo').then(val => assert.equal(val, 'hello world'))
})


test('should reject undefined aliases', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/foo' : '/world',
      '/': {
        service(data) {
          return 'hello ' + data.name
        }
      }
    }
  })

  api.get('/foo').then(null, err => {
    assert.equal(err.message, 'service /foo not implemented')
  })
})


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


test('should support nesting of services', assert => {
  assert.plan(5)
  const api = service({
    get: {
      '/': {
        service : () => 'hello world',
        routes: {
          '/john': {
            service: () => 'hello john',
            routes: {
              '/doe': {
                service: () => 'hello john doe'
              }
            }
          },
          '/jane': {
            service: () => 'hello jane',
            routes: {
              '/doe': {
                service: () => 'hello jane doe'
              }
            }
          }
        }
      }
    }
  })
  api.get('/').then(val => assert.equal(val, 'hello world'))
  api.get('/john').then(val => assert.equal(val, 'hello john'))
  api.get('/john/doe').then(val => assert.equal(val, 'hello john doe'))
  api.get('/jane').then(val => assert.equal(val, 'hello jane'))
  api.get('/jane/doe').then(val => assert.equal(val, 'hello jane doe'))
})

test('should generate options for nested services', assert => {
  assert.plan(5)
  const api = service({
    get: {
      '/': {
        service : () => 'hello world',
        routes: {
          '/john': {
            service: () => 'hello john',
            routes: {
              '/doe': {
                service: () => 'hello john doe'
              }
            }
          },
          '/jane': {
            service: () => 'hello jane',
            routes: {
              '/doe': {
                service: () => 'hello jane doe'
              }
            }
          }
        }
      }
    }
  })
  api.options('/').then(val => assert.equal(typeof val, 'object'))
  api.options('/john').then(val => assert.equal(typeof val, 'object'))
  api.options('/john/doe').then(val => assert.equal(typeof val, 'object'))
  api.options('/jane').then(val => assert.equal(typeof val, 'object'))
  api.options('/jane/doe').then(val => assert.equal(typeof val, 'object'))
})
