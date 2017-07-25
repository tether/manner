/**
 * Dependencies.
 */

const service = require('methodd')
const salute = require('salute')

module.exports = methods => {
  const api = service(salute((req, res) => {
    return api[req.method.toLowerCase()](req.url)
  }))
  add(api, methods)
  return api
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
