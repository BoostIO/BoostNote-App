import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ContentLayout, {
  ContentLayoutProps,
} from '../shared/components/templates/ContentLayout'
import { useRouter } from '../lib/router'
import { StorageNotesRouteParams, useRouteParams } from '../lib/routeParams'
import { mapTopBarTree } from '../lib/v2/mappers/local/topbarTree'
import { useDb } from '../lib/db'
import { useGeneralStatus } from '../lib/generalStatus'
import { useSearchModal } from '../lib/searchModal'
import { addIpcListener, removeIpcListener } from '../lib/electronOnly'
import SearchModal from './organisms/SearchModal'
import SidebarContainer from './organisms/SidebarContainer'
import ApplicationLayout from '../shared/components/molecules/ApplicationLayout'
import LocalGlobalSearch from './organisms/LocalGlobalSearch'

interface ApplicationProps {
  content: ContentLayoutProps
  className?: string
  hideSidebar?: boolean
}

const Application = ({
  content: { topbar, ...content },
  children,
}: React.PropsWithChildren<ApplicationProps>) => {
  const { storageMap } = useDb()
  const routeParams = useRouteParams() as StorageNotesRouteParams
  const { workspaceId } = routeParams
  const storage = storageMap[workspaceId]

  const { push, goBack, goForward, pathname } = useRouter()
  const { generalStatus, setGeneralStatus } = useGeneralStatus()
  const { noteViewMode, preferredEditingViewMode } = generalStatus
  const { bookmarkNote, unbookmarkNote } = useDb()
  const { showSearchModal } = useSearchModal()
  const [showSearchScreen, setShowSearchScreen] = useState<boolean>()

  const previousPathnameRef = useRef(pathname)
  useEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return
    }
    previousPathnameRef.current = pathname
    return () => {
      setShowSearchScreen(false)
    }
  }, [pathname])

  const note = useMemo(() => {
    if (storage == null) {
      return undefined
    }
    switch (routeParams.name) {
      case 'workspaces.notes': {
        if (routeParams.noteId == null) {
          return undefined
        }
        const note = storage.noteMap[routeParams.noteId]
        if (note == null) {
          return undefined
        }
        if (!note.folderPathname.includes(routeParams.folderPathname)) {
          return undefined
        }
        return note
      }
    }
    return undefined
  }, [
    routeParams.folderPathname,
    routeParams.name,
    routeParams.noteId,
    storage,
  ])

  const noteId = note?._id

  const topbarTree = useMemo(() => {
    if (storage == null) {
      return undefined
    }
    return mapTopBarTree(storage.noteMap, storage.folderMap, storage, push)
  }, [push, storage])

  const bookmark = useCallback(async () => {
    if (noteId == null || storage == null) {
      return
    }
    await bookmarkNote(storage.id, noteId)
  }, [noteId, storage, bookmarkNote])

  const unbookmark = useCallback(async () => {
    if (noteId == null || storage == null) {
      return
    }
    await unbookmarkNote(storage.id, noteId)
  }, [storage, noteId, unbookmarkNote])

  const selectEditMode = useCallback(() => {
    setGeneralStatus({
      noteViewMode: 'edit',
      preferredEditingViewMode: 'edit',
    })
  }, [setGeneralStatus])

  const selectSplitMode = useCallback(() => {
    setGeneralStatus({
      noteViewMode: 'split',
      preferredEditingViewMode: 'split',
    })
  }, [setGeneralStatus])

  const selectPreviewMode = useCallback(() => {
    setGeneralStatus({
      noteViewMode: 'preview',
    })
  }, [setGeneralStatus])

  const togglePreviewMode = useCallback(() => {
    if (noteViewMode === 'preview') {
      if (preferredEditingViewMode === 'edit') {
        selectEditMode()
      } else {
        selectSplitMode()
      }
    } else {
      selectPreviewMode()
    }
  }, [
    noteViewMode,
    preferredEditingViewMode,
    selectEditMode,
    selectSplitMode,
    selectPreviewMode,
  ])

  useEffect(() => {
    addIpcListener('toggle-preview-mode', togglePreviewMode)
    return () => {
      removeIpcListener('toggle-preview-mode', togglePreviewMode)
    }
  }, [togglePreviewMode])

  const toggleSplitEditMode = useCallback(() => {
    if (noteViewMode === 'edit') {
      selectSplitMode()
    } else {
      selectEditMode()
    }
  }, [noteViewMode, selectSplitMode, selectEditMode])

  useEffect(() => {
    addIpcListener('toggle-split-edit-mode', toggleSplitEditMode)
    return () => {
      removeIpcListener('toggle-split-edit-mode', toggleSplitEditMode)
    }
  }, [toggleSplitEditMode])

  const toggleBookmark = useCallback(() => {
    if (note == null) {
      return
    }
    if (note.data.bookmarked) {
      unbookmark()
    } else {
      bookmark()
    }
  }, [note, unbookmark, bookmark])

  useEffect(() => {
    addIpcListener('toggle-bookmark', toggleBookmark)
    return () => {
      removeIpcListener('toggle-bookmark', toggleBookmark)
    }
  })

  return (
    <>
      {storage != null && showSearchModal && <SearchModal storage={storage} />}
      <ApplicationLayout
        sidebar={
          <SidebarContainer
            workspace={storage}
            toggleSearchScreen={() => setShowSearchScreen((prev) => !prev)}
          />
        }
        pageBody={
          showSearchScreen ? (
            <LocalGlobalSearch
              workspace={storage}
              closeSearch={() => setShowSearchScreen(false)}
            />
          ) : (
            <ContentLayout
              {...content}
              topbar={{
                ...topbar,
                tree: topbarTree,
                navigation: {
                  goBack,
                  goForward,
                },
              }}
            >
              {children}
            </ContentLayout>
          )
        }
      />
    </>
  )
}

export default Application
