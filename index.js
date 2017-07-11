/**
 * Dependencies.
 */

const url = require('url').parse
const query = require('querystring').parse
const Readable = require('readable-stream').Readable
const content = require('request-content')
const pass = require('morph-stream')
const status = require('response-error')


/**
 * This is a simple description.
 *
 * @param {Object} methods
 * @api public
 */

module.exports = function (methods) {
  // Object.keys(methods)
  //   .map(key => {
  //     if (typeof methods[key] === 'object') {
  //       methods[key] = (...args) => {
  //
  //       }
  //     }
  //   })
  return (req, res) => {
    const readable = Readable({
      objectMode: true
    })
    readable._read = () => {}
    let cb = methods[req.method.toLowerCase()]
    const params = query(url(req.url).query) || {}
    // what if .on('abort')?
    content(req, data => {
      if(cb) {
        try {
          pass(cb(params, data, req, res), false, readable)
        } catch (e) {
          // @note we should send more details in the error payload
          // and send proper status
          status(res, 400)
        }
      } else status(res, 501)
    })
    return readable
  }
}
