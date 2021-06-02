import { compareDateString } from '../../../../shared/lib/date'
import { mdiFileDocumentOutline } from '@mdi/js'
import { NoteDoc, NoteStorage } from '../../../db/types'
import { getDocHref, getNoteTitle } from '../../../db/utils'

export function mapTimelineItems(
  docs: NoteDoc[],
  push: (url: string) => void,
  storage?: NoteStorage,
  limit = 15
) {
  if (storage == null) {
    return []
  }

  return docs
    .sort((a, b) =>
      compareDateString(
        a.createdAt || a.updatedAt,
        b.createdAt || b.updatedAt,
        'DESC'
      )
    )
    .slice(0, limit)
    .map((doc) => {
      const labelHref = getDocHref(doc, storage.id)
      return {
        id: doc._id,
        label: getNoteTitle(doc, 'Untitled'),
        labelHref,
        labelOnClick: () => push(labelHref),
        // emoji: doc.emoji,
        defaultIcon: mdiFileDocumentOutline,
        lastUpdated: doc.createdAt || doc.updatedAt,
        lastUpdatedBy: [],
      }
    })
}
