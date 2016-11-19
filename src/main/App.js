import React from 'react'
import { Provider } from 'react-redux'
import { Router } from 'react-router'
import routes from './routes'

Router.prototype.componentWillReceiveProps = function (nextProps) {
  let components = []
  function grabComponents (element) {
    if (element.props && element.props.component) {
      components.push(element.props.component)
    }
    if (element.props && element.props.children) {
      React.Children.forEach(element.props.children, grabComponents)
    }
  }
  grabComponents(nextProps.routes || nextProps.children)
  components.forEach(React.createElement)
}

class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }

  render () {
    let { store, history } = this.props

    return (
      <Provider store={store}>
        <Router history={history}>
          {routes}
        </Router>
      </Provider>
    )
  }
}

App.propTypes = {
}

export default App
