/* eslint-disable @typescript-eslint/no-empty-function */
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
import Flexbox from '../../design/components/atoms/Flexbox'
import MetadataContainer from '../../design/components/organisms/MetadataContainer'
import MetadataContainerBreak from '../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import MetadataContainerRow from '../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { getMapValues } from '../../design/lib/utils/array'
import { SerializedDashboardFolder } from '../interfaces/db/dashboardFolder'
import { SerializedTeam } from '../interfaces/db/team'
import { SerializedUser } from '../interfaces/db/user'
import { boostHubBaseUrl } from '../lib/consts'
import { getFormattedDateTime } from '../lib/date'
import { useI18n } from '../lib/hooks/useI18n'
import { getDashboardFolderHref } from '../lib/href'
import { lngKeys } from '../lib/i18n/types'
import { usePage } from '../lib/stores/pageStore'
import UserIcon from './UserIcon'
import copy from 'copy-to-clipboard'
import { usingElectron, sendToHost } from '../lib/stores/electron'
import UpdateDashboardFolderModal from './Modal/contents/DashboardFolder/UpdateDashboardFolderModal'
import { useModal } from '../../design/lib/stores/modal'
import { useCloudApi } from '../lib/hooks/useCloudApi'
import { useDialog } from '../../design/lib/stores/dialog'
import { format } from 'date-fns'
import { capitalize } from 'lodash'
import DocAssigneeSelect from './DocProperties/DocAssigneeSelect'
import DocStatusSelect from './DocProperties/DocStatusSelect'
import styled from '../../design/lib/styled'
import DocTagsListItem from './DocTagsListItem'
import { useNav } from '../lib/stores/nav'
import { SerializedTag } from '../interfaces/db/tag'

interface DashboardFolderContextMenuProps {
  dashboardFolder: SerializedDashboardFolder
  team: SerializedTeam
}

const DashboardFolderContextMenu = ({
  team,
  dashboardFolder,
}: DashboardFolderContextMenuProps) => {
  const { translate } = useI18n()
  const { permissions = [], currentUserIsCoreMember } = usePage()
  const [copied, setCopied] = useState(false)
  const { openModal } = useModal()
  const { sendingMap, deleteDashboardFolder } = useCloudApi()
  const { messageBox } = useDialog()
  const { tagsMap } = useNav()

  const docUrl = useMemo(() => {
    return (
      boostHubBaseUrl + getDashboardFolderHref(dashboardFolder, team, 'index')
    )
  }, [team, dashboardFolder])

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
    dashboardFolder.userId != null
      ? usersMap.get(dashboardFolder.userId)
      : undefined

  return (
    <MetadataContainer rows={[{ type: 'header', content: 'Filter options' }]}>
      <MetadataContainerRow
        row={{
          content:
            dashboardFolder.condition.type === 'and'
              ? translate(lngKeys.GeneralAll)
              : translate(lngKeys.GeneralAny),
          type: 'header',
        }}
      />
      {dashboardFolder.condition.conditions.map((condition, i) => {
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
            dashboardFolder.createdAt,
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
            dashboardFolder.updatedAt,
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
          content: dashboardFolder.private ? (
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
                disabled: sendingMap.has(dashboardFolder.id),
                id: 'metadata-move',
                label: translate(lngKeys.GeneralEditVerb),
                iconPath: mdiPencil,
                onClick: () =>
                  openModal(
                    <UpdateDashboardFolderModal
                      dashboardFolder={dashboardFolder}
                    />
                  ),
              },
            }}
          />
          <MetadataContainerRow
            row={{
              type: 'button',
              props: {
                disabled: sendingMap.has(dashboardFolder.id),
                spinning: sendingMap.get(dashboardFolder.id) === 'delete',
                id: 'metadata-delete',
                label: translate(lngKeys.GeneralDelete),
                iconPath: mdiTrashCanOutline,
                onClick: () => {
                  messageBox({
                    title: `Delete ${dashboardFolder.name}?`,
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
                          await deleteDashboardFolder(dashboardFolder)
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

export default React.memo(DashboardFolderContextMenu)
