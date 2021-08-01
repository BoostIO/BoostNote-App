import {
  mdiAccountCircleOutline,
  mdiAccountMultiple,
  mdiCalendarMonthOutline,
  mdiClockOutline,
  mdiContentCopy,
  mdiContentSaveOutline,
  mdiListStatus,
  mdiOpenInNew,
  mdiPencil,
  mdiTag,
  mdiTrashCanOutline,
} from '@mdi/js'
import React, { useCallback, useMemo, useState } from 'react'
import Flexbox from '../../../shared/components/atoms/Flexbox'
import MetadataContainer from '../../../shared/components/organisms/MetadataContainer'
import MetadataContainerBreak from '../../../shared/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import MetadataContainerRow from '../../../shared/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { getMapValues } from '../../../shared/lib/utils/array'
import { SerializedSmartFolder } from '../../interfaces/db/smartFolder'
import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedUser } from '../../interfaces/db/user'
import { boostHubBaseUrl } from '../../lib/consts'
import { getFormattedDateTime } from '../../lib/date'
import { useI18n } from '../../lib/hooks/useI18n'
import { getSmartFolderHref } from '../../lib/href'
import { lngKeys } from '../../lib/i18n/types'
import { usePage } from '../../lib/stores/pageStore'
import UserIcon from '../atoms/UserIcon'
import copy from 'copy-to-clipboard'
import { usingElectron, sendToHost } from '../../lib/stores/electron'
import UpdateSmartFolderModal from './Modal/contents/SmartFolder/UpdateSmartFolderModal'
import { useModal } from '../../../shared/lib/stores/modal'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import { useDialog } from '../../../shared/lib/stores/dialog'
import { format } from 'date-fns'
import { capitalize } from 'lodash'
import DocAssigneeSelect from './DocProperties/DocAssigneeSelect'
import DocStatusSelect from './DocProperties/DocStatusSelect'
import styled from '../../../shared/lib/styled'
import DocTagsListItem from '../atoms/DocTagsListItem'
import { useNav } from '../../lib/stores/nav'
import { SerializedTag } from '../../interfaces/db/tag'

interface SmartFolderContextMenuProps {
  smartFolder: SerializedSmartFolder
  team: SerializedTeam
}

const SmartFolderContextMenu = ({
  team,
  smartFolder,
}: SmartFolderContextMenuProps) => {
  const { translate } = useI18n()
  const { permissions = [], currentUserIsCoreMember } = usePage()
  const [copied, setCopied] = useState(false)
  const { openModal } = useModal()
  const { sendingMap, deleteSmartFolder } = useCloudApi()
  const { messageBox } = useDialog()
  const { tagsMap } = useNav()

  const docUrl = useMemo(() => {
    return boostHubBaseUrl + getSmartFolderHref(smartFolder, team, 'index')
  }, [team, smartFolder])

  const copyButtonHandler = useCallback(() => {
    copy(docUrl)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 200)
  }, [docUrl])

  const usersMap = useMemo(() => {
    const users = permissions.reduce((acc, val) => {
      acc.set(val.user.id, val.user)
      return acc
    }, new Map<string, SerializedUser>())

    return users
  }, [permissions])

  const creator =
    smartFolder.userId != null ? usersMap.get(smartFolder.userId) : undefined

  return (
    <MetadataContainer rows={[{ type: 'header', content: 'Filter options' }]}>
      <MetadataContainerRow
        row={{
          content:
            smartFolder.condition.type === 'and'
              ? translate(lngKeys.GeneralAll)
              : translate(lngKeys.GeneralAny),
          type: 'header',
        }}
      />
      {smartFolder.condition.conditions.map((condition, i) => {
        switch (condition.type) {
          case 'creation_date':
          case 'update_date':
          case 'due_date':
            let label = ''
            switch (condition.value.type) {
              case '30_days':
                label = 'Last 30 days'
                break
              case '7_days':
                label = 'Last 7 days'
                break
              case 'specific':
                label = format(
                  new Date(condition.value.date),
                  'MMMM dd, yyyy, HH:mm'
                )
                break
              case 'after':
              case 'before':
                label = `${capitalize(condition.value.type)} ${format(
                  new Date(condition.value.date),
                  'MMMM dd, yyyy, HH:mm'
                )}`
                break
              case 'today':
                label = 'Today'
                break
              case 'between':
                label = `Between ${format(
                  new Date(condition.value.from),
                  'MMMM dd'
                )} and ${format(new Date(condition.value.to), 'MMMM dd')}`
                break
              default:
                break
            }

            return (
              <MetadataContainerRow
                key={`condition-${i}`}
                row={{
                  label:
                    condition.type === 'due_date'
                      ? translate(lngKeys.DueDate)
                      : condition.type === 'creation_date'
                      ? translate(lngKeys.CreationDate)
                      : translate(lngKeys.UpdateDate),
                  type: 'content',
                  icon:
                    condition.type === 'due_date'
                      ? mdiCalendarMonthOutline
                      : mdiClockOutline,
                  content: label,
                }}
              />
            )
          case 'status':
            return (
              <MetadataContainerRow
                key={`condition-${i}`}
                row={{
                  label: translate(lngKeys.GeneralStatus),
                  type: 'content',
                  icon: mdiListStatus,
                  content: (
                    <DocStatusSelect
                      isReadOnly={true}
                      disabled={true}
                      status={condition.value}
                      onStatusChange={() => {}}
                    />
                  ),
                }}
              />
            )

          case 'assignees':
            return (
              <MetadataContainerRow
                key={`condition-${i}`}
                row={{
                  label: translate(lngKeys.Assignees),
                  type: 'content',
                  icon: mdiAccountCircleOutline,
                  content: (
                    <DocAssigneeSelect
                      isLoading={false}
                      readOnly={true}
                      disabled={true}
                      defaultValue={condition.value}
                      update={() => {}}
                    />
                  ),
                }}
              />
            )
          case 'labels':
            const tags = condition.value.reduce((acc, val) => {
              const tag = tagsMap.get(val)
              if (tag != null) {
                acc.push(tag)
              }
              return acc
            }, [] as SerializedTag[])
            return (
              <MetadataContainerRow
                key={`condition-${i}`}
                row={{
                  label: translate(lngKeys.GeneralLabels),
                  type: 'content',
                  icon: mdiTag,
                  content: (
                    <TagList>
                      {tags.map((tag) => (
                        <DocTagsListItem team={team} tag={tag} key={tag.id} />
                      ))}
                    </TagList>
                  ),
                }}
              />
            )
          default:
            return null
        }
      })}
      <MetadataContainerBreak />
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
            smartFolder.createdAt,
            undefined,
            'MMM dd, yyyy, HH:mm'
          ),
        }}
      />
      {creator != null && (
        <MetadataContainerRow
          row={{
            label: translate(lngKeys.CreatedBy),
            type: 'content',
            icon: mdiAccountCircleOutline,
            content: (
              <Flexbox wrap='wrap'>
                <UserIcon key={creator.id} user={creator} className='subtle' />
              </Flexbox>
            ),
          }}
        />
      )}
      <MetadataContainerRow
        row={{
          label: translate(lngKeys.UpdateDate),
          type: 'content',
          icon: mdiContentSaveOutline,
          content: getFormattedDateTime(
            smartFolder.updatedAt,
            undefined,
            'MMM dd, yyyy, HH:mm'
          ),
        }}
      />
      <MetadataContainerRow
        row={{
          label: translate(lngKeys.ModalsWorkspaceAccess),
          type: 'content',
          icon: mdiAccountMultiple,
          content: smartFolder.private ? (
            translate(lngKeys.GeneralPrivate)
          ) : (
            <Flexbox wrap='wrap'>
              {[...getMapValues(usersMap)].map((user) => (
                <UserIcon key={user.id} user={user} className='subtle' />
              ))}
            </Flexbox>
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
                disabled: sendingMap.has(smartFolder.id),
                id: 'metadata-move',
                label: translate(lngKeys.GeneralEditVerb),
                iconPath: mdiPencil,
                onClick: () =>
                  openModal(
                    <UpdateSmartFolderModal smartFolder={smartFolder} />
                  ),
              },
            }}
          />
          <MetadataContainerRow
            row={{
              type: 'button',
              props: {
                disabled: sendingMap.has(smartFolder.id),
                spinning: sendingMap.get(smartFolder.id) === 'delete',
                id: 'metadata-delete',
                label: translate(lngKeys.GeneralDelete),
                iconPath: mdiTrashCanOutline,
                onClick: () => {
                  messageBox({
                    title: `Delete ${smartFolder.name}?`,
                    message: `Are you sure to delete this smart folder?`,
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
                          await deleteSmartFolder(smartFolder)
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

const TagList = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  flex-wrap: wrap;

  .doc__tags__list__item {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

export default React.memo(SmartFolderContextMenu)
