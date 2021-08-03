import React, { useCallback, useEffect, useMemo } from 'react'
import ContentLayout, {
  ContentLayoutProps,
} from '../shared/components/templates/ContentLayout'
import { useRouter } from '../lib/router'
import { LocalSpaceRouteParams, useRouteParams } from '../lib/routeParams'
import { useDb } from '../lib/db'
import { useGeneralStatus } from '../lib/generalStatus'
import { addIpcListener, removeIpcListener } from '../lib/electronOnly'
import SidebarContainer from './organisms/SidebarContainer'
import ApplicationLayout from '../shared/components/molecules/ApplicationLayout'
import { NoteDoc } from '../lib/db/types'

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
  const routeParams = useRouteParams() as LocalSpaceRouteParams
  const { workspaceId } = routeParams
  const storage = storageMap[workspaceId]

  const { goBack, goForward } = useRouter()
  const { generalStatus, setGeneralStatus } = useGeneralStatus()
  const { noteViewMode, preferredEditingViewMode } = generalStatus
  const { bookmarkNote, unbookmarkNote } = useDb()

  const note = useMemo<NoteDoc | undefined>(() => {
    return undefined
  }, [])

  const noteId = note?._id

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
    <ApplicationLayout
      sidebar={<SidebarContainer workspace={storage} />}
      pageBody={
        <ContentLayout
          {...content}
          topbar={{
            ...topbar,
            navigation: {
              goBack,
              goForward,
            },
          }}
        >
          {children}
        </ContentLayout>
      }
    />
  )
}

export default Application
