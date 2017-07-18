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
    '/': 'hello world',
    '/foo': 'bar',
    '/:name': (query) => {
      return query
    }
  },
  'post': (query, data) => {
    console.log('post query', query)
    console.log('post data', data)
    return 'post processed'
  }
})

http.createServer((req, res) => {
  user(req, res).pipe(res)
}).listen(5000)
