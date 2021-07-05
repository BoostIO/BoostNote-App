import { mdiPencilBoxMultipleOutline, mdiTextBoxPlusOutline } from '@mdi/js'
import React from 'react'
import SidebarButton from '../../../shared/components/organisms/Sidebar/atoms/SidebarButton'
import { MenuTypes } from '../../../shared/lib/stores/contextMenu'
import { useModal } from '../../../shared/lib/stores/modal'
import { SerializedTeam } from '../../interfaces/db/team'
import { useCloudResourceModals } from '../../lib/hooks/useCloudResourceModals'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { useNav } from '../../lib/stores/nav'
import TemplatesModal from '../organisms/Modal/contents/TemplatesModal'

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

  return (
    <SidebarButton
      variant='primary'
      icon={mdiTextBoxPlusOutline}
      id='sidebar-newdoc-btn'
      label={translate(lngKeys.CreateNewDoc)}
      labelClick={() =>
        openNewDocForm(
          {
            team,
            parentFolderId: currentParentFolderId,
            workspaceId: currentWorkspaceId,
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
      }
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
