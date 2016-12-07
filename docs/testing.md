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

Then, runner will track changes from `**.spec.js` files in `src` directory and its dependencies and run the needed test.

## `**.spec.js`

Spec file should export test method to `default`.

```js
import assert from 'assert'
import StorageManager from './StorageManager'

export default t => {
  assert.ok(true)
}
```

## Mocking

This feature is not implemented yet. But, it would be easily solved by using `import-loader`.
