/**
 * Dependencies.
 */

const service = require('methodd')
const status = require('http-errors')
const salute = require('salute')
const query = require('qs').parse
const parse = require('url').parse
const body = require('request-body')
const join = require('path').join

/**
 * Create web services from an object.
 *
 * @param {Object} obj
 * @param {String} relative (relative url path)
 * @return {Function}
 * @api public
 */


module.exports = (methods, relative = '') => {
  const api = service(salute((req, res) => {
    const url = parse(join('/', req.url.substring(relative.length)))
    const cb = api.has(req.method.toLowerCase(), url.pathname)
    return body(req).then(data => {
      const payload = req.query
      const params = Object.assign(query(url.query), typeof payload === 'object' ? payload : {})
      const result = cb ? cb(params, data, req, res) : status(501)
      // stream salute is closed when res end
      return result == null ?  res.end() : result
    }, err => {
      // @note we should manage content-type not supported
      // coming from request-body
      console.error(err)
      return status(err.statusCode || 400)
    })
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
        '/': value
      }
    }
  })
  api.add(methods)
}
