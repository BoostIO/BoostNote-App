import React, { PropTypes } from 'react'
import styled from 'styled-components'
import CodeEditor from './CodeEditor'
import MarkdownPreview from './MarkdownPreview'

const SCROLL_DISPATCH_DELAY = 500

const WrappedCodeEditor = styled(CodeEditor)`
  position: absolute;
  overflow: hidden;
  top: 0;
  left: 0;
  ${p => p.editorMode === 'TWO_PANE'
    ? 'width: 50%;border-right: ' + p.theme.border + ';'
    : 'right: 0;'
  }
  box-sizing: border-box;
  bottom: 0;
`

const WrappedMarkdownPreview = styled(MarkdownPreview)`
  position: absolute;
  overflow: hidden;
  top: 0;
  right: 0;
  bottom: 0;
  border: none;
  height: 100%;
  ${p => p.editorMode === 'TWO_PANE'
    ? 'left: 50%; width: 50%;border-top: ' + p.theme.border + ';'
    : 'left: 0; width: 100%;'
  }
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

  componentWillUnmount () {
    window.clearTimeout(this.scrollQueue)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.docKey !== nextProps.docKey) {
      window.clearTimeout(this.scrollQueue)
      this.scrollTo(0)
    }
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

  handlePreviewScroll = line => {
    this.queueEditorScrolling(line)
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

  handleEditorScroll = line => {
    this.queuePreviewScrolling(line)
  }

  handleTaskClick = line => {
    this.editor.checkTaskItem(line)
  }

  scrollTo (line) {
    this.scrollEditorTo(line)
    this.scrollPreviewTo(line)
  }

  queueEditorScrolling (line) {
    window.clearTimeout(this.scrollQueue)
    this.scrollQueue = window.setTimeout(() => {
      this.scrollEditorTo(line)
    }, SCROLL_DISPATCH_DELAY)
  }

  queuePreviewScrolling (line) {
    window.clearTimeout(this.scrollQueue)
    this.scrollQueue = window.setTimeout(() => {
      this.scrollPreviewTo(line)
    }, SCROLL_DISPATCH_DELAY)
  }

  scrollEditorTo (line) {
    this.editor.scrollTo(line)
  }

  scrollPreviewTo (line) {
    this.preview.scrollTo(line)
  }

  focus () {
    this.setState({
      mode: EDIT_MODE
    }, () => {
      this.editor.focus()
    })
  }

  render () {
    const { className, style, value, docKey, mode,
      previewTheme, fontSize, fontFamily, codeBlockTheme, codeBlockFontFamily,
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
          editorMode={mode}
          onMouseUp={this.handlePreviewMouseUp}
          onMouseDown={this.handlePreviewMouseDown}
          onScroll={this.handlePreviewScroll}
          content={value}
          previewTheme={previewTheme}
          fontSize={fontSize}
          fontFamily={fontFamily}
          codeBlockTheme={codeBlockTheme}
          codeBlockFontFamily={codeBlockFontFamily}
          onTaskClick={this.handleTaskClick}
        />
        <WrappedCodeEditor
          innerRef={c => (this.editor = c)}
          style={{
            zIndex: this.state.mode === EDIT_MODE ? 2 : 1
          }}
          editorMode={mode}
          onBlur={this.handleEditorBlur}
          onChange={this.handleEditorChange}
          onScroll={this.handleEditorScroll}
          value={value}
          docKey={docKey}
          mode={'GitHub Flavored Markdown'}
          fontSize={editorFontSize}
          fontFamily={editorFontFamily}
          editorTheme={editorTheme}
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
