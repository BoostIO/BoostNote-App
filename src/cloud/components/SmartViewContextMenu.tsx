/* eslint-disable @typescript-eslint/no-empty-function */
import {
  mdiClockOutline,
  mdiContentCopy,
  mdiContentSaveOutline,
  mdiOpenInNew,
  mdiPencil,
  mdiTrashCanOutline,
} from '@mdi/js'
import React, { useCallback, useMemo, useState } from 'react'
import MetadataContainer from '../../design/components/organisms/MetadataContainer'
import MetadataContainerBreak from '../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import MetadataContainerRow from '../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { SerializedSmartView } from '../interfaces/db/smartView'
import { SerializedTeam } from '../interfaces/db/team'
import { boostHubBaseUrl } from '../lib/consts'
import { getFormattedDateTime } from '../lib/date'
import { useI18n } from '../lib/hooks/useI18n'
import { lngKeys } from '../lib/i18n/types'
import { usePage } from '../lib/stores/pageStore'
import copy from 'copy-to-clipboard'
import { usingElectron, sendToHost } from '../lib/stores/electron'
import UpdateSmartViewModal from './Modal/contents/SmartView/UpdateSmartViewModal'
import { useModal } from '../../design/lib/stores/modal'
import { useCloudApi } from '../lib/hooks/useCloudApi'
import { useDialog } from '../../design/lib/stores/dialog'
import { getTeamLinkHref } from './Link/TeamLink'

interface SmartViewContextMenuProps {
  smartView: SerializedSmartView
  team: SerializedTeam
}

const SmartViewContextMenu = ({
  team,
  smartView,
}: SmartViewContextMenuProps) => {
  const { translate } = useI18n()
  const { currentUserIsCoreMember } = usePage()
  const [copied, setCopied] = useState(false)
  const { openModal, closeAllModals } = useModal()
  const { sendingMap, deleteSmartViewApi } = useCloudApi()
  const { messageBox } = useDialog()

  const docUrl = useMemo(() => {
    return (
      boostHubBaseUrl +
      getTeamLinkHref(team, 'dashboard', { smartView: smartView.id })
    )
  }, [team, smartView])

  const copyButtonHandler = useCallback(() => {
    copy(docUrl)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 200)
  }, [docUrl])

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
            smartView.createdAt,
            undefined,
            'MMM dd, yyyy, HH:mm'
          ),
        }}
      />
      <MetadataContainerRow
        row={{
          label: translate(lngKeys.UpdateDate),
          type: 'content',
          icon: mdiContentSaveOutline,
          content: getFormattedDateTime(
            smartView.updatedAt,
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
                sendToHost('open-external-url', docUrl)
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
                disabled: sendingMap.has(smartView.id),
                id: 'metadata-move',
                label: translate(lngKeys.GeneralEditVerb),
                iconPath: mdiPencil,
                onClick: () =>
                  openModal(<UpdateSmartViewModal smartView={smartView} />),
              },
            }}
          />
          <MetadataContainerRow
            row={{
              type: 'button',
              props: {
                disabled: sendingMap.has(smartView.id),
                spinning: sendingMap.get(smartView.id) === 'delete',
                id: 'metadata-delete',
                label: translate(lngKeys.GeneralDelete),
                iconPath: mdiTrashCanOutline,
                onClick: () => {
                  messageBox({
                    title: `Delete ${smartView.name}?`,
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
                          await deleteSmartViewApi(smartView)
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

export default React.memo(SmartViewContextMenu)
