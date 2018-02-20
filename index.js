/**
 * Dependencie(s)
 */

const methodd = require('methodd')


/**
 * Create web resource.
 *
 * @param {Object} obj
 * @return {Function}
 * @api public
 */

module.exports = (obj) => {
  const resource = methodd()
  const services = transform(obj)
  Object.keys(services).map(method => {
    const service = services[method]
    Object.keys(service).map(path => {
      const handler = service[path]
      resource.add(method, path, handler.service)
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

function transform (services) {
  const result = {}
  Object.keys(services).map(name => {
    const service = services[name]
    if (typeof service === 'function') {
      result[name] = {
        '/' : {
          service,
          data: {}
        }
      }
    } else {
      Object.keys(service).map(path => {
        if (typeof service[path] === 'function') {
          result[name] = {
            [path]: {
              service: service[path],
              data: {}
            }
          }
        } else {
          result[name] = {
            [path]: service[path]
          }
        }
      })
    }
  })
  return result
}
