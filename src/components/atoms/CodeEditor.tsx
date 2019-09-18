import React from 'react'
import CodeMirror from 'codemirror'
import 'codemirror/mode/markdown/markdown'

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
}

class CodeEditor extends React.Component<CodeEditorProps> {
  textAreaRef = React.createRef<HTMLTextAreaElement>()
  codeMirror?: CodeMirror.EditorFromTextArea

  componentDidMount() {
    this.codeMirror = CodeMirror.fromTextArea(
      this.textAreaRef.current!,
      defaultCodeMirrorOptions
    )
    this.codeMirror.on('change', this.handleCodeMirrorChange)
  }

  componentDidUpdate() {
    if (
      this.codeMirror != null &&
      this.props.value !== this.codeMirror.getValue()
    ) {
      this.codeMirror.setValue(this.props.value)
    }
  }

  componentWillUnmount() {
    if (this.codeMirror != null) {
      this.codeMirror.toTextArea()
    }
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
    return <textarea ref={this.textAreaRef} defaultValue={this.props.value} />
  }
}

export default CodeEditor
