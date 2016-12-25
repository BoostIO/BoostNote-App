import React, { PropTypes } from 'react'
import styled from 'styled-components'
import CodeEditor from './CodeEditor'
import MarkdownPreview from './MarkdownPreview'

const WrappedCodeEditor = styled(CodeEditor)`
  position: absolute;
  overflow-y: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

const WrappedMarkdownPreview = styled(MarkdownPreview)`
  position: absolute;
  overflow-y: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: none;
  height: 100%;
  width: 100%;
  min-height: 100%;
  background-color: white;
`

const PREVIEW_MODE = 'PREVIEW_MODE'
const EDIT_MODE = 'EDIT_MODE'

class MarkdownEditor extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      mode: PREVIEW_MODE
    }
    this.value = this.props.value
  }

  componentDidMount () {
    this.value = this.props.value
  }

  handlePreviewMouseDown = e => {
    this.lastPreviewMouseDown = Date.now()
  }

  // If mouse up is fired after 500 secs from the last mouse down,
  // Don't switch edit mode and let user to select contents from MarkdownPreview.
  handlePreviewMouseUp = e => {
    if (Date.now() - this.lastPreviewMouseDown < 500) {
      this.focus()
    }
  }

  handleEditorBlur = e => {
    this.setState({
      mode: PREVIEW_MODE
    })
  }

  handleEditorChange = e => {
    this.value = this.editor.value
    if (this.props.onChange != null) this.props.onChange(e)
  }

  focus () {
    this.setState({
      mode: EDIT_MODE
    }, () => {
      this.editor.focus()
    })
  }

  render () {
    const { className, style, value, docKey,
      theme, fontSize, fontFamily, codeBlockTheme, codeBlockFontFamily,
      editorFontSize, editorFontFamily, editorTheme, indentStyle, indentSize } = this.props

    return (
      <div
        className={className}
        style={style}
      >
        <WrappedMarkdownPreview
          innerRef={c => (this.preview = c)}
          style={{
            zIndex: this.state.mode === PREVIEW_MODE ? 2 : 1
          }}
          onMouseUp={this.handlePreviewMouseUp}
          onMouseDown={this.handlePreviewMouseDown}
          content={value}
          theme={theme}
          fontSize={fontSize}
          fontFamily={fontFamily}
          codeBlockTheme={codeBlockTheme}
          codeBlockFontFamily={codeBlockFontFamily}
        />
        <WrappedCodeEditor
          innerRef={c => (this.editor = c)}
          style={{
            zIndex: this.state.mode === EDIT_MODE ? 2 : 1
          }}
          onBlur={this.handleEditorBlur}
          onChange={this.handleEditorChange}
          value={value}
          docKey={docKey}
          mode={'GitHub Flavored Markdown'}
          fontSize={editorFontSize}
          fontFamily={editorFontFamily}
          theme={editorTheme}
          indentStyle={indentStyle}
          indentSize={indentSize}
        />
      </div>
    )
  }
}

MarkdownEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  docKey: PropTypes.string
}

export default MarkdownEditor
