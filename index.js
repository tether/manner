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


/**
 * Create web services from an object.
 *
 * @param {Object} obj
 * @param {Object} schema
 * @return {Function}
 * @api public
 */


module.exports = (methods, schema = {}) => {
  const options = passover(schema)
  const relative = options('relative') || ''

  debug('Initialize endpoint %s', relative)
  const api = service(salute((req, res) => {
    const method = req.method.toLowerCase()
    const url = parse(join('/', req.url.substring(relative.length)))
    const pathname = url.pathname
    const cb = api.has(method, pathname)
    debug(`Serve endpoint [%s] %s`, method.toUpperCase(), pathname, !!cb)

    if (cb) {
      const schema = options(method, cb.path)
      const type = schema && schema.type
      const payload = req.query
      const parameters = Object.assign(
        query(url.query),
        typeof payload === 'object'
          ? payload
          : {}
      )

      if (type) res.setHeader('Content-Type', salute.mime(type))

      return Promise.all([
        isokay(parameters, schema && schema.query),
        body(req).then(data => isokay(data, schema && schema.body))
      ]).then(([params, data]) => {
        var middleware = []
        if (schema && schema.middleware) middleware = middleware.concat(schema.middleware)
        return middlewares([
          ...middleware,
          (query, body) => cb(query, body, req, res)
        ], params, data, req, res)
        //return cb(params, data, req, res)
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
