import React from 'react'

interface FileDropProps {
  onDrop: (files: File[]) => any
  onDragOver?: () => any
  children?: React.ReactNode
  style?: React.CSSProperties
}

export default ({ onDrop, onDragOver, children, style }: FileDropProps) => {
  const drop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = getFilesFromDragEvent(e)
    if (files.length === 0) {
      return
    }
    onDrop(files)
  }

  const dragover = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDragOver == null) {
      return
    }
    onDragOver()
  }

  return (
    <div style={style} onDrop={drop} onDragOver={dragover}>
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
