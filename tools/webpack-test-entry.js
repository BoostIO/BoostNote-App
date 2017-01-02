/**
 * # Test entry
 *
 * Grab `*.spec.js` files
 *
 * TODO: Render result as a react
 *
 */

const _ = require('lodash')
const assert = require('assert')
const t = assert

function runTest (key, spec, isReloaded) {
  return Promise.resolve()
    .then(function doBefore () {
      if (_.isFunction(spec.before)) {
        return spec.before(t)
      }
    })
    .catch(function handleBeforeError (err) {
      console.warn('Test(Before) failed: ' + key)
      console.error(err.stack || err)
      throw new Error('NO_TEST')
    })
    .then(function doTest () {
      if (_.isFunction(spec.default)) {
        return Promise.resolve(spec.default(t))
          .then(function showResult (v) {
            console.info(`%c${key} ${(isReloaded ? 're-' : '')}tested successfully.`, 'color: green;')
          })
      } else {
        console.warn(`${key} has no test`)
      }
    })
    .catch(function handleTestError (err) {
      // Skip if the error already caught.
      if (err.message !== 'NO_TEST') {
        console.warn('Test failed: ' + key)
        console.error(err.stack || err)
      }
    })
    .then(function doAfter () {
      if (_.isFunction(spec.before)) {
        return spec.before(t)
      }
    })
    .catch(function handleAfterError (err) {
      console.warn('Test(After) failed: ' + key)
      console.error(err.stack || err)
    })
}

function loadContext () {
  return require.context('../specs', true, /\.spec\.js$/)
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
