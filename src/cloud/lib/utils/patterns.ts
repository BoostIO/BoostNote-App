import { join } from 'path'
import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedFolder } from '../../interfaces/db/folder'
import { getHexFromUUID, getUUIDFromHex } from './string'
import slugify from 'slugify'
import { SerializedDoc } from '../../interfaces/db/doc'
import { NavResource } from '../../interfaces/resources'
import { isArray } from 'util'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { SerializedOpenInvite } from '../../interfaces/db/openInvite'

export const prefixFolders = 'fD'
export const prefixDocs = 'dC'
export const prefixWorspaces = 'wP'
export const prefixOpenInvite = 'oI'

export function getDocTitle(doc: SerializedDoc, fallback = '') {
  return doc.head != null && doc.head.title != '' ? doc.head.title : fallback
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
    folder.pathname !== '' ? slugify(folder.name) + '-' : '',
    prefixFolders,
    getHexFromUUID(folder.id),
  ].join('')
}

export function getDocURL(doc: SerializedDoc) {
  const title = doc.head != null ? doc.head.title : ''
  return [
    '/',
    title !== '' ? slugify(title) + '-' : '',
    prefixDocs,
    getHexFromUUID(doc.id),
  ].join('')
}

export function getWorkspaceURL(workspace: SerializedWorkspace) {
  return [
    '/workspaces/',
    workspace.name !== '' ? slugify(workspace.name) + '-' : '',
    prefixWorspaces,
    getHexFromUUID(workspace.id),
  ].join('')
}

export function getOriginalDocId(id: string) {
  return getUUIDFromHex(
    id.startsWith(prefixDocs) ? id.substring(prefixDocs.length) : id
  )
}

export function getFolderId(folder: SerializedFolder) {
  return [prefixFolders, getHexFromUUID(folder.id)].join('')
}

export function getDocId(doc: SerializedDoc) {
  return [prefixDocs, getHexFromUUID(doc.id)].join('')
}

export function getFolderIdFromString(id: string) {
  return [prefixFolders, getHexFromUUID(id)].join('')
}

export function getDocIdFromString(id: string) {
  return [prefixDocs, getHexFromUUID(id)].join('')
}

export function getResourceId(source: NavResource) {
  if (source.type === 'doc') {
    return getDocId(source.result)
  } else {
    return getFolderId(source.result)
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
