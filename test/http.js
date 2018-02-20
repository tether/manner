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
        schema: {
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


test('should work with POST request', assert => {
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



/**
 * Create HTTP server.
 *
 * @param {Stream} api
 * @param {Function} cb
 * @api private
 */

function server (api, cb, query, mixin = {}) {
  http((req, res) => {
    const input = api({
      ...req,
      ...mixin
    }, res)
    input.pipe(concat(data => {
      cb(data, res)
    }))
    input.pipe(res)
  }, query || null, true)
}
