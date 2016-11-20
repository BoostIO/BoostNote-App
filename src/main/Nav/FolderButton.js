import React, { PropTypes } from 'react'
import styled from 'styled-components'
import { LinkButton } from 'components'
import ContextMenu from 'main/lib/ContextMenu'

const Root = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
`

const Button = styled(LinkButton)`
  ${p => p.theme.navButton}
  display: block;
  height: 24px;
  line-height: 24px;
  margin: 0;
  padding: 0 10px;
  cursor: pointer;
  flex: 1;
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
      ContextMenu.open([
        {
          label: 'Rename Folder...',
          click: e => this.rename()
        },
        {
          label: 'Delete Folder...'
        },
        {
          label: 'New Sub Folder...'
        },
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
    const { folderPath, folderName } = this.props

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
            to={folderPath}
            innerRef={c => (this.button = c)}
            onContextMenu={this.handleContextMenu}
          >
            {folderName}
          </Button>
        }
      </Root>
    )
  }
}

FolderButton.propTypes = {
  folderPath: PropTypes.string,
  folderName: PropTypes.string
}

export default FolderButton
