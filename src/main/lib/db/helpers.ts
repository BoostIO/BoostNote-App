import filenamify from 'filenamify'

export function getFolderId (path: string): string {
  return `folder:${path}`
}

export function getNoteId (id: string): string {
  return `note:${id}`
}

export function getParentFolderPath (path: string): string {
  if (path === '/') throw new Error('The given path is root path.')
  const splitted = path.split('/')
  splitted.shift()
  splitted.pop()
  return '/' + splitted.join('/')
}

export function normalizeFolderPath (path: string): string {
  return '/' + path
    .split('/')
    .reduce((sum, element) => {
      const sanitized = filenamify(element, { replacement: '_' })
      if (sanitized.length > 0) {
        sum.push(sanitized)
      }
      return sum
    }, [] as string[])
    .join('/')
}

export function validateFolderPath (path: string): boolean {
  if (path === normalizeFolderPath(path)) return false
  return true
}
