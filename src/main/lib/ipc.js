import store from './redux/store'

const { ipcRenderer } = require('electron')

function handleNewNote (e) {
  window.dispatchEvent(new window.CustomEvent('main:new-note'))
}

function handleNewFolder (e) {
  window.dispatchEvent(new window.CustomEvent('main:new-folder'))
}

function handleDelete (e) {
  window.dispatchEvent(new window.CustomEvent('main:delete'))
}

function handleFocusSearch (e) {
  window.dispatchEvent(new window.CustomEvent('main:focus-search'))
}

function handleFind (e) {
  window.dispatchEvent(new window.CustomEvent('main:find'))
}

function handlePrint (e) {
  window.dispatchEvent(new window.CustomEvent('main:print'))
}

function handleOpenPreferences (e) {
  window.dispatchEvent(new window.CustomEvent('main:open-preferences'))
}

function handleUpdateConfig (e, config) {
  store.dispatch({
    type: 'UPDATE_CONFIG',
    payload: {
      config
    }
  })
}

export function mount () {
  ipcRenderer.addListener('new-note', handleNewNote)
  ipcRenderer.addListener('new-folder', handleNewFolder)
  ipcRenderer.addListener('delete', handleDelete)
  ipcRenderer.addListener('focus-search', handleFocusSearch)
  ipcRenderer.addListener('find', handleFind)
  ipcRenderer.addListener('print', handlePrint)
  ipcRenderer.addListener('open-preferences', handleOpenPreferences)
  ipcRenderer.addListener('update-config', handleUpdateConfig)
}

export function unmount () {
  ipcRenderer.removeListener('new-note', handleNewNote)
  ipcRenderer.removeListener('new-folder', handleNewFolder)
  ipcRenderer.removeListener('delete', handleDelete)
  ipcRenderer.removeListener('focus-search', handleFocusSearch)
  ipcRenderer.removeListener('find', handleFind)
  ipcRenderer.removeListener('print', handlePrint)
  ipcRenderer.removeListener('open-preferences', handleOpenPreferences)
  ipcRenderer.removeListener('update-config', handleUpdateConfig)
}

export default {
  mount,
  unmount
}
