import React from 'react'
import styled from '../../lib/styled'
import { SerializedUser } from '../../interfaces/db/user'
import { buildIconUrl } from '../../api/files'
import {
  subtleBorderColor,
  userIconStyle,
} from '../../lib/styled/styleFunctions'

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

const StyledUserIcon = styled.div`
  ${userIconStyle}
  width: 30px;
  height: 30px;
  border: 2px solid currentColor;

  &.subtle {
    ${subtleBorderColor}
  }
`
