import React from 'react'

interface FileDropProps {
  onDrop: (files: File[]) => any
  onDragEnter?: () => any
  onDragLeave?: () => any
  children?: React.ReactNode
  style?: React.CSSProperties
}

export default ({
  onDrop,
  onDragEnter,
  onDragLeave,
  children,
  style
}: FileDropProps) => {
  const drop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = getFilesFromDragEvent(e)
    if (files.length === 0) {
      return
    }
    onDrop(files)
  }

  const dragenter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDragEnter == null) {
      return
    }
    onDragEnter()
  }

  const dragleave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDragLeave == null) {
      return
    }
    onDragLeave()
  }

  return (
    <div
      style={style}
      onDrop={drop}
      onDragEnter={dragenter}
      onDragLeave={dragleave}
      onDragOver={e => e.preventDefault()}
    >
      {children}
    </div>
  )
}

function getFilesFromDragEvent({
  dataTransfer: { items, files }
}: React.DragEvent): File[] {
  if (items != null) {
    const arr = []
    for (let i = 0; i < items.length; i++) {
      const asFile = items[i].getAsFile()
      if (asFile != null) {
        arr.push(asFile)
      }
    }
    return arr
  } else {
    const arr = []
    for (let i = 0; i < files.length; i++) {
      arr.push(files[i])
    }
    return arr
  }
}
