/**
 * Test dependencie(s)
 */

const test = require('tape')
const service = require('..')
const http = require('server-test')
const concat = require('concat-stream')


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


/**
 * Create HTTP server.
 *
 * @param {Stream} api
 * @param {Function} cb
 * @api private
 */

function server (api, cb) {
  http((req, res) => {
    const input = api(req, res)
    input.pipe(concat(data => {
      cb(data, res)
    }))
    input.pipe(res)
  }, null, true)
}
