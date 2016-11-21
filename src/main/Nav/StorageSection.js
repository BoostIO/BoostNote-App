import React, { PropTypes } from 'react'
import styled from 'styled-components'
import { Octicon, LinkButton } from 'components'
import FolderButton from './FolderButton'
import ContextMenu from 'main/lib/ContextMenu'
import StorageManager from 'main/lib/StorageManager'
import filenamify from 'filenamify'

const NavButton = styled(LinkButton)`
  ${p => p.theme.navButton}
  display: block;
  height: 24px;
  line-height: 24px;
  margin: 0;
  padding: 0 10px;
  cursor: pointer;
  width: 100%;
  &.active .Octicon {
    fill: white;
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
      isCreatingFolder: false,
      newName: ''
    }

    this.createNewFolder = this.createNewFolder.bind(this)

    this.handleNavButtonContextMenu = e => {
      ContextMenu.open([
        {
          label: 'New Folder...',
          click: () => this.createNewFolder()
        }
      ])
    }

    this.handleNewNameInputChange = e => {
      this.setState({
        newName: e.target.value
      })
    }

    this.handleNewNameInputKeyDown = e => {
      switch (e.keyCode) {
        case 13:
          this.confirmCreating()
          break
        case 27:
          this.cancelCreating()
          break
      }
    }

    this.handleNewNameInputBlur = e => {
      this.confirmCreating()
    }
  }

  createNewFolder () {
    const { storageData } = this.props

    let count = 0
    let newName = 'New Folder'
    while (storageData.hasIn(['folders', newName])) {
      newName = `New Folder (${++count})`
    }

    this.setState({
      isCreatingFolder: true,
      newName
    }, () => {
      this.newNameInput.focus()
      this.newNameInput.select()
    })
  }

  confirmCreating () {
    const { storageName, storageData } = this.props
    const { store } = this.context

    let count = 0
    let originalName = filenamify(this.state.newName, {replacement: '_'})
    let newName = originalName
    while (storageData.hasIn(['folders', newName])) {
      newName = `${originalName} (${++count})`
    }

    StorageManager
      .upsertFolder(storageName, newName)
      .then((res) => {
        store.dispatch({
          type: 'UPDATE_FOLDER',
          payload: {
            storageName,
            folderName: newName
          }
        })
      })

    this.setState({
      isCreatingFolder: false
    }, () => {
      this.storageButton.focus()
    })
  }

  cancelCreating () {
    this.setState({
      isCreatingFolder: false,
      newName: 'New Folder'
    }, () => {
      this.storageButton.focus()
    })
  }

  render () {
    const { router } = this.context
    const { storageName, storageData } = this.props

    const folderList = storageData.get('folders')
      .sortBy((v, key) => key.toLowerCase())
      .map((meta, folderName) => {
        const folderURL = `/storages/${storageName}/folders/${folderName}`

        return <FolderButton
          key={folderName}
          storageName={storageName}
          folderURL={folderURL}
          folderName={folderName}
          createNewButton={this.createNewFolder}
        >
          {folderName}
        </FolderButton>
      })
      .toArray()

    const storageURL = `/storages/${storageName}/all-notes`

    return (
      <Root>
        <NavButton
          innerRef={c => (this.storageButton = c)}
          to={storageURL}
          onContextMenu={this.handleNavButtonContextMenu}
        >
          <Octicon icon='repo' /> {storageName}
        </NavButton>
        {folderList}
        {this.state.isCreatingFolder &&
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
}

StorageSection.contextTypes = {
  router: PropTypes.shape({
    push: PropTypes.func,
    isActive: PropTypes.func
  }),
  store: PropTypes.shape({
    dispatch: PropTypes.func
  })
}

export default StorageSection
