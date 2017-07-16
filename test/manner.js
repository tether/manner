/**
 * Test dependencies.
 */

const test = require('tape')
const service = require('..')
const concat = require('concat-stream')
const Readable = require('stream').Readable
const Writable = require('stream').Writable
const server = require('server-test')


test('should return a function', assert => {
  assert.plan(1)
  const api = service()
  assert.equal(typeof api, 'function')
})
