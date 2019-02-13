import React from 'react'
import { inject, observer } from 'mobx-react'
import { RouteStore } from '../lib/RouteStore'
import NotePage from './NotePage'
import { storageRegexp } from '../lib/routes'
import { StyledNotFoundPage } from './styled'

type RouterProps = {
  route?: RouteStore
}

@inject('data', 'route')
@observer
export default class Router extends React.Component<RouterProps> {
  render() {
    const { route } = this.props
    const { pathname } = route!
    if (storageRegexp.exec(pathname)) return <NotePage />
    return (
      <StyledNotFoundPage>
        <h1>Page not found</h1>
        <p>Check the URL or click other link in the left side navigation.</p>
      </StyledNotFoundPage>
    )
  }
}
