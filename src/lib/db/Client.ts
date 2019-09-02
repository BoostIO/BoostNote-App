import { NoteStorageDocMap, FolderData, FolderDataEditibleProps } from './types'
import {
  getFolderId,
  createUnprocessableEntityError,
  isFolderPathnameValid,
  getParentFolderPathname
} from './utils'

export default class Client {
  public initialized: boolean

  constructor(
    public db: PouchDB.Database,
    public id: string,
    public name: string
  ) {}

  // WIP
  async init() {
    // Check root directory does exist
    await this.upsertFolder('/')
    // Load all docs and classify into maps(noteMap, folderMap, tagMap)
    // const {noteMap, folderMap, tagMap} = await this.getAllDataMap()
    // Check all note(except trashed)
    // - Check folder does exist
    // - Check its parent folder does exist
    // - Check tag does exist
    // Check pathname of all folders
    // Generate missing folders and tags at once.
    // Done.
  }

  async getFolder(path: string): Promise<FolderData | null> {
    let folder: FolderData
    try {
      folder = await this.db.get<FolderData>(getFolderId(path))
    } catch (error) {
      switch (error.name) {
        case 'not_found':
          return null
        default:
          throw error
      }
    }

    return folder
  }

  async upsertFolder(
    pathname: string,
    props?: Partial<FolderDataEditibleProps>
  ): Promise<FolderData> {
    if (!isFolderPathnameValid(pathname)) {
      throw createUnprocessableEntityError(
        `pathname is invalid, got ${pathname}`
      )
    }
    if (pathname !== '/') {
      await this.doesParentFolderExistOrCreate(pathname)
    }
    const folder = await this.getFolder(pathname)
    if (folder != null && props == null) {
      return folder
    }
    const now = new Date().toISOString()
    const folderDocProps = {
      ...(folder || {
        _id: getFolderId(pathname),
        createdAt: now,
        data: {}
      }),
      ...props,
      updatedAt: now
    }
    const { rev } = await this.db.put(folderDocProps)

    return {
      _id: folderDocProps._id,
      createdAt: folderDocProps.createdAt,
      updatedAt: folderDocProps.updatedAt,
      data: folderDocProps.data,
      _rev: rev
    }
  }

  async doesParentFolderExistOrCreate(pathname: string) {
    const parentPathname = getParentFolderPathname(pathname)
    await this.upsertFolder(parentPathname)
  }

  async getAllDataMap(): Promise<NoteStorageDocMap> {
    const map = {
      noteMap: new Map(),
      folderMap: new Map(),
      tagMap: new Map()
    }
    const allDocsResponse = await this.db.allDocs({})

    return allDocsResponse.rows.reduce((map, doc) => {
      doc
      return map
    }, map)
  }

  /**
   * WIP
   *
   * createTag
   * upsertNote
   * findNotesByTag
   * findNotesByPathname
   * removeTag
   * removeFolder
   * trashNotesInFolder
   * restoreNote
   * purgeTrashedNote
   */
}
