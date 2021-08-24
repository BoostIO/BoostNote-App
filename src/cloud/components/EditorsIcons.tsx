import React from 'react'
import { SerializedUser } from '../interfaces/db/user'
import { buildIconUrl } from '../api/files'
import { getColorFromString } from '../lib/utils/string'
import Flexbox from '../../design/components/atoms/Flexbox'
import styled from '../../design/lib/styled'
import { userIconStyle } from '../../design/lib/styled/styleFunctions'

interface EditorsIconsProps {
  editors: SerializedUser[]
  prefix?: boolean
}

const displayLimit = 5

const EditorsIcons = ({ editors, prefix = true }: EditorsIconsProps) => {
  return (
    <Flexbox flex='0 0 auto' className='editors__icons'>
      <StyledUsersList>
        {prefix && <li style={{ marginRight: 4 }}>by</li>}
        {editors.slice(0, displayLimit).map((user) => {
          const color = getColorFromString(user.id)
          return (
            <li key={user.id}>
              <StyledUsersListItem style={{ color, borderColor: color }}>
                {user.icon == null ? (
                  <div className='icon'>{user.displayName[0]}</div>
                ) : (
                  <img
                    src={buildIconUrl(user.icon.location)}
                    alt={user.displayName[0]}
                  />
                )}
              </StyledUsersListItem>
            </li>
          )
        })}
      </StyledUsersList>
      {editors.length > displayLimit && (
        <StyledCropped>+{editors.length - displayLimit}</StyledCropped>
      )}
    </Flexbox>
  )
}

const StyledUsersList = styled.ul`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  list-style: none;
  margin: 0 ${({ theme }) => theme.sizes.spaces.xsm}px 0 0;
  padding: 0;
  color: ${({ theme }) => theme.colors.text.subtle};
  font-size: inherit;
  margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
  z-index: initial;
  line-height: 24px;
`

const StyledCropped = styled.span`
  padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
`

const StyledUsersListItem = styled.div`
  ${userIconStyle}
  width: 24px;
  height: 24px;
`

export default EditorsIcons
