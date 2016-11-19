import React from 'react'
import styled from 'styled-components'
import { TitleBar as MacTitleBar, Toolbar } from 'react-desktop/macOs'
import Octicon from 'components/Octicon'

const { remote } = require('electron')

const SearchInput = styled.input`
  ${(p) => p.theme.input}
  -webkit-app-region: no-drag;
  -webkit-user-select: none;
  margin: 0 2.5px;
  height: 26px;
  padding: 0 10px;
  box-sizing: border-box;
`

const Button = styled.button`
  ${(p) => p.theme.button}
  padding: 0;
  width: 30px;
  height: 26px;
  -webkit-app-region: no-drag;
  -webkit-user-select: none;
  margin: 0 2.5px;
`

const Seperator = styled.div`
  display: inline-block;
  margin: 0 10px;
  height: 26px;
`

const BordedTitleBar = styled(MacTitleBar)`
  border-bottom: ${(p) => p.theme.border};
`

const Root = styled.div`
  position: relative;
`

class TitleBar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isFullscreen: false,
      search: ''
    }

    this.handleChange = (e) => {
      this.setState({
        search: e.target.value
      })
    }
  }

  handleCloseClick = () => {
    remote.getCurrentWindow().close()
  }

  handleResizeClick () {
    let currentWindow = remote.getCurrentWindow()
    let isFullscreen = currentWindow.isFullScreen()

    currentWindow.setFullScreen(!isFullscreen)

    this.setState({
      isFullscreen: !isFullscreen
    })
  }

  handleMinimizeClick = () => {
    remote.getCurrentWindow().minimize()
  }

  handleMaximizeClick = () => {
    remote.getCurrentWindow().maximize()
  }

  render () {
    return (
      <Root>
        <BordedTitleBar
          inset
          controls
          transparent
          isFullscreen={this.state.isFullscreen}
          onCloseClick={this.handleCloseClick}
          onMinimizeClick={this.handleMinimizeClick}
          onMaximizeClick={this.handleMaximizeClick}
          onResizeClick={this.handleResizeClick.bind(this)}
        >
          <Toolbar height='36' horizontalAlignment='center'>
            <SearchInput
              placeholder='Search...'
              value={this.state.search}
              onChange={this.handleChange}
            />
            <Button>
              <Octicon icon='plus' />
            </Button>
            <Seperator />
            <Button>
              <Octicon icon='settings' />
            </Button>
          </Toolbar>
        </BordedTitleBar>
      </Root>
    )
  }
}

TitleBar.propTypes = {
}

export default TitleBar
