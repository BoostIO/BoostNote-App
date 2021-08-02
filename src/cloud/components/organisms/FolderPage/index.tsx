import React, { useMemo, useEffect } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import { useNav } from '../../../lib/stores/nav'
import { useTitle } from 'react-use'
import {
  useGlobalKeyDownHandler,
  preventKeyboardEventPropagation,
} from '../../../lib/keyboard'
import {
  isFolderBookmarkShortcut,
  isFolderDeleteShortcut,
  isFolderEditShortcut,
} from '../../../lib/shortcuts'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import {
  mdiStarOutline,
  mdiStar,
  mdiDotsHorizontal,
  mdiPlus,
  mdiTextBoxPlus,
  mdiFolderPlusOutline,
} from '@mdi/js'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import ContentManager from '../../molecules/ContentManager'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import Application from '../../Application'
import ErrorLayout from '../../../../shared/components/templates/ErrorLayout'
import { useRouter } from '../../../lib/router'
import { LoadingButton } from '../../../../shared/components/atoms/Button'
import FolderContextMenu from './NewFolderContextMenu'
import { useCloudResourceModals } from '../../../lib/hooks/useCloudResourceModals'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { mapTopbarBreadcrumbs } from '../../../lib/mappers/topbarBreadcrumbs'
import { useI18n } from '../../../lib/hooks/useI18n'
import InviteCTAButton from '../../molecules/InviteCTAButton'
import { useModal } from '../../../../shared/lib/stores/modal'
import MetadataContainer from '../../../../shared/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../shared/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { lngKeys } from '../../../lib/i18n/types'
import { TopbarControlProps } from '../../../../shared/components/organisms/Topbar'

const FolderPage = () => {
  const { pageFolder, team, currentUserIsCoreMember } = usePage()
  const {
    docsMap,
    foldersMap,
    setCurrentPath,
    workspacesMap,
    currentWorkspaceId,
  } = useNav()
  const { toggleFolderBookmark, sendingMap } = useCloudApi()
  const { push } = useRouter()
  const {
    openRenameDocForm,
    openRenameFolderForm,
    openNewFolderForm,
    openNewDocForm,
    deleteFolder,
    openWorkspaceEditForm,
    deleteDoc,
    deleteWorkspace,
  } = useCloudResourceModals()
  const { translate } = useI18n()
  const { openContextModal } = useModal()

  const currentFolder = useMemo(() => {
    if (pageFolder == null) {
      return
    }

    return foldersMap.get(pageFolder.id)
  }, [foldersMap, pageFolder])

  const topBarBreadcrumbs = useMemo(() => {
    if (team == null) {
      return []
    }

    if (!currentUserIsCoreMember) {
      return mapTopbarBreadcrumbs(
        translate,
        team,
        foldersMap,
        workspacesMap,
        push,
        {
          pageFolder: currentFolder,
        }
      )
    }

    return mapTopbarBreadcrumbs(
      translate,
      team,
      foldersMap,
      workspacesMap,
      push,
      {
        pageFolder: currentFolder,
      },
      openRenameFolderForm,
      openRenameDocForm,
      openNewDocForm,
      openNewFolderForm,
      openWorkspaceEditForm,
      deleteDoc,
      deleteFolder,
      deleteWorkspace
    )
  }, [
    translate,
    currentFolder,
    foldersMap,
    workspacesMap,
    push,
    team,
    openRenameFolderForm,
    openRenameDocForm,
    openNewFolderForm,
    openNewDocForm,
    deleteDoc,
    deleteWorkspace,
    deleteFolder,
    openWorkspaceEditForm,
    currentUserIsCoreMember,
  ])

  const childDocs = useMemo(() => {
    if (currentFolder == null) {
      return []
    }
    return currentFolder.childDocsIds
      .filter((docId) => docsMap.has(docId))
      .map((docId) => docsMap.get(docId) as SerializedDocWithBookmark)
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

    if (currentUserIsCoreMember) {
      controls.push({
        type: 'button',
        variant: 'icon',
        iconPath: mdiPlus,
        onClick: (event) =>
          openContextModal(
            event,
            <MetadataContainer>
              <MetadataContainerRow
                row={{
                  type: 'button',
                  props: {
                    disabled: sendingMap.has(currentFolder.id),
                    id: 'folder-add-doc',
                    label: translate(lngKeys.CreateNewDoc),
                    iconPath: mdiTextBoxPlus,
                    onClick: () =>
                      openNewDocForm({
                        team,
                        parentFolderId: currentFolder.id,
                        workspaceId: currentFolder.workspaceId,
                      }),
                  },
                }}
              />
              <MetadataContainerRow
                row={{
                  type: 'button',
                  props: {
                    disabled: sendingMap.has(currentFolder.id),
                    id: 'folder-add-folder',
                    label: translate(lngKeys.ModalsCreateNewFolder),
                    iconPath: mdiFolderPlusOutline,
                    onClick: () =>
                      openNewFolderForm({
                        team,
                        parentFolderId: currentFolder.id,
                        workspaceId: currentFolder.workspaceId,
                      }),
                  },
                }}
              />
            </MetadataContainer>,
            {
              hideBackground: true,
              removePadding: true,
              width: 200,
              alignment: 'bottom-right',
            }
          ),
      })
    }

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
            width: 200,
            hideBackground: true,
            removePadding: true,
          }
        ),
    })

    return controls
  }, [
    currentFolder,
    currentUserIsCoreMember,
    openContextModal,
    openNewDocForm,
    openNewFolderForm,
    sendingMap,
    translate,
    team,
  ])

  if (team == null) {
    return (
      <Application
        content={{
          reduced: true,
        }}
      >
        <ErrorLayout message={'Team is missing'} />
      </Application>
    )
  }

  if (currentFolder == null) {
    return (
      <Application
        content={{
          reduced: true,
        }}
      >
        <ErrorLayout message={'The folder has been deleted'} />
      </Application>
    )
  }

  return (
    <Application
      content={{
        topbar: {
          breadcrumbs: topBarBreadcrumbs,
          children: (
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
          ),
          controls: topbarControls,
        },
      }}
    >
      <ContentManager
        team={team}
        documents={childDocs}
        folders={childFolders}
        workspacesMap={workspaceMap}
        currentFolderId={currentFolder.id}
        currentWorkspaceId={currentFolder.workspaceId}
        currentUserIsCoreMember={currentUserIsCoreMember}
      />
    </Application>
  )
}

export default FolderPage
