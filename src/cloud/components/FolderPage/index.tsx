import React, { useMemo, useEffect } from 'react'
import { usePage } from '../../lib/stores/pageStore'
import { useNav } from '../../lib/stores/nav'
import { useTitle } from 'react-use'
import {
  useGlobalKeyDownHandler,
  preventKeyboardEventPropagation,
} from '../../lib/keyboard'
import {
  isFolderBookmarkShortcut,
  isFolderDeleteShortcut,
  isFolderEditShortcut,
} from '../../lib/shortcuts'
import { mdiStarOutline, mdiStar, mdiDotsHorizontal } from '@mdi/js'
import { SerializedFolderWithBookmark } from '../../interfaces/db/folder'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { LoadingButton } from '../../../design/components/atoms/Button'
import FolderContextMenu from './NewFolderContextMenu'
import { useCloudResourceModals } from '../../lib/hooks/useCloudResourceModals'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import InviteCTAButton from '../buttons/InviteCTAButton'
import { useModal } from '../../../design/lib/stores/modal'
import { TopbarControlProps } from '../../../design/components/organisms/Topbar'
import FolderPageInviteSection from '../Onboarding/FolderPageInviteSection'
import ApplicationPage from '../ApplicationPage'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import ApplicationTopbar from '../ApplicationTopbar'
import ApplicationContent from '../ApplicationContent'
import { getMapValues } from '../../../design/lib/utils/array'
import { getDefaultListView } from '../../lib/views/list'
import { filterIter } from '../../lib/utils/iterator'
import { ViewsManager } from '../Views'
import ApplicationPageLoader from '../ApplicationPageLoader'
import LoaderFolderPage from '../../../design/components/atoms/loaders/LoaderFolderPage'
import ViewerDisclaimer from '../ViewerDisclaimer'

const FolderPage = () => {
  const { pageFolder, team, currentUserIsCoreMember } = usePage()
  const {
    docsMap,
    foldersMap,
    setCurrentPath,
    workspacesMap,
    currentWorkspaceId,
    viewsMap,
  } = useNav()
  const { toggleFolderBookmark, sendingMap } = useCloudApi()
  const { openRenameFolderForm, deleteFolder } = useCloudResourceModals()
  const { openContextModal } = useModal()

  const currentFolder = useMemo(() => {
    if (pageFolder == null) {
      return
    }

    return foldersMap.get(pageFolder.id) || pageFolder
  }, [foldersMap, pageFolder])

  const childDocs = useMemo(() => {
    if (currentFolder == null) {
      return []
    }

    return filterIter(
      (doc) => doc.parentFolderId === currentFolder.id,
      docsMap.values()
    )
  }, [docsMap, currentFolder])

  const childFolders = useMemo(() => {
    if (currentFolder == null) {
      return []
    }
    return currentFolder.childFoldersIds
      .filter((folderId) => foldersMap.has(folderId))
      .map(
        (folderId) => foldersMap.get(folderId) as SerializedFolderWithBookmark
      )
  }, [foldersMap, currentFolder])

  const pageTitle = useMemo(() => {
    if (currentFolder == null || team == null) {
      return 'BoostHub'
    }

    return `${currentFolder.name} - ${team.name}`
  }, [currentFolder, team])

  useTitle(pageTitle)

  useEffect(() => {
    if (currentFolder == null) {
      setCurrentPath('/')
    } else {
      setCurrentPath(currentFolder.pathname)
    }
  }, [currentFolder, setCurrentPath])

  const folderPageControlsKeyDownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (team == null || pageFolder == null) {
        return
      }

      if (isFolderBookmarkShortcut(event)) {
        preventKeyboardEventPropagation(event)
        toggleFolderBookmark(team.id, pageFolder.id, pageFolder.bookmarked)
        return
      }

      if (!currentUserIsCoreMember) {
        return
      }

      if (isFolderEditShortcut(event)) {
        preventKeyboardEventPropagation(event)
        openRenameFolderForm(pageFolder)
        return
      }
      if (isFolderDeleteShortcut(event)) {
        preventKeyboardEventPropagation(event)
        deleteFolder(pageFolder)
        return
      }
    }
  }, [
    openRenameFolderForm,
    team,
    pageFolder,
    deleteFolder,
    toggleFolderBookmark,
    currentUserIsCoreMember,
  ])
  useGlobalKeyDownHandler(folderPageControlsKeyDownHandler)

  const currentWorkspace = useMemo(() => {
    if (currentWorkspaceId == null) {
      return undefined
    }
    return workspacesMap.get(currentWorkspaceId)
  }, [currentWorkspaceId, workspacesMap])

  const workspaceMap = useMemo(() => {
    const map = new Map<string, SerializedWorkspace>()
    if (currentWorkspace != null) {
      map.set(currentWorkspace.id, currentWorkspace)
    }

    return map
  }, [currentWorkspace])

  const currentViews = useMemo(() => {
    if (currentFolder == null) {
      return []
    }

    const views = getMapValues(viewsMap)

    const filteredViews = views.filter(
      (view) => view.folderId === currentFolder.id
    )
    if (filteredViews.length === 0) {
      return [getDefaultListView({ type: 'folder', target: currentFolder })]
    }

    return filteredViews
  }, [viewsMap, currentFolder])

  const topbarControls = useMemo(() => {
    if (team == null || currentFolder == null) {
      return undefined
    }

    const controls: TopbarControlProps[] = [
      {
        type: 'node',
        element: <InviteCTAButton origin='folder-page' key='invite-cta' />,
      },
    ]

    controls.push({
      type: 'button',
      variant: 'icon',
      iconPath: mdiDotsHorizontal,
      onClick: (event) =>
        openContextModal(
          event,
          <FolderContextMenu
            currentFolder={currentFolder}
            currentUserIsCoreMember={currentUserIsCoreMember}
          />,
          {
            alignment: 'bottom-right',
            removePadding: true,
            hideBackground: true,
          }
        ),
    })

    return controls
  }, [currentFolder, currentUserIsCoreMember, openContextModal, team])

  if (team == null) {
    return <ApplicationPageLoader team={team} loader={<LoaderFolderPage />} />
  }

  if (currentFolder == null) {
    return (
      <ApplicationPage showingTopbarPlaceholder={true}>
        <ApplicationContent reduced={true}>
          <ColoredBlock variant='danger'>
            {'The folder has been deleted'}
          </ColoredBlock>
        </ApplicationContent>
      </ApplicationPage>
    )
  }

  return (
    <ApplicationPage>
      <ApplicationTopbar controls={topbarControls}>
        <LoadingButton
          variant='icon'
          disabled={sendingMap.has(currentFolder.id)}
          spinning={sendingMap.has(currentFolder.id)}
          size='sm'
          iconPath={currentFolder.bookmarked ? mdiStar : mdiStarOutline}
          onClick={() =>
            toggleFolderBookmark(
              currentFolder.teamId,
              currentFolder.id,
              currentFolder.bookmarked
            )
          }
        />
      </ApplicationTopbar>
      <ApplicationContent>
        <FolderPageInviteSection />
        <ViewerDisclaimer resource='folder' />
        <ViewsManager
          parent={{ type: 'folder', target: currentFolder }}
          views={currentViews}
          team={team}
          docs={childDocs}
          folders={childFolders}
          workspacesMap={workspaceMap}
          currentFolderId={currentFolder.id}
          currentWorkspaceId={currentFolder.workspaceId}
          currentUserIsCoreMember={currentUserIsCoreMember}
        />
      </ApplicationContent>
    </ApplicationPage>
  )
}

export default FolderPage
