/**
 * Dependencies.
 */

const service = require('methodd')
const salute = require('salute')

module.exports = methods => {
  const api = service()
  add(api, methods)
  return salute((req, res) => {
    return api[req.method.toLowerCase()](req.url)
  })
}



function add(api, methods) {
  Object.keys(methods).map(key => {
    const value = methods[key]
    if (typeof value !== 'object') {
      methods[key] = {
        '/': (...args) => value(...args)
      }
    }
  })
  api.add(methods)
}
