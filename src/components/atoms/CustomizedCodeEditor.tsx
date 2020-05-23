import React from 'react'
import CodeEditor from './CodeEditor'
import { usePreferences } from '../../lib/preferences'

interface CustomizedCodeEditorProps {
  value: string
  onChange?: (
    newValue: string,
    change: CodeMirror.EditorChangeLinkedList
  ) => void
  onPaste?: (event: ClipboardEvent) => void
  codeMirrorRef?: (codeMirror: CodeMirror.EditorFromTextArea) => void
  className?: string
  mode?: string
  readonly?: boolean
}

const CustomizedCodeEditor = ({
  onChange,
  onPaste,
  value,
  codeMirrorRef,
  className,
  mode,
  readonly,
}: CustomizedCodeEditorProps) => {
  const { preferences } = usePreferences()
  return (
    <CodeEditor
      onChange={onChange}
      onPaste={onPaste}
      value={value}
      codeMirrorRef={codeMirrorRef}
      className={className}
      theme={preferences['editor.theme']}
      fontSize={preferences['editor.fontSize']}
      fontFamily={preferences['editor.fontFamily']}
      indentType={preferences['editor.indentType']}
      indentSize={preferences['editor.indentSize']}
      keyMap={preferences['editor.keyMap']}
      mode={mode}
      readonly={readonly}
    />
  )
}
export default CustomizedCodeEditor
