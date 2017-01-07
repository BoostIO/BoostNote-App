export const NOTE_ID_PREFIX = 'note:'
export const FOLDER_ID_PREFIX = 'folder:'
export const TAG_ID_PREFIX = 'tag:'
export const isNoteId = new RegExp(`^${NOTE_ID_PREFIX}.+`)
export const isFolderId = new RegExp(`^${FOLDER_ID_PREFIX}.+`)
export const isTagId = new RegExp(`^${TAG_ID_PREFIX}.+`)

// Views for reducin' & mappin'
export const noteView = {
  _id: '_design/notes',
  views: {
    by_folder: {
      map: `function mapFun(doc) {
        emit(doc.folder);
      }`
    },
    by_tag: {
      map: `function mapFun(doc) {
        if (Array.isArray(doc.tags)) {
          doc.tags.forEach(tag => {
            emit(tag)
          })
        }
      }`
    }
  }
}
