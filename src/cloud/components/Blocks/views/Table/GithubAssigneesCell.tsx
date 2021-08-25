import { StyledUserIcon } from '../../../UserIcon'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { GithubCellProps } from '.'
import { useModal } from '../../../../../design/lib/stores/modal'
import { getAction, postAction } from '../../../../api/integrations'
import styled from '../../../../../design/lib/styled'
import FilterableSelectList from '../../../../../design/components/molecules/FilterableSelectList'
import Spinner from '../../../../../design/components/atoms/Spinner'
import { useToast } from '../../../../../design/lib/stores/toast'

interface Assignee {
  id: number
  avatar_url: string
  login: string
}

const GitHubAssigneesCell = ({ data, onUpdate }: GithubCellProps) => {
  const { openContextModal, closeAllModals } = useModal()
  const { pushApiErrorMessage } = useToast()

  const addAssignees = useCallback(
    async (assignees: string[]) => {
      try {
        const [owner, repo] = data.repository.full_name.split('/')
        const issue = await postAction(
          { id: data.integrationId },
          'issue:assign',
          { owner, repo, issue_number: data.number },
          { assignees }
        )
        await onUpdate({ ...data, ...issue })
        closeAllModals()
      } catch (error) {
        pushApiErrorMessage(error)
      }
    },
    [data]
  )

  const openAssigneeSelect: React.MouseEventHandler = useCallback(
    (ev) => {
      openContextModal(
        ev,
        <AssigneeSelect data={data} onSelect={addAssignees} />
      )
    },
    [openContextModal, data]
  )

  return (
    <Container onClick={openAssigneeSelect}>
      {data.assignees?.map((user: Assignee) => (
        <StyledUserIcon className='subtle'>
          <img src={user.avatar_url} alt={user.login[0]} />
        </StyledUserIcon>
      ))}
    </Container>
  )
}

const Container = styled.div`
  min-height: 40px;
`

interface AssigneeSelectProps {
  data: GithubCellProps['data']
  onSelect: (names: string[]) => Promise<void>
}

const AssigneeSelect = ({ data, onSelect }: AssigneeSelectProps) => {
  const [users, setUsers] = useState<Assignee[] | null>(null)
  const { pushApiErrorMessage } = useToast()

  const pushErrorRef = useRef(pushApiErrorMessage)
  useEffect(() => {
    pushErrorRef.current = pushApiErrorMessage
  }, [pushApiErrorMessage])

  useEffect(() => {
    let cancel = false
    const cb = async () => {
      try {
        if (
          data.integrationId != null &&
          data.repository != null &&
          data.repository.full_name != null
        ) {
          const [owner, repo] = data.repository.full_name.split('/')
          const users = await getAction(
            { id: data.integrationId },
            'repo:collaborators',
            { owner, repo }
          )
          if (!cancel) {
            setUsers(users)
          }
        }
      } catch (error) {
        pushErrorRef.current(error)
      }
    }
    cb()
    return () => {
      cancel = true
    }
  }, [data])

  if (users == null) {
    return <Spinner />
  }

  return (
    <GithubUserSelectContainer>
      <h3>Person</h3>
      <FilterableSelectList
        items={users.map((user) => [
          user.login,
          <div
            className='user__select__item'
            onClick={() => onSelect([user.login])}
          >
            <StyledUserIcon className='subtle'>
              <img src={user.avatar_url} alt={user.login[0]} />
            </StyledUserIcon>
            {user.login}
          </div>,
        ])}
      />
    </GithubUserSelectContainer>
  )
}

const GithubUserSelectContainer = styled.div`
  & .user__select__item {
    display: flex;
    cursor: pointer;
    align-items: center;
    & .user__icon {
      margin-right: ${({ theme }) => theme.sizes.spaces.df}px;
    }
  }
`
export default GitHubAssigneesCell
