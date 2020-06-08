import { createGlobalStyle } from 'styled-components'
import { backgroundColor, textColor } from '../lib/styled/styleFunctions'
import { BaseTheme } from '../lib/styled/BaseTheme'

export default createGlobalStyle<{ theme: BaseTheme }>`
  body {
    margin: 0;
    ${backgroundColor}
    ${textColor}
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Fira sans', Roboto, Helvetica,
    Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    font-size: 15px;
    font-weight: 400;
  }

  * {
    box-sizing: border-box;
    scrollbar-color: rgba(0, 0, 0, 0.12) #efe8d6; /* scrollbar style for firefox */
  }

  *:focus {
    outline: none;
  }

  input, button {
    font-size: 15px;
  }

  h1,h2,h3,h4,h5,h6 {
    font-weight: 500;
  }

  b, strong {
    font-weight: 700;
  }

  button,
  input {
    padding: 0;
    outline: none;
  }

  a {
    color: inherit;
  }

  th,
  td {
    ${backgroundColor}
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
