/**
 * Dependencies.
 */

const service = require('methodd')


module.exports = methods => {
  const api = service()
  api.add(methods)
  return api
}
