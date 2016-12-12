const { app } = require('electron')

const OSX = process.platform === 'darwin'
const WIN = process.platform === 'win32'

global.windows = {
  main: null,
  preferences: null
}

app.on('window-all-closed', () => {
  if (!OSX) {
    app.quit()
  }
})

app.on('ready', () => {
  global.windows.main = require('./lib/mainWindow')
  global.windows.preferences = require('./lib/preferencesWindow')
})
