import React from 'react'
import Helmet from 'react-helmet'

interface PageHelmetProps {
  title?: string
  indexing?: boolean
}

const PageHelmet: React.FC<PageHelmetProps> = ({
  title = 'Boost Note - markdown editor for developers',
  indexing,
}) => (
  <Helmet>
    <title>{title}</title>
    <meta property='og:image' content='/static/images/ogp.jpg' />
    {!indexing && <meta name='robots' content='noindex, nofollow' />}
  </Helmet>
)

export default PageHelmet
