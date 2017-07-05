/**
 * Dependencies.
 */

const url = require('url').parse
const query = require('querystring').parse
const Readable = require('readable-stream').Readable
const content = require('request-content')
const morph = require('morph-stream')
const status = require('response-error')


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
    let type = req.method.toLowerCase()
    const authorization = req.headers['authorization']
    if (type === 'post' && authorization) {
      type = 'auth'
    }
    let cb = typeof methods === 'function'
      ? methods(req, res)[type]
      : methods[type]
    if (type === 'auth') cb = cb.bind(null, ...credentials(authorization))
    const params = query(url(req.url).query) || {}
    // what if .on('abort')?
    content(req, data => {
      if(cb) {
        let result
        try {
          morph(cb(params, data), false, readable)
        } catch (e) {
          // @note we should send more details in the payload
          // and send proper status
          status(res, 400)
        }
      } else status(res, 501)
    })
    return readable
  }
}


/**
 * Handle authorization header and return function with
 * user and password binded.
 *
 * @param {String} header
 * @api private
 */

function credentials (header) {
  const buffer = new Buffer(header.split(' ')[1], 'base64')
  return buffer.toString().split(':')
}
