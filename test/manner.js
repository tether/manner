/**
 * Test dependencies.
 */

const test = require('tape')
const service = require('..')
const concat = require('concat-stream')
const Readable = require('stream').Readable
const Writable = require('stream').Writable
const server = require('server-test')


test('get params from GET incoming message', assert => {
  assert.plan(1)
  const request = {
    qs: {
      label: 'hello'
    }
  }
  const api = service({
    'get': (params) => {
      assert.deepEqual(params, {
        label: 'hello'
      })
    }
  })
  server((req, res) => {
    api(req, res)
  }, request)
})

test('Method params is always an object', assert => {
  assert.plan(2)
  const api = service({
    'get': (params) => {
      assert.equal(typeof params, 'object')
      assert.equal(params != null, true)
    }
  })
  server((req, res) => {
    api(req, res)
  })
})


test('get data from POST incoming message', assert => {
  assert.plan(2)
  const message = {
    foo: 'bar'
  }
  const request = {
    method: 'POST',
    qs: {
      label: 'hello'
    },
    form: message
  }
  const api = service({
    'post': (params, data) => {
      assert.deepEqual(params, {
        label: 'hello'
      })
      assert.deepEqual(data, message)
    }
  })
  server((req, res) => {
    api(req, res)
  }, request)
})


test('should stream returned object data as string', assert => {
  assert.plan(1)
  const api = service({
    'get': (params) => ({
      foo: 'bar'
    })
  })
  server((req, res) => {
    api(req, res)
      .pipe(concat(data => {
        assert.deepEqual(JSON.parse(data), {
          foo: 'bar'
        })
      }))
  })
})


test('should stream returned string data', assert => {
  assert.plan(1)
  const api = service({
    'get': (params) => 'hello world'
  })
  server((req, res) => {
    api(req, res)
      .pipe(concat(data => {
        assert.deepEqual(data, 'hello world')
      }))
  })
})

test('should stream returned stream data', assert => {
  assert.plan(1)
  const api = service({
    'get': (params) => {
      const result = new Readable
      result._read = function () {}
      setTimeout(() => {
        result.push('hello ')
        setTimeout(() => {
          result.push('world')
          result.push(null)
        }, 10)
      }, 10)
      return result
    }
  })
  server((req, res) => {
    api(req, res)
      .pipe(concat(data => {
        assert.deepEqual(data.toString(), 'hello world')
      }))
  })
})


// test('should not stream returned writable stream data', assert => {
//   assert.plan(1)
//   const api = service({
//     'get': (params) => {
//       const result = new Writable
//       result._write = function () {}
//       setTimeout(() => {
//         result.write('hello ')
//         setTimeout(() => {
//           result.write('world')
//           //result.write(null)
//         }, 10)
//       }, 10)
//       return result
//     }
//   })
//   server((req, res) => {
//     api(req, res)
//       .pipe(concat(data => {
//         assert.deepEqual(data.toString(), 'hello world')
//       }))
//   }, 'get')
// })





test('should stream returned promise data', assert => {
  assert.plan(1)
  const api = service({
    'get': (params) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve('hello world'), 10)
      })
    }
  })
  server((req, res) => {
    api(req, res)
      .pipe(concat(data => {
        assert.deepEqual(data.toString(), 'hello world')
      }))
  })

})

test('should pass request and response', assert => {
  assert.plan(2)
  server((req, res) => {
    service({
      'get': (params, data, request, response) => {
        assert.equal(request, req)
        assert.equal(response, res)
      }
    })(req, res)
  }, {})
})


test('get accept dynamic routes', assert => {
  assert.plan(1)
  const request = {
    qs: {
      label: 'hello'
    }
  }
  const api = service({
    'get': {
      '/:name': (params) => {
        assert.deepEqual(params, {
          label: 'hello',
          name: 'foo'
        })
      }
    }
  })
  server((req, res) => {
    req.url = '/foo' + req.url.substring(1)
    api(req, res)
  }, request)
})
