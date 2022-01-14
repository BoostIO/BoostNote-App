import React, { useState, useCallback, useMemo, useRef } from 'react'
import { usePage } from '../../../../lib/stores/pageStore'
import ErrorBlock from '../../../ErrorBlock'
import { SerializedWorkspace } from '../../../../interfaces/db/workspace'
import { useGlobalData } from '../../../../lib/stores/globalData'
import { SerializedUserTeamPermissions } from '../../../../interfaces/db/userTeamPermissions'
import {
  CreateWorkspaceRequestBody,
  createWorkspace,
  UpdateWorkspaceRequestBody,
  updateWorkspace,
} from '../../../../api/teams/workspaces'
import { SerializedTeam } from '../../../../interfaces/db/team'
import { useNav } from '../../../../lib/stores/nav'
import WorkspaceAccess from './WorkspaceAccess'
import { useToast } from '../../../../../design/lib/stores/toast'
import { useModal } from '../../../../../design/lib/stores/modal'
import Button, {
  LoadingButton,
} from '../../../../../design/components/atoms/Button'
import Form from '../../../../../design/components/molecules/Form'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'
import FormRow from '../../../../../design/components/molecules/Form/templates/FormRow'
import { useEffectOnce } from 'react-use'
import ButtonGroup from '../../../../../design/components/atoms/ButtonGroup'
import { mdiAccountMultipleOutline, mdiLockOutline } from '@mdi/js'
import { canCreatePrivateFolders } from '../../../../lib/subscription'
import UnlockPrivateWorkspaceModal from '../Subscription/UnlockPrivateWorkspaceModal'
import Icon from '../../../../../design/components/atoms/Icon'
import styled from '../../../../../design/lib/styled'

interface WorkspaceModalFormProps {
  workspace?: SerializedWorkspace
}

const WorkspaceModalForm = ({ workspace }: WorkspaceModalFormProps) => {
  const { team, permissions, subscription } = usePage()
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const { pushMessage } = useToast()
  const { closeLastModal, openModal } = useModal()
  const { updateWorkspacesMap } = useNav()
  const inputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState<unknown>()
  const [sending, setSending] = useState<boolean>(false)
  const [name, setName] = useState<string>(
    workspace != null ? workspace.name : ''
  )
  const [isPublic, setIsPublic] = useState<boolean>(
    workspace != null ? workspace.public : true
  )
  const [selectedPermissions, setSelectedPermissions] = useState<
    SerializedUserTeamPermissions[]
  >(
    workspace != null && workspace.permissions != null && permissions != null
      ? permissions.filter((permission) =>
          workspace.permissions!.map((p) => p.id).includes(permission.id)
        )
      : []
  )
  const { translate } = useI18n()

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

  const togglePrivate = useCallback(() => {
    setIsPublic((prev) => {
      if (prev) {
        setSelectedPermissions([])
      }
      return !prev
    })
  }, [])

  const ownerPermissions = useMemo(() => {
    if (workspace == null) {
      return undefined
    }

    if (workspace.ownerId == null || permissions == null) {
      return undefined
    }

    return permissions.find((p) => p.id === workspace.ownerId)
  }, [workspace, permissions])

  const isOwner = useMemo(() => {
    if (currentUser == null) {
      return false
    }

    if (workspace == null || workspace.ownerId == null || permissions == null) {
      return true
    }
    if (ownerPermissions == null) {
      return true
    }

    return currentUser.id === ownerPermissions.user.id
  }, [permissions, currentUser, workspace, ownerPermissions])

  const onChangeWorkspaceNameHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value)
    },
    [setName]
  )

  const submitCreateWorkSpaceHandler = useCallback(
    async (team: SerializedTeam, body: CreateWorkspaceRequestBody) => {
      const { workspace } = await createWorkspace(team, body)
      updateWorkspacesMap([workspace.id, workspace])
    },
    [updateWorkspacesMap]
  )

  const submitEditWorkSpaceHandler = useCallback(
    async (
      team: SerializedTeam,
      workspace: SerializedWorkspace,
      body: UpdateWorkspaceRequestBody
    ) => {
      const { workspace: updatedWorkspace } = await updateWorkspace(
        team,
        workspace.id,
        body
      )
      updateWorkspacesMap([workspace.id, updatedWorkspace])
    },
    [updateWorkspacesMap]
  )

  const onSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      if (team == null) {
        return
      }

      const body = {
        name,
        public: isPublic,
        permissions:
          !isPublic && selectedPermissions != null
            ? selectedPermissions.map((p) => p.id)
            : [],
      }

      setError(undefined)
      setSending(true)
      try {
        if (body.name.trim() === '') {
          throw new Error('Folder name has to be filled.')
        }
        if (workspace != null) {
          await submitEditWorkSpaceHandler(team, workspace, body)
          pushMessage({
            title: 'Success',
            description: 'Your folder has been updated',
            type: 'success',
          })
        } else {
          await submitCreateWorkSpaceHandler(team, body)
        }
        closeLastModal()
      } catch (error) {
        setError(error)
      } finally {
        setSending(false)
      }
    },
    [
      name,
      closeLastModal,
      pushMessage,
      selectedPermissions,
      submitCreateWorkSpaceHandler,
      submitEditWorkSpaceHandler,
      team,
      isPublic,
      workspace,
    ]
  )

  if (currentUser == null) {
    return <p>You need to be connected.</p>
  }

  if (team == null) {
    return <p>You need to select a valid team.</p>
  }

  return (
    <Form onSubmit={onSubmit} fullWidth={true}>
      <FormRow
        fullWidth={true}
        row={{
          title: translate(lngKeys.GeneralName),
          items: [
            {
              type: 'input',
              props: {
                ref: inputRef,
                placeholder: translate(lngKeys.GeneralName),
                value: name,
                onChange: onChangeWorkspaceNameHandler,
              },
            },
          ],
        }}
      />
      {workspace != null && workspace.default ? (
        <FormRow
          row={{
            title: translate(lngKeys.ModalsWorkspaceAccess),
            description: translate(lngKeys.ModalsWorkspaceDefaultDisclaimer),
          }}
        />
      ) : (
        <FormRow
          fullWidth={true}
          row={{
            items: [
              {
                type: 'node',
                element: isPublic ? (
                  <Button
                    variant='bordered'
                    iconPath={mdiLockOutline}
                    onClick={() => {
                      if (canCreatePrivateFolders(subscription)) {
                        return togglePrivate()
                      }

                      openModal(<UnlockPrivateWorkspaceModal />, {
                        showCloseIcon: false,
                        width: 'small',
                      })
                    }}
                    className='privacy__button'
                  >
                    Make Private
                  </Button>
                ) : (
                  <PrivateDisclaimerContainer>
                    <Icon path={mdiLockOutline} />
                    <span>Private {team != null && `to ${team.name}`}</span>
                    <Button
                      variant='bordered'
                      onClick={togglePrivate}
                      iconPath={mdiAccountMultipleOutline}
                      size='sm'
                    >
                      Make public
                    </Button>
                  </PrivateDisclaimerContainer>
                ),
              },
            ],
          }}
        />
      )}

      {!isOwner && (
        <FormRow>
          <small>{translate(lngKeys.ModalsWorkspacesNonOwnerDisclaimer)}</small>
        </FormRow>
      )}

      {!isPublic && (
        <FormRow>
          <WorkspaceAccess
            permissions={permissions}
            ownerPermissions={ownerPermissions}
            currentUserIsOwner={isOwner}
            selectedPermissions={selectedPermissions}
            setSelectedPermissions={setSelectedPermissions}
            currentUser={currentUser}
          />
        </FormRow>
      )}

      {error != null && (
        <FormRow>
          <ErrorBlock error={error} style={{ margin: 0, width: '100%' }} />
        </FormRow>
      )}

      <FormRow>
        <ButtonGroup layout='spread'>
          <Button variant='secondary' onClick={closeLastModal}>
            {translate(lngKeys.GeneralCancel)}
          </Button>
          <LoadingButton
            spinning={sending}
            variant='primary'
            type='submit'
            disabled={sending}
          >
            {workspace != null
              ? translate(lngKeys.GeneralUpdateVerb)
              : translate(lngKeys.GeneralCreate)}
          </LoadingButton>
        </ButtonGroup>
      </FormRow>
    </Form>
  )
}

const PrivateDisclaimerContainer = styled.div`
  display: flex;
  align-items: center;

  span {
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
    margin-right: ${({ theme }) => theme.sizes.spaces.df}px;
  }
`

export default WorkspaceModalForm
