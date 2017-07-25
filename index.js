/**
 * Dependencies.
 */

const service = require('methodd')
const status = require('http-errors')
const salute = require('salute')


/**
 * Not Implemented callback.
 */

const notimplemented = status(501)


module.exports = methods => {
  const api = service(salute((req, res) => {
    const result = api[req.method.toLowerCase()](req.url)
    return result == null ?  '' : result
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
