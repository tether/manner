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
    '/': {
      service() {},
      stories: {
        success: {
          data: {
            name: 'hello'
          },
          status: 200,
          payload: {
            message: 'Hello world@'
          }
        }
      }
    }
  }
}, true)

http.createServer((req, res) => {
  user(req, res).pipe(res)
}).listen(6000)
