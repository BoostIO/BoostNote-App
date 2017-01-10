import React, { PropTypes } from 'react'
import styled from 'styled-components'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { routerShape } from 'react-router'
import Octicon from 'components/Octicon'
import _ from 'lodash'
import ContextMenu from 'main/lib/ContextMenu'
import Dialog from 'main/lib/Dialog'
import dataAPI from 'main/lib/dataAPI'

/**
 * Check the title is empty.
 * If it is, Item component will render 'Empty' label.
 *
 * @param {any} title
 * @returns {Boolean} true if the title is valid

 */
function isValidTitle (title) {
  return _.isString(title) && title.trim().length > 0
}

const Root = styled.div`
  border-bottom: ${p => p.theme.border};
  ${p => p.isDragging
    ? 'border-color: transparent;'
    : ''
  }
  padding: 4px 10px 0;
  font-size: 12px;
  cursor: pointer;
  color: ${p => p.theme.color};
  &:hover {
    background-color: ${p => p.theme.buttonHoverColor};
  }
  &:active {
    background-color: ${p => p.theme.buttonActiveColor};
  }
  .Octicon {
    fill: ${p => p.theme.inactiveColor};
  }
  &.active {
    background-color: ${p => p.isFocused
      ? p.theme.activeColor
      : p.theme.buttonActiveColor};
    color: ${p => p.isFocused
      ? p.theme.activeInverseColor
      : p.theme.color};
    .Octicon {
      fill: ${p => p.isFocused
        ? p.theme.activeInverseColor
        : p.theme.inactiveColor};
    }
    .empty {
      color: inherit;
    }
    .preview {
      color: ${p => p.isFocused
        ? 'inherit'
        : p.theme.inactiveColor};
    }
  }
  .empty {
    color: ${p => p.theme.inactiveColor};
  }
  .title {
    flex: 1;
    height: 20px;
    line-height: 20px;
    overflow: hidden;
    font-weight: bold;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .preview {
    flex: 1;
    height: 20px;
    line-height: 20px;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${p => p.theme.inactiveColor}
  }
  .tags {
    font-size: 12px;
    height: 16px;
    line-height: 16px;
    margin-bottom: 4px;
    display: flex;
  }
  .tags .Octicon {
    line-height: 14px;
    height: 14px;
    width: 14px;
    vertical-align: middle;
  }
  .tags .list {
    flex: 1;
    display: flex;
    margin-left: 4px;
    overflow: auto;
  }
  .tags .list .item {
    line-height: 14px;
    height: 14px;
    font-size: 12px;
    vertical-align: middle;
    padding: 0 6px;
    margin: 0 2px;
    border: ${p => p.theme.border};
    border-radius: 3px;
    background-color: ${p => p.theme.buttonBackgroundColor};
    color: ${p => p.theme.color};
  }
  .tags .count {
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 10px;
    line-height: 12px;
    height: 12px;
    width: 12px;
    border-radius: 6px;
    text-align: center;
    color: ${p => p.theme.inactiveColor};
    background-color: ${p => p.theme.backgroundColor};
  }
  &:hover .tags .count {
    background-color: ${p => p.theme.buttonHoverColor};
  }
  &:active .tags .count {
    background-color: ${p => p.theme.buttonActiveColor};
  }
  &.active .tags .count {
    color: ${p => p.isFocused
      ? p.theme.activeInverseColor
      : p.theme.inactiveColor};
    background-color: ${p => p.isFocused
      ? p.theme.activeColor
      : p.theme.buttonActiveColor};
  }
  .tags .icon {
    position: relative;
    width: 24px;
    height: 24px;
    text-align: center;
    line-height: 24px;
    margin: -5px;
  }
`

const CompactRoot = styled(Root)`
  display: flex;
  padding: 0 0 0 10px;
  .title {
    height: 24px;
    line-height: 24px;
  }
  .tags {
    height: 24px;
    width: 24px;
    line-height: 24px;
    margin-bottom: 0;
    position: relative;
  }
  .tags .icon {
    margin: 0;
  }
`

class NoteItem extends React.Component {
  state = {
    isDragging: false
  }

  handleClick = e => {
    const { noteKey } = this.props
    const { router } = this.context

    router.push({
      pathname: router.location.pathname,
      query: {
        key: noteKey
      }
    })
  }

  handleDragStart = e => {
    const { noteKey, note } = this.props

    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.dropEffect = 'move'
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'MOVE_NOTE',
      payload: {
        noteKey,
        note
      }
    }))

    this.setState({
      isDragging: true
    })
  }

  handleDragEnd = e => {
    this.setState({
      isDragging: false
    })
  }

  handleContextMenu = e => {
    ContextMenu.open([
      {
        label: 'Delete Note...',
        click: e => this.delete()
      }
    ])
  }

  delete () {
    Dialog.showMessageBox({
      message: `Are you sure you want to delete the selected note?`,
      buttons: ['Delete Note', 'Cancel']
    }, (index) => {
      const { router, store } = this.context
      const { storageName } = router.params
      const { noteKey, getNextKey } = this.props

      if (index === 0) {
        dataAPI
          .deleteNote(storageName, noteKey)
          .then(() => {
            if (router.location.query.key === noteKey) {
              router.push({
                pathname: router.location.pathname,
                query: {
                  key: getNextKey()
                }
              })
            }
          })
          .then(() => {
            store.dispatch({
              type: 'DELETE_NOTE',
              payload: {
                storageName,
                noteId: noteKey
              }
            })
          })
      }
    })
  }

  render () {
    const { active, isFocused, note, compact } = this.props

    const title = note.getIn(['meta', 'title'])
    const preview = note.getIn(['meta', 'preview'])
    let classNameArr = []
    if (active) classNameArr.push('active')

    let tags = note.get('tags')
      .toArray()

    let props = {
      className: classNameArr.join(' '),
      isFocused,
      onClick: this.handleClick,
      onDragStart: this.handleDragStart,
      onDragEnd: this.handleDragEnd,
      onContextMenu: this.handleContextMenu,
      draggable: true,
      isDragging: this.state.isDragging
    }

    if (compact) {
      return <CompactRoot
        {...props}
      >
        <div className='title'>
          {isValidTitle(title) ? title : <span className='empty'>Empty</span>}
        </div>
        {tags.length > 0 &&
          <div className='tags' title={tags.join(', ')}>
            <div className='icon'>
              <Octicon icon='tag' />
              <div className='count'>{tags.length}</div>
            </div>
          </div>
        }
      </CompactRoot>
    }

    return <Root
      {...props}
    >
      <div className='title'>
        {isValidTitle(title) ? title : <span className='empty'>Empty</span>}
      </div>
      <div className='preview'>
        {isValidTitle(preview) ? preview : <span className='empty'>Empty</span>}
      </div>
      {tags.length > 0 &&
        <div className='tags' title={tags.join(', ')}>
          <div className='icon'>
            <Octicon icon='tag' />
            <div className='count'>{tags.length}</div>
          </div>
          <div className='list'>
            {tags.map(tag => <div className='item' key={tag}>{tag}</div>)}
          </div>
        </div>
      }
    </Root>
  }
}

NoteItem.contextTypes = {
  router: routerShape,
  store: PropTypes.shape({
    dispatch: PropTypes.func
  })
}

NoteItem.propTypes = {
  active: PropTypes.bool,
  isFocused: PropTypes.bool,
  noteKey: PropTypes.string,
  note: ImmutablePropTypes.mapContains({
    meta: ImmutablePropTypes.mapContains({
      title: PropTypes.string,
      preview: PropTypes.string
    })
  })
}

export default NoteItem
