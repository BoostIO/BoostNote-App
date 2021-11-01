import React, {
  useState,
  createContext,
  useContext,
  PropsWithChildren,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { NavContext } from './types'
import {
  SerializedFolder,
  SerializedFolderWithBookmark,
} from '../../../interfaces/db/folder'
import {
  SerializedDoc,
  SerializedDocWithSupplemental,
} from '../../../interfaces/db/doc'
import { usePage } from '../pageStore'
import {
  useDialog,
  DialogIconTypes,
} from '../../../../design/lib/stores/dialog'
import { useRouter } from '../../router'
import {
  createFolder,
  updateFolder,
  destroyFolder,
  CreateFolderRequestBody,
  UpdateFolderRequestBody,
} from '../../../api/teams/folders'
import {
  getFolderURL,
  getTeamURL,
  getDocURL,
  getResourceId,
  getUniqueFolderAndDocIdsFromResourcesIds,
  getDocTitle,
} from '../../utils/patterns'
import { moveResource, getResources } from '../../../api/teams/resources'
import {
  createDoc,
  destroyDoc,
  CreateDocRequestBody,
  updateDoc,
  UpdateDocRequestBody,
  getDoc,
} from '../../../api/teams/docs'
import { NavResource } from '../../../interfaces/resources'
import { SidebarDragState } from '../../dnd'
import {
  SerializedAppEvent,
  ResourcesIdSortedByWorkspaceIds,
} from '../../../interfaces/db/appEvents'
import { SerializedTag } from '../../../interfaces/db/tag'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { getMapFromEntityArray } from '../../utils/array'
import { SerializedTemplate } from '../../../interfaces/db/template'
import { getAllTemplates } from '../../../api/teams/docs/templates'
import { useToast } from '../../../../design/lib/stores/toast'
import { SerializedDashboard } from '../../../interfaces/db/dashboard'
import { SerializedView } from '../../../interfaces/db/view'
export * from './types'

function useNavStore(): NavContext {
  // currently provided
  const {
    team,
    pageWorkspace,
    pageFolder,
    pageDoc,
    workspaces,
    setPartialPageData,
  } = usePage()
  const { messageBox } = useDialog()
  const router = useRouter()
  const { pushMessage } = useToast()

  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const [sideNavCreateButtonState, setSideNavCreateButtonState] = useState<
    string | undefined
  >()
  // setters
  const [currentPath, setCurrentPath] = useState<string>(
    pageFolder != null
      ? pageFolder.pathname
      : pageDoc != null
      ? pageDoc.folderPathname
      : '/'
  )

  useEffect(() => {
    setCurrentPath(
      pageFolder != null
        ? pageFolder.pathname
        : pageDoc != null
        ? pageDoc.folderPathname
        : '/'
    )
  }, [pageFolder, pageDoc])

  const [foldersMap, setFoldersMap] = useState<
    Map<string, SerializedFolderWithBookmark>
  >(new Map())
  const [docsMap, setDocsMap] = useState<
    Map<string, SerializedDocWithSupplemental>
  >(new Map())
  const [dashboardsMap, setDashboardsMap] = useState<
    Map<string, SerializedDashboard>
  >(new Map())
  const [viewsMap, setViewsMap] = useState<Map<number, SerializedView>>(
    new Map()
  )
  const [appEventsMap, setAppEventsMap] = useState<
    Map<string, SerializedAppEvent>
  >(new Map())

  const updateViewsMap = useCallback(
    (...mappedEvents: [number, SerializedView][]) => {
      setViewsMap((prevMap) => {
        return new Map([...prevMap, ...mappedEvents])
      })
    },
    []
  )

  const removeFromViewsMap = useCallback(
    (...ids: number[]) =>
      setViewsMap((prevMap) => {
        const newMap = new Map(prevMap)
        ids.forEach((viewId) => {
          newMap.delete(viewId)
        })
        return newMap
      }),
    []
  )

  const updateAppEventsMap = useCallback(
    (...mappedEvents: [string, SerializedAppEvent][]) => {
      setAppEventsMap((prevMap) => {
        return new Map([...prevMap, ...mappedEvents])
      })
    },
    []
  )

  const updateDashboardsMap = useCallback(
    (...mappedTags: [string, SerializedDashboard][]) =>
      setDashboardsMap((prevMap) => {
        return new Map([...prevMap, ...mappedTags])
      }),
    []
  )

  const removeFromDashboardsMap = useCallback(
    (...ids: string[]) =>
      setDashboardsMap((prevMap) => {
        const newMap = new Map(prevMap)
        ids.forEach((workspaceId) => {
          newMap.delete(workspaceId)
        })
        return newMap
      }),
    []
  )

  const [workspacesMap, setWorkspacesMap] = useState<
    Map<string, SerializedWorkspace>
  >(new Map())
  const updateWorkspacesMap = useCallback(
    (...mappedWorkspaces: [string, SerializedWorkspace][]) =>
      setWorkspacesMap((prevMap) => {
        return new Map([...prevMap, ...mappedWorkspaces])
      }),
    []
  )
  const removeFromWorkspacesMap = useCallback(
    (...ids: string[]) =>
      setWorkspacesMap((prevMap) => {
        const newMap = new Map(prevMap)
        ids.forEach((workspaceId) => {
          newMap.delete(workspaceId)
        })
        return newMap
      }),
    []
  )

  const [tagsMap, setTagsMap] = useState<Map<string, SerializedTag>>(new Map())
  const updateTagsMap = useCallback(
    (...mappedTags: [string, SerializedTag][]) =>
      setTagsMap((prevMap) => {
        return new Map([...prevMap, ...mappedTags])
      }),
    []
  )

  const removeFromTagsMap = useCallback(
    (...ids: string[]) =>
      setTagsMap((prevMap) => {
        const newMap = new Map(prevMap)
        ids.forEach((tagId) => {
          newMap.delete(tagId)
        })
        return newMap
      }),
    []
  )

  const [templatesMap, setTemplatesMap] = useState<
    Map<string, SerializedTemplate>
  >(new Map())

  const updateTemplatesMap = useCallback(
    (...mappedTemplates: [string, SerializedTemplate][]) =>
      setTemplatesMap((prevMap) => {
        return new Map([...prevMap, ...mappedTemplates])
      }),
    []
  )

  const removeFromTemplatesMap = useCallback(
    (...ids: string[]) =>
      setTemplatesMap((prevMap) => {
        const newMap = new Map(prevMap)
        ids.forEach((tagId) => {
          newMap.delete(tagId)
        })
        return newMap
      }),
    []
  )

  const prevTeamId = useRef<string>()

  const getAllResourcesAbortController = useRef<AbortController | null>(null)

  useEffect(() => {
    const getAllResources = async () => {
      if (team == null) {
        setFoldersMap(new Map())
        setDocsMap(new Map())
        setTagsMap(new Map())
        setWorkspacesMap(new Map())
        return
      }
      if (team.id !== prevTeamId.current) {
        if (prevTeamId.current != null) {
          setFoldersMap(new Map())
          setDocsMap(new Map())
          setTagsMap(new Map())
          setWorkspacesMap(new Map())
          setTemplatesMap(new Map())
          setViewsMap(new Map())
        }

        setInitialLoadDone(false)
        prevTeamId.current = team.id

        const abortController = new AbortController()
        if (getAllResourcesAbortController.current != null) {
          getAllResourcesAbortController.current.abort()
        }
        getAllResourcesAbortController.current = abortController

        const [
          {
            folders,
            docs,
            tags = [],
            workspaces = [],
            dashboards = [],
            appEvents = [],
          },
          { templates = [] },
        ] = await Promise.all([
          getResources(team.id, undefined, abortController.signal),
          getAllTemplates(team.id, abortController.signal),
        ])

        getAllResourcesAbortController.current = null

        if (abortController.signal.aborted) {
          return
        }

        const maps = getTagsFoldersDocsMapsFromProps({
          folders,
          docs,
          tags,
          workspaces,
          templates,
          dashboards,
          appEvents,
        })
        setFoldersMap(maps.foldersData)
        setDocsMap(maps.docsData)
        setTagsMap(maps.tagsData)
        setWorkspacesMap(maps.workspacesData)
        setTemplatesMap(maps.templatesData)
        setDashboardsMap(maps.dashboardsData)
        setAppEventsMap(maps.appEventsData)
        setInitialLoadDone(true)
      }
    }
    getAllResources()
  }, [team])

  const currentPublicWorkspace = useMemo(() => {
    if (team == null) {
      return null
    }
    return [...workspacesMap.values()].find(
      (w) => w.public && w.teamId === team.id
    )
  }, [workspacesMap, team])

  const removeFromFoldersMap = useCallback(
    (...ids: string[]) =>
      setFoldersMap((prevMap) => {
        const newMap = new Map(prevMap)
        ids.forEach((folderId) => {
          newMap.delete(folderId)
        })
        return newMap
      }),
    []
  )

  const updateFoldersMap = useCallback(
    (...mappedFolders: [string, SerializedFolderWithBookmark][]) =>
      setFoldersMap((prevMap) => {
        return new Map([...prevMap, ...mappedFolders])
      }),
    []
  )

  const updateParentFolderOfDoc = useCallback(
    (doc: SerializedDocWithSupplemental) =>
      setFoldersMap((prevMap) => {
        const parentFolder = doc.parentFolder!
        const existingParentFolder = prevMap.get(parentFolder.id)
        const existingChildDocsIds =
          existingParentFolder != null ? existingParentFolder.childDocsIds : []
        const bookmarked =
          existingParentFolder != null ? existingParentFolder.bookmarked : false
        const newFolder: SerializedFolderWithBookmark = {
          ...existingParentFolder,
          ...parentFolder,
          bookmarked,
          childDocsIds: [...existingChildDocsIds, doc.id],
        }

        return new Map([...prevMap, [parentFolder.id, newFolder]])
      }),
    []
  )

  const removeFromDocsMap = useCallback(
    (...ids: string[]) =>
      setDocsMap((prevMap) => {
        const newMap = new Map(prevMap)
        ids.forEach((docId) => {
          newMap.delete(docId)
        })
        return newMap
      }),
    []
  )

  const updateDocsMap = useCallback(
    (...mappedDocs: [string, SerializedDocWithSupplemental][]) =>
      setDocsMap((prevMap) => {
        const newMap = new Map([...prevMap])

        for (const [id, doc] of mappedDocs) {
          const existingDoc = newMap.get(id)
          if (existingDoc == null) {
            newMap.set(id, doc)
            continue
          }
          newMap.set(id, {
            ...existingDoc,
            ...doc,
            head: doc.head == null ? existingDoc.head : doc.head,
          })
        }

        return new Map([...prevMap, ...mappedDocs])
      }),
    []
  )

  const createFolderHandler = useCallback(
    async (body: CreateFolderRequestBody) => {
      if (team == null) {
        return
      }
      const { folder } = await createFolder(team, body)
      updateFoldersMap([
        folder.id,
        {
          ...folder,
          childDocsIds: [],
          childFoldersIds: [],
        },
      ])
      router.push(`${getTeamURL(team)}${getFolderURL(folder)}`)
    },
    [team, router, updateFoldersMap]
  )

  const updateFolderHandler = useCallback(
    async (
      target: SerializedFolder | SerializedFolderWithBookmark,
      body: UpdateFolderRequestBody
    ) => {
      if (team == null) {
        return
      }
      const { folders, docs, workspaces } = await updateFolder(
        team,
        target.id,
        body
      )

      const changedFolders = getMapFromEntityArray(folders)
      updateFoldersMap(...changedFolders)

      const changedDocs = getMapFromEntityArray(docs)
      updateDocsMap(...changedDocs)

      if (workspaces != null) {
        updateWorkspacesMap(...getMapFromEntityArray(workspaces))
      }

      if (pageFolder != null && changedFolders.get(pageFolder.id) != null) {
        setPartialPageData({ pageFolder: changedFolders.get(pageFolder.id)! })
        setCurrentPath(changedFolders.get(pageFolder.id)!.pathname)
      }

      if (pageDoc != null && changedDocs.get(pageDoc.id) != null) {
        setPartialPageData({ pageDoc: changedDocs.get(pageDoc.id)! })
        setCurrentPath(changedDocs.get(pageDoc.id)!.folderPathname)
      }
    },
    [
      team,
      updateFoldersMap,
      pageDoc,
      pageFolder,
      updateDocsMap,
      updateWorkspacesMap,
      setPartialPageData,
    ]
  )

  const pendingLoads = useRef<
    Map<string, Promise<SerializedDocWithSupplemental>>
  >(new Map())
  const loadedDocs = useRef<Set<string>>(new Set())
  const loadDoc = useCallback(
    async (id: string, team: string, reload = false) => {
      const loadedDoc = docsMap.get(id)
      if (
        loadedDoc != null &&
        (loadedDoc.head != null || loadedDocs.current.has(id)) &&
        !reload
      ) {
        return loadedDoc
      }

      if (pendingLoads.current.has(id)) {
        return pendingLoads.current.get(id)
      }

      try {
        const promise = getDoc(id, team).then((data) => data.doc)
        pendingLoads.current.set(id, promise)
        const doc = await promise
        updateDocsMap([doc.id, doc])
        return doc
      } finally {
        loadedDocs.current.add(id)
        pendingLoads.current.delete(id)
      }
    },
    [updateDocsMap, docsMap]
  )

  const updateDocHandler = useCallback(
    async (
      target: SerializedDoc | SerializedDocWithSupplemental,
      body: UpdateDocRequestBody
    ) => {
      if (team == null) {
        return
      }
      const { folders, doc, workspaces } = await updateDoc(
        team.id,
        target.id,
        body
      )

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
    [
      team,
      updateFoldersMap,
      pageDoc,
      updateDocsMap,
      updateWorkspacesMap,
      setPartialPageData,
    ]
  )

  const deleteFolderHandler = useCallback(
    async (target: SerializedFolder | SerializedFolderWithBookmark) => {
      if (team == null) {
        return
      }
      messageBox({
        title: `Delete ${target.pathname}`,
        message: `Are you sure to remove this folder and delete completely its notes`,
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'secondary',
            label: 'Cancel',
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: 'Delete',
            onClick: async () => {
              try {
                const {
                  parentFolder,
                  workspace,
                  docs,
                  docsIds,
                  foldersIds,
                } = await destroyFolder(team, target)

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
                    } as SerializedFolderWithBookmark,
                  ])
                }

                if (workspace != null) {
                  updateWorkspacesMap([workspace.id, workspace])
                }
              } catch (error) {
                pushMessage({
                  title: 'Error',
                  description: 'Could not delete this folder',
                })
              }
            },
          },
        ],
      })
    },
    [
      messageBox,
      team,
      updateFoldersMap,
      removeFromFoldersMap,
      pushMessage,
      updateDocsMap,
      updateWorkspacesMap,
      removeFromDocsMap,
    ]
  )

  const createDocHandler = useCallback(
    async (body: CreateDocRequestBody) => {
      if (team == null) {
        return
      }
      const { doc } = await createDoc(team, body)
      updateDocsMap([doc.id, doc])

      router.push(
        {
          pathname: `${getTeamURL(team)}${getDocURL(doc)}`,
        },
        { new: true }
      )

      return
    },
    [team, updateDocsMap, router]
  )

  const deleteDocHandler = useCallback(
    async (target: SerializedDoc) => {
      if (team == null) {
        return
      }

      const message = `Are you sure to remove for good this content?`

      messageBox({
        title: `Delete ${getDocTitle(target, 'this document')}?`,
        message,
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'secondary',
            label: 'Cancel',
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: 'Delete',
            onClick: async () => {
              try {
                const { doc, parentFolder, workspace } = await destroyDoc(
                  team,
                  target
                )
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
              } catch (error) {
                pushMessage({
                  title: 'Error',
                  description: 'Could not delete this doc',
                })
              }
            },
          },
        ],
      })
    },
    [
      team,
      updateDocsMap,
      removeFromDocsMap,
      pushMessage,
      messageBox,
      updateFoldersMap,
      updateWorkspacesMap,
    ]
  )

  const moveResourceHandler = useCallback(
    async (
      draggedResource: NavResource,
      targetedResource: NavResource,
      targetedPosition: SidebarDragState
    ) => {
      if (team == null || targetedPosition == null) {
        return
      }

      if (
        draggedResource.type === targetedResource.type &&
        draggedResource.resource.id === targetedResource.resource.id
      ) {
        return
      }

      try {
        const originalResourceId = getResourceId(draggedResource)
        const pos = targetedPosition
        const { folders, docs, workspaces } = await moveResource(
          team,
          originalResourceId,
          {
            targetedPosition: pos,
            targetedResourceId: getResourceId(targetedResource),
          }
        )

        const changedFolders = getMapFromEntityArray(folders)
        updateFoldersMap(...changedFolders)

        const changedDocs = getMapFromEntityArray(docs)
        updateDocsMap(...changedDocs)

        if (workspaces != null) {
          updateWorkspacesMap(...getMapFromEntityArray(workspaces))
        }

        if (pageFolder != null && changedFolders.get(pageFolder.id) != null) {
          setCurrentPath(changedFolders.get(pageFolder.id)!.pathname)
        }

        if (pageDoc != null && changedDocs.get(pageDoc.id) != null) {
          setCurrentPath(changedDocs.get(pageDoc.id)!.folderPathname)
        }
      } catch (error) {
        const { data, statusText } = error.response
        pushMessage({
          title: statusText,
          description: data.message,
        })
      }
    },
    [
      team,
      pushMessage,
      updateFoldersMap,
      updateDocsMap,
      updateWorkspacesMap,
      setCurrentPath,
      pageFolder,
      pageDoc,
    ]
  )

  const eventSourceResourceUpdateHandler = useCallback(
    async (event: SerializedAppEvent) => {
      try {
        if (event.teamId == null) {
          return
        }
        const resourcesIds = new Set<string>()
        const workspacesIds = new Set<string>()

        if (event.data != null) {
          if (event.data['resource'] != null) {
            resourcesIds.add(event.data['resource'])
          }
          if (event.data['workspaceId'] != null) {
            workspacesIds.add(event.data['workspaceId'])
          }
          if (event.data['resources'] != null) {
            const data = event.data[
              'resources'
            ] as ResourcesIdSortedByWorkspaceIds
            const idSet = new Set<string>()
            Object.keys(data).forEach((workspaceId) => {
              workspacesIds.add(workspaceId)
              ;(data[workspaceId] || []).forEach((resourceId) => {
                idSet.add(resourceId)
              })
            })
            Array.from(idSet).forEach((id) => resourcesIds.add(id))
          }
        }

        const { docs, folders, workspaces } = await getResources(event.teamId, {
          resourcesIds: Array.from(resourcesIds),
          workspacesIds: Array.from(workspacesIds),
          minimal: true,
        })
        /** -- update -- **/
        const changedWorkspaces = getMapFromEntityArray(workspaces)
        updateWorkspacesMap(...changedWorkspaces)
        workspacesIds.forEach((id) => {
          if (!changedWorkspaces.has(id)) {
            removeFromWorkspacesMap(id)
          }
        })
        const changedFolders = getMapFromEntityArray(folders)
        updateFoldersMap(...changedFolders)
        const changedDocs = getMapFromEntityArray(docs)
        updateDocsMap(...changedDocs)
        /** check removals **/
        const {
          uniqueFoldersIds,
          uniqueDocsIds,
        } = getUniqueFolderAndDocIdsFromResourcesIds(Array.from(resourcesIds))
        uniqueFoldersIds.forEach((folderId) => {
          if (!changedFolders.has(folderId)) {
            removeFromFoldersMap(folderId)
          }
        })
        uniqueDocsIds.forEach((docId) => {
          if (!changedDocs.has(docId)) {
            removeFromDocsMap(docId)
          }
        })
      } catch (error) {
        pushMessage({
          title: 'Error',
          description: error.message,
        })
      }
    },
    [
      pushMessage,
      updateDocsMap,
      removeFromDocsMap,
      updateFoldersMap,
      updateWorkspacesMap,
      removeFromFoldersMap,
      removeFromWorkspacesMap,
    ]
  )

  useEffect(() => {
    if (workspaces != null) {
      setWorkspacesMap((prevMap) => {
        return new Map([
          ...prevMap,
          ...getMapFromEntityArray(workspaces as SerializedWorkspace[]),
        ])
      })
    }
  }, [workspaces])

  const currentParentFolderId = useMemo(() => {
    if (pageDoc != null) {
      return pageDoc.parentFolderId
    }

    if (pageFolder != null) {
      return pageFolder.id
    }

    return undefined
  }, [pageDoc, pageFolder])

  const currentWorkspaceId = useMemo(() => {
    if (pageWorkspace != null) {
      return pageWorkspace.id
    }

    if (pageDoc != null) {
      return pageDoc.workspaceId
    }

    if (pageFolder != null) {
      return pageFolder.workspaceId
    }

    if (currentPublicWorkspace != null) {
      return currentPublicWorkspace.id
    }

    return undefined
  }, [pageDoc, pageFolder, pageWorkspace, currentPublicWorkspace])

  const currentParentFolder = useMemo(() => {
    if (currentParentFolderId == null) {
      return undefined
    }
    return foldersMap.get(currentParentFolderId)
  }, [currentParentFolderId, foldersMap])

  return {
    initialLoadDone,
    sideNavCreateButtonState,
    setSideNavCreateButtonState,
    updateParentFolderOfDoc,
    currentPath,
    setCurrentPath,
    currentWorkspaceId,
    currentParentFolderId,
    currentParentFolder,
    foldersMap,
    updateFoldersMap,
    removeFromFoldersMap,
    loadDoc,
    docsMap,
    updateDocsMap,
    removeFromDocsMap,
    dashboardsMap: dashboardsMap,
    appEventsMap,
    updateAppEventsMap,
    updateDashboardsMap: updateDashboardsMap,
    removeFromDashboardsMap: removeFromDashboardsMap,
    createFolderHandler,
    updateFolderHandler,
    createDocHandler,
    deleteFolderHandler,
    deleteDocHandler,
    moveResourceHandler,
    eventSourceResourceUpdateHandler,
    tagsMap,
    updateTagsMap,
    removeFromTagsMap,
    workspacesMap,
    updateWorkspacesMap,
    removeFromWorkspacesMap,
    templatesMap,
    setTemplatesMap,
    updateTemplatesMap,
    removeFromTemplatesMap,
    updateDocHandler,
    viewsMap,
    updateViewsMap,
    removeFromViewsMap,
  }
}

function createNavStoreContext(
  storeCreator: () => NavContext,
  storeName?: string
) {
  const navContext = createContext<null | any>(null)

  const StoreProvider = ({ children }: PropsWithChildren<{}>) => {
    return (
      <navContext.Provider value={storeCreator()}>
        {children}
      </navContext.Provider>
    )
  }

  function useStore() {
    const store = useContext(navContext)
    if (store == null) {
      throw new Error(`You have forgotten to use ${storeName} provider.`)
    }
    return store as NavContext
  }

  return {
    StoreProvider,
    useStore,
  }
}

export const {
  StoreProvider: NavProvider,
  useStore: useNav,
} = createNavStoreContext(useNavStore, 'nav')

interface CreateMapsFromPagePropsProps {
  foldersData: Map<string, SerializedFolderWithBookmark>
  docsData: Map<string, SerializedDocWithSupplemental>
  tagsData: Map<string, SerializedTag>
  workspacesData: Map<string, SerializedWorkspace>
  templatesData: Map<string, SerializedTemplate>
  dashboardsData: Map<string, SerializedDashboard>
  appEventsData: Map<string, SerializedAppEvent>
}

function getTagsFoldersDocsMapsFromProps(
  pageProps: any
): CreateMapsFromPagePropsProps {
  if (pageProps == null || typeof pageProps !== 'object') {
    return {
      foldersData: new Map(),
      docsData: new Map(),
      tagsData: new Map(),
      workspacesData: new Map(),
      templatesData: new Map(),
      dashboardsData: new Map(),
      appEventsData: new Map(),
    }
  }

  const {
    folders = [],
    docs = [],
    tags = [],
    workspaces = [],
    templates = [],
    dashboards = [],
    appEvents = [],
  } = pageProps

  const foldersData = getMapFromEntityArray(
    folders as SerializedFolderWithBookmark[]
  )
  const docsData = getMapFromEntityArray(
    docs as SerializedDocWithSupplemental[]
  )
  const tagsData = getMapFromEntityArray(tags as SerializedTag[])
  const workspacesData = getMapFromEntityArray(
    workspaces as SerializedWorkspace[]
  )
  const templatesData = getMapFromEntityArray(templates as SerializedTemplate[])
  const dashboardsData = getMapFromEntityArray(
    dashboards as SerializedDashboard[]
  )
  const appEventsData = getMapFromEntityArray(appEvents as SerializedAppEvent[])

  return {
    foldersData,
    docsData,
    tagsData,
    workspacesData,
    templatesData,
    dashboardsData,
    appEventsData,
  }
}
