import React, { PropTypes } from 'react'
import styled from 'styled-components'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { routerShape } from 'react-router'

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
  height: 24px;
  line-height: 24px;
  padding: 0 10px;
  font-size: 12px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover {
    background-color: ${p => p.theme.buttonHoverColor};
  }
  &:active {
    background-color: ${p => p.theme.buttonActiveColor};
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
        : p.theme.color};
    }
    .empty {
      color: inherit;
    }
  }
  .empty {
    color: ${p => p.theme.inactiveColor};
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
    const { active, isFocused, note } = this.props

    const title = note.get('title')

    return <Root
      className={active ? 'active' : ''}
      isFocused={isFocused}
      onClick={this.handleClick}
      onDragStart={this.handleDragStart}
      onDragEnd={this.handleDragEnd}
      draggable
      isDragging={this.state.isDragging}
    >
      {isValidTitle(title) ? title : <span className='empty'>Empty</span>}
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
