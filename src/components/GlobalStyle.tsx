import { createGlobalStyle } from 'styled-components'
import { backgroundColor, textColor } from '../lib/styled/styleFunctions'
import { BaseTheme } from '../lib/styled/themes/types'

export default createGlobalStyle<BaseTheme>`
  body {
    margin: 0;
    ${backgroundColor}
    ${textColor}
    font-family: ${({ theme }) => theme.fontFamily};
    font-size: ${({ theme }) => theme.fontSize}px;
  }

  * {
    box-sizing: border-box;
  }
  *:focus {
    outline: none;
  }

  input {
    font-size: ${({ theme }) => theme.fontSize}px;
  }

  button,
  input {
    outline: none;
  }

  a {
    color: inherit;
  }
  
  /* total width */
  ::-webkit-scrollbar {
    background-color: transparent;
    width:12px;
  }

  /* background of the scrollbar except button or resizer */
  ::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.scrollBarTrackColor};
  }

  /* scrollbar itself */
  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.scrollBarThumbColor};
  }

  /* set button(top and bottom of the scrollbar) */
  ::-webkit-scrollbar-button {
    display: none
  }
`
