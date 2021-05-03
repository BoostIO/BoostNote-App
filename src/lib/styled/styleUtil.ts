import { BaseTheme } from './BaseTheme'
import { lightTheme } from '../../themes/light'
import { legacyTheme } from '.'
import { darkTheme } from '../../themes/dark'
import { sepiaTheme } from '../../themes/sepia'
import { solarizedDarkTheme } from '../../themes/solarizedDark'

export const getGlobalCss = (theme: BaseTheme) => `
  body {
    margin: 10px;
    background-color: ${theme.backgroundColor};
    color: ${theme.textColor};
    font-family: Lato, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;
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
      background-color: ${theme.backgroundColor};
  }

  /* total width */
  ::-webkit-scrollbar {
    background-color: transparent;
    width:12px;
  }

  /* background of the scrollbar except button or resizer */
  ::-webkit-scrollbar-track {
    background-color: ${theme.scrollBarTrackColor};
  }

  /* scrollbar itself */
  ::-webkit-scrollbar-thumb {
    background-color: ${theme.scrollBarThumbColor};
  }

  /* set button(top and bottom of the scrollbar) */
  ::-webkit-scrollbar-button {
    display: none
  }
`

export function selectTheme(theme: string): BaseTheme {
  switch (theme) {
    case 'legacy':
      return legacyTheme
    case 'light':
      return lightTheme
    case 'sepia':
      return sepiaTheme
    case 'solarizedDark':
      return solarizedDarkTheme
    case 'dark':
    default:
      return darkTheme
  }
}
