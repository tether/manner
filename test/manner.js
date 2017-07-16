/**
 * Test dependencies.
 */

const test = require('tape')
const service = require('..')
const concat = require('concat-stream')
const Readable = require('stream').Readable
const Writable = require('stream').Writable
const server = require('server-test')


test('should be a high order function', assert => {
  assert.plan(1)
  const api = service({})
  assert.equal(typeof api, 'function')
})

// test('should return a readable stream when passed a http request and response', assert => {
//   assert.plan(1)
//   const api = service()
//   server((req, res) => {
//     const stream = api(req, res)
//     assert.equal(stream instanceof Readable, true)
//   })
//
// })


test('should return value from defined method', assert => {
  assert.plan(1)
  const api = service({
    get: 'hello world!'
  })
  server((req, res) => {
    api(req, res).pipe(concat(data => {
      assert.equal(data.toString(), 'hello world!')
    }))
  })
})
