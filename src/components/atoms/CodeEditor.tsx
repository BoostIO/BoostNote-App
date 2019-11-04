import React from 'react'
import CodeMirror from '../../lib/CodeMirror'

const defaultCodeMirrorOptions: CodeMirror.EditorConfiguration = {
  lineWrapping: true,
  lineNumbers: true,
  mode: 'markdown'
}

interface CodeEditorProps {
  value: string
  onChange: (
    newValue: string,
    change: CodeMirror.EditorChangeLinkedList
  ) => void
  codeMirrorRef?: (codeMirror: CodeMirror.EditorFromTextArea) => void
  theme?: string
  fontSize?: number
}

class CodeEditor extends React.Component<CodeEditorProps> {
  textAreaRef = React.createRef<HTMLTextAreaElement>()
  codeMirror?: CodeMirror.EditorFromTextArea

  componentDidMount() {
    this.codeMirror = CodeMirror.fromTextArea(this.textAreaRef.current!, {
      ...defaultCodeMirrorOptions,
      theme: this.props.theme == null ? 'default' : this.props.theme
    })
    this.codeMirror.on('change', this.handleCodeMirrorChange)
    window.addEventListener('codemirror-mode-load', this.reloadMode)
    if (this.props.codeMirrorRef != null) {
      this.props.codeMirrorRef(this.codeMirror)
    }
  }

  reloadMode = () => {
    if (this.codeMirror != null) {
      this.codeMirror.setOption('mode', this.codeMirror.getOption('mode'))
    }
  }

  componentDidUpdate(prevProps: CodeEditorProps) {
    if (this.codeMirror == null) {
      return
    }
    if (this.props.value !== this.codeMirror.getValue()) {
      this.codeMirror.setValue(this.props.value)
    }
    if (this.props.theme !== prevProps.theme) {
      this.codeMirror.setOption('theme', this.props.theme)
    }
    if (this.props.fontSize !== prevProps.fontSize) {
      this.codeMirror.refresh()
    }
  }

  componentWillUnmount() {
    if (this.codeMirror != null) {
      this.codeMirror.toTextArea()
    }
    window.removeEventListener('codemirror-mode-load', this.reloadMode)
  }

  handleCodeMirrorChange = (
    editor: CodeMirror.Editor,
    change: CodeMirror.EditorChangeLinkedList
  ) => {
    if (change.origin !== 'setValue') {
      this.props.onChange(editor.getValue(), change)
    }
  }

  render() {
    return (
      <div
        style={{
          fontSize:
            this.props.fontSize == null ? 'inherit' : `${this.props.fontSize}px`
        }}
      >
        <textarea ref={this.textAreaRef} defaultValue={this.props.value} />
      </div>
    )
  }
}

export default CodeEditor
