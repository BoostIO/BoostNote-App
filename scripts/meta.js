const fs = require('fs')
const path = require('path')
const { pick } = require('ramda')

const packageJson = require('../package.json')

const filteredJson = pick(
  ['name', 'productName', 'version', 'author'],
  packageJson
)

fs.writeFileSync(
  path.join(__dirname, '../app/package.json'),
  JSON.stringify(filteredJson, null, 2) + '\n'
)
