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
