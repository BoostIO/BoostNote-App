import React, { PropTypes } from 'react'
import styled from 'styled-components'

const Root = styled.div`
  height: 26px;
  position: relative;
  display: inline-block;
  margin: 0 2.5px;
  outline: none;
  .search {
    ${p => p.theme.input}
    -webkit-app-region: no-drag;
    -webkit-user-select: none;
    height: 26px;
    padding: 0 10px;
    box-sizing: border-box;
    margin-left: auto;
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
        this.props.onChange('')
        window.dispatchEvent(new window.CustomEvent('list:focus'))
        break
      case 13:
        window.dispatchEvent(new window.CustomEvent('list:focus'))
        break
    }
  }

  focus () {
    this.refs.input.select()
    this.refs.input.focus()
  }

  render () {
    return <Root
      innerRef={c => (this.root = c)}
      tabIndex='-1'
      onMouseDown={this.handleMouseDown}
    >
      <input className='search'
        ref='input'
        title='Quickly find notes'
        placeholder='Search...'
        value={this.props.value}
        onChange={this.handleChange}
        onMouseDown={this.handleMouseDown}
        onKeyDown={this.handleKeyDown}
      />
    </Root>
  }
}

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func
}

export default SearchInput
