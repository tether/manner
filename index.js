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
      return morph(
        data(query(url.query), req, services[method][service.path].limit)
          .then(val => service({
            ...val,
            ...req.query
          }, req, res))
          .then(null, reason => status(res, reason))
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
