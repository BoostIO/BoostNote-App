const { dialog, Notification } = require('electron')
const { autoUpdater } = require('electron-updater')
const logger = require('electron-log')

autoUpdater.logger = logger
autoUpdater.logger.transports.file.level = 'info'

let updater
autoUpdater.autoDownload = false

let updating = false
let foundUpdates = false

autoUpdater.on('error', error => {
  console.info(error.stack || error)
})

autoUpdater.on('update-available', () => {
  foundUpdates = true
  if (updater == null) {
    const notification = new Notification({
      title: 'Found Updates!',
      body: 'Click here to update'
    })
    notification.addListener('click', () => {
      dialog
        .showMessageBox({
          type: 'info',
          title: 'Found Updates',
          message: 'Found updates, do you want update now?',
          buttons: ['Sure', 'No']
        })
        .then(({ response }) => {
          if (response === 0) {
            autoUpdater.downloadUpdate()
          }
        })
    })
    notification.show()
  } else {
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Found Updates',
        message: 'Found updates, do you want update now?',
        buttons: ['Sure', 'No']
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.downloadUpdate()
        } else {
          updater.enabled = true
          updater = null
        }
      })
  }
})

autoUpdater.on('update-not-available', () => {
  if (updater != null) {
    dialog.showMessageBox({
      title: 'No Updates',
      message: 'Current version is up-to-date.'
    })
    updater.enabled = true
    updater = null
  }
})

autoUpdater.on('update-downloaded', () => {
  dialog
    .showMessageBox({
      title: 'Updates downloaded',
      message: 'To install the update, the app must be restarted.',
      buttons: ['Restart and Install', 'Not Yet']
    })
    .then(({ response }) => {
      if (response === 0) {
        setImmediate(() => autoUpdater.quitAndInstall())
      } else {
        if (updater != null) {
          updater.enabled = true
          updater = null
        }
      }
    })
})

function checkForUpdates(menuItem, focusedWindow, event) {
  updater = menuItem
  updater.enabled = false
  autoUpdater.checkForUpdates()
}

setTimeout(() => {
  if (updater == null) {
    autoUpdater.checkForUpdates()
  }
}, 10 * 1000) // After 10 secs

setInterval(() => {
  if (!foundUpdates && updater == null) {
    autoUpdater.checkForUpdates()
  }
}, 24 * 3600 * 1000) // Everyday

module.exports.checkForUpdates = checkForUpdates
