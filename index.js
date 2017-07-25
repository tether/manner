/**
 * Dependencies.
 */

const service = require('methodd')
const status = require('http-errors')
const salute = require('salute')


module.exports = methods => {
  const api = service(salute((req, res) => {
    const cb = api.has(req.method.toLowerCase(), req.url)
    const result = cb ? cb(null, null, req, res) : status(501)
    return result == null ?  '' : result
  }))
  add(api, methods)
  return api
}


/**
 * Add routes.
 *
 * @param {Function} api
 * @param {Object} methods
 * @api private
 */

function add(api, methods) {
  Object.keys(methods).map(key => {
    const value = methods[key]
    if (typeof value !== 'object') {
      methods[key] = {
        '/': (...args) => value(...args)
      }
    }
  })
  api.add(methods)
}
