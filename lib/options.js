

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
        service() {
          return {}
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
