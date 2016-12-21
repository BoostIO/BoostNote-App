import { combineReducers } from 'redux'
import _ from 'lodash'
import { routerReducer } from 'react-router-redux'
import { DEFAULT_CONFIG } from 'lib/consts'

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
      state = state.merge(action.payload.config)
      // TODO: this should be extracted to redux saga middleware
      const config = state.toJS()
      // Try to save as a json file
      try {
        sander.writeFileSync(configPath, JSON.stringify(config))
      } catch (err) {
        console.warn(err.stack)
      }
      // Try to send to main window
      try {
        remote.getGlobal('windows').main.webContents.send('update-config', config)
      } catch (err) {
        console.warn(err.stack)
      }
      return state
  }
  return state
}

let reducers = combineReducers({
  config,
  routing: routerReducer
})

export default reducers
