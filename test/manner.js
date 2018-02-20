/**
 * Test dependencie(s)
 */

const test = require('tape')
const service = require('..')


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
  assert.equal(api.get('/'), 'hello world')
})


test('should call service a function service ', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/': () => 'hello world'
    }
  })
  assert.equal(api.get('/'), 'hello world')
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
  assert.equal(api.get('/'), 'hello world')
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
  assert.equal(api.get('/'), 'get hello world')
  assert.equal(api.get('/john'), 'get john')
  assert.equal(api.post('/'), 'post hello world')
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
  assert.equal(api.get('/john'), 'hello john')
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
