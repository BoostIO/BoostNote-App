import React, { useCallback, useState, useEffect, useRef } from 'react'
import {
  Section,
  Column,
  Container,
  Scrollable,
  TabHeader,
  SectionHeader2,
  StyledMembername,
  SectionSelect,
  SectionDescription,
  PrimaryAnchor,
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
import cc from 'classcat'
import { useNav } from '../../../lib/stores/nav'
import Icon from '../../atoms/Icon'
import { mdiArrowRight, mdiCardTextOutline, mdiChevronDown } from '@mdi/js'
import { deleteGuestDoc, getGuestsEmails } from '../../../api/guests'
import { useSet } from 'react-use'
import plur from 'plur'
import Button from '../../atoms/Button'
import { MenuTypes, useContextMenu } from '../../../lib/stores/contextMenu'
import { SerializedGuest } from '../../../interfaces/db/guest'
import EmojiIcon from '../../atoms/EmojiIcon'
import { getDocTitle } from '../../../lib/utils/patterns'
import SettingsTeamForm from '../../molecules/SettingsTeamForm'

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
                pushApiErrorMessage(error)
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
      pushApiErrorMessage,
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
                pushApiErrorMessage(error)
              }
              setSending(undefined)
              return
            default:
              return
          }
        },
      })
    },
    [pushApiErrorMessage, messageBox, t, permissions, setPartialPageData, team]
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
        buttons: ['Deactivate', t('general.cancel')],
        defaultButtonIndex: 0,
        cancelButtonIndex: 1,
        onClose: async (value: number | null) => {
          switch (value) {
            case 0:
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
            default:
              return
          }
        },
      })
    },
    [
      messageBox,
      t,
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
              <Flexbox
                justifyContent='space-between'
                style={{ padding: '3px 5px' }}
              >
                <Flexbox flex='1 1 auto' style={{ marginRight: 10 }}>
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
                  variant='outline-secondary'
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
      <Column>
        <Scrollable>
          <Container>
            <TabHeader>{t('settings.teamMembers')}</TabHeader>
            <ColoredBlock variant='danger'>
              You don&apos;t own any permissions.
            </ColoredBlock>
          </Container>
        </Scrollable>
      </Column>
    )
  }

  const currentUserIsAdmin = currentUserPermissions.role === 'admin'

  if (team.personal && showTeamPersonalForm) {
    return (
      <Column>
        <Scrollable>
          <Container>
            <SettingsTeamForm
              team={team}
              onCancel={() => setShowTeamPersonalForm(false)}
              teamConversion={true}
            />
          </Container>
        </Scrollable>
      </Column>
    )
  }

  return (
    <Column>
      <Scrollable>
        <Container>
          <TabSelector>
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
          </TabSelector>

          {tab === 'member' ? (
            team.personal ? (
              <Section>
                <Flexbox>
                  <SectionHeader2>Current Members</SectionHeader2>
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
                    <th>User</th>
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
              </Section>
            ) : (
              <>
                {currentUserIsAdmin && (
                  <OpenInvitesSection
                    userPermissions={currentUserPermissions}
                  />
                )}
                <TeamInvitesSection userPermissions={currentUserPermissions} />
                <Section>
                  <Flexbox>
                    <SectionHeader2>Current Members</SectionHeader2>
                    {fetching.has('userEmails') && (
                      <Spinner className='relative' style={{ top: 2 }} />
                    )}
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
                </Section>{' '}
              </>
            )
          ) : (
            <>
              {subscription == null || subscription.status === 'inactive' ? (
                <>
                  <SectionDescription>
                    Upgrade to invite guests. Guests are people external to your
                    team who you want to work with on specific documents.
                    <br /> They can be invited to individual documents but not
                    an entire workspace.{` `}
                    <PrimaryAnchor
                      target='_blank'
                      rel='noreferrer'
                      href='https://intercom.help/boostnote-for-teams/en/articles/4874279-how-to-invite-guest-to-your-document'
                    >
                      See how it works <Icon path={mdiArrowRight} />
                    </PrimaryAnchor>
                  </SectionDescription>
                  <CustomButton
                    variant='primary'
                    onClick={() => {
                      openSettingsTab('teamUpgrade')
                    }}
                  >
                    Start Free Trial
                  </CustomButton>
                </>
              ) : (
                <Section>
                  <Flexbox>
                    <SectionHeader2>Current Guests</SectionHeader2>
                    {fetching.has('guestEmails') && (
                      <Spinner className='relative' style={{ top: 2 }} />
                    )}
                  </Flexbox>
                  <StyledMembersTable>
                    <thead className='table-header'>
                      <th>User</th>
                      <th>Access Level</th>
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
                </Section>
              )}
            </>
          )}
        </Container>
      </Scrollable>
    </Column>
  )
}

const TabSelector = styled.div`
  display: flex;
  button {
    background: transparent;
    margin-bottom: ${({ theme }) => theme.space.xxsmall}px;
    font-size: ${({ theme }) => theme.fontSizes.medium}px;
    color: ${({ theme }) => theme.subtleTextColor};
    border-bottom: 1px solid transparent;
    cursor: pointer;
    outline: none;

    &:hover {
      color: ${({ theme }) => theme.emphasizedTextColor};
    }

    &.active {
      color: ${({ theme }) => theme.emphasizedTextColor};
      border-color: ${({ theme }) => theme.emphasizedTextColor};
    }
  }
  button:first-of-type {
    margin-right: ${({ theme }) => theme.space.medium}px;
  }
`

const TopMargin = styled.div`
  margin-top: ${({ theme }) => theme.space.medium}px;
`

const StyledMembersTable = styled.table`
  width: 100%;

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
      select {
        padding-left: 0;
        padding-right: ${({ theme }) => theme.space.small}px;
        background-color: transparent;
        border: transparent;
      }
    }

    .no-padding {
      padding: 0 !important;
    }
  }
`

export default MembersTab
