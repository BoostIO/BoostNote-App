export function getFolderItemId(storageId: string, folderPathname: string) {
  return `storage:${storageId}/folder:${folderPathname}`
}

export function getTagListItemId(storageId: string) {
  return `storage:${storageId}/tags`
}
