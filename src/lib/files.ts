export const readAsText = (file: File): Promise<string> => {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload = (e) => res(e.target!.result as string)
    reader.onerror = () => {
      reader.abort()
      rej()
    }
    reader.readAsText(file)
  })
}

export const getFilesFromClipboard = (event: ClipboardEvent) => {
  const files = event.clipboardData!.files
  const images: File[] = []

  if (files instanceof FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const newName = String(file.lastModified)
      const newFile = renameFile(file, newName)
      images.push(newFile)
    }
  }

  return images
}

export const renameFile = (file: File, newName: string) => {
  if (newName.length === 0) return file

  const blob = file.slice(0, file.size, file.type)
  const fileExtension = file.name.split('.').pop()
  const newFileName = `${newName}.${fileExtension}`
  const newFile = new File([blob], newFileName, { type: file.type })

  return newFile
}
