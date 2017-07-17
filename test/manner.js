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
