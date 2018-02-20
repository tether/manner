/**
 * Dependencie(s)
 */

const methodd = require('methodd')


/**
 * Create web services from an object.
 *
 * @param {Object} obj
 * @param {Object} schema
 * @return {Function}
 * @api public
 */

module.exports = (services) => {
  const resource = methodd()
  Object.keys(services).map(name => {
    resource.add(name, '/', services[name])
  })
  return resource
}
