import React from 'react'
import App from 'next/app'
import { ThemeProvider } from 'styled-components'
import { defaultTheme } from '../lib/styled'
import '../lib/i18n'

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props
    return (
      <ThemeProvider theme={defaultTheme}>
        <Component {...pageProps} />
      </ThemeProvider>
    )
  }
}

export default MyApp
