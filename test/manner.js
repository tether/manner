/**
 * Test dependencies.
 */

const test = require('tape')
const service = require('..')
const concat = require('concat-stream')
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

test('Method params is always an object', assert => {
  assert.plan(1)
  const api = service({
    'get': (params) => {
      assert.deepEqual(params, {})
    }
  })
  api(request('GET'))
})


test('get data from POST incoming message', assert => {
  assert.plan(2)
  const message = {
    foo: 'bar'
  }
  const api = service({
    'post': (params, data) => {
      assert.deepEqual(params, {
        label: 'hello'
      })
      assert.deepEqual(data, message)
    }
  })
  api(request('POST', 'label=hello', message))
})


test('should stream returned object data', assert => {
  assert.plan(1)
  const api = service({
    'get': (params) => ({
      foo: 'bar'
    })
  })
  api(request('GET'))
    .pipe(concat(data => {
      assert.deepEqual(data[0], {
        foo: 'bar'
      })
    }))
})


test('should stream returned string data', assert => {
  assert.plan(1)
  const api = service({
    'get': (params) => 'hello world'
  })
  api(request('GET'))
    .pipe(concat(data => {
      assert.deepEqual(data.toString(), 'hello world')
    }))
})

test('should stream returned stream data', assert => {
  assert.plan(1)
  const api = service({
    'get': (params) => {
      const result = new Stream
      result._read = function () {}
      setTimeout(() => {
        result.push('hello ')
        setTimeout(() => {
          result.push('world')
          result.push(null)
        }, 1000)
      }, 1000)
      return result
    }
  })
  api(request('GET'))
    .pipe(concat(data => {
      assert.deepEqual(data.toString(), 'hello world')
    }))
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
