import React from 'react'
import { Global, css } from '@emotion/core'

const GlobalStyle = () => (
  <Global
    styles={css`
      body {
        margin: 0;
      }
      a {
        color: inherit;
      }
    `}
  />
)

export default GlobalStyle
