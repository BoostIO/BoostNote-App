import store from './redux/store'

const { ipcRenderer } = require('electron')

function handleNewNote (e) {
  window.dispatchEvent(new window.CustomEvent('title:new-note'))
}

function handleNewFolder (e) {
  window.dispatchEvent(new window.CustomEvent('nav:new-folder'))
}

function handleDelete (e) {
  window.dispatchEvent(new window.CustomEvent('nav:delete'))
  window.dispatchEvent(new window.CustomEvent('list:delete'))
}

function handleFocusSearch (e) {
  window.dispatchEvent(new window.CustomEvent('title:focus-search'))
}

function handleFind (e) {
  window.dispatchEvent(new window.CustomEvent('detail:find'))
}

function handlePrint (e) {
  window.dispatchEvent(new window.CustomEvent('detail:print'))
}

function handleOpenPreferences (e) {
  window.dispatchEvent(new window.CustomEvent('title:open-preferences'))
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
