export function getFolderItemId(storageId: string, folderPathname: string) {
  return `storage:${storageId}/folder:${folderPathname}`
}
