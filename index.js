/**
 * Dependencie(s)
 */

const compile = require('./lib/compile')
const { join, extname } = require('path')
const query = require('qs').parse
const parse = require('url').parse
const morph = require('morph-stream')
const body = require('request-body')
const lookup = require('mime-types').contentType
const stream = require('stream')
const assert = require('assert')


/**
 * Create web resource.
 *
 * @param {Object} obj
 * @param {Boolean} dev
 * @return {Function}
 * @api public
 */

module.exports = (obj, dev) => {
  return compile(dev ? stub : resource, obj)
}


/**
 * Create resource.
 *
 * A resource is a set of HTTP methods (or services).
 *
 * @param {Object} core
 * @param {Object} services
 * @param {ServerRequest} req
 * @param {ServerResponse} res
 * @return {Stream}
 * @api public
 */

function resource (core, services, req, res) {
  const method = req.method.toLowerCase()
  const url = parse(join('/', req.url))
  const service = core.has(method, url.pathname)
  if (service) {
    const conf = services[method][service.path]
    return morph(
      data(query(url.query), req, conf.limit)
        .then(val => service({...val, ...req.query}, req, res))
        .then(val => {
          res.statusCode = Number(conf.options.status) || 200
          res.setHeader('Content-Type', conf.options.type || mime(val))
          return val
        }, reason => status(res, reason))
    )
  } else {
    return morph(status(res, {
      status: 501,
      message: `method ${method.toUpperCase()} not implemented`
    }))
  }
}


/**
 * Stub resource.
 *
 * @param {Object} core
 * @param {Object} services
 * @param {ServerRequest} req
 * @param {ServerResponse} res
 * @return {Stream}
 * @api private
 */

function stub (core, services, req, res) {
  const method = req.method.toLowerCase()
  const url = parse(join('/', req.url))
  const handler = core.has(method, url.pathname)
  if (handler) {
    const service = services[method][handler.path]
    const stories = service.stories
    return morph(
      data(query(url.query), req, service.limit)
        .then(val => {
          if (method !== 'options') return match(val, stories)
          else {
            res.writeHead(200, {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': `*`,
              'Access-Control-Allow-Headers': '*'
            })
            res.end()
            return val
          }
        })
        .then(story => {
          const payload = story.payload
          res.statusCode = story.status || 200
          res.setHeader('Content-Type', mime(payload))
          return payload
        }, reason => status(res, {
          status: 422,
          message: `request content does not match any user story`
        }))
    )
  } else {
    return morph(status(res, {
      status: 501,
      message: `method ${method.toUpperCase()} not implemented`
    }))
  }
}

/**
 * Check if data match one user story.
 *
 * @param {Object} data
 * @param {Array} stories
 * @return {Promise} resolved if match
 * @api private
 */

function match (data, stories) {
  var story
  if (!(stories instanceof Array)) {
    stories = Object.keys(stories).map(key => {
      return {
        key,
        ...stories[key]
      }
    })
  }
  return new Promise((resolve, reject) => {
    for (var i = 0, l = stories.length; i < l; i++) {
      story = stories[i]
      assert.notDeepEqual(data, story.data)
    }
    resolve()
  }).then(() => Promise.reject(), val => Promise.resolve(story))
}


/**
 * Return MIME type according of a value.
 *
 * @note we could read the .path property of a stream
 * to get the right content type using mime-types
 *
 * @param {String} type
 * @return {String}
 * @api private
 */

function mime (value) {
  if (typeof value == 'object') {
    let type = 'application/json; charset=utf-8'
    if (value instanceof stream.Stream) {
      type = lookup(extname(value.path || '')) || type
    }
    return type
  }
  return 'text/plain; charset=utf-8'
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
