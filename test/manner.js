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

test('should call resource service with implicit path', assert => {
  assert.plan(1)
  const api = service({
    get() {
      return 'hello world'
    }
  })
  assert.equal(api.get('/'), 'hello world')
})


test('should call resource service with explicit path', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/': () => 'hello world'
    }
  })
  assert.equal(api.get('/'), 'hello world')
})
