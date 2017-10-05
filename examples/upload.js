/**
 * Dependencies.
 */

const http = require('http')
const service = require('..')
const fs = require('fs')

/**
 * Build upload endpoint.
 */

const user = service({
  'post': (query, data) => {
    // file is send as multipart form data in file field
    const file = data['file']
    file.pipe(fs.createWriteStream('./file.png'))
    return new Promise(resolve => {
      file.on('end', () => resolve('it worked'))
    })
  }
})


/**
 * Upload server.
 */

http.createServer((req, res) => {
  user(req, res).pipe(res)
}).listen(6000)
