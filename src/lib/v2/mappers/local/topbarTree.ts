import { mdiFileDocumentOutline, mdiLock } from '@mdi/js'
import { FolderDoc, NoteDoc, NoteStorage, ObjectMap } from '../../../db/types'
import {
  getFolderNameFromPathname,
  getNoteTitle,
  getParentFolderPathname,
  values,
  getFolderPathname,
  getDocHref,
} from '../../../db/utils'
import { topParentId } from '../../../../cloud/lib/mappers/topbarTree'
import { BreadCrumbTreeItem } from '../../../../shared/lib/mappers/types'

export function mapTopBarTree(
  noteMap: ObjectMap<NoteDoc>,
  foldersMap: ObjectMap<FolderDoc>,
  storage: NoteStorage,
  push: (url: string) => void
) {
  const items = new Map<string, BreadCrumbTreeItem[]>()

  const [notes, folders] = [values(noteMap), values(foldersMap)]
  // todo: maybe implement all file system storages and navigate through them?
  const href = `/app/storage/${storage.id}`
  items.set(topParentId, [
    {
      id: storage.id,
      label: storage.name,
      parentId: topParentId,
      defaultIcon: mdiLock,
      link: {
        href,
        navigateTo: () => push(href),
      },
    },
  ] as BreadCrumbTreeItem[])

  folders.forEach((folder: FolderDoc) => {
    const folderPathname = getFolderPathname(folder._id)
    if (folderPathname == '/') return
    const href = `/app/storages/${storage.id}/${
      folderPathname == '/' ? '' : 'notes' + folderPathname
    }`
    const folderId = folderPathname == '/' ? storage.id : folder._id
    const parentFolderPathname = getParentFolderPathname(folderPathname)
    const parentFolderDoc = storage.folderMap[parentFolderPathname]
    const parentId =
      parentFolderDoc != null && parentFolderDoc.pathname != '/'
        ? parentFolderDoc._id
        : storage.id

    let folderLabel = getFolderNameFromPathname(folderPathname)
    if (folderLabel == null) {
      folderLabel = storage.name
    }
    const parentArray = items.get(parentId) || []
    parentArray.push({
      id: folderId,
      label: folderLabel,
      emoji: undefined,
      parentId: parentId,
      link: {
        href,
        navigateTo: () => push(href),
      },
    })
    items.set(parentId, parentArray)
  })

  notes
    .filter((note) => !note.trashed)
    .forEach((note) => {
      const noteId = note._id
      const href = getDocHref(note, storage.id)
      // const href = `/app/storages/${storage.id}/notes${
      //   note.folderPathname == '/' ? '' : note.folderPathname
      // }/${note._id}`
      const parentFolderDoc = storage.folderMap[note.folderPathname]
      const parentId =
        parentFolderDoc != null
          ? parentFolderDoc.pathname == '/'
            ? storage.id
            : parentFolderDoc._id
          : storage.id

      const parentArray = items.get(parentId) || []
      parentArray.push({
        id: noteId,
        label: getNoteTitle(note, 'Untitled'),
        emoji: undefined,
        defaultIcon: mdiFileDocumentOutline,
        parentId: parentFolderDoc != null ? parentFolderDoc._id : storage.id,
        link: {
          href,
          navigateTo: () => push(href), // todo: push or replace?
        },
      })
      items.set(parentId, parentArray)
    })

  // console.log('Got items', items)
  return items
}
