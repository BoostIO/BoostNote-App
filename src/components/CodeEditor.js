import React, { PropTypes } from 'react'
import styled from 'styled-components'
import CodeMirror from 'codemirror'
import _ from 'lodash'
import { Map } from 'immutable'

let docMap = new Map()

const Root = styled.div`
  .CodeMirror {
    min-height: 100%;
    font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
    font-size: 14px;
    line-height: 1.4;
  }
`

class CodeEditor extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }

  componentDidMount () {
    const { value, docKey, mode } = this.props
    this.value = value
    this.codemirror = CodeMirror(this.root, {
      value: new CodeMirror.Doc(_.isString(value) ? value : ''),
      lineNumbers: true,
      lineWrapping: true,
      keyMap: 'sublime',
      inputStyle: 'textarea'
    })

    this.setSyntaxMode(mode)

    this.codemirror.on('blur', this.handleBlur)
    this.codemirror.on('change', this.handleChange)
    docMap = docMap.set(docKey, this.codemirror.getDoc())
  }

  componentWillUnmount () {
    this.codemirror.off('blur', this.handleBlur)
    this.codemirror.off('change', this.handleChange)

    // Unlink document by force
    this.codemirror.swapDoc(new CodeMirror.Doc(''))
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.docKey !== nextProps.docKey) {
      let nextDoc = docMap.get(nextProps.docKey)
      let currentDoc = this.codemirror.getDoc()
      docMap = docMap.set(this.props.docKey, currentDoc)

      if (nextDoc == null) {
        let syntax = CodeMirror.findModeByName(nextProps.mode)
        nextDoc = new CodeMirror.Doc(nextProps.value, syntax.mime)
        docMap = docMap.set(nextProps.docKey, nextDoc)
      }
      this.codemirror.swapDoc(nextDoc)
    }

    if (this.props.mode !== nextProps.mode) this.setSyntaxMode(nextProps.mode)
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

  focus () {
    this.codemirror.focus()
  }

  setSyntaxMode (mode) {
    let syntax = CodeMirror.findModeByName(mode)
    if (syntax == null) syntax = CodeMirror.findModeByName('Plain Text')

    this.codemirror.setOption('mode', syntax.mime)
    CodeMirror.autoLoadMode(this.codemirror, syntax.mode)
  }

  render () {
    const { className, style } = this.props
    return (
      <Root
        className={['CodeEditor', className].join(' ')}
        style={style}
        innerRef={c => (this.root = c)}
      />
    )
  }
}

CodeEditor.propTypes = {
  value: PropTypes.string,
  docKey: PropTypes.string
}

export default CodeEditor
