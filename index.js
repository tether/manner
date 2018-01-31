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
const debug = require('debug')('manner')
const passover = require('passover')
const isokay = require('isokay')

const compile = require('manner-to-schema')
const mix = require('deepmix')


/**
 * Create web services from an object.
 *
 * @param {Object} obj
 * @param {Object} schema
 * @return {Function}
 * @api public
 */


module.exports = (methods, schema = {}) => {
  const options = mix(compile(methods), schema)
  const relative = options.relative || ''

  debug('Initialize endpoint %s', relative)
  const api = service(salute((req, res) => {
    const method = req.method.toLowerCase()
    const url = parse(join('/', req.url.substring(relative.length)))
    const pathname = url.pathname
    const handler = api.has(method, pathname)
    debug(`Serve endpoint [%s] %s`, method.toUpperCase(), pathname, !!handler)

    if (handler) {
      const schema = options[method][handler.path]
      const type = schema.type
      const payload = req.query
      const parameters = Object.assign(
        query(url.query),
        typeof payload === 'object'
          ? payload
          : {}
      )

      if (type) res.setHeader('Content-Type', salute.mime(type))

      return Promise.all([
        isokay(parameters, schema.query),
        body(req).then(data => isokay(data, schema.body))
      ]).then(([params, data]) => {
        var middleware = []
        if (schema.middleware) middleware = middleware.concat(schema.middleware)
        return middlewares([
          ...middleware,
          (query, body) => handler(query, body, req, res)
        ], params, data, req, res)
      }, err => {
        // @note we should send error payload with it
        return status(err.statusCode || 400)
      })
    } else {
      return status(501)
    }
  }))
  add(api, methods, relative)
  return api
}


// /**
//  * Create schema from manner service mixed in
//  * with passed schema.
//  */
//
// function compile () {
//   // create schema from endpoint methods
//   // mixin with passed schema
//   // => this way we never have null or undefined values
//   // we do not need passover
//   // compile middleware arrays into single Function (middlwares can be an array, a function or an object)
//   // compile if called at the beginning not inside the request handler
//
//   // we should check if schema query or body to validate against schema
//   // for body we should check the request content length
// }


/**
 * Apply middlewares.
 *
 * @param {Array} array
 * @param {Object} params
 * @param {Object} data
 * @param {Object} req
 * @param {Object} res
 * @return {Any}
 * @api private
 */

function middlewares(array = [], params, data, req, res) {
  var index = -1
  var next = function (query, body) {
    const cb = array[++index]
    if (cb) return cb(query, body, next, req, res)
  }
  return next(params, data)
}


/**
 * Add routes.
 *
 * @param {Function} api
 * @param {Object} methods
 * @param {String} relative (used for logs only)
 * @api private
 */

function add(api, methods, relative) {
  Object.keys(methods).map(key => {
    const value = methods[key]
    if (typeof value !== 'object') {
      methods[key] = {
        '/': value
      }
    }
    debug('Create endpoint [%s] %s', key.toUpperCase(), relative)
  })
  api.add(methods)
}
