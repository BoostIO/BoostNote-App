import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import styled from 'styled-components'
import { TitleBar as MacTitleBar } from 'react-desktop/macOs'
import { TitleBar as WindowsTitleBar } from 'react-desktop/windows'
import Octicon from 'components/Octicon'
import _ from 'lodash'
import StorageManager from '../lib/StorageManager'
import SearchInput from './SearchInput'

const { remote } = require('electron')

const OSX = global.process.platform === 'darwin'
const WIN = global.process.platform === 'win32'
// const LINUX = global.process.platform === 'linux'

const Button = styled.button`
  ${p => p.theme.button}
  padding: 0;
  width: 30px;
  height: 26px;
  -webkit-app-region: no-drag;
  -webkit-user-select: none;
  margin: 0 2.5px;
  ${p => p.active
    ? 'color: ' + p.theme.activeColor + ';'
    : ''
  }
  .Octicon {
    fill: currentColor;
  }
`

const ToolBar = styled.div`
  height: ${OSX ? 36 : 31}px;
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-right: ${OSX ? 0 : 10}px;
  padding-left: 140px;
  .left {
    flex: 1;
  }
`

const BordedTitleBar = styled(OSX ? MacTitleBar : WindowsTitleBar)`
  border-bottom: ${p => p.theme.border};
  ${WIN ? 'flex-direction: row-reverse;' : ''}
`

const AttributedTitleBar = (props) => {
  return WIN
    ? <BordedTitleBar
      controls
      {..._.omit(props, ['isFullscreen', 'onResizeClick', 'innerRef'])}
    />
    : <BordedTitleBar
      transparent
      inset
      {..._.omit(props, ['isMaximized', 'onRestoreDownClick', 'innerRef'])}
    />
}

const Root = styled.div`
  position: relative;
  background-color: ${p => p.theme.uiBackgroundColor};
`

class TitleBar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isFullscreen: false,
      search: ''
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
  }

  componentDidMount () {
    window.addEventListener('title:new-note', this.handleNewButtonClick)
    window.addEventListener('title:focus-search', this.handleWindowFocusSearch)
    window.addEventListener('title:open-preferences', this.handleOpenPreferences)
    window.addEventListener('resize', this.handleWindowResize)

    const { status } = this.props

    const currentWindow = remote.getCurrentWindow()
    const [, windowHeight] = currentWindow.getSize()
    const nextEditorWidth = status.get('editorMode') === 'SINGLE'
      ? status.get('editorSingleWidth')
      : status.get('editorDoubleWidth')
    const nextWidth = status.get('navWidth') + status.get('noteListWidth') + nextEditorWidth + 2
    currentWindow.setSize(nextWidth, windowHeight)
  }

  componentWillUnmount () {
    window.removeEventListener('title:new-note', this.handleNewButtonClick)
    window.removeEventListener('title:focus-search', this.handleWindowFocusSearch)
    window.removeEventListener('title:open-preferences', this.handleOpenPreferences)
    window.removeEventListener('resize', this.handleWindowResize)
  }

  handleNewButtonClick = e => {
    this.createNote()
  }

  handleWindowFocusSearch = e => {
    this.search.focus()
  }

  handleWindowResize = e => {
    const currentWindow = remote.getCurrentWindow()
    const [windowWidth] = currentWindow.getSize()

    this.queueResolveEditorWidth(windowWidth)
  }

  handleOpenPreferences = e => {
    this.openPreferences()
  }

  handleDeleteButtonClick = e => {
    window.dispatchEvent(new window.CustomEvent('main:delete'))
  }

  handleMouseDown = e => {
    let el = document.activeElement
    if (el.nodeName === 'TEXTAREA') {
      el = el.parentNode
      while (el != null) {
        if (el.attributes.tabIndex != null) {
          el.focus()
          e.stopPropagation()
          e.preventDefault()
          return
        }
        el = el.parentNode
      }
    }
    e.stopPropagation()
    e.preventDefault()
  }

  handlePreferencesButtonClick = e => {
    this.openPreferences()
  }

  handleToggleEditorModeButtonClick = e => {
    const { store } = this.context
    const { status } = this.props

    const nextMode = status.get('editorMode') === 'SINGLE'
      ? 'TWO_PANE'
      : 'SINGLE'

    const currentWindow = remote.getCurrentWindow()
    const [, windowHeight] = currentWindow.getSize()
    const nextEditorWidth = status.get('editorMode') === 'SINGLE'
      ? status.get('editorDoubleWidth')
      : status.get('editorSingleWidth')
    const nextWidth = status.get('navWidth') + status.get('noteListWidth') + nextEditorWidth + 2
    currentWindow.setSize(nextWidth, windowHeight)

    store.dispatch({
      type: 'UPDATE_STATUS',
      payload: {
        status: status.set('editorMode', nextMode)
      }
    })
  }

  queueResolveEditorWidth (windowWidth) {
    window.clearTimeout(this.resizeTimer)
    this.resizeTimer = window.setTimeout(() => {
      this.resolveAndDispatchEditorWidth(windowWidth)
    }, 500)
  }

  resolveAndDispatchEditorWidth (windowWidth) {
    const { store } = this.context
    const { status } = this.props

    const nextEditorWidth = windowWidth - status.get('navWidth') - status.get('noteListWidth') - 2
    const targetStatusKey = status.get('editorMode') === 'SINGLE'
      ? 'editorSingleWidth'
      : 'editorDoubleWidth'

    store.dispatch({
      type: 'UPDATE_STATUS',
      payload: {
        status: status.set(targetStatusKey, nextEditorWidth)
      }
    })
  }

  openPreferences () {
    if (remote.getGlobal('windows').preferences.isVisible()) {
      remote.getGlobal('windows').preferences.hide()
    } else {
      remote.getGlobal('windows').preferences.show()
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

  createNote = () => {
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
        meta: {},
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
          }
        })
        window.dispatchEvent(new window.CustomEvent('detail:focus'))
      })
  }

  render () {
    const { search, onSearchChange, status } = this.props

    return (
      <Root
        onMouseDown={this.handleMouseDown}
      >
        <AttributedTitleBar
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
            <div className='left'>
              <Button onClick={this.handleDeleteButtonClick}
                title='Delete'>
                <Octicon icon='trashcan' />
              </Button>
              <Button onClick={this.handleNewButtonClick}
                title='Create a note'
              >
                <Octicon icon='plus' />
              </Button>
            </div>
            <div className='right'>
              <Button
                title='Toggle Editor Mode'
                active={status.get('editorMode') === 'TWO_PANE'}
                onClick={this.handleToggleEditorModeButtonClick}
              >
                <Octicon icon='book' />
              </Button>
              <SearchInput
                ref={c => (this.search = c)}
                onChange={onSearchChange}
                value={search}
              />
              <Button
                title='Preferences'
                onClick={this.handlePreferencesButtonClick}
              >
                <Octicon icon='settings' />
              </Button>
            </div>
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
