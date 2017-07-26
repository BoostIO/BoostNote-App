import {
  Location,
} from 'client/redux'
import g from 'glamorous'
import React from 'react'
import {
  ReposCreatePageContainer,
  ReposListPageContainer,
} from '../pages'
import Nav from './Nav'

interface PageViewProps {
  location: Location.State
}

const Styled = {
  Root: g.div({
    flex: 1,
  }),
}

class PageRouter extends React.PureComponent<PageViewProps, any> {
  public getPage () {
    const { location } = this.props
    return location.pathname === '/' ? <ReposListPageContainer />
      : location.pathname === '/new-repo' ? <ReposCreatePageContainer />
      // TODO: 404 page
      : '404'
  }

  public render () {
    const page = this.getPage()
    return <Styled.Root>
      {page}
    </Styled.Root>
  }
}

export default PageRouter
