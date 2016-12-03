import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import styled from 'styled-components'
import { TitleBar as MacTitleBar } from 'react-desktop/macOs'
import { TitleBar as WindowsTitleBar } from 'react-desktop/windows'
import Octicon from 'components/Octicon'
import _ from 'lodash'
import StorageManager from './lib/StorageManager'

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
      {..._.omit(props, ['isMaximized', 'onRestoreDownClick', 'innerRef'])}
    />
    : <BordedTitleBar
      {..._.omit(props, ['isFullscreen', 'onResizeClick', 'innerRef'])}
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
      if (e.target === findDOMNode(this.titlebar) || e.target === findDOMNode(this.toolbar)) {
        this.toggleMaximize()
      }
    }

    this.handleNewButtonClick = e => {
      this.createNote()
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

  createNote () {
    const { router, store } = this.context

    let storageName = router.params.storageName
    if (!_.isString(storageName)) {
      storageName = 'notebook'
    }

    let folderName = router.params.folderName
    if (!_.isString(folderName)) {
      folderName = 'Notes'
    }

    // TODO: this should be moved to redux saga
    StorageManager
      .createNote(storageName, {
        folder: folderName,
        title: '',
        content: '',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .then(res => {
        store.dispatch({
          type: 'CREATE_NOTE',
          payload: {
            storageName,
            noteId: res.id,
            note: res.note
          }
        })
        router.push({
          pathname: router.location.pathname,
          query: {
            key: res.id
          },
          state: {
            active: true
          }
        })
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
          <ToolBar
            innerRef={c => (this.toolbar = c)}
          >
            <SearchInput
              placeholder='Search...'
              value={this.state.search}
              onChange={this.handleChange}
            />
            <Button onClick={this.handleNewButtonClick}>
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

TitleBar.contextTypes = {
  router: PropTypes.shape({
    params: PropTypes.shape({
      storageName: PropTypes.string,
      folderName: PropTypes.string
    })
  }),
  store: PropTypes.shape({
    dispatch: PropTypes.func
  })
}

export default TitleBar
