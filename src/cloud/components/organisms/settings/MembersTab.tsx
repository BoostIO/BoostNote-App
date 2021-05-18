import React, { useCallback, useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { usePage } from '../../../lib/stores/pageStore'
import {
  useDialog,
  DialogIconTypes,
} from '../../../../shared/lib/stores/dialog'
import CustomButton from '../../atoms/buttons/CustomButton'
import { SerializedUserTeamPermissions } from '../../../interfaces/db/userTeamPermissions'
import { useGlobalData } from '../../../lib/stores/globalData'
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
import { useRouter } from '../../../lib/router'
import cc from 'classcat'
import { useNav } from '../../../lib/stores/nav'
import Icon from '../../atoms/Icon'
import {
  mdiArrowLeft,
  mdiArrowRight,
  mdiCardTextOutline,
  mdiChevronDown,
} from '@mdi/js'
import { deleteGuestDoc, getGuestsEmails } from '../../../api/guests'
import { useSet } from 'react-use'
import plur from 'plur'
import {
  MenuTypes,
  useContextMenu,
} from '../../../../shared/lib/stores/contextMenu'
import { SerializedGuest } from '../../../interfaces/db/guest'
import EmojiIcon from '../../atoms/EmojiIcon'
import { getDocTitle } from '../../../lib/utils/patterns'
import SettingsTeamForm from '../../molecules/SettingsTeamForm'
import { guestsPerMember } from '../../../lib/subscription'
import { useToast } from '../../../../shared/lib/stores/toast'
import SettingTabContent from '../../../../shared/components/organisms/Settings/atoms/SettingTabContent'
import Button from '../../../../shared/components/atoms/Button'
import Flexbox from '../../../../shared/components/atoms/Flexbox'
import SettingTabSelector from '../../../../shared/components/organisms/Settings/atoms/SettingTabSelector'
import { ExternalLink } from '../../../../shared/components/atoms/Link'
import { SimpleFormSelect } from '../../../../shared/components/molecules/Form/atoms/FormSelect'

const MembersTab = () => {
  const { t } = useTranslation()
  const {
    team,
    permissions = [],
    setPartialPageData,
    guestsMap,
    setGuestsMap,
    updateGuestsMap,
    currentUserPermissions,
  } = usePage()
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const { messageBox } = useDialog()
  const { pushApiErrorMessage } = useToast()
  const { setClosed, openSettingsTab } = useSettings()
  const [sending, setSending] = useState<string>()
  const router = useRouter()
  const currentUserEmailIds = useRef<string[]>([])
  const currentGuestsEmailIds = useRef<string[]>([])
  const [fetching, { add, remove, has }] = useSet<string>(new Set())
  const [userEmailsMap, setUserEmailsMap] = useState<Map<string, string>>(
    new Map()
  )
  const [guestEmailsMap, setGuestEmailsMap] = useState<Map<string, string>>(
    new Map()
  )
  const [tab, setTab] = useState<'member' | 'guest'>('member')
  const { docsMap } = useNav()
  const { subscription } = usePage()
  const { popup } = useContextMenu()
  const [showTeamPersonalForm, setShowTeamPersonalForm] = useState<boolean>(
    false
  )

  const fetchUserEmails = useCallback(
    async (teamId: string, ids: string[]) => {
      add('userEmails')
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
      remove('userEmails')
    },
    [add, remove]
  )

  const fetchGuestsEmails = useCallback(
    async (teamId: string, ids: string[]) => {
      add('guestEmails')
      try {
        const res = await getGuestsEmails({ teamId })
        setGuestEmailsMap(() =>
          res.guestsEmails.reduce((acc, val) => {
            acc.set(val.id, val.email)
            return acc
          }, new Map<string, string>())
        )
      } catch (error) {}
      currentGuestsEmailIds.current = ids
      remove('guestEmails')
    },
    [add, remove]
  )

  useEffect(() => {
    if (
      permissions.length === 0 ||
      fetching.has('userEmails') ||
      team == null
    ) {
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

  useEffect(() => {
    if (guestsMap.size === 0 || team == null || fetching.has('guestEmails')) {
      return
    }
    const guestsMapIds = [...guestsMap.keys()]
    if (arraysAreIdentical(currentGuestsEmailIds.current, guestsMapIds)) {
      return
    }

    fetchGuestsEmails(team.id, guestsMapIds)
  }, [guestsMap, fetching, team, fetchGuestsEmails])

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
        buttons: [
          {
            variant: 'secondary',
            label: 'Cancel',
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: 'Delete',
            onClick: async () => {
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
                pushApiErrorMessage(error)
              }
              setSending(undefined)
              return
            },
          },
        ],
      })
    },
    [
      pushApiErrorMessage,
      messageBox,
      currentUser,
      router,
      permissions,
      setPartialPageData,
      team,
      setClosed,
    ]
  )

  const changePermissionsRole = useCallback(
    async (
      targetedRole,
      userPermissions,
      targetedPermissions: SerializedUserTeamPermissions
    ) => {
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
        buttons: [
          {
            variant: 'secondary',
            label: 'Cancel',
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: changeIsDemotion ? 'danger' : 'primary',
            label: changeIsDemotion ? 'Demote' : 'Promote',
            onClick: async () => {
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
                pushApiErrorMessage(error)
              }
              setSending(undefined)
              return
            },
          },
        ],
      })
    },
    [pushApiErrorMessage, messageBox, permissions, setPartialPageData, team]
  )
  const removeGuestAccess = useCallback(
    (guestId: string, docId: string) => {
      if (has(guestId)) {
        return
      }
      messageBox({
        title: `Deactivate?`,
        message: `Are you sure to retract this invite? The invited guest won't be able to access this document anymore.`,
        iconType: DialogIconTypes.Warning,

        buttons: [
          {
            variant: 'secondary',
            label: 'Cancel',
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: 'Deactivate',
            onClick: async () => {
              try {
                add(guestId)
                add(`${guestId}-${docId}`)
                const { guest: updatedGuest } = await deleteGuestDoc(
                  guestId,
                  docId
                )

                if (updatedGuest == null) {
                  setGuestsMap((prevMap) => {
                    const newMap = new Map(prevMap)
                    newMap.delete(guestId)
                    return newMap
                  })
                } else {
                  updateGuestsMap([updatedGuest.id, updatedGuest])
                }
              } catch (error) {
                pushApiErrorMessage(error)
              }
              remove(guestId)
              remove(`${guestId}-${docId}`)
              return
            },
          },
        ],
      })
    },
    [
      messageBox,
      add,
      remove,
      setGuestsMap,
      updateGuestsMap,
      pushApiErrorMessage,
      has,
    ]
  )

  const openGuestsContextMenu = useCallback(
    (event: React.MouseEvent, guest: SerializedGuest) => {
      event.preventDefault()
      popup(
        event,
        guest.docsIds.map((docId) => {
          const doc = docsMap.get(docId)
          return {
            type: MenuTypes.Component,
            component: (
              <Flexbox justifyContent='space-between'>
                <Flexbox flex='1 1 auto'>
                  {doc != null ? (
                    <EmojiIcon
                      defaultIcon={mdiCardTextOutline}
                      emoji={doc.emoji}
                      size={16}
                    />
                  ) : (
                    <Icon path={mdiCardTextOutline} />
                  )}
                  {doc != null ? getDocTitle(doc, 'Untitled') : 'Untitled'}
                </Flexbox>
                <Button
                  variant='secondary'
                  onClick={() => removeGuestAccess(guest.id, docId)}
                  size='sm'
                  disabled={has(guest.id)}
                >
                  {has(`${guest.id}-${docId}`) ? (
                    <Spinner className='relative' style={{ top: 0, left: 0 }} />
                  ) : (
                    'Deactivate'
                  )}
                </Button>
              </Flexbox>
            ),
          }
        })
      )
    },
    [popup, docsMap, removeGuestAccess, has]
  )

  if (currentUserPermissions == null || team == null) {
    return (
      <SettingTabContent
        title={t('settings.teamMembers')}
        body={
          <ColoredBlock variant='danger'>
            You don&apos;t own any permissions.
          </ColoredBlock>
        }
      ></SettingTabContent>
    )
  }

  const currentUserIsAdmin = currentUserPermissions.role === 'admin'

  if (team.personal && showTeamPersonalForm) {
    return (
      <SettingTabContent
        title='Create team space'
        description='Create a team space in order to invite your teammates'
        backLink={{
          variant: 'icon',
          iconPath: mdiArrowLeft,
          iconSize: 20,
          onClick: () => setShowTeamPersonalForm(false),
        }}
        body={<SettingsTeamForm team={team} teamConversion={true} />}
      ></SettingTabContent>
    )
  }

  return (
    <SettingTabContent
      title={
        <SettingTabSelector>
          <button
            className={cc([tab === 'member' && 'active'])}
            onClick={() => setTab('member')}
          >
            Members ({permissions.length})
          </button>
          <button
            className={cc([tab === 'guest' && 'active'])}
            onClick={() => setTab('guest')}
          >
            Guests ({guestsMap.size})
          </button>
        </SettingTabSelector>
      }
      description={'Manage who access to this space.'}
      body={
        <>
          {tab === 'member' ? (
            team.personal ? (
              <section>
                <Flexbox>
                  <h2>Current Members</h2>
                  {fetching.has('userEmails') && (
                    <Spinner className='relative' style={{ top: 2 }} />
                  )}
                </Flexbox>
                <Button
                  variant='primary'
                  onClick={() => setShowTeamPersonalForm(true)}
                >
                  Add members
                </Button>
                <TopMargin />
                <StyledMembersTable>
                  <thead className='table-header'>
                    <tr>
                      <th>User</th>
                    </tr>
                  </thead>
                  <tbody className='table-body'>
                    <tr key={currentUserPermissions.id}>
                      <td>
                        <div className='user-info'>
                          <div className='user-info-icon'>
                            <UserIcon user={currentUserPermissions.user} />
                          </div>
                          <StyledMembername>
                            {currentUserPermissions.user.displayName}
                            {currentUserIsAdmin &&
                              userEmailsMap.has(currentUserPermissions.id) && (
                                <span>
                                  {userEmailsMap.get(currentUserPermissions.id)}
                                </span>
                              )}
                          </StyledMembername>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </StyledMembersTable>
              </section>
            ) : (
              <>
                {currentUserIsAdmin && (
                  <OpenInvitesSection
                    userPermissions={currentUserPermissions}
                  />
                )}
                <TeamInvitesSection userPermissions={currentUserPermissions} />
                <section>
                  <Flexbox>
                    <h2>Current Members</h2>
                    {fetching.has('userEmails') && (
                      <Spinner className='relative' style={{ top: 2 }} />
                    )}
                  </Flexbox>
                  <StyledMembersTable>
                    <thead className='table-header'>
                      <tr>
                        <th>User</th>
                        <th>Access Level</th>
                      </tr>
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
                                      <span>
                                        {userEmailsMap.get(permission.id)}
                                      </span>
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
                                  <SimpleFormSelect
                                    className='user--role--select'
                                    value={permission.role}
                                    onChange={(value: string) =>
                                      changePermissionsRole(
                                        value,
                                        currentUserPermissions,
                                        permission
                                      )
                                    }
                                    isDisabled={
                                      !currentUserIsAdmin ||
                                      targetPermissionsAreUsersOwn
                                    }
                                    options={['admin', 'member']}
                                  />
                                )}
                                {(targetPermissionsAreUsersOwn ||
                                  currentUserIsAdmin) && (
                                  <CustomButton
                                    variant='transparent'
                                    onClick={() =>
                                      removePermissions(permission)
                                    }
                                    disabled={sending != null}
                                    style={{ width: 80 }}
                                  >
                                    {sending === `${permission.id}-delete` ? (
                                      <Spinner />
                                    ) : currentUserPermissions.id ===
                                      permission.id ? (
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
                </section>{' '}
              </>
            )
          ) : (
            <>
              {subscription == null || subscription.status === 'inactive' ? (
                <>
                  <StyledGuestInactiveText>
                    <p>
                      Upgrade to invite guests. Guests are people external to
                      your team who you want to work with on specific documents.
                      They can be invited to individual documents but not an
                      entire workspace.
                      {` `}
                      <ExternalLink href='https://intercom.help/boostnote-for-teams/en/articles/4874279-how-to-invite-guest-to-your-document'>
                        See how it works <Icon path={mdiArrowRight} />
                      </ExternalLink>
                    </p>
                  </StyledGuestInactiveText>
                  <Button
                    variant='primary'
                    onClick={() => {
                      openSettingsTab('teamUpgrade')
                    }}
                  >
                    Start Free Trial
                  </Button>
                </>
              ) : (
                <section>
                  <Flexbox>
                    <h2>Current Guests</h2>
                    {fetching.has('guestEmails') && (
                      <Spinner className='relative' style={{ top: 2 }} />
                    )}
                  </Flexbox>
                  <p>
                    Guests are people external to your team who you want to work
                    with on specific documents. They can be invited to
                    individual documents but not an entire workspace.
                  </p>
                  <p>
                    {permissions.length > 0
                      ? `${
                          permissions.length * guestsPerMember - guestsMap.size
                        } remaining ${plur('seat', permissions.length)}. `
                      : 'No Remaining seats. '}
                  </p>
                  <StyledMembersTable>
                    <thead className='table-header'>
                      <tr>
                        <th>User</th>
                        <th>Access Level</th>
                      </tr>
                    </thead>
                    <tbody className='table-body'>
                      {[...guestsMap.values()].map((guest) => (
                        <tr key={guest.id}>
                          <td>
                            <div className='user-info'>
                              <div className='user-info-icon'>
                                <UserIcon user={guest.user} />
                              </div>
                              <StyledMembername>
                                {guest.user.displayName}
                                {guestEmailsMap.has(guest.id) && (
                                  <span>{guestEmailsMap.get(guest.id)}</span>
                                )}
                              </StyledMembername>
                            </div>
                          </td>
                          <td>
                            <div className='user-action'>
                              <Button
                                variant='transparent'
                                className='no-padding'
                                onClick={(ev) =>
                                  openGuestsContextMenu(ev, guest)
                                }
                              >
                                {`${guest.docsIds.length} ${plur(
                                  'Document',
                                  guest.docsIds.length
                                )}`}
                                <Icon path={mdiChevronDown} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </StyledMembersTable>
                </section>
              )}
            </>
          )}
        </>
      }
    ></SettingTabContent>
  )
}

const TopMargin = styled.div`
  margin-top: ${({ theme }) => theme.space.medium}px;
`

const StyledMembersTable = styled.table`
  width: 100%;
  margin-top: ${({ theme }) => theme.space.default}px;

  .table-header {
    text-align: left;
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
      position: relative;

      .form__select__wrapper {
        flex: 1 0 auto;
      }

      .form__select .form__select__control {
        /* border: transparent; */
      }
    }

    .no-padding {
      padding: 0 !important;
    }
  }
`

const StyledGuestInactiveText = styled.p`
  margin-top: ${({ theme }) => theme.space.medium}px;
  margin-bottom: ${({ theme }) => theme.space.default}px;
  line-height: 1.6;
`

const StyledMembername = styled.div`
  display: flex;
  align-items: center;
  flex: 1 1 auto;

  p {
    margin: 0;
    color: ${({ theme }) => theme.baseTextColor};
    padding-right: ${({ theme }) => theme.space.xsmall}px;
  }

  span {
    color: ${({ theme }) => theme.subtleTextColor};
    margin-left: ${({ theme }) => theme.space.xsmall}px;
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    padding: 2px 5px;
  }
`

export default MembersTab
