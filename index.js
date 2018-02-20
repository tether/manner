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
  const services = parse(obj)
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
 * Parse services.
 *
 * @param {Object} services
 * @api private
 */

function parse (services) {
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
    }
  })
  return result
}
