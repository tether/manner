/**
 * Test dependencies.
 */

const test = require('tape')
const service = require('..')
const Stream = require('stream').Readable


test('get params from GET incoming message', assert => {
  assert.plan(1)
  const api = service({
    'get': (params) => {
      assert.deepEqual(params, {
        label: 'hello'
      })
    }
  })
  api(request('GET', 'label=hello'))
})

test('GET method should return empty object if no params has been specified', assert => {
  assert.plan(1)
  const api = service({
    'get': (params) => {
      assert.deepEqual(params, {})
    }
  })
  api(request('GET'))
})


test('get data from POST incoming message', assert => {
  assert.plan(1)
  const message = {
    foo: 'bar'
  }
  const api = service({
    'post': (params, data) => {
      assert.deepEqual(data, message)
    }
  })
  api(request('POST', 'label=hello', message))
})

/**
 * Simulate HTTP request.
 *
 * @param {String} method
 * @param {String} params
 * @param {Object} data
 * @api private
 */

function request (method, params, data) {
  const req = new Stream
  req._read = function () {}
  req.method = method
  req.url = params ? '?' + params : ''
  req.push(JSON.stringify(data))
  req.push(null)
  return req
}
