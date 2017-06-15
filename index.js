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
    const stream = Readable({
      objectMode: true
    })
    stream._read = () => {}
    const type = req.method.toLowerCase()
    const params = query(url(req.url).query) || {}
    // what if .on('abort')?
    collect(req, buffer => {
      const data = buffer.length ? parse(buffer, req) : null
      const result = methods[type](params, data)
      stream.push(result)
      stream.push(null)
    })
    return stream
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
