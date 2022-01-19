import SidebarButton from '../../../design/components/organisms/Sidebar/atoms/SidebarButton'
import { MenuTypes } from '../../../design/lib/stores/contextMenu'
import { useModal } from '../../../design/lib/stores/modal'
import { mdiPalette, mdiPlus } from '@mdi/js'
import React, { useCallback } from 'react'
import { SerializedTeam } from '../../interfaces/db/team'
import { useCloudResourceModals } from '../../lib/hooks/useCloudResourceModals'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { useNav } from '../../lib/stores/nav'
import TemplatesModal from '../Modal/contents/TemplatesModal'
import { usePage } from '../../lib/stores/pageStore'
import { canCreateDoc } from '../../lib/subscription'
import { getMapValues } from '../../../design/lib/utils/array'
import UnlockDocCreationModal from '../Modal/contents/Subscription/UnlockDocCreationModal'

const NewDocButton = ({ team }: { team: SerializedTeam }) => {
  const {
    docsMap,
    currentWorkspaceId,
    workspacesMap,
    currentPath,
    currentParentFolderId,
  } = useNav()
  const { openNewDocForm } = useCloudResourceModals()
  const { openModal } = useModal()
  const { translate } = useI18n()
  const { subscription } = usePage()

  const openNewDocModal = useCallback(() => {
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
  }, [
    openNewDocForm,
    workspacesMap,
    currentWorkspaceId,
    team,
    currentParentFolderId,
    currentPath,
  ])

  return (
    <SidebarButton
      variant='primary'
      icon={mdiPlus}
      id='sidebar-newdoc-btn'
      label={translate(lngKeys.CreateNewDoc)}
      labelClick={() =>
        canCreateDoc(getMapValues(docsMap), subscription)
          ? openNewDocModal()
          : openModal(<UnlockDocCreationModal />, {
              showCloseIcon: false,
              width: 'small',
            })
      }
      contextControls={[
        {
          icon: mdiPalette,
          type: MenuTypes.Normal,
          label: translate(lngKeys.UseATemplate),
          onClick: () =>
            canCreateDoc(getMapValues(docsMap), subscription)
              ? openModal(<TemplatesModal />, { width: 'large', removePadding: true })
              : openModal(<UnlockDocCreationModal />, {
                  showCloseIcon: false,
                  width: 'small',
                }),
        },
      ]}
    />
  )
}

export default NewDocButton
