import React, { PropTypes } from 'react'
import styled from 'styled-components'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Octicon } from 'components'
import StorageSection from './StorageSection'
import { isFinallyBlurred } from 'lib/util'
import { NAV_MIN_WIDTH } from 'lib/consts'
import CodeMirror from 'codemirror'
import Dialog from 'main/lib/Dialog'
import dataAPI from 'main/lib/dataAPI'
import { routerShape } from 'react-router'

const Root = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: ${NAV_MIN_WIDTH}px;
  background-color: ${p => p.theme.uiBackgroundColor};
  outline: none;
  .tabs {
    text-align: center;
    margin-top: 5px;
    margin-bottom: -5px;
  }
  .tabs button {
    ${p => p.theme.button}
    background-color: ${p => p.theme.uiBackgroundColor};
    border-radius: 0;
    margin-right: -1px;
    box-sizing: border-box;
    height: 20px;
    &:first-child {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
    &:last-child {
      margin-right: 0;
      border-right: ${p => p.theme.border};
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
    &.active {
      color:  ${p => p.theme.activeColor};
    }
  }
  .list {
    width: 100%;
    overflow-y: auto;
    flex: 1;
  }
  .bottomButton {
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
    &:hover {
      background-color: ${p => p.theme.buttonHoverColor};
    }
    &:active {
      background-color: ${p => p.theme.buttonActiveColor};
    }
  }
`

class Nav extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isFocused: false,
      tab: props.status.get('navTab', 'folders')
    }
  }

  componentDidMount () {
    window.addEventListener('nav:new-folder', this.handleNavNewFolder)
    window.addEventListener('nav:focus', this.handleNavFocus)
    window.addEventListener('nav:up', this.handleNavUp)
    window.addEventListener('nav:down', this.handleNavDown)
    window.addEventListener('nav:delete', this.handleNavDelete)
    window.addEventListener('nav:toggle-tab', this.handleNavToggleTab)

    this.focus()
  }

  componentWillUnmount () {
    window.removeEventListener('nav:new-folder', this.handleNavNewFolder)
    window.removeEventListener('nav:focus', this.handleNavFocus)
    window.removeEventListener('nav:up', this.handleNavUp)
    window.removeEventListener('nav:down', this.handleNavDown)
    window.removeEventListener('nav:delete', this.handleNavDelete)
    window.removeEventListener('nav:toggle-tab', this.handleNavToggleTab)
  }

  handleKeyDown = e => {
    const keyName = CodeMirror.keyName(e)
    const { keymap } = this.props

    if (keymap.hasIn(['nav', keyName])) {
      e.preventDefault()
      window.dispatchEvent(new window.CustomEvent(keymap.getIn(['nav', keyName])))
    }
  }

  handleNavNewFolder = e => {
    this.setState({
      tab: 'folders'
    }, () => {
      this.refs['storage-' + this.context.router.params.storageName].createNew()
    })
  }

  handleNewButtonClick = e => {
    switch (this.state.tab) {
      case 'tags':
        this.refs['storage-' + this.context.router.params.storageName].createNew('tags')
        break
      case 'folders':
      default:
        this.refs['storage-' + this.context.router.params.storageName].createNew('folders')
        break
    }
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

  handleNavFocus = e => {
    this.focus()
  }

  handleNavUp = e => {
    this.move(-1)
  }

  handleNavDown = e => {
    this.move()
  }

  handleNavDelete = e => {
    const { router } = this.context
    const { storageName, folderName, tagName } = router.params
    if (this.state.isFocused && folderName != null && folderName !== 'Notes' && this.state.tab === 'folders') {
      this.deleteFolder(storageName, folderName)
    }
    if (this.state.isFocused && tagName != null && this.state.tab === 'tags') {
      this.deleteTag(storageName, tagName)
    }
  }

  handleNavToggleTab = e => {
    this.toggleTab()
  }

  handleFoldersTabClick = e => {
    this.switchTab('folders')
  }

  handleTagsTabClick = e => {
    this.switchTab('tags')
  }

  move (offset = 1) {
    const { router } = this.context
    const { storageName, folderName, tagName } = router.params

    if (this.state.tab !== 'tags') {
      const currentIndex = folderName == null
        ? this.linkList.indexOf(storageName)
        : this.linkList.indexOf(storageName + '/' + folderName)

      const nextIndex = currentIndex + offset

      if (nextIndex > -1 && nextIndex < this.linkList.length) {
        const nextLink = this.linkList[nextIndex]
          .replace(/\//, '/folders/')

        router.push('storages/' + nextLink)
        return true
      }
      return false
    } else {
      const currentIndex = tagName == null
        ? this.linkList.indexOf(storageName)
        : this.linkList.indexOf(storageName + '/' + tagName)

      const nextIndex = currentIndex + offset

      if (nextIndex > -1 && nextIndex < this.linkList.length) {
        const nextLink = this.linkList[nextIndex]
          .replace(/\//, '/tags/')

        router.push('storages/' + nextLink)
        return true
      }
      return false
    }
  }

  focus () {
    this.root.focus()
  }

  deleteFolder = (storageName, folderName) => {
    const { store, router } = this.context

    Dialog.showMessageBox({
      message: `Are you sure you want to delete "${folderName}" folder?`,
      detail: 'All notes and any subfolders will be deleted.',
      buttons: ['Confirm', 'Cancel']
    }, (index) => {
      if (index === 0) {
        const isCurrentFolder = (storageName === router.params.storageName) && (folderName === router.params.folderName)
        if (isCurrentFolder && !this.move(1)) {
          this.move(-1)
        }
        store
          .dispatch(dispatch => {
            return dataAPI.deleteFolder(storageName, folderName)
              .then(res => {
                dispatch({
                  type: 'DELETE_FOLDER',
                  payload: {
                    storageName,
                    folderName
                  }
                })
                this.focus()
              })
          })
      }
    })
  }

  deleteTag = (storageName, tagName) => {
    const { store, router } = this.context

    Dialog.showMessageBox({
      message: `Are you sure you want to delete "${tagName}" tag?`,
      detail: 'All Notes will be untagged.',
      buttons: ['Confirm', 'Cancel']
    }, (index) => {
      if (index === 0) {
        const isCurrentTag = (storageName === router.params.storageName) && (tagName === router.params.tagName)
        if (isCurrentTag && !this.move(1)) {
          this.move(-1)
        }
        store
          .dispatch(dispatch => {
            return dataAPI.deleteTag(storageName, tagName)
              .then(res => {
                dispatch({
                  type: 'DELETE_TAG',
                  payload: {
                    storageName,
                    tagName
                  }
                })
                this.focus()
              })
          })
      }
    })
  }

  switchTab = (nextTab, shouldKeepFocus = true) => {
    const { store } = this.context

    store.dispatch({
      type: 'UPDATE_STATUS',
      payload: {
        status: {
          navTab: nextTab
        }
      }
    })

    this.setState({
      tab: nextTab
    }, () => {
      if (shouldKeepFocus) {
        this.focus()
      }
    })
  }

  toggleTab () {
    const nextTab = this.state.tab === 'folders'
      ? 'tags'
      : 'folders'

    this.switchTab(nextTab, true)
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

        const tagMap = storageData.get('tagMap')
          .sortBy((v, key) => key.toLowerCase(), (a, b) => {
            return a.localeCompare(b)
          })

        this.linkList = this.state.tab !== 'tags'
          ? this.linkList.concat(folderMap.map((folder, key) => storageName + '/' + key).toArray())
          : this.linkList.concat(tagMap.map((tag, key) => storageName + '/' + key).toArray())

        return <StorageSection
          ref={'storage-' + storageName}
          key={storageName}
          storageName={storageName}
          folderMap={folderMap}
          tagMap={tagMap}
          isFocused={this.state.isFocused}
          switchTab={this.switchTab}
          deleteFolder={this.deleteFolder}
          deleteTag={this.deleteTag}
          tab={this.state.tab}
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
        <div className='tabs'>
          <button
            className={this.state.tab === 'folders' && 'active'}
            onClick={this.handleFoldersTabClick}
          >
            Folders
          </button>
          <button
            className={this.state.tab === 'tags' && 'active'}
            onClick={this.handleTagsTabClick}
          >
            Tags
          </button>
        </div>
        <div className='list'>
          {storageList}
        </div>
        <button
          className='bottomButton'
          onClick={this.handleNewButtonClick}
          title={this.state.tab === 'folders'
            ? 'Create a folder'
            : 'Create a tag'
          }
        >
          <Octicon icon='plus' /> {this.state.tab === 'folders'
            ? 'Add Folder'
            : 'Add Tag'
          }
        </button>
      </Root>
    )
  }
}

Nav.propTypes = {
  storageMap: ImmutablePropTypes.orderedMap
}

Nav.contextTypes = {
  store: PropTypes.shape({
    dispatch: PropTypes.func
  }),
  router: routerShape
}

export default Nav
