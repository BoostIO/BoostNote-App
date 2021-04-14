import { DragEvent } from 'react'

export enum DraggedTo {
  insideFolder = 0,
  beforeItem = -1,
  afterItem = 1,
}

export type SidebarDragState = undefined | DraggedTo

export const onDragLeaveCb = (
  event: DragEvent<HTMLDivElement>,
  dropzone: React.RefObject<HTMLDivElement>,
  cb: () => void
) => {
  event.preventDefault()
  event.stopPropagation()
  const relatedTarget = event.relatedTarget
  let ignoreCb = false
  if (
    relatedTarget != null &&
    dropzone.current != null &&
    relatedTarget instanceof Node &&
    dropzone.current.isSameNode(relatedTarget)
  ) {
    ignoreCb = true
  }

  if (!ignoreCb) {
    cb()
  }
}
