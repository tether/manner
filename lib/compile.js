/**
 * Dependencie(s)
 */

const methodd = require('methodd')
const options = require('./options')
const isokay = require('isokay')


/**
 * Compile services.
 *
 * @param {Function} cb
 * @param {Object} obj
 * @api private
 */

module.exports = (cb, obj) => {
  const services = parse(obj)
  const resource = methodd((...args) => cb(resource, services, ...args))
  Object.keys(services).map(method => {
    const service = services[method]
    Object.keys(service).map(path => {
      const handler = service[path]
      const cb = middleware(handler.middleware, handler.service.bind(resource))
      resource.add(method, path, (data, ...args) => {
        return isokay(data, handler.data).then(value => cb(value, ...args))
      })
    })
  })
  return resource
}


/**
 * Parse and transform services.
 *
 * @param {Object} services
 * @api private
 */

function parse (services) {
  const result = {}
  Object.keys(services).map(name => {
    const service = services[name]
    if (typeof service === 'function') {
      result[name] = transform('/', service)
    } else {
      Object.keys(service).map(path => {
        result[name] = {
          ...result[name],
          ...transform(path, service[path]),
          ...routes(service[path].routes)
        }
      })
    }
  })
  return options(result)
}


/**
 * Parse service routes and return object containing the route
 * services.
 *
 * @param {Object} services
 * @param {String} relative
 * @return {Object}
 * @api private
 */

function routes (services = {}, relative = '') {
  let result = {}
  Object.keys(services).map(path => {
    const service = services[path]
    result = {
      ...result,
      ...transform(relative + path, service),
      ...routes(service.routes, path)
    }
  })
  return result
}


/**
 * Transform function service into object service.
 *
 * @param {Object} path
 * @param {Object|Function} service
 * @api private
 */

function transform (path, service) {
  if (typeof service === 'function')  {
    return {
      [path]: {
        service,
        data: {}
      }
    }
  } else {
    return {
      [path]: service
    }
  }
}


/**
 * Compile list of middlwares and service into a single
 * callback.
 *
 * @param {Array} callbacks
 * @param {Function} service
 * @return {Function}
 * @api private
 */

function middleware (callbacks = [], service) {
  var fns = callbacks.concat(service)
  return (data, ...args) => {
    // read promises in serie
    return fns.reduce((cb, next) => cb.then(props => next(props, ...args)), Promise.resolve(data))
  }
}
