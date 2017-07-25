/**
 * Dependencies.
 */

const http = require('http')
const service= require('..')
const Readable = require('stream').Readable




/**
 * Build basic user api.
 */

const user = service({
  'get': {
    '/': () => 'hello world',
    '/foo': '/bar',
    '/:name': (query) => {
      return query
    }
  },
  'post': (query, data) => {
    return data
  }
})

http.createServer((req, res) => {
  user(req, res).pipe(res)
}).listen(6000)
