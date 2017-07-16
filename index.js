/**
 * Dependencies.
 */

const url = require('url').parse
const salute = require('salute')
const status = require('http-errors')

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
 * @return {Obkect}
 * @api private
 */

function routes (methods) {
  const result = {}
  Object.keys(methods).map(key => {
    result[key] = salute((req, res) => {
      return methods[key]
    })
  })
  return result
}
