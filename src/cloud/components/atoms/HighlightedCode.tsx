import React, { useEffect, useRef } from 'react'
import CodeMirror from '../../lib/editor/CodeMirror'

interface HighlightedCodeProps {
  value: string
}

const HighlightedCode = ({ value }: HighlightedCodeProps) => {
  const editorRootRef = useRef<HTMLPreElement>(null)
  useEffect(() => {
    if (editorRootRef.current == null) {
      return
    }
    CodeMirror.runMode(value, 'application/javascript', editorRootRef.current)
  }, [value])
  return (
    <pre
      className='CodeMirrorWrapper CodeMirror cm-s-default'
      ref={editorRootRef}
    />
  )
}

export default HighlightedCode
