/**
 * Dependencies.
 */

const url = require('url').parse
const query = require('querystring').parse
const Readable = require('readable-stream').Readable
const content = require('request-content')
const pass = require('morph-stream')
const status = require('response-error')
const routes = require('manner-path')


/**
 * Create HTTP endpoint from an object containing
 * HTTP methods (lowercase).
 *
 * Examples:
 *
 *   ```js
 *   const service = require('manner')
 *   service({
 *     get(query, data) {
 *       // return something
 *     }
 *   })
 *
 *   ```
 * @param {Object} methods
 * @param {String?} relative path
 * @api public
 */

module.exports = function (methods, relative = '') {
  Object.keys(methods)
    .map(key => {
      if (typeof methods[key] === 'object') {
        const route = routes(methods[key])
        methods[key] = (query, data, req, res) => {
          const pathname = format(url(req.url).pathname, relative)
          const handler = route(pathname)
          if (handler) return handler.arg(Object.assign(query, handler.params), data, req, res)
          else status(res, 501)
        }
      }
    })
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
          const value = cb(params, data, req, res)
          if (value) pass(value, false, readable)
        } catch (e) {
          status(res, 400)
        }
      } else status(res, 501)
    })
    readable.on('error', err => {
      status(res, err.statusCode || 403)
      readable.end()
    })
    return readable
  }
}


/**
 * Format request path name.
 *
 * @param {String} pathname
 * @param {String} relative
 * @return {String}
 * @api private
 */

function format (pathname, relative) {
  if (pathname.substr(-1) !== '/') pathname = pathname + '/'
  return pathname.substring(relative.length)
}
