import { DEFAULT_CONFIG } from 'lib/consts'
import _ from 'lodash'

const sander = require('sander')
const path = require('path')
const { remote } = require('electron')
const { app } = remote
const configPath = path.join(app.getPath('userData'), 'config.json')

let storedConfig
try {
  storedConfig = JSON.parse(sander.readFileSync(configPath))
  if (!_.isObject(storedConfig)) throw new Error('Status data should be an object.')
} catch (err) {
  console.warn(err.stack)
  storedConfig = {}
}

const initialConfig = DEFAULT_CONFIG.merge(storedConfig)

function config (state = initialConfig, action) {
  switch (action.type) {
    case 'UPDATE_CONFIG':
      return state.merge(action.payload.config)
  }
  return state
}

export default config
