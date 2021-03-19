import React, { useState, useCallback, useMemo } from 'react'
import { useModal } from '../../../../../lib/stores/modal'
import { useToast } from '../../../../../lib/stores/toast'
import { usePage } from '../../../../../lib/stores/pageStore'
import { ModalBody, ModalContainer, ModalLine, ModaLineHeader } from '../styled'
import CustomButton from '../../../../atoms/buttons/CustomButton'
import { Spinner } from '../../../../atoms/Spinner'
import ErrorBlock from '../../../../atoms/ErrorBlock'
import { StyledModalForm, StyledModalFormInput } from '../Forms/styled'
import { SerializedWorkspace } from '../../../../../interfaces/db/workspace'
import { useGlobalData } from '../../../../../lib/stores/globalData'
import { SerializedUserTeamPermissions } from '../../../../../interfaces/db/userTeamPermissions'
import {
  CreateWorkspaceRequestBody,
  createWorkspace,
  UpdateWorkspaceRequestBody,
  updateWorkspace,
} from '../../../../../api/teams/workspaces'
import { SerializedTeam } from '../../../../../interfaces/db/team'
import { useNav } from '../../../../../lib/stores/nav'
import Flexbox from '../../../../atoms/Flexbox'
import CustomSwitch from '../../../../atoms/CustomSwitch'
import WorkspaceAccess from './WorkspaceAccess'

interface WorkspaceModalFormProps {
  workspace?: SerializedWorkspace
}

const WorkspaceModalForm = ({ workspace }: WorkspaceModalFormProps) => {
  const { team, permissions } = usePage()
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const { pushMessage } = useToast()
  const { closeModal } = useModal()
  const { updateWorkspacesMap } = useNav()

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
  const formRef = React.createRef<HTMLDivElement>()

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
          throw new Error('Workspace name has to be filled.')
        }
        if (workspace != null) {
          await submitEditWorkSpaceHandler(team, workspace, body)
          pushMessage({
            title: 'Success',
            description: 'Your workspace has been updated',
            type: 'success',
          })
        } else {
          await submitCreateWorkSpaceHandler(team, body)
        }
        closeModal()
      } catch (error) {
        setError(error)
      } finally {
        setSending(false)
      }
    },
    [
      name,
      closeModal,
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
    return <ModalContainer>You need to be connected.</ModalContainer>
  }

  if (team == null) {
    return <ModalContainer>You need to select a valid team.</ModalContainer>
  }

  return (
    <ModalBody ref={formRef} tabIndex={0}>
      <StyledModalForm onSubmit={onSubmit}>
        <ModalLine>
          <ModaLineHeader>Name</ModaLineHeader>
        </ModalLine>
        <ModalLine className='svg-initial-style' style={{ marginBottom: 30 }}>
          <StyledModalFormInput
            placeholder='Workspace name'
            value={name}
            onChange={onChangeWorkspaceNameHandler}
          />
        </ModalLine>

        {workspace != null && workspace.default ? (
          <>
            <ModalLine>
              <ModaLineHeader>Access</ModaLineHeader>
            </ModalLine>
            <ModalLine style={{ marginBottom: 30 }}>
              <span>
                This default workspace is public and can&apos;t have its access
                modified.
              </span>
            </ModalLine>
          </>
        ) : (
          <>
            <ModalLine>
              <ModaLineHeader>Make private</ModaLineHeader>
            </ModalLine>
            <ModalLine style={{ marginBottom: 30 }}>
              <Flexbox justifyContent='space-between'>
                {isPublic ? (
                  <span>
                    This workspace is public. Anyone from the team can access it
                  </span>
                ) : (
                  <span>
                    This workspace is private.{' '}
                    {isOwner && 'You can set individual member access below.'}
                  </span>
                )}
                <Flexbox flex='0 0 auto'>
                  <CustomSwitch
                    disabled={
                      sending ||
                      (workspace != null && workspace.default) ||
                      !isOwner
                    }
                    id='make-private-switch'
                    onChange={togglePrivate}
                    checked={!isPublic}
                    height={28}
                    width={60}
                    uncheckedIcon={false}
                    checkedIcon={false}
                  />
                </Flexbox>
              </Flexbox>
            </ModalLine>{' '}
          </>
        )}

        {!isOwner && (
          <small>Only the workspace owner can change its access.</small>
        )}

        {!isPublic && (
          <WorkspaceAccess
            permissions={permissions}
            ownerPermissions={ownerPermissions}
            currentUserIsOwner={isOwner}
            selectedPermissions={selectedPermissions}
            setSelectedPermissions={setSelectedPermissions}
            currentUser={currentUser}
          />
        )}

        {error != null && (
          <ModalLine>
            <ErrorBlock
              error={error}
              style={{ margin: 0, width: '100%', marginTop: 20 }}
            />
          </ModalLine>
        )}
        <ModalLine className='justify-end svg-initial-style'>
          <CustomButton
            variant='transparent'
            className='rounded mr-2 size-l'
            onClick={closeModal}
            type='button'
          >
            Cancel
          </CustomButton>
          <CustomButton
            variant='primary'
            className='rounded size-l'
            type='submit'
            disabled={sending}
          >
            {sending ? (
              <Spinner size={16} style={{ fontSize: 16, marginRight: 0 }} />
            ) : workspace != null ? (
              'Update'
            ) : (
              'Create'
            )}
          </CustomButton>
        </ModalLine>
      </StyledModalForm>
    </ModalBody>
  )
}

export default WorkspaceModalForm
