const sander = require('sander')
const path = require('path')
const _ = require('lodash')

const themesDir = path.join(__dirname, '../node_modules/codemirror/theme')

function getCodeMirrorThemes () {
  let themes = sander.readdirSync(themesDir)
    .map(cssPath => {
      const name = path.basename(cssPath, '.css')
      return {
        label: name.split('-').map(splitted => _.capitalize(splitted)).join(' '),
        value: name
      }
    })

  themes.unshift({
    label: 'Default',
    value: 'default'
  })

  return themes
}

const util = {
  getCodeMirrorThemes
}

module.exports = util
