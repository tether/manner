

/**
 * Generate options services.
 *
 * @param {Object} services
 * @api private
 */

module.exports = services => {
  const options = methods(services)
  services.options = services.options || {}
  Object.keys(options).map(path => {
    services.options = {
      ...services.options,
      [path] : {
        service(data, req, res) {
          const head = headers(options[path])
          if (res) res.writeHead(200, head)
          // @note we would like to return the schema as well
          return head
        }
      }
    }
  })
  return services
}


/**
 * Extract allowed methods from a resource.
 *
 * @param {Object} resource
 * @return {Object}
 * @api private
 */

function methods (resource) {
  const result = {}
  Object.keys(resource).map(method => {
    Object.keys(resource[method]).map(path => {
      const option = result[path] = result[path] || {}
      const allowed = option.methods = (option.methods || [])
      allowed.push(method)
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
