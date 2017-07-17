/**
 * Dependencies.
 */

const url = require('url').parse
const query = require('querystring').parse
const salute = require('salute')
const status = require('http-errors')
const content = require('co-body')


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
    const cb = curry(methods[key])
    result[key] = salute((req, res) => {
      const params = query(url(req.url).query) || {}
      return cb(params)
    })
  })
  return result
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
