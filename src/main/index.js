import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import store from './lib/redux/store'
import { hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'
import App from './App'

const isDev = process.env.NODE_ENV !== 'production'

if (isDev) {
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err))
}

document.addEventListener('drop', function (e) {
  e.preventDefault()
  e.stopPropagation()
})
document.addEventListener('dragover', function (e) {
  e.preventDefault()
  e.stopPropagation()
})

const history = syncHistoryWithStore(hashHistory, store)

if (isDev) {
  history.listen((location) => {
    if (location.action === 'PUSH') {
      console.info('PUSHING...', location.pathname + location.search)
    }
  })
}

const render = () => {
  ReactDOM.render(
    <AppContainer>
      <App store={store} history={history} />
    </AppContainer>,
    document.getElementById('content')
  )
}

render()

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./App', render)
}
