import React from 'react'
import '../lib/i18n'
import { getBoostHubHomepageUrl } from '../lib/boosthub'
import BoostHubWebview from './BoostHubWebview'
import styled from '../design/lib/styled'
import { createGlobalStyle } from 'styled-components'
import querystring from 'querystring'

const parsedQuery = querystring.parse(location.search.slice(1))
const targetUrl = typeof parsedQuery.url === 'string' ? parsedQuery.url : ''

const App = () => {
  return (
    <Container>
      <BoostHubWebview src={resolveUrl(targetUrl)} />
      <GlobalStyle />
    </Container>
  )
}

export default App

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
`

function resolveUrl(url: string) {
  if (url === '' || !url.startsWith(process.env.BOOST_HUB_BASE_URL!)) {
    return getBoostHubHomepageUrl()
  }

  return url
}
