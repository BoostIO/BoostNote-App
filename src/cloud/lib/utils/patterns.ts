import { join } from 'path'
import { SerializedTeam } from '../../interfaces/db/team'
import {
  SerializedFolder,
  SerializedFolderWithBookmark,
} from '../../interfaces/db/folder'
import { getHexFromUUID, getUUIDFromHex } from './string'
import slugify from 'slugify'
import {
  SerializedDoc,
  SerializedDocWithSupplemental,
} from '../../interfaces/db/doc'
import {
  DOC_DRAG_TRANSFER_DATA_JSON,
  DocDataTransferItem,
  FOLDER_DRAG_TRANSFER_DATA_JSON,
  FolderDataTransferItem,
  NavResource,
} from '../../interfaces/resources'
import { isArray } from 'util'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { SerializedOpenInvite } from '../../interfaces/db/openInvite'

export const prefixFolders = 'fD'
export const prefixDocs = 'dC'
export const prefixWorspaces = 'wP'
export const prefixOpenInvite = 'oI'

export function getDocTitle(doc: SerializedDoc, fallback = '') {
  return doc.title != '' ? doc.title : fallback
}

export function getDocContent(doc: SerializedDoc, fallback = '') {
  return doc.head != null ? doc.head.content : fallback
}

export function getTeamURL(team: SerializedTeam) {
  if (team.domain != null && team.domain !== '') {
    return `/${team.domain}`
  }
  return `/${team.id}`
}

export function getOpenInviteURL(invite: SerializedOpenInvite) {
  return `/invite/${invite.slug}`
}

export function getFolderURL(folder: SerializedFolder) {
  return [
    '/',
    folder.pathname !== '' ? slugify(folder.name).replace('.', '') + '-' : '',
    prefixFolders,
    getHexFromUUID(folder.id),
  ].join('')
}

export function getDocURL(doc: SerializedDoc) {
  return [
    '/',
    doc.title !== '' ? slugify(doc.title).replace('.', '') + '-' : '',
    prefixDocs,
    getHexFromUUID(doc.id),
  ].join('')
}

export function getWorkspaceURL(workspace: SerializedWorkspace) {
  return [
    '/workspaces/',
    workspace.name !== '' ? slugify(workspace.name).replace('.', '') + '-' : '',
    prefixWorspaces,
    getHexFromUUID(workspace.id),
  ].join('')
}

export function getOriginalDocId(id: string) {
  return getUUIDFromHex(
    id.startsWith(prefixDocs) ? id.substring(prefixDocs.length) : id
  )
}

export function getFolderId(
  folder: { id: string } & Partial<SerializedFolder>
) {
  return [prefixFolders, getHexFromUUID(folder.id)].join('')
}

export function getDocId(doc: { id: string } & Partial<SerializedDoc>) {
  return [prefixDocs, getHexFromUUID(doc.id)].join('')
}

export function getFolderIdFromString(id: string) {
  return [prefixFolders, getHexFromUUID(id)].join('')
}

export function getDocIdFromString(id: string) {
  return [prefixDocs, getHexFromUUID(id)].join('')
}

export function getDraggedResource(event: any): NavResource | null {
  const docData = event.dataTransfer.getData(DOC_DRAG_TRANSFER_DATA_JSON)
  if (docData.length === 0) {
    const folderData = event.dataTransfer.getData(
      FOLDER_DRAG_TRANSFER_DATA_JSON
    )
    if (folderData.length === 0) {
      return null
    }
    try {
      return {
        type: 'folder',
        resource: JSON.parse(folderData) as FolderDataTransferItem,
      }
    } catch (err) {
      console.warn('Invalid drag data encountered', err)
      return null
    }
  } else {
    try {
      return {
        type: 'doc',
        resource: JSON.parse(docData) as DocDataTransferItem,
      }
    } catch (err) {
      console.warn('Invalid drag data encountered', err)
      return null
    }
  }
}

export function getResourceId(source: NavResource) {
  if (source.type === 'doc') {
    return getDocIdFromString(source.resource.id)
  } else {
    return getFolderIdFromString(source.resource.id)
  }
}

export function folderToDataTransferItem(
  folder: SerializedFolderWithBookmark
): FolderDataTransferItem {
  return {
    workspaceId: folder.workspaceId,
    teamId: folder.teamId,
    id: folder.id,
    emoji: folder.emoji,
    name: folder.name,
    description: folder.description,
    url: getFolderURL(folder),
  }
}

export function docToDataTransferItem(
  doc: SerializedDocWithSupplemental
): DocDataTransferItem {
  return {
    workspaceId: doc.workspaceId,
    teamId: doc.teamId,
    id: doc.id,
    emoji: doc.emoji,
    title: doc.title,
    url: getDocURL(doc),
  }
}

export function isFolderPathnameValid(pathname: string): boolean {
  if (pathname === '/') {
    return false
  }
  if (!pathname.startsWith('/')) {
    return false
  }
  const [, ...folderNames] = pathname.split('/')
  return folderNames.every(isFolderNameValid)
}

export function getParentFolderPathname(pathname: string): string {
  return join(pathname, '..')
}

export function getResourceFromSlug(resourceSlug: string) {
  const resourceData = resourceSlug.split('-').reverse()[0]
  return [resourceData.slice(0, 2), getUUIDFromHex(resourceData.slice(2))]
}

export function getResourceFromPattern(resourcePattern: string) {
  return [resourcePattern.slice(0, 2), getUUIDFromHex(resourcePattern.slice(2))]
}

export function getUniqueFolderAndDocIdsFromResourcesIds(
  resourcePatterns: string[]
) {
  const folderIds = new Set<string>()
  const docsIds = new Set<string>()
  if (
    resourcePatterns != null &&
    isArray(resourcePatterns) &&
    resourcePatterns.length > 0
  ) {
    resourcePatterns.forEach((resourceId) => {
      try {
        const resource = getResourceFromPattern(resourceId)
        if (resource[0] === prefixFolders) {
          folderIds.add(resource[1])
        } else {
          docsIds.add(resource[1])
        }
      } catch (error) {}
    })
  }

  return {
    uniqueFoldersIds: [...folderIds.values()],
    uniqueDocsIds: [...docsIds.values()],
  }
}

export function isFolderNameValid(name: string): boolean {
  if (name.length === 0) {
    return false
  }
  return !/[<>:"\/\\|?*\x00-\x1F]/g.test(name)
}
