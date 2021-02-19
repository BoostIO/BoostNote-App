import { DragEvent } from 'react'

export enum DraggedTo {
  insideFolder = 0,
  beforeItem = -1,
  afterItem = 1,
}

export type SidebarDragState = undefined | -1 | 0 | 1

export const onDragLeaveCb = (
  event: DragEvent<HTMLDivElement>,
  dropzone: React.RefObject<HTMLDivElement>,
  cb: () => void
) => {
  event.stopPropagation()
  const relatedTarget = event.relatedTarget
  let targetIsChildElement = false
  if (
    relatedTarget != null &&
    dropzone.current != null &&
    relatedTarget instanceof Node
  ) {
    if (dropzone.current.contains(relatedTarget)) {
      targetIsChildElement = true
    }
  }

  if (!targetIsChildElement) {
    cb()
  }
}
