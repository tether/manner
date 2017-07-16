/**
 * Dependencies.
 */

const url = require('url').parse
const salute = require('salute')


/**
 *
 */

module.exports = function (obj) {
  const methods = routes(obj)
  return (req, res) => {
    return methods[req.method.toLowerCase()](req, res)
  }
}


function routes (methods) {
  const result = {}
  Object.keys(methods).map(key => {
    result[key] = salute((req, res) => {
      return methods[key]
    })
  })
  return result
}
