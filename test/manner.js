/**
 * Test dependencies.
 */

const test = require('tape')
const fs = require('fs')
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


// method exist but returns null

test('should return value string from defined method', assert => {
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


test('should send 501 if method is not implementd', assert => {
  assert.plan(2)
  const api = service({
    post: 'hello world!'
  })
  server((req, res) => {
    api(req, res).pipe(res)
    assert.equal(res.statusCode, 501)
    assert.equal(res.statusMessage , 'Not Implemented')
  })
})

test('should execute value function from defined method', assert => {
  assert.plan(1)
  const api = service({
    get: () => 'hello world!'
  })
  server((req, res) => {
    api(req, res).pipe(concat(data => {
      assert.equal(data.toString(), 'hello world!')
    }))
  })
})


test('should chunk object returned by defined method', assert => {
  assert.plan(1)
  const api = service({
    get: () => ({
      name: 'hello'
    })
  })
  server((req, res) => {
    api(req, res).pipe(concat(data => {
      assert.deepEqual(JSON.parse(data), {
        name: 'hello'
      })
    }))
  })
})

test('should chunk streams returned by defined method', assert => {
  assert.plan(1)
  const api = service({
    get: () => fs.createReadStream(__dirname + '/manner.txt')
  })
  server((req, res) => {
    api(req, res).pipe(concat(data => assert.equal(data.toString(), 'hello world\n')))
  })
})

test('should chunk promise returned by defined method', assert => {
  assert.plan(1)
  const api = service({
    get: () => new Promise(resolve => resolve('hello'))
  })
  server((req, res) => {
    api(req, res).pipe(concat(data => assert.equal(data.toString(), 'hello')))
  })
})


test('should pass query parameters to value function', assert => {
  assert.plan(1)
  const api = service({
    get: (params) => params.first + ' ' + params.last
  })
  server((req, res) => {
    api(req, res).pipe(concat(data => {
      assert.equal(data.toString(), 'john doe')
    }))
  }, {
    qs: {
      first: 'john',
      last: 'doe'
    }
  })
})


test('should pass request and response', assert => {
  assert.plan(2)
  server((req, res) => {
    service({
      'get': (params, data, request, response) => {
        assert.equal(request, req)
        assert.equal(response, res)
        return ''
      }
    })(req, res)
  }, {})
})


test('should pass empty query object to value function when request does not have any query parameters', assert => {
  assert.plan(2)
  const api = service({
    get: (params) => {
      assert.equal(typeof params , 'object')
      assert.equal(params != null, true)
      return 'hello world'
    }
  })
  server((req, res) => {
    api(req, res)
  })
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
        return ''
      }
    }
  })
  server((req, res) => {
    req.url = '/foo' + req.url.substring(1)
    api(req, res)
  }, request)
})

test('get root route if dynamic path have been defined', assert => {
  assert.plan(1)
  const request = {
    qs: {
      label: 'hello'
    }
  }
  const api = service({
    'get': {
      '/': () => {
        assert.ok('path executed')
        return ''
      },
      '/:name': (params) => {
        assert.fail('should not be called')
        return ''
      }
    }
  })
  server((req, res) => {
    api(req, res)
  }, request)
})

test('should mixin query parameters with dynamic route params', assert => {
  assert.plan(2)
  const api = service({
    get: {
      '/:first': (query) => {
        assert.equal(query.first, 'olivier')
        assert.equal(query.last, 'doe')
        return ''
      }
    }
  })
  server((req, res) => {
    req.url = '/olivier' + req.url.substring(1)
    api(req, res)
  }, {
    qs: {
      first: 'john',
      last: 'doe'
    }
  })

})

test('should not have to return data', assert => {
  assert.plan(1)
  const api = service({
    get: () => {
      assert.ok('service executed')
    }
  })
  server((req, res) => {
    api(req, res)
  })
})

// test('should decode data passed in the body of a request and pass it to the appropriate value function', assert => {
//   assert.plan(2)
//   const message = {
//     foo: 'bar'
//   }
//   const request = {
//     method: 'POST',
//     qs: {
//       label: 'hello'
//     },
//     form: message
//   }
//   const api = service({
//     'post': (params, data) => {
//       assert.deepEqual(params, {
//         label: 'hello'
//       })
//       assert.deepEqual(data, message)
//       return ''
//     }
//   })
//   server((req, res) => {
//     api(req, res)
//   }, request)
// })
