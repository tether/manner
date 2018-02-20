/**
 * Dependencie(s)
 */

const compile = require('./lib/compile')
const Readable = require('stream').Readable

/**
 * Create web resource.
 *
 * @param {Object} obj
 * @return {Function}
 * @api public
 */

module.exports = (obj) => {
  return compile((req, res) => {
    var stream = new Readable
    stream._read = () => {}
    stream.push('hello world')
    stream.push(null)
    return stream
  }, obj)
}
