import { createGlobalStyle } from 'styled-components'
import { BaseTheme } from '../lib/styled'

const GlobalStyle = createGlobalStyle<{ theme: BaseTheme }>`
  * {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    background-color: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.black};
    font-family: -apple-system, BlinkMacSystemFont,
                 "Segoe UI", Roboto, "Helvetica Neue",
                 Arial, "Noto Sans", sans-serif;
    font-size: ${({ theme }) => theme.fontSizes[1]}px;
    line-height: 1.6;
  }

  ul {
    margin: 0;
    padding-left: 0;
    list-style: none;
  }

  a {
    text-decoration: none;
  }
`

export default GlobalStyle
