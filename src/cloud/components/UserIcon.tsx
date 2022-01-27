import React from 'react'
import { SerializedUser } from '../interfaces/db/user'
import { buildIconUrl } from '../api/files'
import styled from '../../design/lib/styled'
import { userIconStyle } from '../../design/lib/styled/styleFunctions'

interface UserIconProps {
  user: SerializedUser
  style?: React.CSSProperties
  className?: string
}

const UserIcon = ({ user, style, className }: UserIconProps) => {
  return (
    <StyledUserIcon style={style} className={className}>
      {user.icon == null ? (
        user.displayName[0]
      ) : (
        <img src={buildIconUrl(user.icon.location)} alt={user.displayName[0]} />
      )}
    </StyledUserIcon>
  )
}

export default UserIcon

export const StyledUserIcon = styled.div`
  ${userIconStyle}
  width: 30px;
  height: 30px;
  background-color: ${({ theme }) => theme.colors.variants.primary.base};
  color: ${({ theme }) => theme.colors.variants.primary.text};
  border: none;
  line-height: 30px;

  &.subtle {
    border: 1px solid ${({ theme }) => theme.colors.border.second};
  }
`
