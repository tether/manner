/**
 * Dependencie(s)
 */

const mime = require('mime-types')


/**
 * Generate options services.
 *
 * @param {Object} services
 * @api private
 */

module.exports = services => {
  const options = parse(services)
  services.options = services.options || {}
  Object.keys(options).map(path => {
    services.options = {
      ...services.options,
      [path] : {
        service(data, req, res) {
          const head = headers(options[path])
          if (res) {
            res.writeHead(200, head)
            res.end()
          }
          // @note we would like to return the schema as well
          return Promise.resolve(head)
        }
      }
    }
  })
  return services
}


/**
 * Parse and set service options.
 *
 * Extract allowed methods from a resource.
 * Set full content-type header given type.
 *
 * @param {Object} resource
 * @return {Object}
 * @api private
 */

function parse (resource) {
  const result = {}
  Object.keys(resource).map(method => {
    const service = resource[method]
    Object.keys(service).map(path => {
      const options = result[path] = {
        ...service[path].options,
        ...result[path]
      }
      const allowed = options.methods = (options.methods || [])
      allowed.push(method)
      if (options.type) options.type = mime.contentType(options.type)
      service[path].options = options
    })
  })
  return result
}


/**
 * Generate options headers from object.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function headers (obj) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': `${obj.methods.map(method => method.toUpperCase()).join(', ')}, OPTIONS`,
    'Access-Control-Allow-Headers': 'Origin, Content-Type, Authorization, Content-Length, X-Requested-With'
  }
}
