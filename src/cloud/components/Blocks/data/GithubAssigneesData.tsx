import { StyledUserIcon } from '../../UserIcon'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useModal } from '../../../../design/lib/stores/modal'
import { getAction, postAction } from '../../../api/integrations'
import styled from '../../../../design/lib/styled'
import Spinner from '../../../../design/components/atoms/Spinner'
import { useToast } from '../../../../design/lib/stores/toast'
import { BlockDataProps } from './types'
import { GithubIssueBlock } from '../../../api/blocks'
import SearchableOptionListPopup from '../../SearchableOptionListPopup'
import Flexbox from '../../../../design/components/atoms/Flexbox'

interface Assignee {
  id: number
  avatar_url: string
  login: string
}

const GitHubAssigneesData = ({
  data,
  onUpdate,
}: BlockDataProps<GithubIssueBlock>) => {
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
    [data, closeAllModals, onUpdate, pushApiErrorMessage]
  )

  const openAssigneeSelect: React.MouseEventHandler = useCallback(
    (ev) => {
      //TOFIX PREVENT GITHUB UPDATE FOR NOW
      return
      openContextModal(
        ev,
        <AssigneeSelect data={data} onSelect={addAssignees} />
      )
    },
    [openContextModal, addAssignees, data]
  )

  return (
    <Container onClick={openAssigneeSelect}>
      <Flexbox alignItems='center'>
        {data.assignees?.map((user: Assignee) => (
          <StyledUserIcon className='subtle' key={user.id}>
            <img src={user.avatar_url} alt={user.login[0]} />
          </StyledUserIcon>
        ))}
      </Flexbox>
    </Container>
  )
}

const Container = styled.div``

interface AssigneeSelectProps {
  data: GithubIssueBlock['data']
  onSelect: (names: string[]) => Promise<void>
}

const AssigneeSelect = ({ data, onSelect }: AssigneeSelectProps) => {
  const [users, setUsers] = useState<Assignee[] | null>(null)
  const { pushApiErrorMessage } = useToast()
  const [filter, setFilter] = useState('')

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
      <SearchableOptionListPopup
        query={filter}
        setQuery={setFilter}
        title='Person'
        options={users.map((user) => {
          return {
            id: `person-${user.id}`,
            icon: (
              <StyledUserIcon className='subtle' style={{ marginRight: 4 }}>
                <img src={user.avatar_url} alt={user.login[0]} />
              </StyledUserIcon>
            ),
            label: user.login,
            checked: false,
            onClick: () => onSelect([user.login]),
          }
        })}
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
export default GitHubAssigneesData
