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
