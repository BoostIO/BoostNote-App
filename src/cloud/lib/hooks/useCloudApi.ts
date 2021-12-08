import { useCallback } from 'react'
import shortid from 'shortid'
import {
  createDoc,
  CreateDocRequestBody,
  CreateDocResponseBody,
  destroyDoc,
  DestroyDocResponseBody,
  updateDoc,
  updateDocAssignees,
  updateDocEmoji,
  UpdateDocRequestBody,
  UpdateDocResponseBody,
  updateDocDueDate,
  updateDocTagsInBulk,
  UpdateDocTagsResponseBody,
  UpdateDocPropsResponseBody,
  updateUnsignedDocProps,
} from '../../api/teams/docs'
import {
  createDocBookmark,
  CreateDocBookmarkResponseBody,
  destroyDocBookmark,
  DestroyDocBookmarkResponseBody,
} from '../../api/teams/docs/bookmarks'
import {
  createFolder,
  CreateFolderRequestBody,
  CreateFolderResponseBody,
  destroyFolder,
  DestroyFolderResponseBody,
  updateFolder,
  UpdateFolderEmojiResponseBody,
  UpdateFolderRequestBody,
  UpdateFolderResponseBody,
  updateFolderEmoji,
} from '../../api/teams/folders'
import {
  createFolderBookmark,
  CreateFolderBookmarkResponseBody,
  destroyFolderBookmark,
  DestroyFolderBookmarkResponseBody,
} from '../../api/teams/folders/bookmarks'
import {
  createWorkspace,
  CreateWorkspaceRequestBody,
  CreateWorkspaceResponseBody,
  destroyWorkspace,
  DestroyWorkspaceResponseBody,
} from '../../api/teams/workspaces'
import {
  SerializedDoc,
  SerializedDocWithSupplemental,
} from '../../interfaces/db/doc'
import { SerializedFolder } from '../../interfaces/db/folder'
import { SerializedTeam } from '../../interfaces/db/team'
import { useRouter } from '../router'
import { useNav } from '../stores/nav'
import { usePage } from '../stores/pageStore'
import {
  getDocURL,
  getFolderURL,
  getTeamURL,
  getWorkspaceURL,
} from '../utils/patterns'
import useBulkApi from '../../../design/lib/hooks/useBulkApi'
import { getMapFromEntityArray } from '../../../design/lib/utils/array'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import {
  createSmartView,
  CreateSmartViewRequestBody,
  CreateSmartViewResponseBody,
  deleteSmartView,
  updateSmartView,
  UpdateSmartViewRequestBody,
  UpdateSmartViewResponseBody,
} from '../../api/teams/smartViews'

import { format as formatDate } from 'date-fns'
import {
  DocDataTransferItem,
  FolderDataTransferItem,
} from '../../interfaces/resources'
import { SerializedTag } from '../../interfaces/db/tag'
import {
  deleteTag,
  updateTag,
  UpdateTagRequestBody,
  UpdateTagResponseBody,
} from '../../api/teams/tags'
import { SerializedSmartView } from '../../interfaces/db/smartView'
import {
  createView,
  CreateViewRequestBody,
  CreateViewResponseBody,
  deleteView,
  listViews,
  ListViewsRequestBody,
  ListViewsResponseBody,
  updateView,
  UpdateViewRequestBody,
  UpdateViewResponseBody,
} from '../../api/teams/views'
import { SerializedView } from '../../interfaces/db/view'
import { PropData } from '../../interfaces/db/props'
import {
  listPropertySuggestions,
  ListPropertySuggestionsRequestBody,
  ListPropertySuggestionsResponseBody,
} from '../../api/teams/props'

export function useCloudApi() {
  const { pageDoc, pageFolder, setPartialPageData } = usePage()
  const {
    updateWorkspacesMap,
    updateFoldersMap,
    updateDocsMap,
    updateParentFolderOfDoc,
    updateSmartViewsMap,
    removeFromWorkspacesMap,
    foldersMap,
    docsMap,
    updateTagsMap,
    removeFromDocsMap,
    removeFromFoldersMap,
    setCurrentPath,
    removeFromSmartViewsMap,
    removeFromTagsMap,
    updateViewsMap,
    removeFromViewsMap,
    updateParentWorkspaceOfDoc,
  } = useNav()
  const { push } = useRouter()

  const { sendingMap, send } = useBulkApi()

  const createWorkspaceApi = useCallback(
    async (
      team: SerializedTeam,
      body: CreateWorkspaceRequestBody,
      options?: {
        skipRedirect?: boolean
        afterSuccess?: (workspace: SerializedWorkspace) => void
      }
    ) => {
      await send(shortid.generate(), 'create', {
        api: () => createWorkspace({ id: team.id }, body),
        cb: (res: CreateWorkspaceResponseBody) => {
          updateWorkspacesMap([res.workspace.id, res.workspace])
          if (!options?.skipRedirect) {
            push(
              {
                pathname: `${getTeamURL(team)}${getWorkspaceURL(
                  res.workspace
                )}`,
              },
              { new: true }
            )
          }
          if (options?.afterSuccess != null) {
            options?.afterSuccess(res.workspace)
          }
        },
      })
    },
    [push, send, updateWorkspacesMap]
  )

  const createDocApi = useCallback(
    async (
      team: SerializedTeam,
      body: CreateDocRequestBody,
      options?: {
        skipRedirect?: boolean
        afterSuccess?: (doc: SerializedDoc) => void
      }
    ) => {
      await send(shortid.generate(), 'create', {
        api: () => createDoc({ id: team.id }, body),
        cb: (res: CreateDocResponseBody) => {
          updateDocsMap([res.doc.id, res.doc])
          if (res.doc.parentFolder != null) {
            updateParentFolderOfDoc(res.doc)
          } else if (res.doc.workspace != null) {
            updateParentWorkspaceOfDoc(res.doc)
          }
          if (!options?.skipRedirect) {
            push(
              {
                pathname: `${getTeamURL(team)}${getDocURL(res.doc)}`,
              },
              { new: true }
            )
          }
          if (options?.afterSuccess != null) {
            options?.afterSuccess(res.doc)
          }
        },
      })
    },
    [
      push,
      send,
      updateDocsMap,
      updateParentFolderOfDoc,
      updateParentWorkspaceOfDoc,
    ]
  )

  const createFolderApi = useCallback(
    async (
      team: SerializedTeam,
      body: CreateFolderRequestBody,
      options?: {
        skipRedirect?: boolean
        afterSuccess?: (folder: SerializedFolder) => void
      }
    ) => {
      await send(shortid.generate(), 'create', {
        api: () => createFolder(team, body),
        cb: (res: CreateFolderResponseBody) => {
          updateFoldersMap([
            res.folder.id,
            {
              ...res.folder,
              childDocsIds: [],
              childFoldersIds: [],
            },
          ])

          if (res.folder.parentFolderId != null) {
            const parentFolder =
              res.parentFolder == null
                ? foldersMap.get(res.folder.parentFolderId)
                : res.parentFolder
            if (parentFolder != null) {
              updateFoldersMap([
                parentFolder.id,
                {
                  ...parentFolder,
                  childFoldersIds: [
                    ...parentFolder.childFoldersIds,
                    res.folder.id,
                  ],
                },
              ])
            }
          }
          if (!options?.skipRedirect) {
            push(`${getTeamURL(team)}${getFolderURL(res.folder)}`)
          }
          if (options?.afterSuccess != null) {
            options?.afterSuccess(res.folder)
          }
        },
      })
    },
    [push, send, updateFoldersMap, foldersMap]
  )

  const toggleDocBookmark = useCallback(
    async (teamId: string, docId: string, bookmarked: boolean) => {
      await send(docId, 'bookmark', {
        api: () => {
          if (bookmarked) {
            return destroyDocBookmark(teamId, docId)
          } else {
            return createDocBookmark(teamId, docId)
          }
        },
        cb: (
          res: CreateDocBookmarkResponseBody | DestroyDocBookmarkResponseBody
        ) => {
          updateDocsMap([res.doc.id, res.doc])
          if (pageDoc != null && res.doc.id === pageDoc.id) {
            setPartialPageData({ pageDoc: res.doc })
          }
        },
      })
    },
    [pageDoc, send, setPartialPageData, updateDocsMap]
  )

  const toggleFolderBookmark = useCallback(
    async (teamId: string, id: string, bookmarked: boolean) => {
      await send(id, 'bookmark', {
        api: () => {
          if (bookmarked) {
            return destroyFolderBookmark(teamId, id)
          } else {
            return createFolderBookmark(teamId, id)
          }
        },
        cb: (
          res:
            | CreateFolderBookmarkResponseBody
            | DestroyFolderBookmarkResponseBody
        ) => {
          updateFoldersMap([res.folder.id, res.folder])
          if (pageFolder != null && res.folder.id === pageFolder.id) {
            setPartialPageData({ pageFolder: res.folder })
          }
        },
      })
    },
    [pageFolder, send, setPartialPageData, updateFoldersMap]
  )

  const updateFolderApi = useCallback(
    async (
      target: SerializedFolder | FolderDataTransferItem,
      body: UpdateFolderRequestBody
    ) => {
      await send(target.id, 'update', {
        api: () => updateFolder({ id: target.teamId }, target.id, body),
        cb: ({ folders, docs, workspaces }: UpdateFolderResponseBody) => {
          const changedFolders = getMapFromEntityArray(folders)
          updateFoldersMap(...changedFolders)

          const changedDocs = getMapFromEntityArray(docs)
          updateDocsMap(...changedDocs)

          if (workspaces != null) {
            updateWorkspacesMap(...getMapFromEntityArray(workspaces))
          }

          if (pageFolder != null && changedFolders.get(pageFolder.id) != null) {
            setPartialPageData({
              pageFolder: changedFolders.get(pageFolder.id)!,
            })
            setCurrentPath(changedFolders.get(pageFolder.id)!.pathname)
          }

          if (pageDoc != null && changedDocs.get(pageDoc.id) != null) {
            setPartialPageData({ pageDoc: changedDocs.get(pageDoc.id)! })
            setCurrentPath(changedDocs.get(pageDoc.id)!.folderPathname)
          }
        },
      })
    },
    [
      updateFoldersMap,
      pageDoc,
      pageFolder,
      updateDocsMap,
      updateWorkspacesMap,
      setPartialPageData,
      setCurrentPath,
      send,
    ]
  )

  const updateDocApi = useCallback(
    async (
      target: SerializedDoc | DocDataTransferItem,
      body: UpdateDocRequestBody
    ) => {
      await send(target.id, 'update', {
        api: () => updateDoc(target.teamId, target.id, body),
        cb: ({ folders, doc, workspaces }: UpdateDocResponseBody) => {
          const changedFolders = getMapFromEntityArray(folders)
          updateFoldersMap(...changedFolders)
          updateDocsMap([doc.id, doc])

          if (workspaces != null) {
            updateWorkspacesMap(...getMapFromEntityArray(workspaces))
          }

          if (pageDoc != null && doc.id === pageDoc.id) {
            setPartialPageData({ pageDoc: doc })
            setCurrentPath(doc.folderPathname)
          }
        },
      })
    },
    [
      updateFoldersMap,
      pageDoc,
      updateDocsMap,
      updateWorkspacesMap,
      setPartialPageData,
      setCurrentPath,
      send,
    ]
  )

  const updateDocPropsApi = useCallback(
    async (
      target: SerializedDocWithSupplemental,
      prop: [string, PropData | null]
    ) => {
      return send(target.id, prop[0], {
        api: () => updateUnsignedDocProps(target.id, { [prop[0]]: prop[1] }),
        cb: ({ data }: UpdateDocPropsResponseBody) => {
          const props = Object.assign({}, data)
          const newDoc = {
            ...target,
            props,
          } as SerializedDocWithSupplemental
          updateDocsMap([newDoc.id, newDoc])

          if (pageDoc != null && newDoc.id === pageDoc.id) {
            setPartialPageData({ pageDoc: newDoc })
          }
        },
      })
    },
    [pageDoc, updateDocsMap, setPartialPageData, send]
  )

  const updateBulkDocPropsApi = useCallback(
    async (
      target: SerializedDocWithSupplemental,
      props: [string, PropData | null][]
    ) => {
      return send(target.id, `props`, {
        api: () =>
          updateUnsignedDocProps(
            target.id,
            (props || []).reduce((acc, [propName, propValue]) => {
              acc[propName] = propValue
              return acc
            }, {} as Record<string, PropData | null>)
          ),
        cb: ({ data }: UpdateDocPropsResponseBody) => {
          const props = Object.assign({}, data)
          const newDoc = {
            ...target,
            props,
          } as SerializedDocWithSupplemental
          updateDocsMap([newDoc.id, newDoc])

          if (pageDoc != null && newDoc.id === pageDoc.id) {
            setPartialPageData({ pageDoc: newDoc })
          }
        },
      })
    },
    [pageDoc, updateDocsMap, setPartialPageData, send]
  )

  const updateDocAssigneeApi = useCallback(
    async (target: SerializedDocWithSupplemental, newAssignees: string[]) => {
      await send(target.id, 'assignees', {
        api: () => updateDocAssignees(target.id, newAssignees),
        cb: ({ data }: UpdateDocPropsResponseBody) => {
          const assignees = data.assignees
          const props = Object.assign({}, target.props || {}, { assignees })
          const newDoc = {
            ...target,
            props,
          } as SerializedDocWithSupplemental
          updateDocsMap([newDoc.id, newDoc])

          if (pageDoc != null && newDoc.id === pageDoc.id) {
            setPartialPageData({ pageDoc: newDoc })
          }
        },
      })
    },
    [pageDoc, updateDocsMap, setPartialPageData, send]
  )

  const updateDocDueDateApi = useCallback(
    async (target: SerializedDocWithSupplemental, newDate: Date | null) => {
      await send(target.id, 'duedate', {
        api: () =>
          updateDocDueDate(
            target.id,
            newDate != null
              ? new Date(formatDate(newDate, 'yyyy-MM-dd') + 'T00:00:00.000Z')
              : null
          ),
        cb: ({ data }: UpdateDocPropsResponseBody) => {
          const props = Object.assign({}, target.props || {}, {
            dueDate: data.dueDate,
          })
          const newDoc = {
            ...target,
            props,
          } as SerializedDocWithSupplemental
          updateDocsMap([newDoc.id, newDoc])

          if (pageDoc != null && newDoc.id === pageDoc.id) {
            setPartialPageData({ pageDoc: newDoc })
          }
        },
      })
    },
    [pageDoc, updateDocsMap, setPartialPageData, send]
  )

  const updateDocTagsBulkApi = useCallback(
    async (target: SerializedDoc, newTags: string[]) => {
      await send(target.id, 'tags', {
        api: () => updateDocTagsInBulk(target.teamId, target.id, newTags),
        cb: ({ doc, tags }: UpdateDocTagsResponseBody) => {
          updateDocsMap([doc.id, doc])
          updateTagsMap(...getMapFromEntityArray(tags))
          if (pageDoc != null && doc.id === pageDoc.id) {
            setPartialPageData({ pageDoc: doc })
          }
        },
      })
    },
    [pageDoc, updateDocsMap, setPartialPageData, send, updateTagsMap]
  )

  const deleteTagApi = useCallback(
    async (target: SerializedTag) => {
      await send(target.id, 'delete', {
        api: () => deleteTag(target.teamId, target.id),
        cb: () => {
          removeFromTagsMap(target.id)
          if (
            pageDoc != null &&
            (pageDoc.tags || []).find((tag) => tag.id === target.id)
          ) {
            const doc = Object.assign({}, pageDoc, {
              tags: pageDoc.tags.filter((tag) => tag !== target.id),
            })
            setPartialPageData({ pageDoc: doc })
          }

          const impactedDocs = [...docsMap.values()]
            .filter((doc) =>
              (doc.tags || []).find((tag) => tag.id === target.id)
            )
            .map((doc) => {
              return {
                ...doc,
                tags: doc.tags.filter((tag) => tag.id !== target.id),
              }
            })

          updateDocsMap(...getMapFromEntityArray(impactedDocs))
        },
      })
    },
    [
      pageDoc,
      updateDocsMap,
      setPartialPageData,
      send,
      removeFromTagsMap,
      docsMap,
    ]
  )

  const updateTagApi = useCallback(
    async (target: SerializedTag, body: UpdateTagRequestBody) => {
      await send(target.id, 'update', {
        api: () => updateTag(target.teamId, target.id, body),
        cb: ({ tag: updatedTag }: UpdateTagResponseBody) => {
          updateTagsMap([updatedTag.id, updatedTag])
          if (
            pageDoc != null &&
            (pageDoc.tags || []).find((tag) => tag.id === target.id)
          ) {
            const doc = Object.assign({}, pageDoc)
            doc.tags = (pageDoc.tags || []).reduce((acc, tag) => {
              if (tag.id === target.id) {
                acc.push(updatedTag)
              } else {
                acc.push(tag)
              }
              return acc
            }, [] as SerializedTag[])

            setPartialPageData({ pageDoc: doc })
          }

          const impactedDocs = [...docsMap.values()]
            .filter((doc) =>
              (doc.tags || []).find((tag) => tag.id === target.id)
            )
            .map((doc) => {
              return {
                ...doc,
                tags: (doc.tags || []).reduce((acc, tag) => {
                  if (tag.id === target.id) {
                    acc.push(updatedTag)
                  } else {
                    acc.push(tag)
                  }
                  return acc
                }, [] as SerializedTag[]),
              }
            })

          updateDocsMap(...getMapFromEntityArray(impactedDocs))
        },
      })
    },
    [send, updateTagsMap, pageDoc, docsMap, updateDocsMap, setPartialPageData]
  )

  const updateDocEmojiApi = useCallback(
    async (target: SerializedDoc, emoji?: string) => {
      await send(target.id, 'emoji', {
        api: () => updateDocEmoji(target, emoji),
        cb: ({ doc }: UpdateDocResponseBody) => {
          updateDocsMap([doc.id, doc])

          if (pageDoc != null && doc.id === pageDoc.id) {
            setPartialPageData({ pageDoc: doc })
          }
        },
      })
    },
    [pageDoc, updateDocsMap, setPartialPageData, send]
  )

  const updateFolderEmojiApi = useCallback(
    async (target: SerializedFolder, emoji?: string) => {
      await send(target.id, 'emoji', {
        api: () => updateFolderEmoji(target, emoji),
        cb: ({ folder }: UpdateFolderEmojiResponseBody) => {
          updateFoldersMap([folder.id, folder])

          if (pageFolder != null && folder.id === pageFolder.id) {
            setPartialPageData({ pageFolder: folder })
          }
        },
      })
    },
    [pageFolder, updateFoldersMap, setPartialPageData, send]
  )

  const deleteWorkspaceApi = useCallback(
    async (workspace: { id: string; teamId: string; default: boolean }) => {
      await send(workspace.id, 'delete', {
        api: () =>
          destroyWorkspace({ id: workspace.teamId } as any, workspace, true),
        cb: ({ publicWorkspace }: DestroyWorkspaceResponseBody) => {
          removeFromWorkspacesMap(workspace.id)
          const workspaceDocs = [...docsMap.values()].filter(
            (doc) => doc.workspaceId === workspace.id
          )
          const workspaceFolders = [...foldersMap.values()].filter(
            (folder) => folder.workspaceId === workspace.id
          )

          if (publicWorkspace != null) {
            const changedDocs = workspaceDocs.map((doc) => {
              doc.workspaceId = publicWorkspace.id
              return doc
            })
            updateDocsMap(...getMapFromEntityArray(changedDocs))
            const changedFolders = workspaceFolders.map((folder) => {
              folder.workspaceId = publicWorkspace.id
              return folder
            })
            updateFoldersMap(...getMapFromEntityArray(changedFolders))
            updateWorkspacesMap([publicWorkspace.id, publicWorkspace])
          } else {
            removeFromDocsMap(...workspaceDocs.map((doc) => doc.id))
            removeFromFoldersMap(...workspaceFolders.map((doc) => doc.id))
          }
        },
      })
    },
    [
      send,
      docsMap,
      foldersMap,
      updateDocsMap,
      updateFoldersMap,
      updateWorkspacesMap,
      removeFromDocsMap,
      removeFromFoldersMap,
      removeFromWorkspacesMap,
    ]
  )

  const deleteFolderApi = useCallback(
    async (target: { id: string; pathname: string; teamId: string }) => {
      return send(target.id, 'delete', {
        api: () => destroyFolder({ id: target.teamId }, { id: target.id }),
        cb: ({
          parentFolder,
          workspace,
          docs,
          docsIds,
          foldersIds,
        }: DestroyFolderResponseBody) => {
          foldersIds.forEach((folderId) => {
            removeFromFoldersMap(folderId)
          })

          if (docs == null) {
            docsIds.forEach((docId) => {
              removeFromDocsMap(docId)
            })
          } else {
            updateDocsMap(...getMapFromEntityArray(docs))
          }

          if (parentFolder != null) {
            updateFoldersMap([
              parentFolder.id,
              {
                ...parentFolder,
                childFoldersIds: parentFolder.childFoldersIds.filter(
                  (id) => id !== target.id
                ),
              },
            ])
          }

          if (workspace != null) {
            updateWorkspacesMap([workspace.id, workspace])
          }
        },
      })
    },
    [
      send,
      updateDocsMap,
      updateFoldersMap,
      updateWorkspacesMap,
      removeFromDocsMap,
      removeFromFoldersMap,
    ]
  )

  const deleteDocApi = useCallback(
    async (target: { id: string; teamId: string }) => {
      return send(target.id, 'delete', {
        api: () => destroyDoc({ id: target.teamId }, { id: target.id }),
        cb: ({ doc, parentFolder, workspace }: DestroyDocResponseBody) => {
          removeFromDocsMap(target.id)
          if (parentFolder != null) {
            updateFoldersMap([parentFolder.id, parentFolder])
          }
          if (workspace != null) {
            updateWorkspacesMap([workspace.id, workspace])
          }
          if (doc != null) {
            updateDocsMap([doc.id, doc])
          }
        },
      })
    },
    [
      send,
      updateDocsMap,
      updateFoldersMap,
      updateWorkspacesMap,
      removeFromDocsMap,
    ]
  )

  const createSmartViewApi = useCallback(
    async (
      teamId: string,
      body: CreateSmartViewRequestBody,
      options?: {
        afterSuccess?: (smartView: SerializedSmartView) => void
      }
    ) => {
      return send(shortid.generate(), 'create', {
        api: () =>
          createSmartView({
            ...body,
            teamId: teamId,
          }),
        cb: ({ data: smartViewFolder }: CreateSmartViewResponseBody) => {
          updateSmartViewsMap([smartViewFolder.id, smartViewFolder])

          if (options?.afterSuccess != null) {
            options.afterSuccess(smartViewFolder)
          }
        },
      })
    },
    [updateSmartViewsMap, send]
  )

  const updateSmartViewApi = useCallback(
    async (
      target: SerializedSmartView,
      body: UpdateSmartViewRequestBody,
      options?: {
        afterSuccess?: (smartView: SerializedSmartView) => void
      }
    ) => {
      return send(shortid.generate(), 'update', {
        api: () => updateSmartView(target, body),
        cb: ({ data: smartViewFolder }: UpdateSmartViewResponseBody) => {
          updateSmartViewsMap([smartViewFolder.id, smartViewFolder])

          if (options?.afterSuccess != null) {
            options.afterSuccess(smartViewFolder)
          }
        },
      })
    },
    [updateSmartViewsMap, send]
  )

  const deleteSmartViewApi = useCallback(
    async (target: { id: string; teamId: string }) => {
      return send(target.id, 'delete', {
        api: () => deleteSmartView({ id: target.id }),
        cb: () => {
          removeFromSmartViewsMap(target.id)
        },
      })
    },
    [removeFromSmartViewsMap, send]
  )

  const createViewApi = useCallback(
    async (target: CreateViewRequestBody) => {
      return send('view-api', 'create', {
        api: () => createView(target),
        cb: ({ data }: CreateViewResponseBody) => {
          updateViewsMap([data.id, data])
        },
      })
    },
    [updateViewsMap, send]
  )

  const updateViewApi = useCallback(
    async (target: SerializedView, body: UpdateViewRequestBody) => {
      return send(target.id.toString(), 'update', {
        api: () => updateView(target, body),
        cb: ({ data }: UpdateViewResponseBody) => {
          updateViewsMap([data.id, data])
        },
      })
    },
    [updateViewsMap, send]
  )

  const deleteViewApi = useCallback(
    async (target: SerializedView) => {
      return send(target.id.toString(), 'delete', {
        api: () => deleteView(target.id),
        cb: () => {
          removeFromViewsMap(target.id)
        },
      })
    },
    [removeFromViewsMap, send]
  )

  const listViewsApi = useCallback(
    async (target: ListViewsRequestBody) => {
      return send(
        'smartView' in target
          ? target.smartView
          : 'folder' in target
          ? target.folder
          : target.workspace,
        'list-views',
        {
          api: () => listViews(target),
          cb: ({ data }: ListViewsResponseBody) => {
            updateViewsMap(
              ...data.reduce((acc, val) => {
                acc.set(val.id, val)
                return acc
              }, new Map<number, SerializedView>())
            )
          },
        }
      )
    },
    [updateViewsMap, send]
  )

  const fetchPropertySuggestionsApi = useCallback(
    async (target: ListPropertySuggestionsRequestBody) => {
      return send('properties', 'suggestions', {
        api: () => listPropertySuggestions(target),
        cb: (_body: ListPropertySuggestionsResponseBody) => {
          return
        },
      })
    },
    [send]
  )

  return {
    send,
    sendingMap,
    createWorkspace: createWorkspaceApi,
    createDoc: createDocApi,
    createFolder: createFolderApi,
    toggleDocBookmark,
    toggleFolderBookmark,
    updateFolder: updateFolderApi,
    updateDoc: updateDocApi,
    updateDocEmoji: updateDocEmojiApi,
    updateFolderEmoji: updateFolderEmojiApi,
    deleteWorkspaceApi,
    deleteFolderApi,
    deleteDocApi,
    createSmartViewApi,
    deleteSmartViewApi,
    updateDocAssigneeApi,
    updateDocDueDateApi,
    updateDocTagsBulkApi,
    deleteTagApi,
    updateTagApi,
    createViewApi,
    updateViewApi,
    deleteViewApi,
    updateSmartViewApi,
    listViewsApi,
    updateDocPropsApi,
    updateBulkDocPropsApi,
    fetchPropertySuggestionsApi,
  }
}
