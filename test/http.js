/**
 * Test dependencie(s)
 */

const test = require('tape')
const service = require('..')
const http = require('server-test')



test('should be a high order function', assert => {
  assert.plan(1)
  const api = service({
    get() {
      return 'hello world'
    }
  })
  server(api, data => {
    assert.equal(data.toString(), 'hello world')
  })
})



function server (api, cb) {
  http((req, res) => {
    const input = api(req, res)
    input.pipe(concat(data => {
      cb(data)
    }))
    input.pipe(res)
  }, null, true)
}
