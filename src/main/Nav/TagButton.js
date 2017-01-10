import React, { PropTypes } from 'react'
import styled from 'styled-components'
import { LinkButton, Octicon } from 'components'
import ContextMenu from 'main/lib/ContextMenu'
import dataAPI from 'main/lib/dataAPI'
import { routerShape } from 'react-router'

const Root = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
`

const Button = styled(LinkButton)`
  display: flex;
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
    .count {
      color: inherit;
    }
  }
  .label {
    flex: 1;
  }
  .count {
    font-size: 10px;
    color: ${p => p.theme.inactiveColor};
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

class TagButton extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isRenaming: false,
      newName: props.tagName
    }

    this.handleContextMenu = e => {
      ContextMenu.open([
        {
          label: 'Rename Tag...',
          click: e => this.rename()
        },
        {
          label: 'Delete Tag...',
          click: e => this.delete()
        },
        {
          type: 'separator'
        },
        {
          label: 'New Tag...',
          click: e => this.props.createNewButton()
        }
      ])
    }

    this.handleInputBlur = e => {
      this.confirmRenaming()
    }

    this.handleInputKeyDown = e => {
      e.stopPropagation()

      switch (e.keyCode) {
        case 13:
          this.confirmRenaming()
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

  handleDragEnter = e => {
    this.setState({
      isDragEntered: true
    })
  }

  handleDragLeave = e => {
    this.setState({
      isDragEntered: false
    })
  }

  handleDrop = e => {
    const data = JSON.parse(e.dataTransfer.getData('application/json'))

    this.setState({
      isDragEntered: false
    }, () => {
      this.parseDropData(data)
    })
  }

  parseDropData (data) {
    const { storageName, tagName } = this.props
    const { store } = this.context

    switch (data.type) {
      case 'MOVE_NOTE':
        const noteId = data.payload.noteKey

        dataAPI
          .updateNote(storageName, noteId, {tags: data.payload.note.tags.concat([tagName])})
          .then(res => {
            store.dispatch({
              type: 'UPDATE_NOTE',
              payload: {
                storageName,
                noteId: res.id,
                note: res.note
              }
            })
          })
    }
  }

  rename () {
    this.setState({
      isRenaming: true,
      newName: this.props.tagName
    }, () => {
      this.input.focus()
      this.input.select()
    })
  }

  delete () {
    const { storageName, tagName, deleteTag } = this.props
    deleteTag(storageName, tagName)
  }

  cancelRenaming () {
    this.setState({
      isRenaming: false
    }, () => {
      this.button.focus()
    })
  }

  confirmRenaming () {
    this.setState({
      isRenaming: false
    }, () => {
      const { storageName, resolveNewName, tagName } = this.props
      const { store, router } = this.context

      const newTagName = resolveNewName(this.state.newName)

      dataAPI
        .renameTag(storageName, tagName, newTagName)
        .then(res => {
          if (router.params.tagName === tagName) {
            router.push(`/storages/${storageName}/tags/${newTagName}`)
          }
          store.dispatch({
            type: 'RENAME_TAG',
            payload: {
              storageName,
              tagName,
              newTagName
            }
          })
        })
    })
  }

  render () {
    const { tagURL, tagName, tagMeta, isFocused } = this.props
    // TODO: Drag & drop to tag note
    return (
      <Root
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
      >
        {this.state.isRenaming
          ? <RenameInput
            innerRef={c => (this.input = c)}
            value={this.state.newName}
            onBlur={this.handleInputBlur}
            onKeyDown={this.handleInputKeyDown}
            onChange={this.handleInputChange}
          />
          : <Button
            to={tagURL}
            innerRef={c => (this.button = c)}
            onContextMenu={this.handleContextMenu}
            className={this.state.isDragEntered
              ? 'NavButton active'
              : 'NavButton'
            }
            isFocused={isFocused}
          >
            <span className='label'><Octicon icon='tag' /> {tagName}</span>
            <span className='count'>{tagMeta.get('notes').size}</span>
          </Button>
        }
      </Root>
    )
  }
}

TagButton.propTypes = {
  tagURL: PropTypes.string,
  tag: PropTypes.string,
  storageName: PropTypes.string,
  deleteTag: PropTypes.func
}

TagButton.contextTypes = {
  store: PropTypes.shape({
    dispatch: PropTypes.func
  }),
  router: routerShape
}

export default TagButton
