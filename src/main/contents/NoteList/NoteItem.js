import React, { PropTypes } from 'react'
import styled from 'styled-components'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { routerShape } from 'react-router'
import Octicon from 'components/Octicon'

/**
 * Check the title is empty.
 * If it is, Item component will render 'Empty' label.
 *
 * @param {any} title
 * @returns {Boolean} true if the title is valid

 */
function isValidTitle (title) {
  return title.trim().length > 0
}

const Root = styled.div`
  border-bottom: ${p => p.theme.border};
  ${p => p.isDragging
    ? 'border-color: transparent;'
    : ''
  }
  padding: 0 10px 4px;
  font-size: 12px;
  cursor: pointer;
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
      ? p.theme.inverseColor
      : p.theme.color};
    .Octicon {
      fill: ${p => p.isFocused
        ? p.theme.inverseColor
        : p.theme.inactiveColor};
    }
    .empty {
      color: inherit;
    }
  }
  .empty {
    color: ${p => p.theme.inactiveColor};
  }
  .title {
    flex: 1;
    height: 24px;
    line-height: 24px;
    overflow: hidden;
    font-weight: bold;
    text-overflow: ellipsis;
  }
  .tags {
    font-size: 12px;
    height: 16px;
    line-height: 16px;
    margin-bottom: 2px;
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
    overflow: hidden;
    text-overflow: ellipsis;
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
    background-color: white;
    color: ${p => p.theme.color};
  }
`

const CompactRoot = styled(Root)`
  display: flex;
  padding: 0 0 0 10px;
  .tags {
    height: 24px;
    width: 24px;
    line-height: 24px;
    margin-bottom: 0;
    position: relative;
    justify-content: center;
  }
  .tags .Octicon {
    height: 24px;
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
    color: ${p => p.theme.inverseColor};
    background-color: ${p => p.theme.activeColor};
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
    const { noteKey } = this.props

    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.dropEffect = 'move'
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'MOVE_NOTE',
      payload: {
        noteKey
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

  render () {
    const { active, isFocused, note, compact } = this.props

    const title = note.get('title')
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
            <Octicon icon='tag' />
            <div className='count'>{tags.length}</div>
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
      {tags.length > 0 &&
        <div className='tags' title={tags.join(', ')}>
          <Octicon icon='tag' />
          <div className='list'>
            {tags.map(tag => <div className='item' key={tag}>{tag}</div>)}
          </div>
        </div>
      }
    </Root>
  }
}

NoteItem.contextTypes = {
  router: routerShape
}

NoteItem.propTypes = {
  active: PropTypes.bool,
  isFocused: PropTypes.bool,
  noteKey: PropTypes.string,
  note: ImmutablePropTypes.mapContains({
    title: PropTypes.string
  })
}

export default NoteItem
