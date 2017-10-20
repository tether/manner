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
 * @param {Object} options
 * @return {Function}
 * @api public
 */


module.exports = (methods, options = {}) => {
  const conf = passover(options)
  const relative = conf('relative') || ''
  debug('Initialize endpoint %s', relative)
  const api = service(salute((req, res) => {
    const method = req.method.toLowerCase()
    const url = parse(join('/', req.url.substring(relative.length)))
    const pathname = url.pathname
    const cb = api.has(method, pathname)
    debug(`Serve endpoint [%s] %s`, method.toUpperCase(), pathname, !!cb)

    if (cb) {
      const schema = conf(method, cb.path)
      const payload = req.query
      const parameters = Object.assign(
        query(url.query),
        typeof payload === 'object'
          ? payload
          : {}
      )

      return Promise.all([
        isokay(parameters, schema && schema.params),
        body(req).then(data => isokay(data, schema && schema.data))
      ]).then(([params, data]) => {
        return cb(params, data, req, res) || res.end()
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
