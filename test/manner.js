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
