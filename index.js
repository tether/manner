/**
 * Dependencie(s)
 */

const compile = require('./lib/compile')
const parse = require('url').parse
const join = require('path').join
const morph = require('morph-stream')


/**
 * Create web resource.
 *
 * @param {Object} obj
 * @return {Function}
 * @api public
 */

module.exports = (obj, relative = '') => {
  return compile((services, req, res) => {
    const method = req.method.toLowerCase()
    const url = parse(join('/', req.url.substring(relative.length)))
    const service = services.has(method, url.pathname)
    if (service) {
      return morph(
        service().then(null, reason => status(res, reason))
      )
    } else {
      return morph(status(res, {
        status: 501,
        message: `method ${method.toUpperCase()} not implemented`
      }))
    }
  }, obj)
}


/**
 * Set response error with custom status status code
 * and payload.
 *
 * @param {ServerResponse} res
 * @param {Object} err
 * @return {Promise}
 * @api private
 */

function status (res, err) {
  const code = res.statusCode = Number(err.status) || 400
  return Promise.resolve({
    error: {
      status: code,
      message: err.message,
      payload: err.payload || {}
    }
  })
}
