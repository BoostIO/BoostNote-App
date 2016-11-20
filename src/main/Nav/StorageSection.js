import React, { PropTypes } from 'react'
import styled from 'styled-components'
import { Octicon, LinkButton } from 'components'
import FolderButton from './FolderButton'
import ContextMenu from 'main/lib/ContextMenu'

const NavButton = styled(LinkButton)`
  ${(p) => p.theme.navButton}
  display: block;
  height: 24px;
  line-height: 24px;
  margin: 0;
  padding: 0 10px;
  cursor: pointer;
  width: 100%;
`

const NewFolder = styled.div`
  height: 24px;
  display: flex;
  align-items: center;
`
const NewFolderNameInput = styled.input`
  ${(p) => p.theme.input}
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
      switch (e) {
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
    this.setState({
      isCreatingFolder: true,
      newName: 'New Folder'
    }, () => {
      this.newNameInput.focus()
      this.newNameInput.select()
    })
  }

  confirmCreating () {
    this.setState({
      isCreatingFolder: false,
      newName: 'New Folder'
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

    const folderList = storageData.folders
      .map((meta, folderName) => {
        const folderPath = `/storages/${storageName}/folders/${folderName}`

        return <FolderButton
          key={folderName}
          folderPath={folderPath}
          folderName={folderName}
          createNewButton={this.createNewFolder}
        >
          {folderName}
        </FolderButton>
      })
      .toArray()

    const storagePath = `/storages/${storageName}/all-notes`
    const isStorageActive = router.isActive(storagePath)

    return (
      <Root>
        <NavButton
          innerRef={c => (this.storageButton = c)}
          to={storagePath}
          active={isStorageActive}
          onContextMenu={this.handleNavButtonContextMenu}
        >
          <Octicon icon='repo' size={12} color={isStorageActive && 'white'} /> {storageName}
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
  })
}

export default StorageSection
