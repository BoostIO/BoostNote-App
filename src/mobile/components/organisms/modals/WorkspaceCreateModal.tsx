import React, { useState, useCallback, useRef } from 'react'
import ModalContainer from './atoms/ModalContainer'
import ModalFormWrapper from './atoms/ModalFormWrapper'

import { usePage } from '../../../../cloud/lib/stores/pageStore'

import ErrorBlock from '../../../../cloud/components/ErrorBlock'
import { useGlobalData } from '../../../../cloud/lib/stores/globalData'
import { SerializedUserTeamPermissions } from '../../../../cloud/interfaces/db/userTeamPermissions'
import {
  CreateWorkspaceRequestBody,
  createWorkspace,
} from '../../../../cloud/api/teams/workspaces'
import { SerializedTeam } from '../../../../cloud/interfaces/db/team'
import { useNav } from '../../../../cloud/lib/stores/nav'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import { useModal } from '../../../../design/lib/stores/modal'
import Switch from '../../../../design/components/atoms/Switch'
import { LoadingButton } from '../../../../design/components/atoms/Button'
import WorkspaceAccess from '../../../../cloud/components/Modal/contents/Workspace/WorkspaceAccess'
import { useEffectOnce } from 'react-use'
import Form from '../../../../design/components/molecules/Form'
import FormRow from '../../../../design/components/molecules/Form/templates/FormRow'

const WorkspaceCreateModal = () => {
  const { team, permissions } = usePage()
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const { closeLastModal } = useModal()
  const { updateWorkspacesMap } = useNav()

  const [error, setError] = useState<unknown>()
  const [sending, setSending] = useState<boolean>(false)
  const [name, setName] = useState<string>('')
  const [isPublic, setIsPublic] = useState<boolean>(true)
  const [selectedPermissions, setSelectedPermissions] = useState<
    SerializedUserTeamPermissions[]
  >([])

  const togglePrivate = useCallback(() => {
    setIsPublic((prev) => {
      if (prev) {
        setSelectedPermissions([])
      }
      return !prev
    })
  }, [])

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

        await submitCreateWorkSpaceHandler(team, body)
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
      selectedPermissions,
      submitCreateWorkSpaceHandler,
      team,
      isPublic,
    ]
  )

  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffectOnce(() => {
    if (nameInputRef.current == null) {
      return
    }

    nameInputRef.current.focus()
  })

  if (currentUser == null) {
    return (
      <ModalContainer title='Create a workspace' closeLabel='Cancel'>
        <ModalFormWrapper>You need to be connected.</ModalFormWrapper>
      </ModalContainer>
    )
  }

  if (team == null) {
    return (
      <ModalContainer title='Create a workspace' closeLabel='Cancel'>
        <ModalFormWrapper>You need to select a valid team.</ModalFormWrapper>
      </ModalContainer>
    )
  }

  return (
    <ModalContainer title='Create a workspace' closeLabel='Cancel'>
      <ModalFormWrapper>
        <Form onSubmit={onSubmit}>
          <FormRow
            row={{
              title: 'Name',
              items: [
                {
                  type: 'input',
                  props: {
                    ref: nameInputRef,
                    placeholder: 'Workspace name',
                    value: name,
                    onChange: onChangeWorkspaceNameHandler,
                  },
                },
              ],
            }}
          />
          <FormRow row={{ title: 'Make Private' }} />
          <FormRow>
            <Flexbox justifyContent='space-between'>
              {isPublic ? (
                <span>
                  This workspace is public. Anyone from the team can access it
                </span>
              ) : (
                <span>
                  This workspace is private. You can set individual member
                  access below.
                </span>
              )}
              <Flexbox flex='0 0 auto'>
                <Switch
                  disabled={sending}
                  id='make-private-switch'
                  onChange={togglePrivate}
                  checked={!isPublic}
                />
              </Flexbox>
            </Flexbox>
          </FormRow>
          {!isPublic && (
            <FormRow>
              <WorkspaceAccess
                permissions={permissions}
                selectedPermissions={selectedPermissions}
                setSelectedPermissions={setSelectedPermissions}
                currentUser={currentUser}
              />
            </FormRow>
          )}
          {error != null && (
            <FormRow>
              <ErrorBlock
                error={error}
                style={{ margin: 0, width: '100%', marginTop: 20 }}
              />
            </FormRow>
          )}
          <FormRow className='justify-center svg-initial-style'>
            <LoadingButton
              variant='primary'
              type='submit'
              disabled={sending}
              spinning={sending}
            >
              Create
            </LoadingButton>
          </FormRow>
        </Form>
      </ModalFormWrapper>
    </ModalContainer>
  )
}

export default WorkspaceCreateModal
