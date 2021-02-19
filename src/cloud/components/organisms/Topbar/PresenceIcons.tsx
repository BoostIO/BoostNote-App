import React, { useMemo } from 'react'
import styled from '../../../lib/styled'
import { UserPresenceInfo } from '../../../interfaces/presence'
import Tooltip from '../../atoms/Tooltip'
import { userIconStyle } from '../../../lib/styled/styleFunctions'

interface PresenceListProps {
  users: UserPresenceInfo[]
  user: UserPresenceInfo
}

type PresenceIconProps = PresenceListProps & { withTooltip?: boolean }

const PresenceList = ({ users, user }: PresenceListProps) => {
  const userIcon = useMemo(() => {
    return user != null && user.icon != null ? (
      <img src={user.icon} alt={user.name[0]} />
    ) : (
      user.name[0]
    )
  }, [user])

  return (
    <StyledPresenceList>
      {users.map(({ id, name, color, icon }, i: number) => {
        return (
          <li style={{ zIndex: i }} key={id}>
            <StyledPresenceListItem
              style={{ color: color != null ? color : 'inherit' }}
            >
              {icon == null ? name[0] : <img src={icon} alt={name[0]} />}
            </StyledPresenceListItem>
          </li>
        )
      })}
      <li key='user' style={{ zIndex: users.length }}>
        <StyledPresenceListItem
          style={{ color: user.color != null ? user.color : 'inherit' }}
        >
          {userIcon}
        </StyledPresenceListItem>
      </li>
    </StyledPresenceList>
  )
}

const PresenceIcons = ({ users, user, withTooltip }: PresenceIconProps) => {
  const otherUsers = useMemo(() => {
    return users.filter((otherUser) => otherUser.id !== user.id)
  }, [users, user])

  const tooltipString = useMemo(() => {
    if (otherUsers.length === 0) {
      return 'No one else is editing this doc'
    }

    if (otherUsers.length === 1) {
      return `${otherUsers[0].name} is also editing this doc`
    }

    const list = otherUsers
      .slice(0, -1)
      .map((user) => user.name)
      .join(', ')
    return `${list} and ${
      otherUsers[otherUsers.length - 1].name
    } are also editing this doc`
  }, [otherUsers])

  if (withTooltip) {
    return (
      <Tooltip tooltip={tooltipString}>
        <PresenceList users={otherUsers} user={user} />
      </Tooltip>
    )
  }

  return <PresenceList users={otherUsers} user={user} />
}

const StyledPresenceList = styled.ul`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  list-style: none;
  margin: 0 ${({ theme }) => theme.space.xxsmall}px 0 0;
  padding: 0;
  font-size: ${({ theme }) => theme.fontSizes.small}px;
`

const StyledPresenceListItem = styled.div`
  ${userIconStyle}
  width: 30px;
  height: 30px;
  border: 2px solid currentColor;
`

export default PresenceIcons
