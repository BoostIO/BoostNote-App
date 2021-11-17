import React, { useMemo } from 'react'
import { usePage } from '../../lib/stores/pageStore'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { useNav } from '../../lib/stores/nav'
import { useCloudResourceModals } from '../../lib/hooks/useCloudResourceModals'
import { useI18n } from '../../lib/hooks/useI18n'
import InviteCTAButton from '../buttons/InviteCTAButton'
import MetadataContainerRow from '../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import {
  mdiDotsHorizontal,
  mdiFolderPlusOutline,
  mdiPlus,
  mdiTextBoxPlus,
} from '@mdi/js'
import MetadataContainer from '../../../design/components/organisms/MetadataContainer'
import { lngKeys } from '../../lib/i18n/types'
import { useModal } from '../../../design/lib/stores/modal'
import FolderPageInviteSection from '../Onboarding/FolderPageInviteSection'
import { TopbarControlProps } from '../../../design/components/organisms/Topbar'
import WorkspaceContextMenu from './WorkspaceContextMenu'
import ApplicationPage from '../ApplicationPage'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import ApplicationTopbar from '../ApplicationTopbar'
import ApplicationContent from '../ApplicationContent'
import { getDefaultTableView } from '../../lib/views/table'
import { getMapValues } from '../../../design/lib/utils/array'
import ViewsList from '../Views'

const WorkspacePage = ({ workspace }: { workspace: SerializedWorkspace }) => {
  const { team, currentUserIsCoreMember } = usePage()
  const { docsMap, foldersMap, viewsMap } = useNav()
  const { openNewFolderForm, openNewDocForm } = useCloudResourceModals()
  const { sendingMap } = useCloudApi()
  const { translate } = useI18n()
  const { openContextModal } = useModal()

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
    if (workspace != null) {
      map.set(workspace.id, workspace)
    }
    return map
  }, [workspace])

  const topbarControls = useMemo(() => {
    if (team == null || workspace == null) {
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
              width: 300,
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
          <WorkspaceContextMenu
            currentWorkspace={workspace}
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
  }, [
    workspace,
    currentUserIsCoreMember,
    openContextModal,
    openNewDocForm,
    openNewFolderForm,
    sendingMap,
    translate,
    team,
  ])

  const currentViews = useMemo(() => {
    if (workspace == null) {
      return []
    }

    const views = getMapValues(viewsMap)

    const filteredViews = views.filter(
      (view) => view.workspaceId === workspace.id
    )
    if (filteredViews.length === 0) {
      return [getDefaultTableView({ type: 'workspace', target: workspace })]
    }

    return filteredViews
  }, [viewsMap, workspace])

  if (team == null) {
    return (
      <ApplicationPage showingTopbarPlaceholder={true}>
        <ApplicationContent reduced={true}>
          <ColoredBlock variant='danger'>{'Team is missing'}</ColoredBlock>
        </ApplicationContent>
      </ApplicationPage>
    )
  }

  if (workspace == null) {
    return (
      <ApplicationPage showingTopbarPlaceholder={true}>
        <ApplicationContent reduced={true}>
          <ColoredBlock variant='danger'>{'Workspace is missing'}</ColoredBlock>
        </ApplicationContent>
      </ApplicationPage>
    )
  }

  return (
    <ApplicationPage>
      <ApplicationTopbar controls={topbarControls} />
      <ApplicationContent>
        <FolderPageInviteSection />
        <ViewsList
          parent={{ type: 'workspace', target: workspace }}
          views={currentViews}
          team={team}
          docs={childDocs}
          folders={childFolders}
          workspacesMap={workspaceMap}
          currentWorkspaceId={workspace.id}
          currentUserIsCoreMember={currentUserIsCoreMember}
        />
      </ApplicationContent>
    </ApplicationPage>
  )
}

export default WorkspacePage
