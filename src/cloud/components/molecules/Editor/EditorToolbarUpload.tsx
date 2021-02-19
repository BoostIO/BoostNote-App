import React, { useCallback, useRef } from 'react'
import EditorToolButton from './EditorToolButton'
import { mdiImagePlus } from '@mdi/js'
import {
  stringifyFileNode,
  buildDefaultUploadWidget,
  OnFileCallback,
} from '../../../lib/editor/plugins/fileHandler'

interface EditorToolbarUploadProps {
  editorRef: React.MutableRefObject<CodeMirror.Editor | null>
  fileUploadHandlerRef: React.MutableRefObject<OnFileCallback | undefined>
}

const lineClass = 'file-loading'

const EditorToolbarUpload = ({
  editorRef,
  fileUploadHandlerRef,
}: EditorToolbarUploadProps) => {
  const imageUploaderRef = useRef<HTMLInputElement>(null)
  const formUploaderRef = useRef<HTMLFormElement>(null)

  const handler = useCallback(
    async (
      onFile: OnFileCallback,
      editor: CodeMirror.Editor,
      pos: CodeMirror.Position,
      file: File
    ) => {
      const fileNodePromise = onFile(file)
      editor.addLineClass(pos.line, 'wrap', lineClass)
      const widget = buildDefaultUploadWidget(file)
      editor.addWidget(pos, widget, false)
      const fileNode = await fileNodePromise
      if (widget.parentNode != null) {
        widget.parentNode.removeChild(widget)
      }
      if (fileNode != null) {
        editor.replaceRange(
          `${pos.ch !== 0 ? `\n` : ''}${stringifyFileNode(fileNode)}\n`,
          pos
        )
        const newCursorPos = {
          ch: 0,
          line: pos.ch !== 0 ? pos.line + 2 : pos.line + 1,
        }
        editor.setCursor(newCursorPos)
      }
    },
    []
  )

  const onFiles = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (
        editorRef.current == null ||
        fileUploadHandlerRef.current == null ||
        event.target == null ||
        event.target.files == null ||
        event.target.files.length === 0
      ) {
        return
      }
      event.stopPropagation()
      event.preventDefault()
      const pos = editorRef.current.getCursor()
      const files = event.target.files
      for (let i = 0; i < files.length; i++) {
        await handler(
          fileUploadHandlerRef.current,
          editorRef.current,
          i > 0 ? editorRef.current.getCursor() : pos,
          files[i]
        )
      }
      if (formUploaderRef.current != null) {
        formUploaderRef.current.reset()
      }
    },
    [editorRef, handler, fileUploadHandlerRef]
  )

  const onClick = useCallback(() => {
    if (imageUploaderRef.current == null) {
      return
    }

    imageUploaderRef.current.click()
  }, [])

  return (
    <>
      <EditorToolButton
        path={mdiImagePlus}
        tooltip='Upload Image'
        onClick={onClick}
      />
      <form ref={formUploaderRef}>
        <input
          type='file'
          accept='image/*'
          multiple={true}
          style={{ display: 'none' }}
          ref={imageUploaderRef}
          onChange={onFiles}
        />
      </form>
    </>
  )
}

export default EditorToolbarUpload
