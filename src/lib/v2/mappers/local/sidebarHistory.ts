import { SidebarSearchHistory } from '../../../../shared/components/organisms/Sidebar/molecules/SidebarSearch'
import { mdiFileDocumentOutline } from '@mdi/js'
import { FolderDoc, NoteDoc, NoteStorage, ObjectMap } from '../../../db/types'
import {
  getFolderHref,
  getFolderName,
  getDocHref,
  getNoteTitle,
} from '../../../db/utils'

type HistoryItem = { type: 'folder' | 'note'; item: string }

export function mapHistory(
  history: HistoryItem[],
  push: (href: string) => void,
  noteMap: ObjectMap<NoteDoc>,
  foldersMap: ObjectMap<FolderDoc>,
  storage: NoteStorage
) {
  const items = [] as SidebarSearchHistory[]

  history.forEach((historyItem) => {
    if (historyItem.type === 'folder') {
      const folderDoc = foldersMap[historyItem.item]
      if (folderDoc != null) {
        const href = getFolderHref(folderDoc, storage.id)
        items.push({
          // emoji: item.emoji,
          label: getFolderName(folderDoc),
          href,
          onClick: () => push(href),
        })
      }
    } else {
      const noteDoc = noteMap[historyItem.item]
      if (noteDoc != null) {
        const href = getDocHref(noteDoc, storage.id)
        items.push({
          // emoji: noteDoc.emoji,
          defaultIcon: mdiFileDocumentOutline,
          label: getNoteTitle(noteDoc, 'Untitled'),
          href,
          onClick: () => push(href),
        })
      }
    }
  })

  return items
}
