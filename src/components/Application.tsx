import React, { useCallback, useEffect } from 'react'
import ContentLayout, {
  ContentLayoutProps,
} from '../design/components/templates/ContentLayout'
import { useRouter } from '../lib/router'
import { LocalSpaceRouteParams, useRouteParams } from '../lib/routeParams'
import { useDb } from '../lib/db'
import { useGeneralStatus } from '../lib/generalStatus'
import { addIpcListener, removeIpcListener } from '../lib/electronOnly'
import SidebarContainer from './organisms/SidebarContainer'
import ApplicationLayout from '../design/components/molecules/ApplicationLayout'

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
