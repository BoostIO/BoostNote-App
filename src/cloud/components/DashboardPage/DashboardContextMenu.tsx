import {
  mdiClockOutline,
  mdiContentCopy,
  mdiOpenInNew,
  mdiPencil,
  mdiTrashCanOutline,
} from '@mdi/js'
import copy from 'copy-to-clipboard'
import React, { useCallback, useMemo, useState } from 'react'
import MetadataContainer from '../../../design/components/organisms/MetadataContainer'
import MetadataContainerBreak from '../../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import MetadataContainerRow from '../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { useDialog } from '../../../design/lib/stores/dialog'
import { useModal } from '../../../design/lib/stores/modal'
import { SerializedDashboard } from '../../interfaces/db/dashboard'
import { SerializedTeam } from '../../interfaces/db/team'
import { boostHubBaseUrl } from '../../lib/consts'
import { getFormattedDateTime } from '../../lib/date'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import { useCloudResourceModals } from '../../lib/hooks/useCloudResourceModals'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { sendToHost, usingElectron } from '../../lib/stores/electron'
import { usePage } from '../../lib/stores/pageStore'
import { getTeamLinkHref } from '../Link/TeamLink'

interface DashboardContextMenuProps {
  dashboard: SerializedDashboard
  team: SerializedTeam
}

const DashboardContextMenu = ({
  team,
  dashboard,
}: DashboardContextMenuProps) => {
  const { translate } = useI18n()
  const { currentUserIsCoreMember } = usePage()
  const [copied, setCopied] = useState(false)
  const { closeAllModals } = useModal()
  const { sendingMap, deleteDashboard } = useCloudApi()
  const { messageBox } = useDialog()
  const { openRenameDashboardForm } = useCloudResourceModals()

  const dashboardUrl = useMemo(() => {
    return (
      boostHubBaseUrl +
      getTeamLinkHref(team, 'dashboard', { dashboard: dashboard.id })
    )
  }, [team, dashboard])

  const copyButtonHandler = useCallback(() => {
    copy(dashboardUrl)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 200)
  }, [dashboardUrl])

  return (
    <MetadataContainer>
      <MetadataContainerRow
        row={{
          content: 'Info',
          type: 'header',
        }}
      />
      <MetadataContainerRow
        row={{
          label: translate(lngKeys.CreationDate),
          type: 'content',
          icon: mdiClockOutline,
          content: getFormattedDateTime(
            dashboard.createdAt,
            undefined,
            'MMM dd, yyyy, HH:mm'
          ),
        }}
      />
      <MetadataContainerBreak />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            id: 'metadata-copy-link',
            label: translate(lngKeys.GeneralCopyTheLink),
            iconPath: mdiContentCopy,
            spinning: copied,
            disabled: copied,
            onClick: copyButtonHandler,
          },
        }}
      />
      {usingElectron && (
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              id: 'metadata-open-new',
              label: translate(lngKeys.OpenInBrowser),
              iconPath: mdiOpenInNew,
              onClick: () => {
                sendToHost('open-external-url', dashboardUrl)
              },
            },
          }}
        />
      )}
      {currentUserIsCoreMember && (
        <>
          <MetadataContainerBreak />

          <MetadataContainerRow
            row={{
              type: 'button',
              props: {
                disabled: sendingMap.has(dashboard.id),
                id: 'metadata-edit',
                label: translate(lngKeys.GeneralEditVerb),
                iconPath: mdiPencil,
                onClick: () => openRenameDashboardForm(dashboard),
              },
            }}
          />
          <MetadataContainerRow
            row={{
              type: 'button',
              props: {
                disabled: sendingMap.has(dashboard.id),
                spinning: sendingMap.get(dashboard.id) === 'delete',
                id: 'metadata-delete',
                label: translate(lngKeys.GeneralDelete),
                iconPath: mdiTrashCanOutline,
                onClick: () => {
                  messageBox({
                    title: `Delete ${dashboard.name}?`,
                    message: `Are you sure to delete this smart view?`,
                    buttons: [
                      {
                        variant: 'secondary',
                        label: translate(lngKeys.GeneralCancel),
                        cancelButton: true,
                        defaultButton: true,
                      },
                      {
                        variant: 'danger',
                        label: translate(lngKeys.GeneralDelete),
                        onClick: async () => {
                          await deleteDashboard(dashboard)
                          closeAllModals()
                        },
                      },
                    ],
                  })
                },
              },
            }}
          />
        </>
      )}
    </MetadataContainer>
  )
}

export default React.memo(DashboardContextMenu)
