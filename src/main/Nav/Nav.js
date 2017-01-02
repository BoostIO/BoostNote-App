import React, { PropTypes } from 'react'
import styled from 'styled-components'
import { Octicon } from 'components'
import StorageSection from './StorageSection'
import { isFinallyBlurred } from 'lib/util'
import commander from 'main/lib/commander'
import { NAV_MIN_WIDTH } from 'lib/consts'
import CodeMirror from 'codemirror'
import ImmutablePropTypes from 'react-immutable-proptypes'

const Root = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: ${NAV_MIN_WIDTH}px;
  background-color: ${p => p.theme.uiBackgroundColor};
  &:focus {
    outline: none;
  }
`

const StorageList = styled.div`
  width: 100%;
  overflow-y: auto;
  flex: 1;
`

const BottomButton = styled.button`
  display: block;
  width: 100%;
  height: 30px;
  line-height: 30px;
  margin: 0;
  padding: 0 10px;
  background-color: ${p => p.theme.buttonBackgroundColor};
  border: none;
  outline: none;
  cursor: pointer;
  color: ${p => p.theme.color};
  text-decoration: none;
  text-align: left;
  font-size: 12px;
  .Octicon {
    fill: ${p => p.theme.color};
  }
  &:hover {
    background-color: ${p => p.theme.buttonHoverColor};
  }
  &:active {
    background-color: ${p => p.theme.buttonActiveColor};
  }
`

class Nav extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isFocused: false
    }
  }

  componentDidMount () {
    window.addEventListener('nav:new-folder', this.handleNewFolderClick)
    window.addEventListener('nav:focus', this.handleWindowFocus)
    window.addEventListener('nav:up', this.handleWindowUp)
    window.addEventListener('nav:down', this.handleWindowDown)
    window.addEventListener('nav:delete', this.handleWindowDelete)
  }

  componentWillUnmount () {
    window.removeEventListener('nav:new-folder', this.handleNewFolderClick)
    window.removeEventListener('nav:focus', this.handleWindowFocus)
    window.removeEventListener('nav:up', this.handleWindowUp)
    window.removeEventListener('nav:down', this.handleWindowDown)
    window.removeEventListener('nav:delete', this.handleWindowDelete)
  }

  handleKeyDown = e => {
    const keyName = CodeMirror.keyName(e)
    const { keymap } = this.props

    if (keymap.hasIn(['nav', keyName])) {
      e.preventDefault()
      window.dispatchEvent(new window.CustomEvent(keymap.getIn(['nav', keyName])))
    }
  }

  handleNewFolderClick = e => {
    this.refs['storage-' + this.context.router.params.storageName].createNewFolder()
  }

  handleFocus = e => {
    if (!this.state.isFocused) {
      this.setState({
        isFocused: true
      })
    }
  }

  handleBlur = e => {
    if (isFinallyBlurred(e, this.root)) {
      this.setState({
        isFocused: false
      })
    }
  }

  handleWindowFocus = e => {
    this.focus()
  }

  handleWindowUp = e => {
    this.move(-1)
  }

  handleWindowDown = e => {
    this.move()
  }

  handleWindowDelete = e => {
    if (this.state.isFocused) {
      const { router } = this.context
      const { storageName, folderName } = router.params

      if (folderName != null) {
        commander.deleteFolder(storageName, folderName)
      }
    }
  }

  move (offset = 1) {
    const { router } = this.context
    const { storageName, folderName } = router.params

    const currentIndex = folderName == null
      ? this.linkList.indexOf(storageName)
      : this.linkList.indexOf(storageName + '/' + folderName)

    const nextIndex = currentIndex + offset

    if (nextIndex > -1 && nextIndex < this.linkList.length) {
      const nextLink = this.linkList[nextIndex]
        .replace(/\//, '/folders/')

      router.push('storages/' + nextLink)
    }
  }

  focus () {
    this.root.focus()
  }

  render () {
    const { storageMap } = this.props

    this.linkList = []

    const storageList = this.storageList = storageMap
      .map((storageData, storageName) => {
        this.linkList.push(storageName)
        const folderMap = storageData.get('folderMap')
          // Sort by localeCompare except 'Notes'. 'Notes' folder should be came first.
          .sortBy((v, key) => key.toLowerCase(), (a, b) => {
            if (a === 'notes') return -1
            if (b === 'notes') return 1
            return a.localeCompare(b)
          })
        this.linkList = this.linkList.concat(folderMap.map((folder, key) => storageName + '/' + key).toArray())

        return <StorageSection
          ref={'storage-' + storageName}
          key={storageName}
          storageName={storageName}
          folderMap={folderMap}
          isFocused={this.state.isFocused}
        />
      })
      .toArray()

    return (
      <Root style={{width: this.props.width}}
        innerRef={c => (this.root = c)}
        tabIndex='0'
        onKeyDown={this.handleKeyDown}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
      >
        <StorageList>
          {storageList}
        </StorageList>
        <BottomButton onClick={this.handleNewFolderClick}
          title='Create a folder'
        >
          <Octicon icon='plus' /> Add Folder
        </BottomButton>
      </Root>
    )
  }
}

Nav.propTypes = {
}

Nav.contextTypes = {
  router: PropTypes.shape({
    push: PropTypes.func,
    isActive: PropTypes.func,
    params: PropTypes.object
  })
}

export default Nav
