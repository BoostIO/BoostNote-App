import React, { useEffect, useRef } from 'react'
import CodeMirror from '../CodeMirror'
import { CodeMirrorBinding } from 'y-codemirror'
import { useEffectOnce } from 'react-use'
import { WebsocketProvider } from 'y-websocket'
import throttle from 'lodash.throttle'

interface EditorProps {
  config?: CodeMirror.EditorConfiguration
  bind?: (editor: CodeMirror.Editor) => void
  realtime?: WebsocketProvider
  lineScrollTarget?: number
  onLineScroll?: (line: number) => void
}

const CodeMirrorEditor = ({
  config = {},
  realtime,
  bind,
  lineScrollTarget,
  onLineScroll,
}: EditorProps) => {
  const editorRootRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<CodeMirror.Editor>()
  const onScrollLineRef = useRef(onLineScroll)
  const skipOnScrollRef = useRef(false)

  useEffect(() => {
    onScrollLineRef.current = onLineScroll
  }, [onLineScroll])

  useEffectOnce(() => {
    if (editorRootRef.current != null) {
      editorRef.current = CodeMirror(editorRootRef.current, {
        extraKeys: {
          Enter: 'newlineAndIndentContinueMarkdownList',
          Tab: 'indentMore',
        },
        ...config,
      })

      editorRef.current.on('keydown', (cm, event) => {
        if (cm.state.vim && cm.state.vim.insertMode) {
          event.stopPropagation()
          event.stopImmediatePropagation()
        }
      })

      editorRef.current.on(
        'scroll',
        throttle(
          (editor) => {
            if (onScrollLineRef.current != null && !skipOnScrollRef.current) {
              const rect = editor.getScrollInfo()
              const line = editor.lineAtHeight(rect.top, 'local')
              onScrollLineRef.current(line + 1)
            }
            skipOnScrollRef.current = false
          },
          10,
          { leading: true, trailing: true }
        )
      )
    }
  })

  useEffect(() => {
    if (editorRef.current != null && bind != null) {
      bind(editorRef.current)
    }
  }, [bind])

  useEffect(() => {
    if (editorRef.current != null) {
      Object.entries(config).forEach(([key, val]) => {
        editorRef.current!.setOption(
          key as keyof CodeMirror.EditorConfiguration,
          val
        )
      })
    }
  }, [config])

  useEffect(() => {
    if (realtime == null || editorRef.current == null) {
      return undefined
    }

    editorRef.current.setValue('')
    const binding = new CodeMirrorBinding(
      realtime.doc.getText('content'),
      editorRef.current,
      realtime.awareness
    )
    editorRef.current.clearHistory()
    return () => {
      binding.destroy()
    }
  }, [realtime])

  useEffect(() => {
    if (lineScrollTarget != null && editorRef.current != null) {
      const height = editorRef.current.heightAtLine(
        Math.max(0, lineScrollTarget - 1),
        'local'
      )
      // animate
      skipOnScrollRef.current = true
      editorRef.current.scrollTo(0, height)
    }
  }, [lineScrollTarget])

  return <div className='CodeMirrorWrapper' ref={editorRootRef} />
}

export default CodeMirrorEditor
