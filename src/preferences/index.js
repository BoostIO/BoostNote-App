import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import store from './lib/redux/store'
import App from './App'
import history from './history'

require('octicons/build/octicons.css')

// Disable Pinch Zoom
const { webFrame } = require('electron')
webFrame.setZoomLevelLimits(1, 1)

// Ignore drag & drop event
document.addEventListener('drop', function (e) {
  e.preventDefault()
  e.stopPropagation()
})
document.addEventListener('dragover', function (e) {
  e.preventDefault()
  e.stopPropagation()
})

if (process.env.NODE_ENV !== 'production') {
  history.listen(location => {
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
