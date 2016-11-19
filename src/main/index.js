import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import App from './App'
import store from './lib/redux/store'
import { hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'

if (process.env.NODE_ENV !== 'production') {
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

let el = document.getElementById('content')

ReactDOM.render((
  <AppContainer>
    <App store={store} history={history} />
  </AppContainer>
), el, function () {

})

// 강제적으로 App을 다시 불러와서 새롭게 렌더링합니다.
// 고로 App을 바깥으로 빼둘 필요가 있습니다.
if (module.hot) {
  module.hot.accept('./App', () => {
    let NextApp = require('./App').default
    ReactDOM.render((
      <AppContainer>
        <NextApp store={store} history={history} />
      </AppContainer>
    ), el)
  })
}
