/**
 * Dependencies.
 */

const url = require('url').parse
const query = require('qs').parse
const salute = require('salute')
const status = require('http-errors')
const body = require('request-body')
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
  const method = dynamic(typeof value === 'object' ? value : static(value))
  return salute((req, res) => {
    const params = query(url(req.url).query) || {}
    return body(req).then(data => {
      const result = method(params, data, req, res)
      return result == null ? '' : result
    }, reason => status(422))
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
    const handler = route(normalize(url(req.url).pathname))
    if (handler) {
      const arg = handler.arg
      return typeof arg === 'function'
        ? arg(Object.assign(params, handler.params), data, req, res)
        : arg
    }
    return status(501)
  }
}


/**
 * Create static route and curry value into a function.
 *
 * @param {Any} val
 * @return {Function}
 * @api private
 */

function static (value) {
  return {
    '/' : typeof value !== 'function' ? () => value : value
  }
}


/**
 * Normalize path name.
 *
 * @param {String} pathname
 * @return {String}
 * @api private
 */

function normalize (pathname) {
  let suffix = pathname.substr(-1) !== '/' ? '/' : ''
  return pathname + suffix
}
