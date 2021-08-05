const fs = require('fs')
const path = require('path')
const { pick } = require('ramda')

const packageJson = require('../package.json')

const filteredJson = {
  ...pick(['name', 'productName', 'version', 'author'], packageJson),
  dependencies: {
    'electron-updater': '^4.2.0',
    'electron-log': '^4.0.0',
    'read-chunk': '^3.2.0',
    'file-type': '^14.6.2',
    'is-svg': '^4.3.1',
    got: '^11.8.1',
  },
}

fs.writeFileSync(
  path.join(__dirname, '../electron/package.json'),
  JSON.stringify(filteredJson, null, 2) + '\n'
)
