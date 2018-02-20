/**
 * Dependencie(s)
 */

const compile = require('./lib/compile')
const parse = require('url').parse
const join = require('path').join
const morph = require('morph-stream')


/**
 * Create web resource.
 *
 * @param {Object} obj
 * @return {Function}
 * @api public
 */

module.exports = (obj, relative = '') => {
  return compile((services, req, res) => {
    const url = parse(join('/', req.url.substring(relative.length)))
    const service = services.has(req.method.toLowerCase(), url.pathname)
    if (service) {
      return morph(
        service().then(null, err => {
          console.log('ERROR', err)
        })
      )
    } else {

    }
  }, obj)
}



/**
 * Stream chunk of data.
 *
 * @param {String} chunk
 * @return {Stream}
 * @api private
 */

function stream (chunk) {
  var obj = new Readable
  obj._read = () => {}
  obj.push(chunk)
  obj.push(null)
  return obj
}
