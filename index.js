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
 *
 */

function stream (chunk, readable) {
  if (chunk && typeof chunk.pipe === 'function') {
    // should we check it is readable?
    chunk.on('data', buf => readable.push(buf))
    chunk.on('end', () => readable.push(null))
  } else {
    readable.push(chunk)
    readable.push(null)
  }
  // if (Buffer.isBuffer(chunk) || typeof chunk === 'string') {
  //
  // }

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
