/**
 * Dependencies.
 */

const url = require('url').parse
const query = require('querystring').parse
const Readable = require('readable-stream').Readable


/**
 * This is a simple description.
 *
 * @param {Object} methods
 * @api public
 */

module.exports = function (methods) {
  return (req) => {
    const readable = Readable({
      objectMode: true
    })
    readable._read = () => {}
    const type = req.method.toLowerCase()
    const params = query(url(req.url).query) || {}
    // what if .on('abort')?
    collect(req, buffer => {
      const data = buffer.length ? parse(buffer, req) : null
      stream(methods[type](params, data), readable)
    })
    return readable
  }
}


/**
 * Transform passed value into a stream.
 *
 * @param {Any} value
 * @param {ReadableStream} readable
 * @return {Stream}
 * @api privater
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


/**
 * Collect HTTP incoming buffers.
 *
 * @param {HttpIncomingMessage} req
 * @param {Function} cb
 * @api private
 */

function collect (req, cb) {
  let list = []
  req.on('data', (chunk) => list.push(chunk))
  req.on('end', () => cb(Buffer.concat(list)))
}


/**
 * Parse request buffer according its encoded format.
 *
 * @param {Buffer} buffer
 * @param {HttpIncomingMessage} req
 * @return {Object}
 * @api private
 */

function parse (buffer, req) {
  return JSON.parse(buffer.toString())
}
