import React, { PropTypes } from 'react'
import styled from 'styled-components'
import CodeMirror from 'codemirror'
import _ from 'lodash'

const Root = styled.div`
  .CodeMirror {
    min-height: 100%;
  }
`

class CodeEditor extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }

  componentDidMount () {
    this.value = this.props.value
    this.codemirror = CodeMirror(this.root, {
      value: _.isString(this.props.value) ? this.props.value : '',
      lineNumbers: true,
      lineWrapping: true,
      keyMap: 'sublime',
      inputStyle: 'textarea'
    })

    this.codemirror.on('blur', this.handleBlur)
    this.codemirror.on('change', this.handleChange)
  }

  componentWillUnmount () {
    this.codemirror.off('blur', this.handleBlur)
    this.codemirror.off('change', this.handleChange)
  }

  componentDidUpdate () {
    if (this.props.value !== this.value) {
      this.value = this.props.value
      this.codemirror.off('change', this.handleChange)
      this.codemirror.setValue(this.props.value)
      this.codemirror.on('change', this.handleChange)
    }
  }

  handleBlur = (cm, e) => {
    if (e == null) return null
    let el = e.relatedTarget
    while (el != null) {
      if (el === this.root) {
        return
      }
      el = el.parentNode
    }

    if (this.props.onBlur != null) this.props.onBlur()
  }

  handleChange = e => {
    this.value = this.codemirror.getValue()
    if (this.props.onChange != null) this.props.onChange()
  }

  focus = e => {
    this.codemirror.focus()
  }

  render () {
    const { className, style } = this.props
    return (
      <Root
        className={className}
        style={style}
        innerRef={c => (this.root = c)}
      />
    )
  }
}

CodeEditor.propTypes = {
  value: PropTypes.string
}

export default CodeEditor
