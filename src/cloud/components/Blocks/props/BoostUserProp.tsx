import { mdiAccountCircleOutline, mdiClose } from '@mdi/js'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../../../../design/components/atoms/Icon'
import { useModal } from '../../../../design/lib/stores/modal'
import styled from '../../../../design/lib/styled'
import { SerializedUser } from '../../../interfaces/db/user'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import { usePage } from '../../../lib/stores/pageStore'
import DocPropertyValueButton from '../../DocProperties/DocPropertyValueButton'
import SearchableOptionListPopup from '../../SearchableOptionListPopup'
import UserIcon from '../../UserIcon'
import { BlockPropertyProps } from './types'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface BoostUserPropProps extends BlockPropertyProps {}

const BoostUserProp = ({
  value,
  onUpdate,
  currentUserIsCoreMember,
}: BoostUserPropProps) => {
  const { permissions = [] } = usePage()
  const { openContextModal, closeAllModals } = useModal()
  const { translate } = useI18n()

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
          showClearOption={user != null}
          onSelect={(user) => {
            if (user != null) {
              onUpdateRef.current(user.id)
            } else {
              onUpdateRef.current('')
            }
            return closeAllModals()
          }}
        />,
        { width: 300 }
      )
    },
    [permissions, openContextModal, closeAllModals, user]
  )

  return (
    <Container onClick={openSelector}>
      <DocPropertyValueButton
        empty={user == null}
        isReadOnly={!currentUserIsCoreMember}
        iconPath={user == null ? mdiAccountCircleOutline : undefined}
        onClick={openSelector}
      >
        {user != null ? (
          <UserIcon user={user} />
        ) : (
          translate(lngKeys.Unassigned)
        )}
      </DocPropertyValueButton>
    </Container>
  )
}

const Container = styled.div`
  justify-content: center;
`

interface UserSelectProps {
  users: SerializedUser[]
  showClearOption: boolean
  onSelect: (user?: SerializedUser) => void
}

const UserSelect = ({ users, onSelect, showClearOption }: UserSelectProps) => {
  const [query, setQuery] = useState('')

  const options = useMemo(() => {
    const userOptions = users
      .filter((user) => user.displayName.includes(query))
      .map((user) => {
        return {
          label: user.displayName,
          icon: (
            <UserIcon
              className='user__icon'
              user={user}
              style={{ marginRight: 4 }}
            />
          ),
          onClick: () => onSelect(user),
        }
      })

    return userOptions
  }, [onSelect, query, users])

  return (
    <SearchableOptionListPopup
      title='Person'
      query={query}
      setQuery={setQuery}
      options={
        showClearOption
          ? [
              ...options,
              {
                label: 'Clear',
                icon: (
                  <Icon size={16} path={mdiClose} style={{ marginRight: 4 }} />
                ),
                onClick: () => onSelect(undefined),
              },
            ]
          : options
      }
    />
  )
}

export default BoostUserProp
