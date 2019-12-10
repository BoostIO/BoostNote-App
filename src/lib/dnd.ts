import { NoteDoc } from './db/types'

const noteFormat = 'application/x-boost-note-json'

export interface TransferrableNoteData {
  storageId: string
  note: NoteDoc
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
  storageId: string,
  note: NoteDoc
) {
  if (event.dataTransfer == null) {
    return
  }
  event.dataTransfer.setData(
    noteFormat,
    JSON.stringify({
      storageId,
      note
    })
  )
}

export function getFileList(event: React.DragEvent): File[] {
  if (event.dataTransfer == null) return []

  const files: File[] = []
  for (let i = 0; i < event.dataTransfer!.files.length; i++) {
    const file = event.dataTransfer!.files[i]
    files.push(file)
  }

  return files
}
