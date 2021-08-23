import React from 'react'
import { StyledUserIcon } from '../../../UserIcon'

interface Assignee {
  id: number
  avatar_url: string
  login: string
}

interface GitHubAssigneesCellProps {
  assignees: Assignee[]
}

const GitHubAssigneesCell = ({ assignees }: GitHubAssigneesCellProps) => {
  return (
    <div>
      {assignees.map((user) => (
        <StyledUserIcon className='subtle'>
          <img src={user.avatar_url} alt={user.login[0]} />
        </StyledUserIcon>
      ))}
    </div>
  )
}

export default GitHubAssigneesCell
