import React, { PropTypes } from 'react'
import styled from 'styled-components'
import Octicon from 'components/Octicon'
import ImmutablePropTypes from 'react-immutable-proptypes'

const Root = styled.div`
  height: 30px;
  display: flex;
  align-items: center;
  .Octicon {
    fill: ${p => p.theme.inactiveColor};
  }
  .list {
    display: flex;
    align-items: center;
  }
  .item {
    -webkit-user-select: none;
    margin: 0 2px;
    height: 20px;
    font-size: 13px;
    border: ${p => p.theme.border};
    line-height: 20px;
    padding: 0 6px;
    border-radius: 4px;
    cursor: default;
    &:hover {
      background-color: ${p => p.theme.buttonHoverColor};
    }
  }
  input {
    margin: 0 2px;
    height: 20px;
    line-height: 20px;
    padding: 0;
    width: 100px;
    border: none;
    border-bottom: ${p => p.theme.border};
    outline: none;
    font-size: 12px;
    &:focus {
      border-bottom: ${p => p.theme.activeBorder};
    }
  }
`

class TagSelect extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      newTag: ''
    }
  }

  componentDidMount () {
    this.value = this.props.value
  }

  componentWillReceiveProps (nextProps) {
    this.value = this.props.value
  }

  handleInputChange = e => {
    this.setState({
      newTag: e.target.value
    })
  }

  handleInputKeyDown = e => {
    switch (e.keyCode) {
      // Enter
      case 13:
        this.addTag()
        break
      // Backspace
      case 8:
        if (e.target.selectionStart === 0) {
          this.removeTag()
        }
        break
      case 27:
        e.preventDefault()
        window.dispatchEvent(new window.CustomEvent('detail:focus'))
    }
  }

  addTag () {
    let newTag = this.state.newTag.trim().replace(/\s/g, '_')
    if (newTag.length > 0) {
      this.setState({
        newTag: ''
      }, () => {
        const { onChange, value } = this.props
        let newValue = value.add(newTag)
        this.value = newValue
        if (onChange != null) onChange(newValue)
      })
    }
  }

  removeTag () {
    const { onChange, value } = this.props
    let newValue = value.slice(0, value.size - 1)
    this.value = newValue
    if (onChange != null) onChange(newValue)
  }

  resetInput () {
    this.setState({
      newTag: ''
    })
  }

  focus () {
    this.input.focus()
  }

  render () {
    const { value } = this.props

    const tagList = value
      .map(tag => {
        return <div className='item' key={tag}>
          {tag}
        </div>
      })
      .toArray()

    return (
      <Root>
        <Octicon className='Octicon' icon='tag' />
        <div className='list'>
          {tagList}
        </div>
        <input
          ref={c => (this.input = c)}
          value={this.state.newTag}
          onChange={this.handleInputChange}
          onKeyDown={this.handleInputKeyDown}
          placeholder='Add Tags...'
        />
      </Root>
    )
  }
}

TagSelect.propTypes = {
  onChange: PropTypes.func,
  value: ImmutablePropTypes.setOf(PropTypes.string)
}

export default TagSelect
