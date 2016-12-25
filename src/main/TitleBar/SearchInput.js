import React, { PropTypes } from 'react'
import styled from 'styled-components'
import Octicon from 'components/Octicon'

const Root = styled.div`
  height: 26px;
  position: relative;
  display: inline-block;
  margin: 0 2.5px;
  outline: none;
  .Octicon {
    position: absolute;
    left: 2px;
    top: 7px;
    height: 12px;
    width: 24px;
    text-align: center;
    fill: ${p => p.theme.inactiveColor};
    pointer-events: none;
  }
  .input {
    ${p => p.theme.input};
    background-color: transparent;
    color: ${p => p.theme.color};
    outline: none;
    -webkit-app-region: no-drag;
    -webkit-user-select: none;
    height: 26px;
    width: 150px;
    padding: 0 28px 0 24px;
    box-sizing: border-box;
    margin-left: auto;
  }
  .reset {
    position: absolute;
    right: 0;
    font-size: 12px;
    width: 28px;
    height: 28px;
    background: transparent;
    border: none;
    padding: 0;
    outline: none;
    color: ${p => p.theme.inactiveColor};
    .Octicon {
      fill: currentColor;
    }
    &:hover {
      color: ${p => p.theme.color};
    }
    &:active {
      color: ${p => p.theme.activeColor};
    }
  }
`

class SearchInput extends React.Component {
  handleChange = e => {
    this.props.onChange(e.target.value)
  }

  handleMouseDown = e => {
    e.stopPropagation()
  }

  handleKeyDown = e => {
    switch (e.keyCode) {
      case 27:
        if (this.props.value.length > 0) {
          this.reset()
        } else {
          window.dispatchEvent(new window.CustomEvent('list:focus'))
        }
        break
      case 13:
        window.dispatchEvent(new window.CustomEvent('list:focus'))
        break
    }
  }

  handleResetButtonClick = e => {
    this.reset()
  }

  focus () {
    this.refs.input.select()
    this.refs.input.focus()
  }

  reset () {
    this.props.onChange('')
  }

  render () {
    return <Root
      innerRef={c => (this.root = c)}
      tabIndex='-1'
      onMouseDown={this.handleMouseDown}
    >
      <Octicon icon='search' />
      <input className='input'
        ref='input'
        title='Quickly find notes'
        placeholder='Search...'
        value={this.props.value}
        onChange={this.handleChange}
        onMouseDown={this.handleMouseDown}
        onKeyDown={this.handleKeyDown}
      />
      {this.props.value.length > 0 &&
        <button className='reset'
          onClick={this.handleResetButtonClick}
        >
          <Octicon icon='x' />
        </button>
      }
    </Root>
  }
}

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func
}

export default SearchInput
