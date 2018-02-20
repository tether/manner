/**
 * Dependencie(s)
 */

const compile = require('./lib/compile')


/**
 * Create web resource.
 *
 * @param {Object} obj
 * @return {Function}
 * @api public
 */

module.exports = (obj) => {
  return compile((...args) => {
    console.log('inside http', args)
  }, obj)
}
