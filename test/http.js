/**
 * Test dependencie(s)
 */

const test = require('tape')
const service = require('..')
const http = require('server-test')
const concat = require('concat-stream')
const fs = require('fs')


test('should stream service', assert => {
  assert.plan(2)
  const api = service({
    get() {
      return 'hello world'
    }
  })
  server(api, (data, res) => {
    assert.equal(res.statusCode, 200)
    assert.equal(data.toString(), 'hello world')
  })
})


test('should stream error payload and set status code', assert => {
  assert.plan(2)
  const api = service({
    get: {
      '/': {
        service: () => 'hello world',
        data: {
          name: {
            required: true
          }
        }
      }
    }
  })

  server(api, (data, res) => {
    assert.equal(JSON.parse(data).error.message, 'field name is missing')
    assert.equal(res.statusCode, 400)
  })
})


test('should stream error 501 if method not implemented', assert => {
  assert.plan(2)
  const api = service({
    post: () => {}
  })

  server(api, (data, res) => {
    assert.deepEqual(JSON.parse(data), {
      error: {
        status: 501,
        message: 'method GET not implemented',
        payload: {}
      }
    })
    assert.equal(res.statusCode, 501)
  })
})


test('should not have to return data', assert => {
  assert.plan(1)
  const api = service({
    get: () => {
      assert.ok('service executed')
    }
  })
  server(api, (data, res) => {})
})


test('should chunk streams through HTTP respsonse', assert => {
  assert.plan(1)
  const api = service({
    get: () => fs.createReadStream(__dirname + '/manner.txt')
  })
  server(api, (data, res) => {
    assert.equal(data.toString(), 'hello world\n')
  })
})


test('should send promise through HTTP respsonse', assert => {
  assert.plan(1)
  const api = service({
    get: () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve('hello world'), 30)
      })
    }
  })
  server(api, (data, res) => {
    assert.equal(data.toString(), 'hello world')
  })
})


test('should send object through HTTP response', assert => {
  assert.plan(1)
  const api = service({
    get: () => {
      return {
        foo: 'bar'
      }
    }
  })
  server(api, (data, res) => {
    assert.deepEqual(JSON.parse(data),{
      foo: 'bar'
    })
  })
})

test('should pass query parameters to value function', assert => {
  assert.plan(1)
  const api = service({
    get: (data) =>  data
  })

  server(api, (data, res) => {
    assert.deepEqual(JSON.parse(data),{
      first: 'john',
      last: 'doe'
    })
  }, {
    qs: {
      first: 'john',
      last: 'doe'
    }
  })
})


test('should mixin request query parameter for compatibility with third party framework', assert => {
  assert.plan(1)
  const api = service({
    get: (data) =>  data
  })

  server(api, (data, res) => {
    assert.deepEqual(JSON.parse(data),{
      first: 'jane',
      last: 'doe'
    })
  }, {
    qs: {
      first: 'john',
      last: 'doe'
    }
  }, {
    query: {
      first: 'jane'
    }
  })
})


test('should work with empty POST request', assert => {
  assert.plan(1)
  const api = service({
    post: (data) =>  data
  })

  server(api, (data, res) => {
    assert.deepEqual(JSON.parse(data), {})
  }, {
    method: 'POST'
  })
})


test('should work with POST request and body', assert => {
  assert.plan(1)
  const api = service({
    post: (data) =>  data
  })

  server(api, (data, res) => {
    assert.deepEqual(JSON.parse(data), {
      foo: 'bar'
    })
  }, {
    method: 'POST',
    form: {
      foo: 'bar'
    }
  })
})


test('should mixin query parameters and body content for POST request', assert => {
  assert.plan(1)
  const api = service({
    post: (data) =>  data
  })

  server(api, (data, res) => {
    assert.deepEqual(JSON.parse(data), {
      foo: 'bar',
      city: 'calgary'
    })
  }, {
    method: 'POST',
    qs: {
      city: 'calgary',
      foo: 'boop'
    },
    form: {
      foo: 'bar'
    }
  })
})


test('should limit the number of bytes of POST content', assert => {
  assert.plan(1)
  const api = service({
    post: {
      '/': {
        limit: 1,
        service: data => data
      }
    }
  })

  server(api, (data, res) => {
    assert.deepEqual(JSON.parse(data), {})
  }, {
    method: 'POST',
    form: {
      foo: 'bar'
    }
  })
})


test('should pass request and response', assert => {
  assert.plan(2)
  http((req, res) => {
    service({
      'get': (data, request, response) => {
        assert.equal(request, req)
        assert.equal(response, res)
      }
    })(req, res).pipe(res)
  }, null, true)
})


test('should pass empty data if no query parameters or body content', assert => {
  assert.plan(1)
  const api = service({
    get: data => data
  })
  server(api, (data, res) => {
    assert.deepEqual(JSON.parse(data), {})
  })
})


test('call service with dynamic route', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/:name': (data) => {
        assert.deepEqual(data, {
          name: 'foo'
        })
      }
    }
  })

  http((req, res) => {
    req.url = '/foo' + req.url.substring(1)
    api(req, res).pipe(res)
  }, null, true)
})


test('call root service even if dynamic route has been defined', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/': data => 'hello world',
      '/:name': (data) => {
        return {
          name: 'foo'
        }
      }
    }
  })

  server(api, (data, res) => {
    assert.deepEqual(data.toString(), 'hello world')
  })
})

test('mixin dynamic route params with query parameters', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/:name': (data) => {
        assert.deepEqual(data, {
          name: 'foo',
          city: 'calgary'
        })
      }
    }
  })

  http((req, res) => {
    req.url = '/foo' + req.url.substring(1)
    api(req, res).pipe(res)
  }, {
    qs: {
      city: 'calgary',
      name: 'bar'
    }
  }, true)
})


test('should call middlware', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/': {
        middleware: [
          data => ({name: 'john'})
        ],
        service: data => data
      }
    }
  })
  server(api, (data, res) => {
    assert.deepEqual(JSON.parse(data), {
      name: 'john'
    })
  })
})

test('should call multiple middleware in serie', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/': {
        middleware: [
          data => ({name: 'john'}),
          data => ({...data, city: 'calgary'})
        ],
        service: data => data
      }
    }
  })
  server(api, (data, res) => {
    assert.deepEqual(JSON.parse(data), {
      name: 'john',
      city: 'calgary'
    })
  })
})

test('should call multiple async middleware in serie', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/': {
        middleware: [
          data => ({name: 'john'}),
          data => new Promise(resolve => setTimeout(() => resolve({...data, city: 'calgary'}), 60)),
          data => new Promise(resolve => setTimeout(() => resolve({...data, country: 'canada'}), 10)),
          data => ({...data, name: 'olivier'})
        ],
        service: data => data
      }
    }
  })
  server(api, (data, res) => {
    assert.deepEqual(JSON.parse(data), {
      name: 'olivier',
      city: 'calgary',
      country: 'canada'
    })
  })
})


test('should accept  aliases', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/foo' : '/world',
      '/:name': {
        service(data) {
          assert.equal(data.name, 'world')
        }
      }
    }
  })

  http((req, res) => {
    req.url = '/foo'
    api(req, res).pipe(res)
  }, null, true)
})


test('should send error if alias does not exist', assert => {
  assert.plan(2)
  const api = service({
    get: {
      '/' : '/world',
      '/foo': {
        service(data) {
          assert.equal(data.name, 'world')
        }
      }
    }
  })

  server(api, (data, res) => {
    assert.equal(res.statusCode, 400)
    assert.deepEqual(JSON.parse(data), {
      error: {
        status: 400,
        message: 'service / not implemented',
        payload: {}
      }
    })
  })
})



test('should set content type application/json if object returned is an object', assert => {
  assert.plan(1)
  const api = service({
    get() {
      return {}
    }
  })
  server(api, (data, res) => {
    assert.equal(res.getHeader('Content-Type'), 'application/json; charset=utf-8')
  })
})

test('should set content type text/plain if object returned is not an object', assert => {
  assert.plan(1)
  const api = service({
    get() {
      return 'hello world'
    }
  })
  server(api, (data, res) => {
    assert.equal(res.getHeader('Content-Type'), 'text/plain; charset=utf-8')
  })
})

test('should set content type application/json if error', assert => {
  assert.plan(1)
  const api = service({
    get() {
      throw new Error('whaaaat')
    }
  })
  server(api, (data, res) => {
    assert.equal(res.getHeader('Content-Type'), 'application/json; charset=utf-8')
  })
})


test('should set custom content type', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/': {
        options: {
          type: 'markdown'
        },
        service: data => `# Hello world`
      }
    }
  })
  server(api, (data, res) => {
    assert.equal(res.getHeader('Content-Type'), 'text/markdown; charset=utf-8')
  })
})

test('should set content type based on file', assert => {
  assert.plan(1)
  const api = service({
    get: () => fs.createReadStream(__dirname + '/manner.html')
  })
  server(api, (data, res) => {
    assert.equal(res.getHeader('Content-Type'), 'text/html; charset=utf-8')
  })
})

test('should be able to set custom status code in case of success', assert => {
  assert.plan(1)
  const api = service({
    get: {
      '/': {
        options: {
          status: 201
        },
        service: data => data
      }
    }
  })
  server(api, (data, res) => {
    assert.equal(res.statusCode, 201)
  })
})


test('should stub service with one user story', assert => {
  assert.plan(2)
  const api = service({
    post: {
      '/': {
        service() {},
        stories: [{
          data: {
            name: 'hello'
          },
          status: 200,
          payload: {
            created: true
          }
        }, {
          data: {
            name: 'something else'
          },
          status: 404,
          payload: {
            created: false
          }
        }]
      }
    }
  }, true)
  server(api, (data, res) => {
    assert.equal(res.statusCode, 200)
    assert.deepEqual(JSON.parse(data), {
      created: true
    })
  }, {
    method: 'POST',
    form: {
      name: 'hello'
    }
  })
})


test('should stub service and go through every user story', assert => {
  assert.plan(2)
  const api = service({
    post: {
      '/': {
        service() {},
        stories: [{
          data: {
            name: 'hello'
          },
          status: 200,
          payload: {
            created: true
          }
        }, {
          data: {
            name: 'something else'
          },
          status: 404,
          payload: {
            created: false
          }
        }]
      }
    }
  }, true)
  server(api, (data, res) => {
    assert.equal(res.statusCode, 404)
    assert.deepEqual(JSON.parse(data), {
      created: false
    })
  }, {
    method: 'POST',
    form: {
      name: 'something else'
    }
  })
})


test('should give indication if user story does not exist', assert => {
  assert.plan(2)
  const api = service({
    post: {
      '/': {
        service() {},
        stories: [{
          data: {
            name: 'hello'
          },
          status: 200,
          payload: {
            created: true
          }
        }, {
          data: {
            name: 'something else'
          },
          status: 404,
          payload: {
            created: false
          }
        }]
      }
    }
  }, true)
  server(api, (data, res) => {
    assert.equal(res.statusCode, 422)
    assert.deepEqual(JSON.parse(data), {
      error: {
        status: 422,
        message: 'request content does not match any user story',
        payload: {}
      }
    })
  }, {
    method: 'POST',
    form: {
      name: 'what'
    }
  })
})


test('should stub service and go through  user stories define as object', assert => {
  assert.plan(2)
  const api = service({
    post: {
      '/': {
        service() {},
        stories: {
          'success': {
            data: {
              name: 'hello'
            },
            status: 200,
            payload: {
              created: true
            }
          },
          'failure': {
            data: {
              name: 'something else'
            },
            status: 404,
            payload: {
              created: false
            }
          }
        }
      }
    }
  }, true)
  server(api, (data, res) => {
    assert.equal(res.statusCode, 404)
    assert.deepEqual(JSON.parse(data), {
      created: false
    })
  }, {
    method: 'POST',
    form: {
      name: 'something else'
    }
  })
})



// test('should stream services returning array', assert => {
//   assert.plan(2)
//   const api = service({
//     get() {
//       return ['hello world']
//     }
//   })
//   server(api, (data, res) => {
//     assert.equal(res.statusCode, 200)
//     assert.deepEqual(JSON.parse(data), ['hello world'])
//   })
// })


/**
 * Create HTTP server.
 *
 * @param {Stream} api
 * @param {Function} cb
 * @api private
 */

function server (api, cb, query, mixin = {}) {
  http((req, res) => {
    req.query = mixin.query
    const input = api(req, res)
    input.pipe(concat(data => {
      cb(data, res)
    }))
    input.pipe(res)
  }, query || null, true)
}
