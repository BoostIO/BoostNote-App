import React, { useMemo } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { useNav } from '../../../lib/stores/nav'
import ContentManager from '../../molecules/ContentManager'
import Application from '../../Application'
import { useRouter } from '../../../lib/router'
import { useCloudResourceModals } from '../../../lib/hooks/useCloudResourceModals'
import { mapWorkspaceBreadcrumb } from '../../../lib/mappers/topbarBreadcrumbs'
import { useI18n } from '../../../lib/hooks/useI18n'
import InviteCTAButton from '../../molecules/InviteCTAButton'
import MetadataContainerRow from '../../../../shared/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { mdiFolderPlusOutline, mdiPlus, mdiTextBoxPlus } from '@mdi/js'
import MetadataContainer from '../../../../shared/components/organisms/MetadataContainer'
import { lngKeys } from '../../../lib/i18n/types'
import { useModal } from '../../../../shared/lib/stores/modal'

interface WorkspacePage {
  workspace: SerializedWorkspace
}

const WorkspacePage = ({ workspace }: WorkspacePage) => {
  const { team, currentUserIsCoreMember } = usePage()
  const { docsMap, foldersMap } = useNav()
  const { push } = useRouter()
  const {
    openNewFolderForm,
    openNewDocForm,
    openWorkspaceEditForm,
    deleteWorkspace,
  } = useCloudResourceModals()
  const { sendingMap } = useCloudApi()
  const { translate } = useI18n()
  const { openContextModal } = useModal()

  const topbarBreadcrumbs = useMemo(() => {
    if (team == null) {
      return []
    }

    if (!currentUserIsCoreMember) {
      return [mapWorkspaceBreadcrumb(translate, team, workspace, push)]
    }

    return [
      mapWorkspaceBreadcrumb(
        translate,
        team,
        workspace,
        push,
        openNewDocForm,
        openNewFolderForm,
        openWorkspaceEditForm,
        deleteWorkspace
      ),
    ]
  }, [
    translate,
    team,
    workspace,
    push,
    openNewFolderForm,
    openNewDocForm,
    openWorkspaceEditForm,
    deleteWorkspace,
    currentUserIsCoreMember,
  ])

  const childFolders = useMemo(() => {
    if (workspace == null) {
      return []
    }
    return [...foldersMap.values()].filter(
      (folder) =>
        folder.workspaceId === workspace.id && folder.parentFolderId == null
    )
  }, [foldersMap, workspace])

  const childDocs = useMemo(() => {
    if (workspace == null) {
      return []
    }
    return [...docsMap.values()].filter(
      (doc) => doc.workspaceId === workspace.id && doc.parentFolderId == null
    )
  }, [docsMap, workspace])

  const workspaceMap = useMemo(() => {
    const map = new Map<string, SerializedWorkspace>()
    map.set(workspace.id, workspace)
    return map
  }, [workspace])

  if (team == null) {
    return <Application content={{}} />
  }

  return (
    <Application
      content={{
        topbar: {
          breadcrumbs: topbarBreadcrumbs,
          controls: currentUserIsCoreMember
            ? [
                {
                  type: 'node',
                  element: (
                    <InviteCTAButton origin='folder-page' key='invite-cta' />
                  ),
                },
                {
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
                              disabled: sendingMap.has(workspace.id),
                              id: 'folder-add-doc',
                              label: translate(lngKeys.CreateNewDoc),
                              iconPath: mdiTextBoxPlus,
                              onClick: () =>
                                openNewDocForm({
                                  team,
                                  workspaceId: workspace.id,
                                }),
                            },
                          }}
                        />
                        <MetadataContainerRow
                          row={{
                            type: 'button',
                            props: {
                              disabled: sendingMap.has(workspace.id),
                              id: 'folder-add-folder',
                              label: translate(lngKeys.ModalsCreateNewFolder),
                              iconPath: mdiFolderPlusOutline,
                              onClick: () =>
                                openNewFolderForm({
                                  team,
                                  workspaceId: workspace.id,
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
                },
              ]
            : [
                {
                  type: 'node',
                  element: (
                    <InviteCTAButton origin='folder-page' key='invite-cta' />
                  ),
                },
              ],
        },
      }}
    >
      <ContentManager
        team={team}
        documents={childDocs}
        folders={childFolders}
        workspacesMap={workspaceMap}
        currentWorkspaceId={workspace.id}
        currentUserIsCoreMember={currentUserIsCoreMember}
      />
    </Application>
  )
}

export default WorkspacePage
