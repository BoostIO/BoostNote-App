import { createGlobalStyle } from 'styled-components'

const MobileGlobalStyle = createGlobalStyle`
  input[type='text'] {
    font-size: 16px !important;
  }
  body {
    overscroll-behavior: none;
    overflow: hidden;
  }
`

export default MobileGlobalStyle
