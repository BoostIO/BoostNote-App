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

function handleSetSingleLayout (e) {
  window.dispatchEvent(new window.CustomEvent('detail:set-single-layout'))
}
function handleSetTwoPaneLayout (e) {
  window.dispatchEvent(new window.CustomEvent('detail:set-two-pane-layout'))
}

const eventMap = [
  ['new-note', handleNewNote],
  ['new-folder', handleNewFolder],
  ['delete', handleDelete],
  ['focus-search', handleFocusSearch],
  ['find', handleFind],
  ['print', handlePrint],
  ['set-single-layout', handleSetSingleLayout],
  ['set-two-pane-layout', handleSetTwoPaneLayout],
  ['open-preferences', handleOpenPreferences],
  ['update-config', handleUpdateConfig]
]

export function mount () {
  eventMap.forEach(([name, handler]) => {
    ipcRenderer.addListener(name, handler)
  })
}

export function unmount () {
  eventMap.forEach(([name, handler]) => {
    ipcRenderer.removeListener(name, handler)
  })
}

export default {
  mount,
  unmount
}
