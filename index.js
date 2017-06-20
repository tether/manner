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
  return (req, res) => {
    const readable = Readable({
      objectMode: true
    })
    readable._read = () => {}
    const type = req.method.toLowerCase()
    const cb = methods[type]
    const params = query(url(req.url).query) || {}
    // what if .on('abort')?
    collect(req, buffer => {
      const data = buffer.length ? parse(buffer, req) : null
      if(cb) stream(cb(params, data), readable)
      else status(res, 501)
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

function status (response, code) {
  response.statusCode = code
  response.statusMessage = 'Not Implemented'
  response.end()
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
  return decode(req.headers['content-type'], buffer.toString())
}


/**
 * Decode data using request content type.
 *
 * @param {String} type
 * @param {String} encoded
 * @return {Object}
 * @api private
 */

function decode (type, encoded) {
  if (type === 'application/x-www-form-urlencoded') {
      return query(encoded)
  } else {
    // we should transform the data for any type
  }
}
