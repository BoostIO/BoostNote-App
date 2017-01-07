import React, { PropTypes } from 'react'
import styled from 'styled-components'
import { Map, Set } from 'immutable'
import { routerShape } from 'react-router'
import filenamify from 'filenamify'
import ContextMenu from 'main/lib/ContextMenu'
import dataAPI from 'main/lib/dataAPI'
import { Octicon, LinkButton } from 'components'
import FolderButton from './FolderButton'
import TagButton from './TagButton'

const NavButton = styled(LinkButton)`
  display: block;
  width: 100%;
  height: 24px;
  line-height: 24px;
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
  &.active {
    font-weight: bold;
    background-color: ${p => p.isFocused
      ? p.theme.activeColor
      : p.theme.buttonActiveColor};
    color: ${p => p.isFocused
      ? p.theme.activeInverseColor
      : p.theme.color};
  }
`

const NewFolder = styled.div`
  height: 24px;
  display: flex;
  align-items: center;
`
const NewFolderNameInput = styled.input`
  ${p => p.theme.input}
  height: 20px;
  line-height: 20px;
  padding: 0 5px;
  display: block;
  width: 100%;
  margin: 0 10px;
  box-sizing: border-box;
  flex: 1;
`

const Root = styled.div`
  margin: 10px 0;
`

class StorageSection extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isCreating: false,
      newName: '',
      mode: 'folders'
    }
  }

  handleNavButtonContextMenu = e => {
    ContextMenu.open([
      {
        label: 'New Folder...',
        click: () => this.createNew()
      }
    ])
  }

  handleNewNameInputChange = e => {
    this.setState({
      newName: e.target.value
    })
  }

  handleNewNameInputKeyDown = e => {
    e.stopPropagation()
    switch (e.keyCode) {
      case 13:
        this.confirmCreating()
        break
      case 27:
        this.cancelCreating()
        break
    }
  }

  handleNewNameInputBlur = e => {
    this.confirmCreating()
  }

  createNewFolder = () => {
    this.createNew('folders')
  }

  createNewTag = () => {
    this.createNew('tags')
  }

  createNew = (tab = 'folders') => {
    const { switchTab, folderMap, tagMap } = this.props
    switchTab(tab, false)

    let count = 0
    let newName = 'New Folder'
    if (tab === 'folders') {
      while (folderMap.has(newName)) {
        newName = `New Folder (${++count})`
      }
    } else {
      newName = 'New Tag'
      while (tagMap.has(newName)) {
        newName = `New Tag (${++count})`
      }
    }

    this.setState({
      isCreating: true,
      newName
    }, () => {
      this.newNameInput.focus()
      this.newNameInput.select()
    })
  }

  resolveNewName = newName => {
    const { folderMap } = this.props

    let count = 0
    let originalName = filenamify(newName, {replacement: '_'})
    let resolvedName = originalName
    while (folderMap.has(resolvedName)) {
      resolvedName = `${originalName} (${++count})`
    }

    return resolvedName
  }

  confirmCreating () {
    const { storageName, tab } = this.props
    const { store, router } = this.context

    const newName = this.resolveNewName(this.state.newName)

    if (tab === 'folders') {
      store
        .dispatch(dispatch => {
          return dataAPI
            .upsertFolder(storageName, newName)
            .then(res => {
              const folderName = res.id
              dispatch({
                type: 'UPDATE_FOLDER',
                payload: {
                  storageName,
                  folderName: folderName,
                  folder: new Map([
                    ['notes', new Set()]
                  ])
                }
              })
              return folderName
            })
        })
        .then(folderName => {
          router.push('/storages/' + storageName + '/folders/' + folderName)
        })
    } else {
      store
        .dispatch(dispatch => {
          return dataAPI
            .upsertTag(storageName, newName)
            .then(res => {
              const tagName = res.id
              dispatch({
                type: 'UPDATE_TAG',
                payload: {
                  storageName,
                  tagName: tagName,
                  tag: new Map([
                    ['notes', new Set()]
                  ])
                }
              })
              return tagName
            })
        })
        .then(tagName => {
          router.push('/storages/' + storageName + '/tags/' + tagName)
        })
    }

    this.setState({
      isCreating: false
    }, () => {
      this.storageButton.focus()
    })
  }

  cancelCreating () {
    this.setState({
      isCreating: false,
      newName: 'New Folder'
    }, () => {
      this.storageButton.focus()
    })
  }

  renderList () {
    const { tab, storageName, folderMap, tagMap, isFocused, deleteFolder, deleteTag } = this.props

    if (tab === 'folders') {
      return folderMap
        .map((meta, folderName) => {
          const folderURL = `/storages/${storageName}/folders/${folderName}`

          return <FolderButton
            key={folderName}
            storageName={storageName}
            resolveNewName={this.resolveNewName}
            folderURL={folderURL}
            folderName={folderName}
            folderMeta={meta}
            createNewButton={this.createNew}
            isFocused={isFocused}
            deleteFolder={deleteFolder}
          >
            {folderName}
          </FolderButton>
        })
        .toArray()
    } else {
      return tagMap
        .map((meta, tagName) => {
          const tagURL = `/storages/${storageName}/tags/${tagName}`

          return <TagButton
            key={tagName}
            storageName={storageName}
            resolveNewName={this.resolveNewName}
            tagURL={tagURL}
            tagName={tagName}
            tagMeta={meta}
            createNewButton={this.createNew}
            isFocused={isFocused}
            deleteTag={deleteTag}
          />
        })
        .toArray()
    }
  }

  render () {
    const { storageName, isFocused } = this.props

    const list = this.renderList()

    const storageURL = `/storages/${storageName}/all-notes`

    return (
      <Root>
        <NavButton
          innerRef={c => (this.storageButton = c)}
          to={storageURL}
          onContextMenu={this.handleNavButtonContextMenu}
          className='NavButton'
          isFocused={isFocused}
        >
          <Octicon icon='repo' /> {storageName}
        </NavButton>
        {list}
        {this.state.isCreating &&
          <NewFolder>
            <NewFolderNameInput
              innerRef={c => (this.newNameInput = c)}
              value={this.state.newName}
              onChange={this.handleNewNameInputChange}
              onKeyDown={this.handleNewNameInputKeyDown}
              onBlur={this.handleNewNameInputBlur}
            />
          </NewFolder>
        }
      </Root>
    )
  }
}

StorageSection.propTypes = {
  storageName: PropTypes.string,
  folderMap: PropTypes.instanceOf(Map),
  isFocused: PropTypes.bool,
  deleteFolder: PropTypes.func
}

StorageSection.contextTypes = {
  store: PropTypes.shape({
    dispatch: PropTypes.func
  }),
  router: routerShape
}

export default StorageSection
