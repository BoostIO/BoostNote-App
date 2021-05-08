import React from 'react'
import CodeEditor from './CodeEditor'
import { usePreferences } from '../../lib/preferences'
import CodeMirror from '../../lib/CodeMirror'

interface CustomizedCodeEditorProps {
  value: string
  onChange?: (
    newValue: string,
    change: CodeMirror.EditorChangeLinkedList
  ) => void
  codeMirrorRef?: (codeMirror: CodeMirror.EditorFromTextArea) => void
  className?: string
  mode?: string
  readonly?: boolean
  onPaste?: (codeMirror: CodeMirror.Editor, event: ClipboardEvent) => void
  onDrop?: (codeMirror: CodeMirror.Editor, event: DragEvent) => void
  onCursorActivity?: (codeMirror: CodeMirror.Editor) => void
  onLocalSearchToggle?: (
    codeMirror: CodeMirror.Editor,
    showLocalSearch: boolean
  ) => void
  onLocalSearchReplaceToggle?: (
    codeMirror: CodeMirror.Editor,
    showLocalReplace: boolean
  ) => void
}

const CustomizedCodeEditor = ({
  onChange,
  value,
  codeMirrorRef,
  className,
  mode,
  readonly,
  onPaste,
  onDrop,
  onCursorActivity,
  onLocalSearchToggle,
  onLocalSearchReplaceToggle,
}: CustomizedCodeEditorProps) => {
  const { preferences, getCodemirrorTypeKeymap } = usePreferences()
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
      getCustomKeymap={getCodemirrorTypeKeymap}
      mode={mode}
      readonly={readonly}
      onPaste={onPaste}
      onDrop={onDrop}
      onCursorActivity={onCursorActivity}
      onLocalSearchToggle={onLocalSearchToggle}
      onLocalSearchReplaceToggle={onLocalSearchReplaceToggle}
    />
  )
}

export default CustomizedCodeEditor
