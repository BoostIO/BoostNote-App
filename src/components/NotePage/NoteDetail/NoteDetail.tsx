import React, { useState, useRef } from 'react'
// import { useDb } from '../../../lib/db'
// import { useRouter } from '../../../lib/router'
import { NoteDoc } from '../../../lib/db/types'

type NoteDetailProps = {
  storageId: string
  note: NoteDoc
  updateNote: (
    storageId: string,
    noteId: string,
    { content }: { content: string }
  ) => Promise<void>
  removeNote: (storageId: string, noteId: string) => Promise<void>
}

export default ({
  storageId,
  note,
  // updateNote,
  removeNote
}: NoteDetailProps) => {
  // const db = useDb()
  // const router = useRouter()

  const [content, setContent] = useState('')
  const [prevNoteId, setPrevNoteId] = useState('')
  const [prevStorageId, setPrevStorageId] = useState('')
  const contentTextareaRef = useRef(null)

  if (storageId !== prevStorageId || note._id !== prevNoteId) {
    setContent(note.content)
    setPrevNoteId(note._id)
    setPrevStorageId(storageId)
  }

  return (
    <div>
      <div>Note Detail</div>
      {note == null ? (
        <p>No note is selected</p>
      ) : (
        <>
          <div>
            {note._id}{' '}
            <button onClick={() => removeNote(storageId, note._id)}>
              Delete
            </button>
          </div>
          <div>
            <textarea
              ref={contentTextareaRef}
              value={content}
              onChange={() => {}}
            />
          </div>
        </>
      )}
    </div>
  )
}
