import React from 'react'
import styled from 'styled-components'
import { TitleBar as MacTitleBar } from 'react-desktop/macOs'
import { TitleBar as WindowsTitleBar } from 'react-desktop/windows'
import Octicon from 'components/Octicon'
import _ from 'lodash'

const { remote } = require('electron')

const OSX = global.process.platform === 'darwin'
const WIN = global.process.platform === 'win32'
// const LINUX = global.process.platform === 'linux'

const SearchInput = styled.input`
  ${p => p.theme.input}
  -webkit-app-region: no-drag;
  -webkit-user-select: none;
  margin: 0 2.5px;
  height: 26px;
  padding: 0 10px;
  box-sizing: border-box;
`

const Button = styled.button`
  ${p => p.theme.button}
  padding: 0;
  width: 30px;
  height: 26px;
  -webkit-app-region: no-drag;
  -webkit-user-select: none;
  margin: 0 2.5px;
  &:last-child {
    margin-left: auto;
  }
`

const Seperator = styled.div`
  display: inline-block;
  margin: 0 10px;
  height: 26px;
`

const ToolBar = styled.div`
  height: ${OSX ? 36 : 31}px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-right: ${OSX ? 0 : 10}px;
`

const BordedTitleBar = styled(OSX ? MacTitleBar : WindowsTitleBar)`
  border-bottom: ${p => p.theme.border};
  ${WIN ? 'flex-direction: row-reverse;' : ''}
`

const AttributedTitleBar = (props) => {
  return OSX
    ? <BordedTitleBar
      transparent
      inset
      {..._.omit(props, ['isMaximized', 'onRestoreDownClick'])}
    />
    : <BordedTitleBar
      {..._.omit(props, ['isFullscreen', 'onResizeClick'])}
    />
}

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

    this.handleChange = e => {
      this.setState({
        search: e.target.value
      })
    }

    this.handleCloseClick = e => {
      remote.getCurrentWindow().close()
    }

    this.handleMinimizeClick = e => {
      remote.getCurrentWindow().minimize()
      this.setState({
        isMaximized: false
      })
    }

    this.handleMaximizeClick = e => {
      this.toggleMaximize()
    }

    this.handleRestoreDownClick = e => {
      this.toggleMaximize()
    }

    this.handleResizeClick = e => {
      let currentWindow = remote.getCurrentWindow()
      let isFullscreen = currentWindow.isFullScreen()

      currentWindow.setFullScreen(!isFullscreen)

      this.setState({
        isFullscreen: !isFullscreen
      })
    }

    this.handleRootDoubleClick = e => {
      this.toggleMaximize()
    }
  }

  toggleMaximize () {
    let currentWindow = remote.getCurrentWindow()

    let isMaximized = currentWindow.isMaximized()
    if (isMaximized) {
      currentWindow.unmaximize()
    } else {
      currentWindow.maximize()
    }

    this.setState({
      isMaximized: !isMaximized
    })
  }

  render () {
    return (
      <Root>
        <AttributedTitleBar
          controls
          isMaximized={this.state.isMaximized}
          isFullscreen={this.state.isFullscreen}
          onCloseClick={this.handleCloseClick}
          onMinimizeClick={this.handleMinimizeClick}
          onMaximizeClick={this.handleMaximizeClick}
          onRestoreDownClick={this.handleRestoreDownClick}
          onResizeClick={this.handleResizeClick}
          onDoubleClick={this.handleRootDoubleClick}
          innerRef={c => (this.titlebar = c)}
        >
          <ToolBar>
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
          </ToolBar>
        </AttributedTitleBar>
      </Root>
    )
  }
}

TitleBar.propTypes = {
}

export default TitleBar
