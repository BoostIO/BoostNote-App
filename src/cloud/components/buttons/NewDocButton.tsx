import SidebarButton from '../../../design/components/organisms/Sidebar/atoms/SidebarButton'
import {
  MenuTypes,
  useContextMenu,
} from '../../../design/lib/stores/contextMenu'
import { useModal } from '../../../design/lib/stores/modal'
import {
  mdiPencilBoxMultipleOutline,
  mdiPackageVariantClosed,
  mdiTextBoxPlusOutline,
  mdiPencilBoxOutline,
} from '@mdi/js'
import React, { useCallback } from 'react'
import { SerializedTeam } from '../../interfaces/db/team'
import { useCloudResourceModals } from '../../lib/hooks/useCloudResourceModals'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { useNav } from '../../lib/stores/nav'
import TemplatesModal from '../Modal/contents/TemplatesModal'

const NewDocButton = ({ team }: { team: SerializedTeam }) => {
  const {
    currentWorkspaceId,
    workspacesMap,
    currentPath,
    currentParentFolderId,
  } = useNav()
  const { openNewDocForm } = useCloudResourceModals()
  const { openModal } = useModal()
  const { translate } = useI18n()
  const { popup } = useContextMenu()

  const openNewDocModal = useCallback(
    (isCanvas = false) => {
      openNewDocForm(
        {
          team,
          parentFolderId: currentParentFolderId,
          workspaceId: currentWorkspaceId,
          blocks: isCanvas,
        },
        {
          precedingRows: [
            {
              description: `${
                workspacesMap.get(currentWorkspaceId || '')?.name
              }${currentPath}`,
            },
          ],
        }
      )
    },
    [
      openNewDocForm,
      workspacesMap,
      currentWorkspaceId,
      team,
      currentParentFolderId,
      currentPath,
    ]
  )

  const openDocTypeSelect: React.MouseEventHandler = useCallback(
    (ev) => {
      popup(ev, [
        {
          icon: mdiTextBoxPlusOutline,
          type: MenuTypes.Normal,
          label: translate(lngKeys.CreateNewDoc),
          onClick: () => openNewDocModal(),
        },
        {
          icon: mdiPackageVariantClosed,
          type: MenuTypes.Normal,
          label: translate(lngKeys.CreateNewCanvas),
          onClick: () => openNewDocModal(true),
        },
      ])
    },
    [openNewDocModal, popup, translate]
  )
  return (
    <SidebarButton
      variant='primary'
      icon={mdiPencilBoxOutline}
      id='sidebar-newdoc-btn'
      label={translate(lngKeys.CreateNewDoc)}
      labelClick={team.state.blocksBeta ? openDocTypeSelect : openNewDocModal}
      contextControls={[
        {
          icon: mdiPencilBoxMultipleOutline,
          type: MenuTypes.Normal,
          label: translate(lngKeys.UseATemplate),
          onClick: () => openModal(<TemplatesModal />, { width: 'large' }),
        },
      ]}
    />
  )
}

export default NewDocButton
