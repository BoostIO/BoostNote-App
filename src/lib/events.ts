import { ChangeEventHandler } from 'react'

export type SelectChangeEventHandler = ChangeEventHandler<HTMLSelectElement>

const NoteDetailFocusTitleInputEventType = 'NoteDetail:focusTitleInput'

export function dispatchNoteDetailFocusTitleInputEvent() {
  window.dispatchEvent(new CustomEvent(NoteDetailFocusTitleInputEventType))
}

export function listenNoteDetailFocusTitleInputEvent(
  handler: (event: Event) => void
) {
  window.addEventListener(NoteDetailFocusTitleInputEventType, handler)
}

export function unlistenNoteDetailFocusTitleInputEvent(
  handler: (event: Event) => void
) {
  window.removeEventListener(NoteDetailFocusTitleInputEventType, handler)
}
