export function convertFileListToArray(fileList: FileList): File[] {
  const files: File[] = []
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i]
    files.push(file)
  }

  return files
}

export function convertItemListToArray(
  itemList: DataTransferItemList
): DataTransferItem[] {
  const items: DataTransferItem[] = []
  for (let i = 0; i < itemList.length; i++) {
    const item = itemList[i]
    items.push(item)
  }

  return items
}

export function inspectDataTransfer(dataTransfer: DataTransfer) {
  if (process.env.NODE_ENV === 'production') {
    return
  }
  const items = convertItemListToArray(dataTransfer.items).map((item) => {
    return {
      type: item.type,
      kind: item.kind,
      file: item.getAsFile(),
    }
  })
  const files = convertFileListToArray(dataTransfer.files).map((file) => {
    return {
      name: file.name,
      type: file.type,
      path: file.path,
      size: file.size,
      lastModified: file.lastModified,
    }
  })

  console.log({
    items,
    files,
  })
}
