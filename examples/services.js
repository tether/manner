/**
 * Dependencies.
 */

const http = require('http')
const service= require('..')
const Readable = require('stream').Readable
const fs = require('fs')



/**
 * Build basic user api.
 */

const user = service({
  'get': {
    '/': () => 'hello world',
    '/:name': (query) => {
      return query
    },
    '/error': () => {
      throw new Error('this is some error')
    },
    '/array': () => {
      return ['hello world']
    },
    '/html': () => fs.createReadStream(__dirname + '/sample.html')
  },
  'post': (query, data) => {
    return data
  }
})

http.createServer((req, res) => {
  user(req, res).pipe(res)
}).listen(6000)
