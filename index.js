/**
 * Dependencies.
 */

const url = require('url').parse
const query = require('querystring').parse
const Readable = require('readable-stream').Readable
const content = require('request-content')
const morph = require('morph-stream')

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
          console.log('yooooo', e)
          // @note we should send more details in the payload
          // and send proper status
          status(res, 400, 'Bad Request')
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
