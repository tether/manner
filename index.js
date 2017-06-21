/**
 * Dependencies.
 */

const url = require('url').parse
const query = require('querystring').parse
const Readable = require('readable-stream').Readable
const content = require('request-content')

/**
 * This is a simple description.
 *
 * @param {Object} methods
 * @api public
 */

module.exports = function (methods) {
  return (req, res) => {
    const readable = Readable({
      objectMode: true
    })
    readable._read = () => {}
    const type = req.method.toLowerCase()
    const cb = methods[type]
    const params = query(url(req.url).query) || {}
    // what if .on('abort')?
    content(req, data => {
      if(cb) {
        let result
        try {
          stream(cb(params, data), readable)
        } catch (e) {
          // @note we should send more details in the payload
          // and send proper status
          status(res, 400, 'Bad Request')
          res.end()
        }
      } else status(res, 501, 'Not Implemented')
    })
    return readable
  }
}


/**
 * Genereate response status code and close connection.
 *
 * @param {ServerResponse} response
 * @param {Number} code
 * @api private
 */

function status (response, code, message) {
  response.statusCode = code
  response.statusMessage = message
  response.end()
}


/**
 * Transform passed value into a stream.
 *
 * @param {Any} value
 * @param {ReadableStream} readable
 * @return {Stream}
 * @api private
 */

function stream (value, readable) {
  if (value && typeof value.pipe === 'function') {
    if(value.readable) {
      value.on('data', buf => readable.push(buf))
      value.on('end', () => readable.push(null))
    } else {
      // throw new Error('Returned stream should be readable or duplex.')
      readable.push(null)
    }
  } else {
    if(typeof value === 'object' && typeof value.then === 'function') {
      value.then(reason => {
        readable.push(reason)
        readable.push(null)
      })
    } else {
      readable.push(value)
      readable.push(null)
    }
  }
}
