/**
 * # Test entry
 *
 * Grab `*.spec.js` files
 *
 * ## TODO
 *
 * - [ ] Render result as a react
 * - [ ] Before/After hook
 *
 */

const _ = require('lodash')
const assert = require('assert')
const t = assert

function runTest (key, spec, isReloaded) {
  if (!_.isFunction(spec.default)) return Promise.reject(new Error('It cannot be excuted. : ' + key))
  return Promise.resolve()
    .then(() => {
      return spec.default(t)
    })
    .then(v => {
      console.info(`%c${key} ${(isReloaded ? 're-' : '')}tested successfully.`, 'color: green;')
    })
    .catch(e => {
      console.warn('Test failed: ' + key)
      throw e
    })
}

function loadContext () {
  return require.context('../src', true, /\.spec\.js$/)
}

let specContext = loadContext()

let modules = {}
specContext.keys().forEach(function (key) {
  let spec = specContext(key)
  modules[key] = spec
  runTest(key, spec, false)
})

if (module.hot) {
  module.hot.accept(specContext.id, function () {
    let reloadedContext = loadContext()
    let changedModules = reloadedContext.keys()
      .map(function (key) {
        return [key, reloadedContext(key)]
      })
      .filter(function (reloadedModule) {
        return modules[reloadedModule[0]] !== reloadedModule[1]
      })
    changedModules.forEach(function (specTuple) {
      modules[specTuple[0]] = specTuple[1]
      runTest(specTuple[0], specTuple[1], true)
    })
  })
}
