import g from 'glamorous'
import React from 'react'
import {
  ReposCreatePage,
  ReposListPage,
  ReposShowPage,
} from '../pages'
import Nav from './Nav'

interface PageViewProps {
  location: {
    pathname: string
  }
}

const Styled = {
  Root: g.div({
    flex: 1,
  }),
}

class PageRouter extends React.PureComponent<PageViewProps, any> {
  public getPage () {
    const { location } = this.props
    return location.pathname === '/' ? <ReposListPage/>
      : location.pathname === '/new-repo' ? <ReposCreatePage/>
      // TODO: 404 page
      : location.pathname.match(/^\/repos/)
      ? <ReposShowPage/>
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
