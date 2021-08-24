import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { CellProps } from '.'
import FilterableSelectList from '../../../../../design/components/molecules/FilterableSelectList'
import { useModal } from '../../../../../design/lib/stores/modal'
import styled from '../../../../../design/lib/styled'
import { SerializedUser } from '../../../../interfaces/db/user'
import { usePage } from '../../../../lib/stores/pageStore'
import UserIcon from '../../../UserIcon'

interface BoostUserCellProps extends CellProps {}

const BoostUserCell = ({ value, onUpdate }: BoostUserCellProps) => {
  const { permissions = [] } = usePage()
  const { openContextModal } = useModal()

  const user = useMemo(() => {
    return permissions
      .map((perm) => perm.user)
      .find((user) => user.id === value)
  }, [permissions, value])

  const onUpdateRef = useRef(onUpdate)
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  const openSelector: React.MouseEventHandler = useCallback(
    (ev) => {
      openContextModal(
        ev,
        <UserSelect
          users={permissions.map((perm) => perm.user)}
          onSelect={(user) => onUpdateRef.current(user.id)}
        />,
        { width: 300 }
      )
    },
    [permissions]
  )

  return (
    <Container onClick={openSelector}>
      {user != null && <UserIcon user={user} />}
    </Container>
  )
}

const Container = styled.div`
  cursor: pointer;
  min-height: 40px;
`

interface UserSelectProps {
  users: SerializedUser[]
  onSelect: (user: SerializedUser) => void
}

const UserSelect = ({ users, onSelect }: UserSelectProps) => {
  return (
    <UserSelectContainer>
      <h3>Person</h3>
      <FilterableSelectList
        items={users.map((user) => [
          user.displayName,
          <div className='user__select__item' onClick={() => onSelect(user)}>
            <UserIcon className='user__icon' user={user} />
            {user.displayName}
          </div>,
        ])}
      />
    </UserSelectContainer>
  )
}

const UserSelectContainer = styled.div`
  & .user__select__item {
    display: flex;
    cursor: pointer;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
    align-items: center;

    &:first-child {
      border-top: 1px solid ${({ theme }) => theme.colors.border.second};
    }

    & .user__icon {
      margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }
  }
`

export default BoostUserCell
