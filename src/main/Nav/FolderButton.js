import React, { PropTypes } from 'react'
import styled from 'styled-components'
import { LinkButton } from 'components'
import ContextMenu from 'main/lib/ContextMenu'
import Dialog from 'main/lib/Dialog'
import StorageManager from 'main/lib/StorageManager'

const DEFAULT_FOLDER_NAME = 'Notes'

const Root = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
`

const Button = styled(LinkButton)`
  display: block;
  width: 100%;
  height: 24px;
  line-height: 24px;
  margin: 0;
  padding: 0 10px;
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  color: ${p => p.theme.color};
  text-decoration: none;
  text-align: left;
  font-size: ${p => p.theme.fontSize};
  font-family: ${p => p.theme.fontFamily};
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
      ? p.theme.inverseColor
      : p.theme.color};
    .Octicon {
      fill: ${p => p.isFocused
        ? p.theme.inverseColor
        : p.theme.color};
    }
  }
`

const RenameInput = styled.input`
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

class FolderButton extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isRenaming: false,
      newName: props.folderName
    }

    this.handleContextMenu = e => {
      const { folderName } = this.props

      const isDefaultFolder = folderName === DEFAULT_FOLDER_NAME

      ContextMenu.open([
        {
          label: 'Rename Folder...',
          click: e => this.rename(),
          enabled: !isDefaultFolder
        },
        {
          label: 'Delete Folder...',
          click: e => this.delete(),
          enabled: !isDefaultFolder
        },
        // {
        //   label: 'New Sub Folder...'
        // },
        {
          type: 'separator'
        },
        {
          label: 'New Folder...',
          click: e => this.props.createNewButton()
        }
      ])
    }

    this.handleInputBlur = e => {
      this.finishRenaming()
    }

    this.handleInputKeyDown = e => {
      switch (e.keyCode) {
        case 13:
          this.finishRenaming()
          break
        case 27:
          this.cancelRenaming()
          break
      }
    }

    this.handleInputChange = e => {
      this.setState({
        newName: this.input.value
      })
    }
  }

  rename () {
    this.setState({
      isRenaming: true,
      newName: this.props.folderName
    }, () => {
      this.input.focus()
      this.input.select()
    })
  }

  delete () {
    const { storageName, folderName } = this.props
    const { store } = this.context

    if (folderName === DEFAULT_FOLDER_NAME) return null

    Dialog.showMessageBox({
      message: `Are you sure you want to delete "${folderName}"?`,
      detail: 'All notes and any subfolders will be deleted.',
      buttons: ['Confirm', 'Cancel']
    }, (index) => {
      if (index === 0) {
        StorageManager.deleteFolder(storageName, folderName)
          .then(() => {
            store.dispatch({
              type: 'DELETE_FOLDER',
              payload: {
                storageName,
                folderName
              }
            })
          })
      }
    })
  }

  cancelRenaming () {
    this.setState({
      isRenaming: false
    }, () => {
      console.log(this.button)
      this.button.focus()
    })
  }

  finishRenaming () {
    this.setState({
      isRenaming: false
    }, () => {
      this.button.focus()
    })
  }

  render () {
    const { folderURL, folderName, isFocused } = this.props

    return (
      <Root>
        {this.state.isRenaming
          ? <RenameInput
            innerRef={c => (this.input = c)}
            value={this.state.newName}
            onBlur={this.handleInputBlur}
            onKeyDown={this.handleInputKeyDown}
            onChange={this.handleInputChange}
          />
          : <Button
            to={folderURL}
            innerRef={c => (this.button = c)}
            onContextMenu={this.handleContextMenu}
            className='NavButton'
            isFocused={isFocused}
          >
            {folderName}
          </Button>
        }
      </Root>
    )
  }
}

FolderButton.propTypes = {
  folderURL: PropTypes.string,
  folderName: PropTypes.string
}

FolderButton.contextTypes = {
  store: PropTypes.shape({
    dispatch: PropTypes.func
  })
}

export default FolderButton
