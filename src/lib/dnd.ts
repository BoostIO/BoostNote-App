import { NoteDoc } from './db/types'
import { convertFileListToArray } from './dom'

const noteFormat = 'application/x-boost-note-json'

export interface TransferrableNoteData {
  workspaceId: string
  doc: NoteDoc
}

export function getTransferrableNoteData(
  event: React.DragEvent | DragEvent
): TransferrableNoteData | null {
  if (event.dataTransfer == null) return null

  const data = event.dataTransfer.getData(noteFormat)
  if (data.length === 0) {
    return null
  }

  return JSON.parse(data)
}

export function setTransferrableNoteData(
  event: React.DragEvent | DragEvent,
  workspaceId: string,
  note: NoteDoc
) {
  if (event.dataTransfer == null) {
    return
  }
  event.dataTransfer.setData(
    noteFormat,
    JSON.stringify({
      workspaceId: workspaceId,
      note,
    })
  )
}

export function getFileList(event: React.DragEvent): File[] {
  if (event.dataTransfer == null) return []

  return convertFileListToArray(event.dataTransfer.files)
}
