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
  const resource = methodd(cb)
  const services = parse(obj)
  Object.keys(services).map(method => {
    const service = services[method]
    Object.keys(service).map(path => {
      const handler = service[path]
      resource.add(method, path, (data, ...args) => {
        return isokay(data, handler.schema)
          .then(value => {
            return handler.service(value, ...args)
          })
        //return handler.service(validate(data, handler.data), ...args)
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
          ...transform(path, service[path])
        }
      })
    }
  })
  return options(result)
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
        schema: {}
      }
    }
  } else {
    return {
      [path]: service
    }
  }
}
