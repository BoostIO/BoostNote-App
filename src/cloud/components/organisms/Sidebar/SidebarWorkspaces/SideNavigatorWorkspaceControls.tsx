import React, { useCallback, useMemo } from 'react'
import { SerializedWorkspace } from '../../../../interfaces/db/workspace'
import { SerializedTeam } from '../../../../interfaces/db/team'
import { useModal } from '../../../../lib/stores/modal'
import { useNav } from '../../../../lib/stores/nav'
import { useContextMenu, MenuTypes } from '../../../../lib/stores/contextMenu'
import { useDialog, DialogIconTypes } from '../../../../lib/stores/dialog'
import { useToast } from '../../../../lib/stores/toast'
import { useTranslation } from 'react-i18next'
import { destroyWorkspace } from '../../../../api/teams/workspaces'
import { getMapFromEntityArray } from '../../../../lib/utils/array'
import EditWorkspaceModal from '../../Modal/contents/Workspace/EditWorkspaceModal'
import SideNavigatorIconButton from '../SideNavigator/SideNavigatorIconButton'
import {
  mdiApplicationCog,
  mdiDotsVertical,
  mdiFolderMultiplePlusOutline,
  mdiTextBoxPlusOutline,
  mdiTrashCanOutline,
} from '@mdi/js'
import Flexbox from '../../../atoms/Flexbox'
import Tooltip from '../../../atoms/Tooltip'
import { useGlobalData } from '../../../../lib/stores/globalData'
import { usePage } from '../../../../lib/stores/pageStore'
import IconMdi from '../../../atoms/IconMdi'

interface SideNavigatorWorkspaceControlsProps {
  workspace: SerializedWorkspace
  team: SerializedTeam
  onNewFolderClick: () => void
}

const SideNavigatorWorkspaceControls = ({
  workspace,
  team,
  onNewFolderClick,
}: SideNavigatorWorkspaceControlsProps) => {
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const { permissions } = usePage()
  const { openModal } = useModal()
  const {
    removeFromWorkspacesMap,
    docsMap,
    foldersMap,
    createDocHandler,
    updateWorkspacesMap,
    updateFoldersMap,
    updateDocsMap,
    removeFromDocsMap,
    removeFromFoldersMap,
  } = useNav()
  const { popup } = useContextMenu()
  const { messageBox } = useDialog()
  const {
    pushAxiosErrorMessage,
    pushMessage,
    pushDocHandlerErrorMessage,
  } = useToast()
  const { t } = useTranslation()

  const createChildDoc = useCallback(async () => {
    try {
      await createDocHandler({ workspaceId: workspace.id })
    } catch (error) {
      pushDocHandlerErrorMessage(error)
    }
  }, [workspace.id, createDocHandler, pushDocHandlerErrorMessage])

  const onDeleteCallback = useCallback(
    (workspace: SerializedWorkspace) => {
      if (workspace.default) {
        return
      }
      messageBox({
        title: `Delete the workspace?`,
        message: `Are you sure to delete this workspace? You will not be able to revert this action.`,
        iconType: DialogIconTypes.Warning,
        buttons: ['Destroy All', t('general.cancel')],
        defaultButtonIndex: 0,
        cancelButtonIndex: 1,
        onClose: async (value: number | null) => {
          switch (value) {
            case 0:
              const destroyContent = value === 0
              try {
                const { publicWorkspace } = await destroyWorkspace(
                  team,
                  workspace,
                  destroyContent
                )
                removeFromWorkspacesMap(workspace.id)
                pushMessage({
                  title: 'Success',
                  type: 'success',
                  description: 'Your workspace has been deleted',
                })

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
              } catch (error) {
                pushAxiosErrorMessage(error)
              }
              return
            case 1:
            default:
              return
          }
        },
      })
    },
    [
      messageBox,
      t,
      pushAxiosErrorMessage,
      team,
      removeFromWorkspacesMap,
      pushMessage,
      docsMap,
      updateDocsMap,
      foldersMap,
      updateFoldersMap,
      updateWorkspacesMap,
      removeFromDocsMap,
      removeFromFoldersMap,
    ]
  )

  const currentUserPermissionsId = useMemo(() => {
    if (permissions == null || currentUser == null) {
      return
    }

    const userPermissions = permissions.find((p) => p.userId === currentUser.id)
    if (userPermissions == null) {
      return
    }

    return userPermissions.id
  }, [permissions, currentUser])

  const openDotsContextMenuOthers = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      popup(
        event,
        !workspace.default &&
          (workspace.public || workspace.ownerId === currentUserPermissionsId)
          ? [
              {
                type: MenuTypes.Normal,
                icon: <IconMdi path={mdiApplicationCog} size={16} />,
                label: 'Edit Workspace',
                onClick: () =>
                  openModal(<EditWorkspaceModal workspace={workspace} />),
              },

              {
                type: MenuTypes.Normal,
                icon: <IconMdi path={mdiTrashCanOutline} size={16} />,
                label: 'Delete Workspace',
                onClick: () => {
                  onDeleteCallback(workspace)
                },
              },
            ]
          : [
              {
                type: MenuTypes.Normal,
                icon: <IconMdi path={mdiApplicationCog} size={16} />,
                label: 'Edit Workspace',
                onClick: () =>
                  openModal(<EditWorkspaceModal workspace={workspace} />),
              },
            ]
      )
    },
    [popup, currentUserPermissionsId, onDeleteCallback, openModal, workspace]
  )

  return (
    <Flexbox style={{ verticalAlign: 'middle', textAlign: 'right' }}>
      <Tooltip
        tooltip={
          <div>
            <span className='tooltip-text'>Create new doc</span>
            <span className='tooltip-command'>N</span>
          </div>
        }
        style={{ left: '-200%' }}
      >
        <SideNavigatorIconButton
          path={mdiTextBoxPlusOutline}
          onClick={createChildDoc}
        />
      </Tooltip>
      <Tooltip
        tooltip={
          <div>
            <span className='tooltip-text'>Create new folder</span>
            <span className='tooltip-command'>F</span>
          </div>
        }
        style={{ left: '-200%' }}
      >
        <SideNavigatorIconButton
          onClick={onNewFolderClick}
          path={mdiFolderMultiplePlusOutline}
        />
      </Tooltip>
      <SideNavigatorIconButton
        onClick={openDotsContextMenuOthers}
        path={mdiDotsVertical}
      />
    </Flexbox>
  )
}

export default SideNavigatorWorkspaceControls
