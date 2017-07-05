/**
 * Test dependencies.
 */

const test = require('tape')
const service = require('..')
const concat = require('concat-stream')
const Readable = require('stream').Readable
const Writable = require('stream').Writable
const http = require('http')
const request = require('request')
const net = require('net')


test('get params from GET incoming message', assert => {
  assert.plan(1)
  const api = service({
    'get': (params) => {
      assert.deepEqual(params, {
        label: 'hello'
      })
    }
  })
  server((req, res) => {
    api(req, res)
  }, 'get', 'label=hello')
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
  }, 'get')
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
  server((req, res) => {
    api(req, res)
  }, 'post', 'label=hello', message)
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
  }, 'get')
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
  }, 'get')
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
  }, 'get')
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
  }, 'get')

})


test('should create service from function', assert => {
  assert.plan(1)
  const api = service(() => {
    return {
      'get': (params) => {
        assert.deepEqual(params, {
          label: 'hello'
        })
      }
    }
  })
  server((req, res) => {
    api(req, res)
  }, 'get', 'label=hello')
})


test('should pass request and response to function service', assert => {
  assert.plan(2)
  server((req, res) => {
    service((request, response) => {
      assert.equal(request, req)
      assert.equal(response, res)
      return {
        get() {}
      }
    })(req, res)
  }, 'get')
})

test('should manage basic authentication', assert => {
  assert.plan(2)
  auth((req, res) => {
    service({
      auth(user, password) {
        assert.equal(user, 'foo')
        assert.equal(password, 'bar')
      }
    })(req, res)
  }, 'foo', 'bar')
})


/**
 * Create HTTP server.
 *
 * @param {Function} cb
 * @param {String} method
 * @param {String} params
 * @param {Object} data
 * @api private
 */

function server (cb, method, params, data) {
  const server = http.createServer((req, res) => {
    cb(req, res)
    res.end()
  }).listen(() => {
    const port = server.address().port
    const sock = net.connect(port)
    request[method || 'post'](`http://localhost:${port}?${params}`, {form: data}, () => {
      sock.end();
      server.close();
    })
  })
}


/**
 * Create authentication server.
 *
 * @param {Function} cb
 * @param {String} user
 * @param {String} password
 * @api private
 */


function auth (cb, user, password) {
  const credentials = 'Basic ' + new Buffer(user + ':' + password).toString('base64')
  const server = http.createServer((req, res) => {
    cb(req, res)
    res.end()
  }).listen(() => {
    const port = server.address().port
    const sock = net.connect(port)
    request.post({
      url: `http://localhost:${port}`,
      headers: {
        'Authorization' : credentials
      },
      form: {}
    }, () => {
      sock.end();
      server.close();
    })
  })
}
