import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { removeCookie } from './lib/electronOnly'

removeCookie(process.env.BOOST_HUB_BASE_URL!, 'desktop_access_token')

function render(Component: typeof App) {
  let rootDiv = document.getElementById('root')
  if (rootDiv == null) {
    rootDiv = document.createElement('div', {})
    rootDiv.setAttribute('id', 'root')
    document.body.appendChild(rootDiv)
  }
  ReactDOM.render(<Component />, document.getElementById('root'))
}

if (module.hot != null) {
  module.hot.accept('./components/App', () => {
    render(App)
  })
}
render(App)
