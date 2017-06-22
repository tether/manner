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
    const type = req.method.toLowerCase()
    const cb = methods[type]
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
