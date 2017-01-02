# Testing

We use a custom runner for testing.

## How to

Run webpack dev server

```sh
npm test:serve
```

Open another terminal and Run test runner

```sh
npm test:run
```

Then, runner will track changes from `**.spec.js` files in `specs` directory and its dependencies and run the needed test.

## `**.spec.js`

Spec file should export test method to `default`.

```js
import assert from 'assert'
import StorageManager from 'main/lib/StorageManager'

export default t => {
  assert.ok(true)
}
```

## Mocking

On test environment, `babel-plugin-rewire` is enabled.

You can replace any dependencies of a module by `__Rewire__` method.

```js
import loadAllStorages from 'main/lib/data/loadAllStorages'

const storageMock = require('storageMock')
loadAllStorages.__Rewire__('localStorage', storageMock)
```
