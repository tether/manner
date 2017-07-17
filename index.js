/**
 * Dependencies.
 */

const url = require('url').parse
const query = require('querystring').parse
const salute = require('salute')
const status = require('http-errors')
const content = require('co-body')
const router = require('manner-path')



/**
 * Not Implemented callback.
 */

const notimplemented = salute(() => status(501))


/**
 *
 */

module.exports = function (obj) {
  const methods = routes(obj)
  return (req, res) => {
    const cb = methods[req.method.toLowerCase()] || notimplemented
    return cb(req, res)
  }
}


/**
 * Create service routes.
 *
 * @param {Object} methods
 * @return {Object}
 * @api private
 */

function routes (methods) {
  const result = {}
  Object.keys(methods).map(key => {
    result[key] = service(methods[key])
  })
  return result
}



/**
 * Create service.
 *
 * @param {Function | Object} value
 * @return {Function}
 * @api private
 */

function service (value) {
  let method = curry(value)
  if (typeof value === 'object') {
    const route = router(value)
    method = (params, data, req, res) => {
      const handler = route(url(req.url).pathname)
      return handler
        ? handler.arg(Object.assign(params, handler.params), data, req, res)
        : status(501)
    }
  }
  return salute((req, res) => {
    const params = query(url(req.url).query) || {}
    return method(params, {}, req, res)
  })
}


/**
 * Curry value into a function.
 *
 * @param {Any} val
 * @return {Function}
 * @api private
 */

function curry (value) {
  return typeof value !== 'function'
    ? () => value
    : value
}
