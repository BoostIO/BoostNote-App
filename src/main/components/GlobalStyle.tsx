import { createGlobalStyle } from 'styled-components'
import { textColor, backgroundColor } from '../styles/colors'

const GlobalStyle = createGlobalStyle`
  body {
    color: ${textColor};
    background-color: ${backgroundColor};
    margin: 0;
  }
  a {
    color: inherit;
  }
`

export default GlobalStyle
