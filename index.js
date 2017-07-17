/**
 * Dependencies.
 */

const url = require('url').parse
const query = require('qs').parse
const salute = require('salute')
const status = require('http-errors')
const content = require('co-body')
const router = require('manner-path')


/**
 * Not Implemented callback.
 */

const notimplemented = salute(() => status(501))


/**
 * Create web services from an object.
 *
 * @param {Object} obj
 * @return {Function}
 * @api public
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
  const method = typeof value === 'object' ? dynamic(value) : curry(value)
  return salute((req, res) => {
    const params = query(url(req.url).query) || {}
    const result = method(params, {}, req, res)
    return result == null ? '' : result
  })
}


/**
 * Create dynamic routes service
 *
 * @param {Object} value
 * @return {Function}
 * @api private
 */

function dynamic (value) {
  const route = router(value)
  return (params, data, req, res) => {
    const handler = route(url(req.url).pathname)
    return handler
      ? handler.arg(Object.assign(params, handler.params), data, req, res)
      : status(501)
  }
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
