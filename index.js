/**
 * Dependencie(s)
 */

const compile = require('./lib/compile')
const join = require('path').join
const query = require('qs').parse
const parse = require('url').parse
const morph = require('morph-stream')
const body = require('request-body')


/**
 * Create web resource.
 *
 * @param {Object} obj
 * @return {Function}
 * @api public
 */

module.exports = (obj, relative = '') => {
  return compile((core, services, req, res) => {
    const method = req.method.toLowerCase()
    const url = parse(join('/', req.url.substring(relative.length)))
    const service = core.has(method, url.pathname)
    if (service) {
      const conf = services[method][service.path]
      return morph(
        data(query(url.query), req, conf.limit)
          .then(val => service({...val, ...req.query}, req, res))
          .then(val => {
            res.setHeader('Content-Type', conf.type || mime(typeof val))
            return val
          }, reason => status(res, reason))
      )
    } else {
      return morph(status(res, {
        status: 501,
        message: `method ${method.toUpperCase()} not implemented`
      }))
    }
  }, obj)
}


/**
 * Return MIME type according the given typeof.
 *
 * @param {String} type
 * @return {String}
 * @api private
 */

function mime (type) {
  return type === 'object'
  ? 'application/json; charset=utf-8'
  : 'text/plain; charset=utf-8'
}


/**
 * Set response error with custom status status code
 * and payload.
 *
 * @param {ServerResponse} res
 * @param {Object} err
 * @return {Promise}
 * @api private
 */

function status (res, err) {
  const code = res.statusCode = Number(err.status) || 400
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  return Promise.resolve({
    error: {
      status: code,
      message: err.message,
      payload: err.payload || {}
    }
  })
}


/**
 * Return the content of the body and the query parameters
 * as a unified object.
 *
 * @param {Object} params
 * @param {ServerRequest} req
 * @param {Number} limit (default 100kb)
 * @return {Promise}
 * @api private
 */

function data (params, req, limit = 100000) {
  return new Promise(resolve => {
    const length = Number(req.headers['content-length'])
    if (length && length > 0 && length <= limit) {
      resolve(body(req).then(val => {
        return {
          ...params,
          ...val
        }
      }))
    } else {
      resolve({
        ...params
      })
    }
  })
}
