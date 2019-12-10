import React from 'react'
import CodeEditor from './CodeEditor'
import { usePreferences } from '../../lib/preferences'

interface CustomizedCodeEditor {
  value: string
  onChange: (
    newValue: string,
    change: CodeMirror.EditorChangeLinkedList
  ) => void
  codeMirrorRef?: (codeMirror: CodeMirror.EditorFromTextArea) => void
  className?: string
  mode?: string
  readonly?: boolean
}

const CustomizedCodeEditor = ({
  onChange,
  value,
  codeMirrorRef,
  className,
  mode,
  readonly
}: CustomizedCodeEditor) => {
  const { preferences } = usePreferences()
  return (
    <CodeEditor
      onChange={onChange}
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
