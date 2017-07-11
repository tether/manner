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
  //       methods[key] = () => {
  //
  //       }
  //     }
  //   })
  return (req, res) => {
    const readable = Readable({
      objectMode: true
    })
    readable._read = () => {}
    let type = req.method.toLowerCase()
    let cb = methods[type]
    const params = query(url(req.url).query) || {}
    // what if .on('abort')?
    content(req, data => {
      if(cb) {
        let result
        try {
          pass(cb(params, data), false, readable)
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
