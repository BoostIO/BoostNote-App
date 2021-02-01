import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import {
  Section,
  Column,
  Scrollable,
  TabHeader,
  SectionHeader2,
  StyledMembername,
  SectionSelect,
} from './styled'
import { useTranslation } from 'react-i18next'
import { usePage } from '../../../lib/stores/pageStore'
import { useDialog } from '../../../lib/stores/dialog'
import { DialogIconTypes } from '../../../lib/stores/dialog/types'
import CustomButton from '../../atoms/buttons/CustomButton'
import { SerializedUserTeamPermissions } from '../../../interfaces/db/userTeamPermissions'
import { useGlobalData } from '../../../lib/stores/globalData'
import { useToast } from '../../../lib/stores/toast'
import {
  destroyPermission,
  updatePermissionRole,
} from '../../../api/teams/permissions'
import { useSettings } from '../../../lib/stores/settings'
import TeamInvitesSection from '../../molecules/TeamInvitesSection'
import ColoredBlock from '../../atoms/ColoredBlock'
import { Spinner } from '../../atoms/Spinner'
import OpenInvitesSection from '../../molecules/OpenInviteSection'
import UserIcon from '../../atoms/UserIcon'
import styled from '../../../lib/styled'
import { arraysAreIdentical } from '../../../lib/utils/array'
import { getUserEmailsFromPermissions } from '../../../api/teams/permissions/emails'
import Flexbox from '../../atoms/Flexbox'
import { useRouter } from '../../../lib/router'

const MembersTab = () => {
  const { t } = useTranslation()
  const { team, permissions = [], setPartialPageData } = usePage()
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const { messageBox } = useDialog()
  const { pushAxiosErrorMessage } = useToast()
  const { setClosed } = useSettings()
  const [sending, setSending] = useState<string>()
  const router = useRouter()
  const currentUserEmailIds = useRef<string[]>([])
  const [fetching, setFetching] = useState<boolean>(false)
  const [userEmailsMap, setUserEmailsMap] = useState<Map<string, string>>(
    new Map()
  )

  const currentUserPermissions = useMemo(() => {
    for (const permission of permissions) {
      if (permission.user.id === currentUser!.id) {
        return permission
      }
    }
    return undefined
  }, [currentUser, permissions])

  const fetchUserEmails = useCallback(async (teamId: string, ids: string[]) => {
    setFetching(true)
    try {
      const res = await getUserEmailsFromPermissions(teamId, ids)
      setUserEmailsMap(() =>
        res.permissionEmails.reduce((acc, val) => {
          acc.set(val.id, val.email)
          return acc
        }, new Map<string, string>())
      )
    } catch (error) {}
    currentUserEmailIds.current = ids
    setFetching(false)
  }, [])

  useEffect(() => {
    if (permissions.length === 0 || fetching || team == null) {
      return
    }
    const permissionsCurrentIds = permissions.map((p) => p.id)
    if (
      arraysAreIdentical(currentUserEmailIds.current, permissionsCurrentIds)
    ) {
      return
    }

    fetchUserEmails(team.id, permissionsCurrentIds)
  }, [permissions, fetching, team, fetchUserEmails])

  const removePermissions = useCallback(
    async (permission: SerializedUserTeamPermissions) => {
      if (team == null) {
        return
      }

      const mboxContent = {
        title: 'Leave the team',
        message:
          'Are you sure to leave the team and not being able to access any of its content? The last team member has to completely delete the team.',
      }

      const currentUserId = currentUser != null ? currentUser.id : ''
      if (currentUserId !== permission.user.id) {
        mboxContent.title = 'Removing a member'
        mboxContent.message = `Are you sure to want removing ${permission.user.displayName} from this team`
      }

      messageBox({
        title: mboxContent.title,
        message: mboxContent.message,
        iconType: DialogIconTypes.Warning,
        buttons: ['Delete', t('general.cancel')],
        defaultButtonIndex: 0,
        cancelButtonIndex: 1,
        onClose: async (value: number | null) => {
          switch (value) {
            case 0:
              //remove
              setSending(`${permission.id}-delete`)
              try {
                await destroyPermission(team, permission)
                if (currentUserId === permission.user.id) {
                  router.replace(`/`)
                  setClosed(true)
                } else {
                  setPartialPageData({
                    permissions: permissions.filter(
                      (p) => p.id !== permission.id
                    ),
                  })
                }
              } catch (error) {
                pushAxiosErrorMessage(error)
              }
              setSending(undefined)
              return
            default:
              return
          }
        },
      })
    },
    [
      pushAxiosErrorMessage,
      messageBox,
      currentUser,
      t,
      router,
      permissions,
      setPartialPageData,
      team,
      setClosed,
    ]
  )

  const changePermissionsRole = useCallback(
    async (
      event: React.ChangeEvent<HTMLSelectElement>,
      userPermissions,
      targetedPermissions: SerializedUserTeamPermissions
    ) => {
      event.preventDefault()
      const targetedRole = event.target.value
      if (
        team == null ||
        userPermissions.role !== 'admin' ||
        userPermissions.id === targetedPermissions.id ||
        targetedRole === targetedPermissions.role
      ) {
        return
      }

      const changeIsDemotion = targetedRole === 'member'
      const mboxContent = changeIsDemotion
        ? {
            title: 'Demote the member',
            message: `This action will remove ${targetedPermissions.user.displayName}'s rights as an admin, he will fall back to being a member. Are you sure?`,
          }
        : {
            title: 'Promote the member',
            message: `This action will promote ${targetedPermissions.user.displayName}'s to an admin, he will be granted access to team management and billing information. Are you sure?`,
          }

      messageBox({
        title: mboxContent.title,
        message: mboxContent.message,
        iconType: DialogIconTypes.Warning,
        buttons: [changeIsDemotion ? 'Demote' : 'Promote', t('general.cancel')],
        defaultButtonIndex: 0,
        cancelButtonIndex: 1,
        onClose: async (value: number | null) => {
          switch (value) {
            case 0:
              //remove

              setSending(`${targetedPermissions.id}-change`)
              try {
                const data = await updatePermissionRole(
                  team,
                  targetedPermissions,
                  changeIsDemotion ? 'member' : 'admin'
                )

                setPartialPageData({
                  permissions: permissions.map((p) =>
                    p.id !== data.permissions.id ? p : data.permissions
                  ),
                })
              } catch (error) {
                pushAxiosErrorMessage(error)
              }
              setSending(undefined)
              return
            default:
              return
          }
        },
      })
    },
    [
      pushAxiosErrorMessage,
      messageBox,
      t,
      permissions,
      setPartialPageData,
      team,
    ]
  )

  if (currentUserPermissions == null) {
    return (
      <Column>
        <Scrollable>
          <TabHeader>{t('settings.teamMembers')}</TabHeader>
          <ColoredBlock variant='danger'>
            You don&apos;t own any permissions.
          </ColoredBlock>
        </Scrollable>
      </Column>
    )
  }

  const currentUserIsAdmin = currentUserPermissions.role === 'admin'

  return (
    <Column>
      <Scrollable>
        <TabHeader>{t('settings.teamMembers')}</TabHeader>

        {currentUserIsAdmin && (
          <OpenInvitesSection userPermissions={currentUserPermissions} />
        )}
        <TeamInvitesSection userPermissions={currentUserPermissions} />
        <Section>
          <Flexbox>
            <SectionHeader2>Current Members</SectionHeader2>
            {fetching && <Spinner className='relative' style={{ top: 2 }} />}
          </Flexbox>
          <StyledMembersTable>
            <thead className='table-header'>
              <th>User</th>
              <th>Access Level</th>
            </thead>
            <tbody className='table-body'>
              {permissions.map((permission) => {
                const targetPermissionsAreUsersOwn =
                  currentUserPermissions.id === permission.id
                return (
                  <tr key={permission.id}>
                    <td>
                      <div className='user-info'>
                        <div className='user-info-icon'>
                          <UserIcon user={permission.user} />
                        </div>
                        <StyledMembername>
                          {permission.user.displayName}
                          {currentUserIsAdmin &&
                            userEmailsMap.has(permission.id) && (
                              <span>{userEmailsMap.get(permission.id)}</span>
                            )}
                        </StyledMembername>
                      </div>
                    </td>
                    <td>
                      <div className='user-action'>
                        {sending === `${permission.id}-change` ? (
                          <Spinner
                            style={{
                              position: 'relative',
                              top: -2,
                              bottom: 0,
                              verticalAlign: 'middle',
                              left: 0,
                            }}
                          />
                        ) : (
                          <SectionSelect
                            value={permission.role}
                            onChange={(e: any) =>
                              changePermissionsRole(
                                e,
                                currentUserPermissions,
                                permission
                              )
                            }
                            style={{
                              width: 'auto',
                              minWidth: 'initial',
                              height: 24,
                              marginRight: 16,
                            }}
                            disabled={
                              !currentUserIsAdmin ||
                              targetPermissionsAreUsersOwn
                            }
                          >
                            <option value='admin'>admin</option>
                            <option value='member'>member</option>
                          </SectionSelect>
                        )}
                        {(targetPermissionsAreUsersOwn ||
                          currentUserIsAdmin) && (
                          <CustomButton
                            variant='transparent'
                            onClick={() => removePermissions(permission)}
                            disabled={sending != null}
                            style={{ width: 80 }}
                          >
                            {sending === `${permission.id}-delete` ? (
                              <Spinner />
                            ) : currentUserPermissions.id === permission.id ? (
                              'Leave'
                            ) : (
                              'Remove'
                            )}
                          </CustomButton>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </StyledMembersTable>
        </Section>
      </Scrollable>
    </Column>
  )
}

const StyledMembersTable = styled.table`
  width: 100%;

  .table-header {
    border-top: 1px solid ${({ theme }) => theme.subtleBorderColor};

    th {
      padding: ${({ theme }) => theme.space.xsmall}px 0;
      color: ${({ theme }) => theme.subtleTextColor};
      font-size: ${({ theme }) => theme.fontSizes.small}px;
      font-weight: normal;
    }
  }

  .table-body {
    tr {
      border-top: 1px solid ${({ theme }) => theme.subtleBorderColor};

      td {
        &:first-child {
          width: 70%;
        }
        &:last-child {
          width: 30%;
        }
      }
    }

    .user-info,
    .user-action {
      display: flex;
      align-items: center;
      padding: ${({ theme }) => theme.space.xsmall}px 0;
    }

    .user-info-icon {
      margin-right: ${({ theme }) => theme.space.small}px;
    }

    .user-action {
      select {
        padding-left: 0;
        padding-right: ${({ theme }) => theme.space.small}px;
        background-color: transparent;
        border: transparent;
      }
    }
  }
`

export default MembersTab
