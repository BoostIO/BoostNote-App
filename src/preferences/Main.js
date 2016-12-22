import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { routerShape } from 'react-router'
import styled, { ThemeProvider } from 'styled-components'
import TabNav from './TabNav'
import themes from 'lib/themes'
import SettingsTab from './SettingsTab'
import KeybindingsTab from './KeybindingsTab'
import AboutTab from './AboutTab'

const Root = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
`

class Main extends React.Component {
  getTab () {
    const { router } = this.context
    const { config, keymap } = this.props

    switch (router.params.tab) {
      case 'about':
        return <AboutTab />
      case 'keybindings':
        return <KeybindingsTab
          keymap={keymap}
        />
      case 'settings':
      default:
        return <SettingsTab
          config={config}
        />
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.config.get('theme') !== this.props.config.get('theme')) {
      this.forceUpdate()
    }
  }

  render () {
    const { config } = this.props

    return <ThemeProvider theme={config.get('theme') === 'dark' ? themes.dark : themes.default}>
      <Root>
        <TabNav />
        {this.getTab()}
      </Root>
    </ThemeProvider>
  }
}

Main.propTypes = {

}

Main.contextTypes = {
  router: routerShape
}

export default connect(x => x)(Main)
