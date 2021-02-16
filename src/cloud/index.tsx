import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import './lib/i18n'
import { ElectronProvider } from './lib/stores/electron'

function render(Component: typeof App) {
  let rootDiv = document.getElementById('root')
  if (rootDiv == null) {
    rootDiv = document.createElement('div', {})
    rootDiv.setAttribute('id', 'root')
    document.body.appendChild(rootDiv)
  }
  ReactDOM.render(
    <ElectronProvider>
      <Component />
    </ElectronProvider>,

    document.getElementById('root')
  )
}

if (module.hot != null) {
  module.hot.accept('./components/App', () => {
    render(App)
  })
}
render(App)
