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


test('should create HTTP method', assert => {
  assert.plan(1)
  const api = service({
    get() {
      return 'hello world'
    }
  })
  server((req, res) => {
    const input = api(req, res)
    input.pipe(concat(data => {
      assert.equal(data.toString(), 'hello world')
    }))
    input.pipe(res)
  }, null, true)
})

// test('should return value string from defined method', assert => {
//   assert.plan(1)
//   const api = service({
//     get: 'hello world!'
//   })
//   server((req, res) => {
//     const input = api(req, res)
//     input.pipe(concat(data => {
//       assert.equal(data.toString(), 'hello world!')
//     }))
//     input.pipe(res)
//   }, null, true)
// })

//
// test('should send 501 if method is not implementd', assert => {
//   assert.plan(2)
//   const api = service({
//     post: 'hello world!'
//   })
//   server((req, res) => {
//     api(req, res)
//       .on('error', () => {
//         assert.equal(res.statusCode, 501)
//         assert.equal(res.statusMessage , 'Not Implemented')
//       })
//       .pipe(res)
//   }, null, true)
// })
//
// test('should execute value function from defined method', assert => {
//   assert.plan(1)
//   const api = service({
//     get: () => 'hello world!'
//   })
//   server((req, res) => {
//     const input = api(req, res)
//     input.pipe(concat(data => {
//       assert.equal(data.toString(), 'hello world!')
//     }))
//     input.pipe(res)
//   }, null, true)
// })
//
// test('should not have to return data', assert => {
//   assert.plan(1)
//   const api = service({
//     get: () => {
//       assert.ok('service executed')
//     }
//   })
//   server((req, res) => {
//     api(req, res).pipe(res)
//   }, null, true)
// })
//
//
// test('should chunk object returned by defined method', assert => {
//   assert.plan(1)
//   const api = service({
//     get: () => ({
//       name: 'hello'
//     })
//   })
//   server((req, res) => {
//     const input = api(req, res)
//     input.pipe(concat(data => {
//       assert.deepEqual(JSON.parse(data), {
//         name: 'hello'
//       })
//     }))
//     input.pipe(res)
//   }, null, true)
// })
//
// test('should chunk streams returned by defined method', assert => {
//   assert.plan(1)
//   const api = service({
//     get: () => fs.createReadStream(__dirname + '/manner.txt')
//   })
//   server((req, res) => {
//     const input = api(req, res)
//     input.pipe(concat(data => assert.equal(data.toString(), 'hello world\n')))
//     input.pipe(res)
//   }, null, true)
// })
//
// test('should chunk promise returned by defined method', assert => {
//   assert.plan(1)
//   const api = service({
//     get: () => new Promise(resolve => resolve('hello'))
//   })
//   server((req, res) => {
//     const input = api(req, res)
//     input.pipe(concat(data => assert.equal(data.toString(), 'hello')))
//     input.pipe(res)
//   }, null, true)
// })
//
//
// test('should pass query parameters to value function', assert => {
//   assert.plan(1)
//   const api = service({
//     get: (params) => params.first + ' ' + params.last
//   })
//   server((req, res) => {
//     const input = api(req, res)
//     input.pipe(concat(data => {
//       assert.equal(data.toString(), 'john doe')
//     }))
//     input.pipe(res)
//   }, {
//     qs: {
//       first: 'john',
//       last: 'doe'
//     }
//   }, true)
// })
//
//
// test('should pass request and response', assert => {
//   assert.plan(2)
//   server((req, res) => {
//     service({
//       'get': (params, data, request, response) => {
//         assert.equal(request, req)
//         assert.equal(response, res)
//       }
//     })(req, res).pipe(res)
//   }, {}, true)
// })
//
//
// test('should pass empty query object to value function when request does not have any query parameters', assert => {
//   assert.plan(2)
//   const api = service({
//     get: (params) => {
//       assert.equal(typeof params , 'object')
//       assert.equal(params != null, true)
//     }
//   })
//   server((req, res) => {
//     api(req, res).pipe(res)
//   }, null, true)
// })
//
// test('get accept dynamic routes', assert => {
//   assert.plan(1)
//   const request = {
//     qs: {
//       label: 'hello'
//     }
//   }
//   const api = service({
//     'get': {
//       '/:name': (params) => {
//         assert.deepEqual(params, {
//           label: 'hello',
//           name: 'foo'
//         })
//       }
//     }
//   })
//   server((req, res) => {
//     req.url = '/foo' + req.url.substring(1)
//     api(req, res).pipe(res)
//   }, request, true)
// })
//
// test('get root route if dynamic path have been defined', assert => {
//   assert.plan(1)
//   const request = {
//     qs: {
//       label: 'hello'
//     }
//   }
//   const api = service({
//     'get': {
//       '/': () => {
//         assert.ok('path executed')
//       },
//       '/:name': (params) => {
//         assert.fail('should not be called')
//       }
//     }
//   })
//   server((req, res) => {
//     api(req, res).pipe(res)
//   }, request, true)
// })
//
// test('should mixin query parameters with dynamic route params', assert => {
//   assert.plan(2)
//   const api = service({
//     get: {
//       '/:first': (query) => {
//         assert.equal(query.first, 'olivier')
//         assert.equal(query.last, 'doe')
//       }
//     }
//   })
//   server((req, res) => {
//     req.url = '/olivier' + req.url.substring(1)
//     api(req, res).pipe(res)
//   }, {
//     qs: {
//       first: 'john',
//       last: 'doe'
//     }
//   }, true)
//
// })

//
// test('should decode data passed in the body of a request and pass it to the appropriate value function', assert => {
//   assert.plan(2)
//   const message = {
//     foo: 'bar'
//   }
//   const api = service({
//     'post': (params, data) => {
//       console.log('IT IS BEEN CALLED')
//       assert.deepEqual(params, {
//         label: 'hello'
//       })
//       console.log('data', data)
//       assert.deepEqual(data, message)
//     }
//   })
//   server((req, res) => {
//     api(req, res).pipe(res)
//   }, {
//     method: 'POST',
//     qs: {
//       label: 'hello'
//     },
//     form: message
//   }, true)
// })
