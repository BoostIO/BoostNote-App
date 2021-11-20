import React from 'react'
import '../lib/i18n'
import { getBoostHubHomepageUrl } from '../lib/boosthub'
import BoostHubWebview from './BoostHubWebview'
import styled from '../design/lib/styled'
import { createGlobalStyle, ThemeProvider } from 'styled-components'
import { getQueryMap } from '../lib/url'
import { darkTheme } from '../design/lib/styled/dark'

const parsedQuery = getQueryMap()
const resolvedInitialUrl = resolveUrl(parsedQuery.get('url'))

const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <Container>
        <BoostHubWebview src={resolvedInitialUrl} />
        <GlobalStyle />
      </Container>
    </ThemeProvider>
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

function resolveUrl(url: string | undefined): string {
  if (
    url == null ||
    url === '' ||
    !url.startsWith(process.env.BOOST_HUB_BASE_URL!)
  ) {
    return getBoostHubHomepageUrl()
  }

  return url
}
