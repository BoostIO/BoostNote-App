import { createGlobalStyle } from 'styled-components'

export default createGlobalStyle`
  body {
    margin: 0;
    
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
    background-color: transparent;
  }

  /* scrollbar itself */
  ::-webkit-scrollbar-thumb {
    background-color: #babac0;
  }

  /* set button(top and bottom of the scrollbar) */
  ::-webkit-scrollbar-button {
    display: none
  }
`
